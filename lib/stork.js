/*jslint node: true, nomen: true, white: true */
'use strict';

var definerProto = require('./definers')
  , unseeable = require('./common').unseeable
  , makeNano = require('./common').makeNano
  , isoStringPropertiesToDates = require('./common').isoStringPropertiesToDates
  , toForTypeNameAndSchema = require('./entity_to').toForTypeNameAndSchema
  , newForTypeNameAndSchema = require('./entity_new').newForTypeNameAndSchema
  , rehydrateForTypeNameAndSchema = require('./entity_new').rehydrateForTypeNameAndSchema
  , fromForTypeNameAndSchema = require('./entity_from').fromForTypeNameAndSchema
  ;

module.exports.deliver = function(typeName, definer) {
  var schema = {
        childProperties: []
      , coercedProperties: []
      , composedViews: {}
      , properties: {}
      , refProperties: []
      , binaryProperties: []
      , views: {}
      }
    , entity
    ;

  if (typeof typeName !== 'string') {
    throw new Error('deliver requires type name as its first argument');
  }
  if (typeof definer !== 'function' && definer !== undefined) {
    throw new Error('deliver requires a schema-defining function as its second argument');
  }

  if (definer) {
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

  entity = {
    new: newForTypeNameAndSchema(typeName, schema)
  , to: toForTypeNameAndSchema(typeName, schema)
  , from: fromForTypeNameAndSchema(typeName, schema)
  };

  unseeable(entity, '$kind', typeName);
  unseeable(entity, '$schema', schema);

  return entity;
};

module.exports.from = function(db) {
  var from;
  db = makeNano(db, 'stork#from must be a couchdb url or nano db');

  from = {
    get: function (models, id, callback) {
      var modelLookup = {};

      models.forEach(function (model) {
        modelLookup[model.$kind] = model;
      });

      db.get(id, function (e, record) {
        var kind, schema, entity;

        if (e) {
          return callback(e);
        }

        isoStringPropertiesToDates(record);

        try {
          kind = record.kind;
          schema = modelLookup[kind].$schema;
          entity = rehydrateForTypeNameAndSchema(kind, schema)(id, record);
        } catch (error) {
          return callback(new Error('Could not create an entity for «' + id + '»'));
        }

        callback(null, entity);
      });
    }
  };

  unseeable(from, 'db', db);

  return from;
};
