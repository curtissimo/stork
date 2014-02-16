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
    , schema = this.$schema
    , coercedProperties = schema.coercedProperties
    , childProperties = schema.childProperties
    , refProperties = schema.refProperties
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

  refProperties.forEach(function(prop) {
    if(!o[prop] || !o[prop].valueOf) {
      return;
    }
    oldValues[prop] = o[prop];
    o[prop] = o[prop]._id;
  });

  result = revalidator.validate(this, this.$schema);

  Object.keys(oldValues).forEach(function(prop) {
    o[prop] = oldValues[prop];
  });

  refProperties.forEach(function(propertyName) {
    var prop = o[propertyName]
      , propSchema = schema.properties[propertyName]
      , proppy = prop === undefined || prop === null
      ;

    if (propSchema.required && proppy) {
      result.valid = false;
      result.errors.push({
        message: 'required'
      });
    } else if (!proppy && prop.kind !== propSchema.entity.$kind) {
      result.valid = false;
      result.errors.push({
        message: 'incorrect child type'
      });
    }
  });

  childProperties.forEach(function(propertyName) {
    var prop = o[propertyName]
      , propSchema = schema.properties[propertyName]
      ;

    if (!Array.isArray(prop)) {
      return;
    }
    prop.forEach(function(child) {
      if (child.kind !== propSchema.entity.$kind) {
        result.valid = false;
        result.errors.push({
          message: 'incorrect child type'
        });
      }
    });
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
    , prop
    ;

  nproto = util.clone(nproto || {});
  
  unwriteable(nproto, 'kind', typeName);
  unseeable(nproto, '$schema', schema);
  
  if(schema.properties.createdOn) {
    date = auditFromProto? nproto.createdOn : undefined;
    nproto.createdOn = date;
  }
  
  if(schema.properties.updatedOn) {
    date = auditFromProto? nproto.updatedOn : undefined;
    nproto.updatedOn = date;
  }
  
  if(nid !== undefined) {
    nproto._id = nid;
  }
  
  for(prop in nproto) {
    if(typeof nproto[prop] === 'function') {
      delete nproto[prop];
    }
  }
  
  instance = Object.create(nproto);
  instance.validate = function() {
    return validateProto.call(instance);
  };
  instance.to = forInstance(instance);
  instance.toString = function () {
    return '[object entity#' + typeName + ']';
  };

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
