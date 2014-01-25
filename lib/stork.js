var util = require('utile')
  , propFilter = function(o, name) {
	  	return typeof o !== 'function' && name !== 'id';
	  }
	, validateProto = function() {
			return {valid: null};
		}
	;

(function(m, undefined) {
	m.exports.deliver = function(typeName, definer) {
		if(typeof typeName !== 'string') {
			throw new Error('deliver requires type name as its first argument')
		}
		if(typeof definer !== 'function' && typeof definer !== 'undefined') {
			throw new Error('deliver requires a schema-defining function as its second argument');
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
