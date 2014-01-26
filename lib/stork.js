'use strict';

var util = require('utile')
  , revalidator = require('revalidator')
  , definerProto = require('./definers')
  ;

var propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== '_id';
	  }
	, validateProto = function() {
			var result = revalidator.validate(this, this.$schema);
			if(result.valid) {
				delete result.errors;
			}
			return result;
		}
	;

module.exports.deliver = function(typeName, definer) {
	var schema = {properties: {}};

	if(typeof typeName !== 'string') {
		throw new Error('deliver requires type name as its first argument');
	}
	if(typeof definer !== 'function' && definer !== undefined) {
		throw new Error('deliver requires a schema-defining function as its second argument');
	}

	if(definer) {
		Object.keys(definerProto).forEach(function(key) {
			schema[key] = function() {
				definerProto[key].apply(schema, arguments);
			};
		});
		definer.call(schema);
		Object.keys(definerProto).forEach(function(key) {
			delete schema[key];
		});
	}

	return {
		'new': function(id, proto) {
			var instance = {
						kind: typeName
					, validate: validateProto
					, '$schema': schema
					}
			  , nid = (typeof id === 'string')? id : undefined
			  , nproto = nid? proto : id
			  ;
			if(nid !== undefined) {
				instance._id = nid;
			} else if(nproto && nproto._id !== undefined) {
				instance._id = nproto._id;
			}
			if(nproto !== undefined) {
				util.mixin(instance, util.filter(nproto, propFilter));
			}
			instance.validate = function() {
				return validateProto.call(instance);
			};
			return instance;
		}
	};
};
