var should = require('should')
  , mock = require('nodemock')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['Entity#to has #sync'] = {
  setUp: function(cb) {
    this.entity = function() {
      return odm.deliver('entity', function() {

      });
    };
    this.mockDb = function(doc, err, result) {
      var db = mock.mock('insert')
        .takes(doc, '_design/entity', empty)
        .calls(2, [err, result]);
      db.config = {url: true, db: true};
      return db;
    };
    this.views = [];

    // Because node mock is stupid loud.
    this.errorStream = console.error;
    console.error = function() {};
    cb();
  }

, tearDown: function(cb) {
    // Because node mock is stupid loud.
    console.error = this.errorStream;
    cb();
  }

, 'that creates an entity design document with #all': function(t) {
    var doc = {
          views: {
            all: {
              map: [
                "function(doc) {",
                "  if(doc.kind === 'entity') {",
                "    emit(doc._id, null);",
                "  }",
                "}"
              ].join('\n')
            }
          }
        }
      , db = this.mockDb(doc, null, {})
      ;

    this.views = [];

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }
};
