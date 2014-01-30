/*jslint node: true, nomen: true, white: true */
'use strict';

var common = require('./common')
  ;

var unwriteable = common.unwriteable
  , unseeable = common.unseeable
  , makeNano = common.makeNano
  ;


module.exports.forInstance = function(instance) {
  return function(dest) {
    var db
      , to = {}
      ;

    to.save = function(cb) {
      var state = JSON.parse(JSON.stringify(instance));
      db.insert(state, function(err, result) {
        if(err) {
          return cb(err);
        }
        unwriteable(instance, '_id', result.id);
        unwriteable(instance, '_rev', result.rev);
        cb(err, instance);
      });
    };

    db = makeNano(dest, 'instance#to must be a couchdb url or nano db');
    unseeable(to, 'db', db);
    return to;
  };
};
