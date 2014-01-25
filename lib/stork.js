var util = require('utile')
  , revalidator = require('revalidator')
  , definerProto = require('./definers')
  ;

var propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== '_id';
	  }
	, validateProto = function() {
			var result = revalidator.validate(this, this['$schema']);
			if(result.valid) {
				delete result.errors;
			}
			return result;
		}
	;

(function(m, undefined) {
	m.exports.deliver = function(typeName, definer) {
		var schema = {properties: {}};

		if(typeof typeName !== 'string') {
			throw new Error('deliver requires type name as its first argument')
		}
		if(typeof definer !== 'function' && typeof definer !== 'undefined') {
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
				  , proto = nid? proto : id
				  ;
				if(nid !== undefined) {
					instance._id = nid;
				} else if(proto && proto._id !== undefined) {
					instance._id = proto._id;
				}
				if(proto !== undefined) {
					util.mixin(instance, util.filter(proto, propFilter));
				}
				instance.validate = function() {
					return validateProto.call(instance);
				};
				return instance;
			}
		};
	};
})(module);
