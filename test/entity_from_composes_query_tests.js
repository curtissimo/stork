var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  , makeName = function() {
      return util.randomString(10).replace('_', '')
    }
  ;

exports['Entity#from provides a query function'] = {
  setUp: function(cb) {
    var relName = this.relName = makeName()
      , entityName = this.entityName = makeName()
      , composedName = this.composedName = makeName()
      , Composed = odm.deliver(this.composedName)
      , relViewName = 'with' + util.capitalize(relName)
      ;

    this.Entity = odm.deliver(this.entityName, function() {
      this.composes(relName, Composed);
    });
    this.mockDb = function(id, err, result) {
      var opts = {
            include_docs: true
          , startkey: [id, 0]
          , endkey: [id, 2]
          }
        , db = mock.mock('view')
          .takes(entityName, relViewName, opts, empty)
          .calls(3, [err, result])
        ;
      db.config = {url: true, db: true};
      return db;
    };

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

, 'that invokes the db#view(entityName, relName, ...) method': function(t) {
    var Entity = this.Entity
      , value = {}
      , id = 'sdfakjdhf'
      , db = this.mockDb(id, null, value)
      , relName = 'with' + util.capitalize(this.relName)
      ;
    Entity.from(db)[relName](id, function(err, result) {
      db.assertThrows();
      t.done();
    });
  }

, 'that returns the error from db#view if one occurs': function(t) {
    var Entity = this.Entity
      , value = {}
      , id = 'pqiuwernfiu'
      , db = this.mockDb(id, value, null)
      , relName = 'with' + util.capitalize(this.relName)
      ;
    Entity.from(db)[relName](id, function(err, result) {
      err.should.be.ok;
      should(result).not.be.ok;
      t.done();
    });
  }

, 'that returns an empty array if db#view returns no results': function(t) {
    var Entity = this.Entity
      , value = {rows: []}
      , id = 'ouwqyebrou'
      , db = this.mockDb(id, null, value)
      , relName = 'with' + util.capitalize(this.relName)
      ;
    Entity.from(db)[relName](id, function(err, result) {
      should(err).not.be.ok;
      should(result).not.be.ok;
      t.done();
    });
  }

, 'that returns an instance with composed children if db#view returns results': function(t) {
    var Entity = this.Entity
      , id = 'entity#1'
      , results = { rows: [
          { doc: { _id: id, _rev: '34' }}
        , { doc: { _id: 'composed#1', _rev: '99' }}
        , { doc: { _id: 'composed#2', _rev: '23' }}
        , { doc: { _id: 'composed#3', _rev: '56' }}
        , { doc: { _id: 'composed#4', _rev: '73' }}
        ]}
      , db = this.mockDb(id, null, results)
      , relName = this.relName
      , calculatedRelName = 'with' + util.capitalize(relName)
      ;

    Entity.from(db)[calculatedRelName](id, function(err, entity) {
      var i
        , composed
        ;

      should(err).not.be.ok;
      entity.should.be.ok;
      entity.should.have.properties(results.rows[0].doc);
      entity[relName].should.have.length(results.rows.length - 1);

      for (i = 0; i < entity[relName].length; i += 1) {
        composed = entity[relName][i];
        composed.should.have.properties(results.rows[i + 1].doc);
      }
      t.done();
    });
  }
};
