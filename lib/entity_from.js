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

function entityTo(typeName, schema, dest) {
  var db
    , from = {}
    , builder = rehydrateForTypeNameAndSchema(typeName, schema)
    ;

  db = makeNano(dest, 'Entity#from must be a couchdb url or nano db');
  unseeable(from, 'db', db);

  from.all = function(cb) {
    db.view(typeName, 'all', {include_docs: true}, function(err, result) {
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

  from.get = function(id, cb) {
    db.get(id, function(err, result) {
      if(err) {
        return cb(err);
      }
      isoStringPropertiesToDates(result);
      cb(err, builder(result));
    });
  };

  return from;
}

module.exports.fromForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityTo(typeName, schema, dest);
  };
};
