var should = require('should')
  , nano = require('nano')
  , path = require('path')
  ;

var odm = require('../lib/stork')
  ;

exports['instance has #to'] = {
  'defined': function(t) {
    var instance = odm.deliver('entity').new()
      ;
    instance.should.have.property('to');
    instance.to.should.be.a.Function;
    t.done();
  }

, 'that accepts a url': function(t) {
    var instance = odm.deliver('entity').new()
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      ;

    instance.to.bind(_, dburl).should.not.throw();
    t.done();
  }

, 'that accepts a nano db': function(t) {
    var instance = odm.deliver('entity').new()
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , db = nano(dburl)
      ;

    instance.to.bind(_, db).should.not.throw();
    t.done();
  }

, 'that fails without a url or nano db': function(t) {
    var instance = odm.deliver('entity').new()
      , _ = null
      , badTos = [
          'not a url', true, null, undefined, {}, 1.3
        ]
      , errorMessage = 'instance#to must be a couchdb url or nano db'
      ;

    badTos.forEach(function(badTo) {
      instance.to.bind(_, badTo).should.throw(errorMessage);
    });
    t.done();
  }

, 'that returns an object with a db property containing a nano db': function(t) {
    var instance = odm.deliver('entity').new()
      , protocol = 'http://'
      , host = 'localhost:5984'
      , dbName = 'stork_test'
      , dburl = protocol + path.join(host, dbName)
      , _ = null
      , db = nano(dburl)
      , toFromString = instance.to(dburl)
      , toFromNano = instance.to(db)
      ;

    function checkNanoDb(o) {
      o.should.have.property('db');
      o.db.should.have.property('config')
      o.db.config.should.have.property('url', protocol + host);
      o.db.config.should.have.property('db', dbName);
    }

    checkNanoDb(toFromNano);
    checkNanoDb(toFromString);

    t.done();
  }

, 'that returns an object with a save method': function(t) {
    var instance = odm.deliver('entity').new()
      , protocol = 'http://localhost:5984/stork_test'
      , _ = null
      , to = instance.to(protocol)
      ;

    to.should.have.property('save');
    to.save.should.be.a.Function;

    t.done();
  }
};
