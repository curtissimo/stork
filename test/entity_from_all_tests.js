var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['Entity#from has #all'] = {
  setUp: function(cb) {
    this.entityName = util.randomString(10).replace('_', '');
    this.Entity = odm.deliver(this.entityName, function() {
      this.string('s');
      this.datetime('dt');
      this.timestamps();
    });
    this.mockDb = function(err, result) {
      var db = mock.mock('view')
        .takes(this.entityName, 'all', {include_docs: true}, empty)
        .calls(3, [err, result]);
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

, 'that invokes the db#view(entityName, "all", ...) method': function(t) {
    var Entity = this.Entity
      , value = {}
      , db = this.mockDb(null, value)
      ;
    Entity.from(db).all(function(err, result) {
      db.assertThrows();
      t.done();
    });
  }

, 'that returns the error from db#view if one occurs': function(t) {
    var Entity = this.Entity
      , value = {}
      , db = this.mockDb(value, null)
      ;
    Entity.from(db).all(function(err, result) {
      err.should.be.ok;
      should(result).not.be.ok;
      t.done();
    });
  }

, 'that returns an empty array if db#view returns no results': function(t) {
    var Entity = this.Entity
      , value = {rows: []}
      , db = this.mockDb(null, value)
      ;
    Entity.from(db).all(function(err, result) {
      should(err).not.be.ok;
      result.should.be.an.Array;
      result.should.be.empty;
      t.done();
    });
  }

, 'that returns an array of instances if db#view returns results': function(t) {
    var Entity = this.Entity
      , obj1 = {
          id: 'obj1'
        , key: 'obj1'
        , value: null
        , doc: {
            s: 'text1'
          , dt: "2012-07-14T05:00:00.000Z"
          , createdOn: "2012-07-14T05:00:00.000Z"
          , updatedOn: "2012-07-14T05:00:00.000Z"
          , kind: this.entityName
          , _id: 'obj1'
          , _rev: '1-sdflkj'
          }
        }
      , match = util.clone(obj1.doc)
      , dateProperties = ['dt', 'createdOn', 'updatedOn']
      , value = {rows: [obj1]}
      , db = this.mockDb(null, value)
      ;
    dateProperties.forEach(function(prop) {
      match[prop] = new Date(match[prop]);
    });
    Entity.from(db).all(function(err, result) {
      var instance
        ;
      should(err).not.be.ok;
      result.should.be.an.Array;
      result.should.not.be.empty;
      result.should.have.length(value.rows.length);

      instance = result[0];
      instance.should.be.ok;
      instance.should.have.properties(match);
      instance.should.have.property('$schema');
      t.done();
    });
  }

, 'that converts nested date time values from strings to Dates': function (t) {
    var Entity = odm.deliver(this.entityName, function () {
          this.object('nested', function () {
            this.datetime('dt');
          });
        })
      , obj1 = {
          id: 'obj1'
        , key: 'obj1'
        , value: null
        , doc: {
            nested: {
              dt: "2012-07-14T05:00:00.000Z"
            }
          , kind: this.entityName
          , _id: 'obj1'
          , _rev: '1-sdflkj'
          }
        }
      , match = util.clone(obj1.doc)
      , value = {rows: [ obj1 ]}
      , db = this.mockDb(null, value)
      ;
    match.nested.dt = new Date(match.nested.dt);
    Entity.from(db).all(function(err, result) {
      var instance
        ;
      should(err).not.be.ok;
      result.should.be.an.Array;
      result.should.not.be.empty;
      result.should.have.length(value.rows.length);
      instance = result[0];

      instance.should.be.ok;
      instance.nested.dt.should.be.ok;
      instance.nested.dt.should.be.equal(match.nested.dt);
      t.done();
    });
  }
};
