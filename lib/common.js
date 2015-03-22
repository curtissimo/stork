/*jslint node: true, nomen: true, white: true */
'use strict';

var nano = require('nano')
  ;

var dateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+\-][0-2]\d:[0-5]\d|Z)/
  ;

module.exports = {
  unwriteable: function(o, name, value) {
    Object.defineProperty(o, name, {
      value: value
    , writable: false
    , enumerable: true
    , configurable: false
    });
  }

, unseeable: function(o, name, value) {
    Object.defineProperty(o, name, {
      value: value
    , writable: false
    , enumerable: false
    , configurable: false
    });
  }

, hidden: function(o, name, value) {
    Object.defineProperty(o, name, {
      value: value
    , writable: true
    , enumerable: false
    , configurable: false
    });
  }

, makeNano: function(dest, message) {
    try {
      if (dest && dest.config && dest.config.url && dest.config.db) {
        return dest;
      }
      return nano(dest);
    } catch(e) {
      throw new Error(message);
    }
  }

, isoStringPropertiesToDates: function(obj, properties) {
    properties = properties || Object.keys(obj);

    properties.forEach(function(key) {
      if (obj[key] === undefined || obj[key] === null) {
        return;
      } else if (obj[key].toString().match(dateRegex)) {
        obj[key] = new Date(obj[key]);
      } else if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        module.exports.isoStringPropertiesToDates(obj[key]);
      }
    });
  }
};
