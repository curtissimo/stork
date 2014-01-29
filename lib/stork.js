/*jslint node: true, nomen: true, white: true */
'use strict';

var util = require('utile')
  , revalidator = require('revalidator')
  , definerProto = require('./definers')
  , nano = require('nano')
  ;

var propFilter = function(o, name) {
      return typeof o !== 'function' && name !== '_id';
    }
  , validateProto = function() {
      var oldValues = {}
        , coercedProperties = this.$schema.coercedProperties
        , o = this
        , result
        ;
      coercedProperties.forEach(function(prop) {
        if(!o[prop] || !o[prop].valueOf || prop === 'createdOn') {
          return;
        }
        oldValues[prop] = o[prop];
        o[prop] = o[prop].valueOf();
      });
      result = revalidator.validate(this, this.$schema);
      Object.keys(oldValues).forEach(function(prop) {
        o[prop] = oldValues[prop];
      });
      if(result.valid) {
        delete result.errors;
      }
      return result;
    }
  , unwriteable = function(o, name, value) {
      Object.defineProperty(o, name, {
        value: value
      , writable: false
      , enumerable: true
      , configurable: false
      });
    }
  , unseeable = function(o, name, value) {
      Object.defineProperty(o, name, {
        value: value
      , writable: false
      , enumerable: false
      , configurable: false
      });
    }
  ;

module.exports.deliver = function(typeName, definer) {
  var schema = {
        properties: {}
      , coercedProperties: []
      }
    ;

  if(typeof typeName !== 'string') {
    throw new Error('deliver requires type name as its first argument');
  }
  if(typeof definer !== 'function' && definer !== undefined) {
    throw new Error('deliver requires a schema-defining function as its second argument');
  }

  if(definer) {
    Object.keys(definerProto).forEach(function(key) {
      schema[key] = function() {
        definerProto[key].apply(schema, arguments);
      };
    });
    definer.call(schema);
    Object.keys(definerProto).forEach(function(key) {
      delete schema[key];
    });
  }

  return {
    'new': function(id, proto) {
      var instance = {
            validate: validateProto
          , '$schema': schema
          }
        , nid = (typeof id === 'string')? id : undefined
        , nproto = nid? proto : id
        ;
      nproto = util.clone(nproto || {});
      unwriteable(instance, 'kind', typeName);
      if(schema.properties.createdOn) {
        unwriteable(instance, 'createdOn');
        delete nproto.createdOn;
      }
      if(schema.properties.updatedOn) {
        unwriteable(instance, 'updatedOn');
        delete nproto.updatedOn;
      }
      if(nid !== undefined) {
        instance._id = nid;
      } else if(nproto && nproto._id !== undefined) {
        instance._id = nproto._id;
      }
      if(nproto !== undefined) {
        util.mixin(instance, util.filter(nproto, propFilter));
      }
      instance.validate = function() {
        return validateProto.call(instance);
      };
      return instance;
    }
  , 'to': function(dest) {
      var db
        , to_result = {}
        ;

      try {
        if(dest && dest.config && dest.config.url && dest.config.db) {
          db = dest;
        } else {
          db = nano(dest);
        }
        unseeable(to_result, 'db', db);
      } catch(e) {
        throw new Error('Entity#to must be a couchdb url or nano db');
      }

      to_result.sync = function(cb) {
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

      return to_result;
    }
  };
};
