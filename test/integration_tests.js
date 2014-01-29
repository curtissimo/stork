var nano = require('nano')
  , os = require('os')
  , odm = require('../lib/stork')
  ;

// Put your own CouchDb endpoint in the dbOverrides to customize where your
// integration test runs.
var dbOverrides = {
      druthers: 'http://couchdb:5984/stork_test'
    }
  , dburl = dbOverrides[os.hostname()] || 'http://localhost:5984/stork_test'
  , db = nano(dburl)
  , dbms = nano(db.config.url)
  , db = dbms.use(db.config.db)
  , integration = function(o) {
      var run = !process.env['SKIP_STORK_DB_TESTS']
        ;

      if(run) {
        return o;
      }
      return {};
    }
  ;

module.exports = integration({
  setUp: function(cb) {
    dbms.db.destroy(db.config.db, function(err) {
      dbms.db.create(db.config.db, function(err) {
        cb(err);
      });
    });
  }

, 'create default entity design document': function(t) {
    var entityName = 'defaulty'
      , entity = odm.deliver(entityName)
      ;

    entity.to(dburl).sync(function(e) {
      if(e) {
        return t.done(e);
      }
      db.get('_design/' + entityName, function(e, doc) {
        if(e) {
          return t.done(e);
        }
        doc.should.be.ok;
        doc.should.have.property('views');
        doc.views.should.have.property('all');
        doc.views.all.should.have.property('map');
        doc.views.all.map.indexOf('emit(doc._id').should.be.greaterThan(-1);
        t.done();
      });
    });
  }

, 'create entity design document with sort': function(t) {
    var entityName = 'sorty'
      , entity = odm.deliver(entityName, function() {
          this.sort('o/n\\e', 'two');
        })
      ;

    entity.to(dburl).sync(function(e) {
      if(e) {
        return t.done(e);
      }
      db.get('_design/' + entityName, function(e, doc) {
        if(e) {
          return t.done(e);
        }
        doc.should.be.ok;
        doc.should.have.property('views');
        doc.views.should.have.property('all');
        doc.views.all.should.have.property('map');
        doc.views.all.map.indexOf("emit([doc['o/n\\\\e'],doc['two']]").should.be.greaterThan(-1);
        t.done();
      });
    });
  }
});
