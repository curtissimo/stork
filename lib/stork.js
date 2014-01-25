var util = require('utile')
  , revalidator = require('revalidator')
  ;

var propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== 'id';
	  }
	, definerProto = {
			bool: function(name) {
				if(typeof name === 'undefined') {
					throw new Error('bool definer requires a name');
				}
			}
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
			util.mixin(schema, definerProto);
			definer.call(schema);
			delete schema.bool;
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
				if(typeof nid !== 'undefined') {
					instance.id = nid;
				}
				if(typeof proto !== 'undefined') {
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
