/*jslint node: true, nomen: true, white: true */
'use strict';

var util = require('utile')
  , revalidator = require('revalidator')
  , common = require('./common')
  , forInstance = require('./instance_to').forInstance
  ;

var unwriteable = common.unwriteable
  , unseeable = common.unseeable
  ;

function propFilter(o, name) {
  return typeof o !== 'function' && name !== '_id';
}

function validateProto() {
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

function entityNew(typeName, schema, id, proto, auditFromProto) {
  var instance = {
        validate: validateProto
      }
    , nid = (typeof id === 'string')? id : undefined
    , nproto = nid? proto : id
    , date
    ;

  nproto = util.clone(nproto || {});
  
  unwriteable(instance, 'kind', typeName);
  unseeable(instance, '$schema', schema);
  
  if(schema.properties.createdOn) {
    date = auditFromProto? nproto.createdOn : undefined;
    unwriteable(instance, 'createdOn', date);
    delete nproto.createdOn;
  }
  
  if(schema.properties.updatedOn) {
    date = auditFromProto? nproto.updatedOn : undefined;
    unwriteable(instance, 'updatedOn', date);
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
  
  instance.to = forInstance(instance);
  return instance;
}

module.exports.newForTypeNameAndSchema = function(typeName, schema) {
  return function(id, proto) {
    return entityNew(typeName, schema, id, proto, false);
  };
};

module.exports.rehydrateForTypeNameAndSchema = function(typeName, schema) {
  return function(id, proto) {
    return entityNew(typeName, schema, id, proto, true);
  };
};
