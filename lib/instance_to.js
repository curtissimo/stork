/*jslint node: true, nomen: true, white: true, forin: true*/
'use strict';

var async = require('async')
  , common = require('./common')
  , uuid = require('node-uuid')
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

    to.destroy = function (cb) {
    	db.destroy(instance._id, instance._rev, cb);
    };

    to.save = function(cb) {
      var state = {}
        , p
        , schema = instance.$schema
        , hasCreatedOn = schema.properties.hasOwnProperty('createdOn')
        , createdOnIsUndefined = instance.createdOn === undefined
        , refProperties = schema.refProperties
        , childProperties = schema.childProperties
        , binaryProperties = schema.binaryProperties
        , insert
        , attachments = []
        , params
        ;

      for (p in instance) {
        if (refProperties.indexOf(p) > -1) {
          state['$' + p + 'Id'] = instance[p]._id;
        } else if (childProperties.indexOf(p) === -1 && typeof instance[p] !== 'function') {
          state[p] = instance[p];
        }
      }
      if (binaryProperties.length === 0) {
        insert = db.insert.bind(db);
      } else {
        binaryProperties.forEach(function (prop) {
          var value, attachment;
          attachment = {name: prop};
          value = state[prop];
          if (value instanceof Buffer) {
            attachment.data = value;
          } else if (value) {
            attachment.data = value.content;
            attachment.content_type = value.type;
          } else {
            return;
          }
          state[prop] = prop;
          attachments.push(attachment);
        });
        params = {
          doc_name: state._id || uuid.v4()
        };
        if (state._rev) {
          params.rev = state._rev;
        }

        insert = function(o, callback) {
          db.multipart.insert(o, attachments, params, callback);
        };
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
      insert(state, function(err, result) {
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
              , childOrder = '$' + instance.kind + '_' + property + '_order'
              , order = 0
              ;
            children.forEach(function(child) {
              var childTo = child.to(db)
                , needsUpdate = false
                ;
              if (child[childProperty] !== result.id) {
                child[childProperty] = result.id;
                needsUpdate = true;
              }
              if (child[childOrder] !== order) {
                child[childOrder] = order;
                needsUpdate = true;
              }
              order += 1;
              if (needsUpdate) {
                childUpdates.push(childTo.save.bind(childTo));
              }
            });
          });
          async.parallel(childUpdates, function(err) {
            cb(err, instance);
          });
        } else if(cb !== undefined) {
          cb(err, instance);
        }
      });
    };

    db = makeNano(dest, 'instance#to must be a couchdb url or nano db');
    unseeable(to, 'db', db);
    return to;
  };
};
