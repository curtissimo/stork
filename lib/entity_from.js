/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  , entityNew = require('./entity_new')
  ;

var unseeable = common.unseeable
  , makeNano = common.makeNano
  , isoStringPropertiesToDates = common.isoStringPropertiesToDates
  , rehydrateForTypeNameAndSchema = entityNew.rehydrateForTypeNameAndSchema
  ;

function makeViewFunction(db, typeName, builder, viewName) {
  return function(cb) {
    db.view(typeName, viewName, {include_docs: true}, function(err, result) {
      if(err) {
        return cb(err);
      }
      if(result.rows === undefined) {
        result.rows = [];
      }
      cb(err, result.rows.map(function(o) {
        var obj = o.doc;
        isoStringPropertiesToDates(obj);
        return builder(obj);
      }));
    });
  };  
}

function entityFrom(typeName, schema, dest) {
  var db
    , from = {}
    , builder = rehydrateForTypeNameAndSchema(typeName, schema)
    , db = makeNano(dest, 'Entity#from must be a couchdb url or nano db')
    , viewBuilder = makeViewFunction.bind({}, db, typeName, builder)
    ;

  unseeable(from, 'db', db);

  from.all = viewBuilder('all');

  from.get = function(id, cb) {
    db.get(id, function(err, result) {
      if(err) {
        return cb(err);
      }
      isoStringPropertiesToDates(result);
      cb(err, builder(result));
    });
  };

  Object.keys(schema.views).forEach(function(viewName) {
    from[viewName] = viewBuilder(viewName);
  });

  return from;
}

module.exports.fromForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityFrom(typeName, schema, dest);
  };
};
