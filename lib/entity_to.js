/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  ;

var unseeable = common.unseeable
  , makeNano = common.makeNano
  ;

function entityTo(typeName, schema, dest) {
  var db
    , to = {}
    ;

  db = makeNano(dest, 'Entity#to must be a couchdb url or nano db');
  unseeable(to, 'db', db);

  to.sync = function(cb) {
    var bsre = /\\/g
      , sortKeyMap = function(o) { 
          return "doc['" + o.replace(bsre, '\\\\') + "']"; 
        }
      , keyList = schema.allSort? schema.allSort.map(sortKeyMap) : null
      , key = keyList? '[' + keyList.toString() + ']' : 'doc._id'
      , doc = {
          views: {
            all: {
              map: [
                "function(doc) {",
                "  if(doc.kind === '" + typeName + "') {",
                "    emit(" + key + ", null);",
                "  }",
                "}"
              ].join('\n')
            }
          }
        }
      ;
    this.db.insert(doc, '_design/' + typeName, cb);
  };

  return to;
}

module.exports.toForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityTo(typeName, schema, dest);
  };
};
