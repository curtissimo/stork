var util = require('utile')
  , revalidator = require('revalidator')
  ;

var propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== 'id';
	  }
	, definerProto = {
			bool: function(name, options) {
				if(typeof name === 'undefined') {
					throw new Error('bool definer requires a name');
				}
				this.properties[name] = {type: 'bool'};
				if(options) {
					if(typeof options.required !== 'undefined') {
						this.properties[name].required = options.required;
					}
					if(typeof options.nullable !== 'undefined') {
						if(options.nullable) {
							this.properties[name].type = ['bool', 'null'];
						}
					}
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
			Object.keys(definerProto).forEach(function(key) {
				schema[key] = function() {
					definerProto[key].apply(schema, arguments);
				};
			});
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
