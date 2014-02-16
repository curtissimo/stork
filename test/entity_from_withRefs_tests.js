var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['Entity#from has #withRefs'] = {
  setUp: function(cb) {
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

, 'that returns an object with the same methods sans #withRefs': function(t) {
    var Entity = odm.deliver('entity')
      , dburl = 'http://localhost:5984/stork_test'
      , from = Entity.from(dburl)
      , withRefs = from.withRefs()
      , withRefsKeys = Object.keys(withRefs)
      ;

    withRefsKeys.length.should.be.greaterThan(0);
    withRefs.should.not.have.property('withRefs');
    withRefsKeys.forEach(function(key) {
      if (typeof withRefs[key] !== 'function') {
        return;
      }
      from.should.have.property(key);
      from[key].should.be.a.Function;
    });

    t.done();
  }

, 'which causes get to POST to _all_docs with referenced ids': function(t) {
    var Referenced = odm.deliver('referenced')
      , Entity = odm.deliver('entity', function() {
          this.ref('first', Referenced);
          this.ref('second', Referenced);
        })
      , id = 'entity#1'
      , firstid = 'referenced#1'
      , secondid = 'referenced#2'
      , entityState = {
          _id: id
        , _rev: '1'
        , $firstId: firstid
        , $secondId: secondid
        }
      , firstState = { _id: firstid, kind: Referenced.$kind }
      , secondState = { _id: secondid, kind: Referenced.$kind }
      , recordSet = { rows: [{ doc: firstState }, { doc: secondState }] }

      , empty = function() {}
      , multi = { keys: [ firstid, secondid ] }
      , db = mock.mock('get').takes(id, empty).calls(1, [ null, entityState ])
      , _ = db.mock('fetch').takes(multi, empty).calls(1, [ null, recordSet ])
      , _ = db.config = { url: true, db: true }
      ;

    Entity.from(db).withRefs().get(id, function(e, entity) {
      should(e).be.not.ok;

      entity.should.have.properties({
        _id: id
      , _rev: entityState._rev
      , $firstId: firstid
      , $secondId: secondid
      });
      entity.should.have.properties(['first', 'second']);

      entity.first.should.have.properties({
        _id: firstid
      , kind: Referenced.$kind
      });

      entity.second.should.have.properties({
        _id: secondid
      , kind: Referenced.$kind
      });

      db.assertThrows();
      t.done();
    });
  }
};