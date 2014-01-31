/*jslint node: true, nomen: true, white: true */
'use strict';

var nano = require('nano')
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
  
, makeNano: function(dest, message) {
    try {
      if(dest && dest.config && dest.config.url && dest.config.db) {
        return dest;
      }
      return nano(dest);
    } catch(e) {
      throw new Error(message);
    }
  }
};
