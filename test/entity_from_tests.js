var should = require('should')
  , nano = require('nano')
  , path = require('path')
  ;

var odm = require('../lib/stork')
  ;

exports['entity has #from'] = {
  'defined': function(t) {
    var Entity = odm.deliver('entity');
    Entity.should.have.property('from');
    Entity.from.should.be.a.Function;
    t.done();
  }

, 'that accepts a url': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      ;

    Entity.from.bind(_, dburl).should.not.throw();
    t.done();
  }

, 'that accepts a nano db': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , db = nano(dburl)
      ;

    Entity.from.bind(_, db).should.not.throw();
    t.done();
  }

, 'that fails without a url or nano db': function(t) {
    var Entity = odm.deliver('entity')
      , _ = null
      , badTos = [
          'not a url', true, null, undefined, {}, 1.3
        ]
      , errorMessage = 'Entity#from must be a couchdb url or nano db'
      ;

    badTos.forEach(function(badTo) {
      Entity.from.bind(_, badTo).should.throw(errorMessage);
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
      , toFromString = Entity.from(dburl)
      , toFromNano = Entity.from(db)
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

, 'that returns an object with a all method': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , from = Entity.from(dburl)
      ;

    from.should.have.property('all');
    from.all.should.be.a.Function;

    t.done();
  }

, 'that returns an object with a get method': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , from = Entity.from(dburl)
      ;

    from.should.have.property('get');
    from.get.should.be.a.Function;

    t.done();
  }

, 'that returns an object with a method named for a view': function(t) {
    var Entity = odm.deliver('entity', function() {
          this.view('myView', ['attr']);
        })
      , dburl = 'http://localhost:5984/stork_test'
      , _ = null
      , from = Entity.from(dburl)
      ;

    from.should.have.property('myView');
    from.get.should.be.a.Function;

    t.done();
  }
}
