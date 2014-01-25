var util = require('utile')
  , propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== 'id';
	  }
	, validateProto = function() {
			return {valid: null};
		}
	, definerProto = {
			bool: function(name) {
				if(typeof name === 'undefined') {
					throw new Error('bool definer requires a name');
				}
			}
		}
	;

(function(m, undefined) {
	m.exports.deliver = function(typeName, definer) {
		var schema = util.mixin({}, definerProto);

		if(typeof typeName !== 'string') {
			throw new Error('deliver requires type name as its first argument')
		}
		if(typeof definer !== 'function' && typeof definer !== 'undefined') {
			throw new Error('deliver requires a schema-defining function as its second argument');
		}

		if(definer) {
			definer.call(schema);
		}

		return {
			'new': function(id, proto) {
				var instance = {
							kind: typeName
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
				instance.validate = validateProto;
				return instance;
			}
		};
	};
})(module);
