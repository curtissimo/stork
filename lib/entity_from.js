/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  , entityNew = require('./entity_new')
  ;

var unseeable = common.unseeable
  , makeNano = common.makeNano
  , rehydrateForTypeNameAndSchema = entityNew.rehydrateForTypeNameAndSchema
  , dateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+\-][0-2]\d:[0-5]\d|Z)/
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
        Object.keys(obj).forEach(function(key) {
          if(obj[key].toString().match(dateRegex)) {
            obj[key] = new Date(obj[key]);
          }
        });
        return builder(obj);
      }));
    });
  };

  return from;
}

module.exports.fromForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityTo(typeName, schema, dest);
  };
};
