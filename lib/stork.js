/*jslint node: true, nomen: true, white: true */
'use strict';

var definerProto = require('./definers')
  , toForTypeNameAndSchema = require('./entity_to').toForTypeNameAndSchema
  , newForTypeNameAndSchema = require('./entity_new').newForTypeNameAndSchema
  ;

module.exports.deliver = function(typeName, definer) {
  var schema = {
        properties: {}
      , coercedProperties: []
      }
    ;

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
    'new': newForTypeNameAndSchema(typeName, schema)
  , 'to': toForTypeNameAndSchema(typeName, schema)
  };
};
