/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  ;

var unseeable = common.unseeable
  , makeNano = common.makeNano
  ;

function assembleViewDefinition(typeName, vars, keyList) {
  var varsHasEntry = vars.some(function(e) {
        return e;
      })
    ;
  return [
    "function(doc) {",
    (varsHasEntry? "  var keys = [];" : ""),
    "  if(doc.kind === '" + typeName + "') {",
    vars.join('\n'),
    "    emit([" + keyList.join(',') + "], null);",
    "  }",
    "}"
  ].join('\n').replace(/\n+/g, '\n');
}

function buildSortedView(typeName, viewSpec) {
  var keyList = []
    , varList = []
    , o = {}
    , view
    ;

  viewSpec.forEach(function(keyHolder, i) {
    var key = Object.keys(keyHolder)[0]
      , value = keyHolder[key]
      ;

    if(value === undefined) {
      keyList.push('doc[\'' + key + '\']');
      varList.push(null);
    } else {
      varList.push('    keys[' + i + '] = (' + value.toString() + '(doc));');
      keyList.push('keys[' + i + ']');
    }
  });

  view = assembleViewDefinition(typeName, varList, keyList);
  o = {map: view};

  return o;
}

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
    Object.keys(schema.views).forEach(function(viewName) {
      doc.views[viewName] = buildSortedView(typeName, schema.views[viewName]);
    });
    this.db.insert(doc, '_design/' + typeName, cb);
  };

  return to;
}

module.exports.toForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityTo(typeName, schema, dest);
  };
};
