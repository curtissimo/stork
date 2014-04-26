var should = require('should')
  , nano = require('nano')
  , path = require('path')
  ;

var odm = require('../lib/stork')
  ;

exports['stork has #from'] = {
  'defined': function(t) {
    odm.should.have.property('from');
    odm.from.should.be.a.Function;
    t.done();
  }

, 'that accepts a url': function(t) {
    var dburl = 'http://localhost:5984/stork_test'
      , _ = null
      ;

    odm.from.bind(_, dburl).should.not.throw();
    t.done();
  }

, 'that accepts a nano db': function(t) {
    var dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , db = nano(dburl)
      ;

    odm.from.bind(_, db).should.not.throw();
    t.done();
  }

, 'that fails without a url or nano db': function(t) {
    var _ = null
      , badTos = [
          'not a url', true, null, undefined, {}, 1.3
        ]
      , errorMessage = 'stork#from must be a couchdb url or nano db'
      ;

    badTos.forEach(function(badTo) {
      odm.from.bind(_, badTo).should.throw(errorMessage);
    });
    t.done();
  }

, 'that returns an object with a db property containing a nano db': function(t) {
    var protocol = 'http://'
      , host = 'localhost:5984'
      , dbName = 'stork_test'
      , dburl = protocol + path.join(host, dbName)
      , _ = null
      , db = nano(dburl)
      , toFromString = odm.from(dburl)
      , toFromNano = odm.from(db)
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

, 'that returns an object with an all method': function(t) {
    var dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , from = odm.from(dburl)
      ;

    from.should.have.property('get');
    from.get.should.be.a.Function;

    t.done();
  }
}
