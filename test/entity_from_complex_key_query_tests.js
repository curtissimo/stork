var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['Entity#from provides a query function'] = {
  setUp: function(cb) {
    var viewName = this.viewName = util.randomString(10).replace('_', '')
      , entityName = this.entityName = util.randomString(10).replace('_', '')
      ;
    
    this.Entity = odm.deliver(this.entityName, function() {
      this.string('s');
      this.datetime('dt');
      this.view(viewName, ['dt', 's']);
    });
    this.mockDb = function(err, result) {
      var db = mock.mock('view')
        .takes(entityName, viewName, {include_docs: true}, empty)
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

, 'that invokes the db#view(entityName, viewName, ...) method': function(t) {
    var Entity = this.Entity
      , value = {}
      , viewName = util.randomString(10).replace('_', '')
      , db = this.mockDb(null, value)
      ;
    Entity.from(db)[this.viewName](function(err, result) {
      db.assertThrows();
      t.done();
    });
  }

, 'that returns the error from db#view if one occurs': function(t) {
    var Entity = this.Entity
      , value = {}
      , db = this.mockDb(value, null)
      ;
    Entity.from(db)[this.viewName](function(err, result) {
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
    Entity.from(db)[this.viewName](function(err, result) {
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
    Entity.from(db)[this.viewName](function(err, result) {
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
};
