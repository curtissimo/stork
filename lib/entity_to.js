/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  , util = require('utile')
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

function buildCustomView(typeName, viewSpec) {
  var viewDefinition = [
        "function(doc) {",
        "  if(doc.kind === '" + typeName + "') {",
        "    (" + viewSpec.toString() + "(doc, emit));",
        "  }",
        "}"
      ].join('\n')
    ;
  return { map: viewDefinition };
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

    if (value === undefined) {
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

function buildComposedView(typeName, propName, childEntity) {
  var kidKind = childEntity.$kind
    , attrName = '$' + typeName + "_" + propName + "_id"
    , viewDefinition = [
        "function(doc) {",
        "  if(doc.kind === '" + typeName + "') {",
        "    emit([doc._id, 0], null);",
        "  }",
        "  if(doc.kind === '" + kidKind + "' && doc." + attrName + ") {",
        "    emit([doc." + attrName + ", 1], null);",
        "  }",
        "}"
      ].join('\n')
    ;
  return { map: viewDefinition };
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
      var viewSpec = schema.views[viewName];
      if (typeof viewSpec === 'function') {
        doc.views[viewName] = buildCustomView(typeName, viewSpec);
      } else {
        doc.views[viewName] = buildSortedView(typeName, viewSpec);
      }
    });
    Object.keys(schema.composedViews).forEach(function(propName) {
      var calculatedViewName = 'with' + util.capitalize(propName)
        , view = schema.composedViews[propName]
        ;
      doc.views[calculatedViewName] = buildComposedView(typeName, propName, view);
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
