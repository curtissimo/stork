/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  , util = require('utile')
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
      if (err) {
        return cb(err);
      }
      if (result.rows === undefined) {
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

function makeComposedViewFunction(db, typeName, builder, viewName, propertyName, kidBuilder) {
  return function(cb) {
    db.view(typeName, viewName, {include_docs: true}, function(err, result) {
      var entity
        , state
        , composed
        , i
        ;

      if (err) {
        return cb(err);
      }
      if (result.rows !== undefined && result.rows.length > 0) {
        composed = [];
        for (i = 1; i < result.rows.length; i += 1) {
          state = result.rows[i].doc;
          isoStringPropertiesToDates(state);
          composed.push(kidBuilder.new(state));
        }
        state = result.rows[0].doc;
        state[propertyName] = composed;
        isoStringPropertiesToDates(state);
        entity = builder(state);
      }

      cb(err, entity);
    });
  };  
}

function entityFrom(typeName, schema, dest) {
  var from = {}
    , fromProto = {}
    , builder = rehydrateForTypeNameAndSchema(typeName, schema)
    , db = makeNano(dest, 'Entity#from must be a couchdb url or nano db')
    , viewBuilder = makeViewFunction.bind({}, db, typeName, builder)
    , composedViewBuilder = makeComposedViewFunction.bind({}, db, typeName, builder)
    , getRefs = false
    ;

  unseeable(fromProto, 'db', db);

  fromProto.all = viewBuilder('all');

  fromProto.get = function(id, cb) {
    db.get(id, function(err, result) {
      var refIds = []
        , refIdToProp = {}
        , o
        ;
      
      if (err) {
        return cb(err);
      }

      isoStringPropertiesToDates(result);
      o = builder(result);
      if (getRefs && schema.refProperties.length > 0) {
        schema.refProperties.forEach(function(propName) {
          var refId = o['$' + propName + 'Id'];
          if (refId) {
            refIdToProp[refId] = propName;
            refIds.push(refId);
          }
        });

        db.fetch({ keys: refIds }, function(e, result) {
          if(e) {
            return cb(e);
          }
          result.rows.forEach(function(row) {
            var doc = row.doc
              , propName = refIdToProp[doc._id]
              , entity = schema.properties[propName].entity
              ;

            o[propName] = entity.new(doc);
          });
          cb(e, o);
        });
      } else {
        cb(err, o);
      }
    });
  };

  Object.keys(schema.views).forEach(function(viewName) {
    fromProto[viewName] = viewBuilder(viewName);
  });

  Object.keys(schema.composedViews).forEach(function(viewName) {
    var calculatedViewName = 'with' + util.capitalize(viewName)
      , kidBuilder = schema.composedViews[viewName]
      ;
    fromProto[calculatedViewName] = composedViewBuilder(calculatedViewName, viewName, kidBuilder);
  });

  from = Object.create(fromProto);

  from.withRefs = function() {
    getRefs = true;
    return fromProto;
  };

  return from;
}

module.exports.fromForTypeNameAndSchema = function(typeName, schema) {
  return function(dest) {
    return entityFrom(typeName, schema, dest);
  };
};
