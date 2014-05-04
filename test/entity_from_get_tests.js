var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['Entity#from has #get'] = {
  setUp: function(cb) {
    this.entityName = util.randomString(10).replace('_', '');
    this.Entity = odm.deliver(this.entityName, function() {
      this.string('s');
      this.datetime('dt');
      this.timestamps();
    });
    this.mockDb = function(id, err, result) {
      var db = mock.mock('get')
        .takes(id, empty)
        .calls(1, [err, result]);
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

, 'that invokes the db#get(id, ...) method': function(t) {
    var Entity = this.Entity
      , value = {}
      , id = util.randomString(10).replace('_', '')
      , db = this.mockDb(id, null, value)
      ;
    Entity.from(db).get(id, function(err, result) {
      db.assertThrows();
      t.done();
    });
  }

, 'that returns the error from db#view if one occurs': function(t) {
    var Entity = this.Entity
      , value = {}
      , id = util.randomString(10).replace('_', '')
      , db = this.mockDb(id, value, null)
      ;
    Entity.from(db).get(id, function(err, result) {
      err.should.be.ok;
      should(result).not.be.ok;
      t.done();
    });
  }

, 'that returns an instance if db#get returns a result': function(t) {
    var Entity = this.Entity
      , obj1 = {
          s: 'text1'
        , dt: "2012-07-14T05:00:00.000Z"
        , createdOn: "2012-07-14T05:00:00.000Z"
        , updatedOn: "2012-07-14T05:00:00.000Z"
        , kind: this.entityName
        , _id: 'obj1'
        , _rev: '1-sdflkj'
        }
      , match = util.clone(obj1)
      , dateProperties = ['dt', 'createdOn', 'updatedOn']
      , id = util.randomString(10).replace('_', '')
      , db = this.mockDb(id, null, obj1)
      ;
    dateProperties.forEach(function(prop) {
      match[prop] = new Date(match[prop]);
    });
    Entity.from(db).get(id, function(err, result) {
      var instance
        ;
      should(err).not.be.ok;
      instance = result;
      instance.should.be.ok;
      instance.should.have.properties(match);
      instance.should.have.property('$schema');
      t.done();
    });
  }
};

exports['Entity#from has #get that handles binary properties'] = {
  setUp: function(cb) {
    this.entityName = util.randomString(10).replace('_', '');
    this.Entity = odm.deliver(this.entityName, function() {
      this.binary('b');
    });
    this.mockDb = function(id, err, result) {
      var db = mock.mock('get')
        .takes(id, empty)
        .calls(1, [err, result]);
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

, 'by copying _attachments content_type and length information': function(t) {
    var Entity = this.Entity
      , value = {
          _attachments: {
            b: { content_type: 'image/png', length: 12345 }
          }
        }
      , id = util.randomString(10).replace('_', '')
      , db = this.mockDb(id, null, value)
      ;
    Entity.from(db).get(id, function(err, result) {
      result.b.type.should.be.equal('image/png');
      result.b.length.should.be.equal(12345);
      t.done();
    });
  }

, 'by having a pipeFrom method on the binary property': function(t) {
    var Entity = this.Entity
      , value = {
          _attachments: {
            b: { content_type: 'image/png', length: 12345 }
          }
        }
      , id = util.randomString(10).replace('_', '')
      , db = this.mockDb(id, null, value)
      ;
    Entity.from(db).get(id, function(err, result) {
      result.b.pipeFrom.should.be.Function;
      t.done();
    });
  }
};
