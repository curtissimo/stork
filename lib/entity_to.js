/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  , util = require('utile')
  , async = require('async')
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

function buildComposedView(typeName, propName, childEntities) {
  var attrName = '$' + typeName + "_" + propName + "_id"
    , orderName = '$' + typeName + "_" + propName + "_order"
    , viewDefinition = [
        "function(doc) {",
        "  if(doc.kind === '" + typeName + "') {",
        "    emit([doc._id, 0], null);",
        "  }"
      ]
    ;
    childEntities.forEach(function (kid) {
      var kidKind = kid.$kind;
      Array.prototype.push.apply(viewDefinition, [
        "  if(doc.kind === '" + kidKind + "' && doc." + attrName + ") {",
        "    emit([doc." + attrName + ", 1, doc." + orderName + "], null);",
        "  }"
      ]);
    });
    viewDefinition.push("}");
  return { map: viewDefinition.join('\n') };
}

function entityTo(typeName, schema, dest) {
  var db
    , to = {}
    ;

  db = makeNano(dest, 'Entity#to must be a couchdb url or nano db');
  unseeable(to, 'db', db);

  to.sync = function(callback) {
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
      , designDocName = '_design/' + typeName
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
    async.waterfall([
      function(cb) {
        /*jslint unparam: true*/
        db.get(designDocName, function (e, entry) {
          cb(null, entry);
        });
        /*jslint unparam: false*/
      }
    , function(entry, cb) {
        if(!entry) {
          return cb();
        }
        /*jslint nomen: true*/
        db.destroy(entry._id, entry._rev, cb);
        /*jslint nomen: false*/
      }
    , function() { db.insert(doc, designDocName, callback); }
    ]);
  };

  return to;
}

module.exports.toForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityTo(typeName, schema, dest);
  };
};
