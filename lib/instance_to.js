/*jslint node: true, nomen: true, white: true, forin: true*/
'use strict';

var async = require('async')
  , common = require('./common')
  ;

var unwriteable = common.unwriteable
  , unseeable = common.unseeable
  , hidden = common.hidden
  , makeNano = common.makeNano
  ;

module.exports.forInstance = function(instance) {
  return function(dest) {
    var db
      , to = {}
      ;

    to.save = function(cb) {
      var state = {}
        , p
        , schema = instance.$schema
        , hasCreatedOn = schema.properties.hasOwnProperty('createdOn')
        , createdOnIsUndefined = instance.createdOn === undefined
        , refProperties = schema.refProperties
        , childProperties = schema.childProperties
        ;

      for (p in instance) {
        if (refProperties.indexOf(p) > -1) {
          state['$' + p + 'Id'] = instance[p]._id;
        } else if (childProperties.indexOf(p) === -1 && typeof instance[p] !== 'function') {
          state[p] = instance[p];
        }
      }
      state = JSON.parse(JSON.stringify(state));
      if (instance._rev) {
        state._rev = instance._rev;
      }
      if (instance._id) {
        state._id = instance._id;
      }
      if (hasCreatedOn && createdOnIsUndefined) {
        instance.createdOn = new Date();
      }
      if (instance.$schema.properties.hasOwnProperty('updatedOn')) {
        instance.updatedOn = new Date();
      }
      db.insert(state, function(err, result) {
        var childUpdates
          ;

        if (err) {
          return cb(err);
        }
        unwriteable(instance, '_id', result.id);
        hidden(instance, '_rev', result.rev);

        if (childProperties.length > 0) {
          childUpdates = [];
          childProperties.forEach(function(property) {
            var children = instance[property] || []
              , childProperty = '$' + instance.kind + '_' + property + '_id'
              ;
            children.forEach(function(child) {
              var childTo = child.to(db)
                ;
              if (child[childProperty] !== result.id) {
                child[childProperty] = result.id;
                childUpdates.push(childTo.save.bind(childTo));
              }
            });
          });
          async.parallel(childUpdates, function(err) {
            cb(err, instance);
          });
        } else {
          cb(err, instance);
        }
      });
    };

    db = makeNano(dest, 'instance#to must be a couchdb url or nano db');
    unseeable(to, 'db', db);
    return to;
  };
};
