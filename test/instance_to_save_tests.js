var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['instance#to has #sync'] = {
  setUp: function(cb) {
    this.instance = odm.deliver('person', function() {
      this.string('firstName', {required: true});
      this.string('lastName', {required: true});
      this.datetime('birthday', {required: true});
    }).new({
      firstName: 'Marco'
    , lastName: 'Polo'
    , birthday: new Date(1254, 8, 15)
    , extra: 123
    });
    this.mockDb = function(doc, id, err, mixin) {
      var db = mock.mock('insert')
        , callbackIndex
        , callbackArgs = [err]
        , state = JSON.parse(JSON.stringify(doc))
        ;
      if(id) {
        db = db.takes(state, id, empty);
        callbackIndex = 2;
      } else {
        db = db.takes(state, empty);
        callbackIndex = 1;
      }
      if(!err) {
        callbackArgs.push(mixin);
      }
      db = db.calls(callbackIndex, callbackArgs);
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

, 'that calls db#insert for the object': function(t) {
    var inst = this.instance
      , mixin = {_id: 'woot', _rev: 'another'}
      , db = this.mockDb(inst, null, null, mixin)
      ;

    inst.to(db).save(function(e, doc) {
      should(e).not.be.ok;
      Object.keys(inst).forEach(function(key) {
        if(typeof inst[key] === 'function') {
          return;
        }
        doc.should.have.property(key, inst[key]);
      });
      t.done();
    });
  }

, 'on success, returns the object with the new id and revision': function(t) {
    var inst = this.instance
      , mixin = {id: 'woot', rev: 'another'}
      , db = this.mockDb(inst, null, null, mixin)
      ;

    inst.to(db).save(function(e, doc) {
      should(e).not.be.ok;
      doc.should.have.property('_id', mixin.id);
      doc.should.have.property('_rev', mixin.rev);
      t.done();
    });
  }

, 'on error, returns no object': function(t) {
    var inst = this.instance
      , db = this.mockDb(inst, null, {}, null)
      ;

    inst.to(db).save(function(e, doc) {
      e.should.be.ok;
      should(doc).not.be.ok;
      t.done();
    });
  }

, 'can save an already saved instance': function(t) {
    var inst = this.instance
      , mixin1 = {id: 'woot', rev: '1-another'}
      , mixin2 = {id: 'woot', rev: '2-another'}
      , db1 = this.mockDb(inst, null, null, mixin1)
      , db2 = this.mockDb(inst, null, null, mixin2)
      ;

    inst.to(db1).save(function(e, doc) {
      inst.to(db2).save(function(e, doc) {
        doc.should.have.property('_rev', mixin2.rev);
        t.done();
      });
    });
  }
};
