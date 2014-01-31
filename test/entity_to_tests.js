var should = require('should')
  , nano = require('nano')
  , path = require('path')
  ;

var odm = require('../lib/stork')
  ;

exports['entity has #to'] = {
  'defined': function(t) {
    var Entity = odm.deliver('entity');
    Entity.should.have.property('to');
    Entity.to.should.be.a.Function;
    t.done();
  }

, 'that accepts a url': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      ;

    Entity.to.bind(_, dburl).should.not.throw();
    t.done();
  }

, 'that accepts a nano db': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , db = nano(dburl)
      ;

    Entity.to.bind(_, db).should.not.throw();
    t.done();
  }

, 'that fails without a url or nano db': function(t) {
    var Entity = odm.deliver('entity')
      , _ = null
      , badTos = [
          'not a url', true, null, undefined, {}, 1.3
        ]
      , errorMessage = 'Entity#to must be a couchdb url or nano db'
      ;

    badTos.forEach(function(badTo) {
      Entity.to.bind(_, badTo).should.throw(errorMessage);
    });
    t.done();
  }

, 'that returns an object with a db property containing a nano db': function(t) {
    var Entity = odm.deliver('entity')
      , protocol = 'http://'
      , host = 'localhost:5984'
      , dbName = 'stork_test'
      , dburl = protocol + path.join(host, dbName)
      , _ = null
      , db = nano(dburl)
      , toFromString = Entity.to(dburl)
      , toFromNano = Entity.to(db)
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

, 'that returns an object with a sync method': function(t) {
    var Entity = odm.deliver('entity')
      , protocol = 'http://localhost:5984/stork_test'
      , _ = null
      , to = Entity.to(protocol)
      ;

    to.should.have.property('sync');
    to.sync.should.be.a.Function;

    t.done();
  }
}
