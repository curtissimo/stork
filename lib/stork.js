var util = require('utile')
  , revalidator = require('revalidator')
  ;

var propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== '_id';
	  }
	, definerProto = {
			bool: function(name, options) {
				if(typeof name === 'undefined') {
					throw new Error('bool definer requires a name');
				}
				this.properties[name] = {type: 'boolean'};
				if(options) {
					if(typeof options.required !== 'undefined') {
						this.properties[name].required = options.required;
					}
					if(typeof options.nullable !== 'undefined') {
						if(options.nullable) {
							this.properties[name].type = ['boolean', 'null'];
						}
					}
				}
			}
		, id: function(options) {
				var isProperObject = typeof options !== 'object'
				                  || options instanceof Array
				                  || options instanceof Date
				                  || options == null
				                  ;
				if(isProperObject) {
					throw new Error('id requires a configuration spec');
				}
				this.properties['_id'] = {type: ['string', 'null']};
				if(options) {
					if(typeof options.minLength === 'number') {
						this.properties['_id'].minLength = options.minLength;
					}
					if(typeof options.maxLength === 'number') {
						this.properties['_id'].maxLength = options.maxLength;
					}
					if(typeof options.format === 'string') {
						this.properties['_id'].format = options.format;
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
				if(typeof nid !== 'undefined') {
					instance._id = nid;
				}
				if(typeof proto !== 'undefined') {
					util.mixin(instance, util.filter(proto, propFilter));
				}
				if(typeof nid === 'undefined' && typeof proto !== 'undefined' && typeof proto._id !== 'undefined') {
					instance._id = proto._id;
				}
				instance.validate = function() {
					return validateProto.call(instance);
				};
				return instance;
			}
		};
	};
})(module);
