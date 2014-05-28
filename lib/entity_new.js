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
    , binaryProperties = schema.binaryProperties
    , o = this
    , result
    ;

  coercedProperties.forEach(function(prop) {
    if (!o[prop] || !o[prop].valueOf || prop === 'createdOn') {
      return;
    }
    oldValues[prop] = o[prop];
    o[prop] = o[prop].valueOf();
  });

  refProperties.forEach(function(prop) {
    if (!o[prop] || !o[prop].valueOf) {
      return;
    }
    oldValues[prop] = o[prop];
    o[prop] = o[prop]._id;
  });

  result = revalidator.validate(this, this.$schema);

  Object.keys(oldValues).forEach(function(prop) {
    o[prop] = oldValues[prop];
  });

  binaryProperties.forEach(function(propertyName) {
    var prop = o[propertyName]
      , isBuffer = prop && prop instanceof Buffer
      , isFiley = prop && prop.content instanceof Buffer && prop.type
      ;

    if (prop === undefined) {
      return;
    }

    result.errors = result.errors.filter(function (r) {
      return !(r.property === propertyName && r.attribute === 'required');
    });

    result.errors = result.errors.filter(function (r) {
      return !(r.property === propertyName && r.attribute === 'type');
    });

    if (!isBuffer && !isFiley) {
      result.valid = false;
      result.errors.push({
        attribute: 'type',
        property: propertyName,
        expected: 'object',
        message: 'must be of type Buffer or object like {type: [mime/type], content: [Buffer]}'
      });
    }
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
      var found = false;
      propSchema.entity.forEach(function (e) {
        if (!found) {
          found = child.kind === e.$kind;
        }
      });
      if (!found) {
        result.valid = false;
        result.errors.push({
          message: 'incorrect child type'
        });
      }
    });
  });

  if (result.valid) {
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

  if (schema.properties.createdOn) {
    date = auditFromProto? nproto.createdOn : undefined;
    nproto.createdOn = date;
  }

  if (schema.properties.updatedOn) {
    date = auditFromProto? nproto.updatedOn : undefined;
    nproto.updatedOn = date;
  }

  if (nid !== undefined) {
    nproto._id = nid;
  }

  if (nproto._attachments) {
    Object.keys(nproto._attachments).forEach(function (key) {
      nproto[key] = {
        type: nproto._attachments[key].content_type,
        length: nproto._attachments[key].length,
        digest: nproto._attachments[key].digest,
        pipeFrom: function (db) {
          var nanodb, att;
          nanodb = common.makeNano(db, typeName + '#' + key);
          att = nanodb.attachment.get(nproto._id, key);
          return att.pipe.bind(att);
        }
      };
    });
  }

  for (prop in nproto) {
    if (typeof nproto[prop] === 'function') {
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
