var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  ;

exports['instance#to has #save'] = {
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
      if (id) {
        db = db.takes(state, id, empty);
        callbackIndex = 2;
      } else {
        db = db.takes(state, empty);
        callbackIndex = 1;
      }
      if (!err) {
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
        if (typeof inst[key] === 'function') {
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

, 'does not create a createdOn if not defined in schema': function(t) {
    var inst = this.instance
      , mixin = {id: 'woot', rev: '1-another'}
      , db = this.mockDb(inst, null, null, mixin)
      ;

    inst.to(db).save(function(e, doc) {
      doc.should.not.have.property('createdOn');
      t.done();
    });
  }

, 'does not create an updatedOn if not defined in schema': function(t) {
    var inst = this.instance
      , mixin = {id: 'woot', rev: '1-another'}
      , db = this.mockDb(inst, null, null, mixin)
      ;

    inst.to(db).save(function(e, doc) {
      doc.should.not.have.property('updatedOn');
      t.done();
    });
  }

, 'sets createdOn only on first save if defined in schema': function(t) {
    var inst = odm.deliver('person', function() {
          this.string('firstName', {required: true});
          this.string('lastName', {required: true});
          this.datetime('birthday', {required: true});
          this.timestamps();
        }).new({
          firstName: 'Marco'
        , lastName: 'Polo'
        , birthday: new Date(1254, 8, 15)
        , extra: 123
        })
      , mixin1 = {id: 'woot', rev: '1-another'}
      , mixin2 = {id: 'woot', rev: '2-another'}
      , db1 = this.mockDb(inst, null, null, mixin1)
      , db2 = this.mockDb(inst, null, null, mixin2)
      , before
      , after
      , time
      ;

    inst.should.have.property('createdOn', undefined);

    before = new Date();
    inst.to(db1).save(function(e, doc) {
      after = new Date();
      time = inst.createdOn;
      time.valueOf().should.be.within(before.valueOf(), after.valueOf());
      inst.to(db2).save(function(e, doc) {
        inst.createdOn.should.be.equal(time);
        doc.should.have.property('_rev', mixin2.rev);
        t.done();
      });
    });
  }

, 'sets updatedOn on every save if defined in schema': function(t) {
    var inst = odm.deliver('person', function() {
          this.string('firstName', {required: true});
          this.string('lastName', {required: true});
          this.datetime('birthday', {required: true});
          this.timestamps();
        }).new({
          firstName: 'Marco'
        , lastName: 'Polo'
        , birthday: new Date(1254, 8, 15)
        , extra: 123
        })
      , mixin1 = {id: 'woot', rev: '1-another'}
      , mixin2 = {id: 'woot', rev: '2-another'}
      , db1 = this.mockDb(inst, null, null, mixin1)
      , db2 = this.mockDb(inst, null, null, mixin2)
      , before
      , after
      , time
      ;

    inst.should.have.property('updatedOn', undefined);

    before = new Date();
    inst.to(db1).save(function(e, doc) {
      after = new Date();
      time = inst.updatedOn;
      time.valueOf().should.be.within(before.valueOf(), after.valueOf());
      inst.to(db2).save(function(e, doc) {
        after = new Date();
        inst.updatedOn.valueOf().should.be.within(time, after.valueOf());
        doc.should.have.property('_rev', mixin2.rev);
        t.done();
      });
    });
  }
};

exports['instances that use #ref'] = {
  setUp: function(cb) {
    var Person = this.Person = odm.deliver('person')
      , _ = this.Discussion = odm.deliver('discussion', function() {
          this.ref('author', Person, { required: true });
        })
      ;

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

, 'saves the state of the object with the id': function(t) {
    var person = this.Person.new({ _id: 'Charles Darwin '})
      , discussion = this.Discussion.new({ author: person })
      , state = { $authorId: person._id }
      , callbackState = { _id: 'someId', $authorId: person._id, _rev: '1' }
      , callbackArgs = [ null, callbackState ]

      , empty = function() {}
      , db = mock.mock('insert').takes(state, empty).calls(1, callbackArgs)
      ;
    db.config = { url: true, db: true };

    discussion.to(db).save(function(e, d) {
      db.assertThrows();
      t.done();
    });
  }
};

exports['instances that use #composes'] = {
  setUp: function(cb) {
    var Comment = this.Comment = odm.deliver('comment')
      , _ = this.Discussion = odm.deliver('discussion', function() {
          this.composes('comments', Comment);
        })
      ;

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

, 'marks the composed objects with the id of the parent': function(t) {
    var discussionId = 'disc'
      , comments = [
          this.Comment.new()
        , this.Comment.new()
        , this.Comment.new()
        ]
      , discussion = this.Discussion.new({ comments: comments })
      , commentState = { kind: 'comment' }
      , decisionState = { kind: 'discussion' }
      , empty = function() {}
      , db = mock
              .mock('insert')
              .takes(decisionState, empty)
              .calls(1, [null, { id: '1', rev: '2' }])
      , _ = db.mock('insert')
              .takes({ $discussion_comments_id: '1' }, empty)
              .calls(1, [null, { id: '1', rev: '1' }])
      , _ = db.mock('insert')
              .takes({ $discussion_comments_id: '1' }, empty)
              .calls(1, [null, { id: '5', rev: '53' }])
      , _ = db.mock('insert')
              .takes({ $discussion_comments_id: '1' }, empty)
              .calls(1, [null, { id: '13', rev: '22' }])
      , _ = db.config = { url: true, db: true }
      ;

    discussion.to(db).save(function(e, d) {
      db.assertThrows();
      t.done();
    });
  }

, 'does not fail for no composed objects': function(t) {
    var discussionId = 'disc'
      , discussion = this.Discussion.new()
      , decisionState = { kind: 'discussion' }
      , empty = function() {}
      , db = mock
              .mock('insert')
              .takes(decisionState, empty)
              .calls(1, [null, { id: '1', rev: '2' }])
      , _ = db.config = { url: true, db: true }
      ;

    discussion.to(db).save(function(e, d) {
      db.assertThrows();
      t.done();
    });
  }

, 'does not fail for empty composed objects': function(t) {
    var discussionId = 'disc'
      , discussion = this.Discussion.new({ comments: [] })
      , decisionState = { kind: 'discussion' }
      , empty = function() {}
      , db = mock
              .mock('insert')
              .takes(decisionState, empty)
              .calls(1, [null, { id: '1', rev: '2' }])
      , _ = db.config = { url: true, db: true }
      ;

    discussion.to(db).save(function(e, d) {
      db.assertThrows();
      t.done();
    });
  }
};

exports['instances that use #binary'] = {
  setUp: function(cb) {
    this.Person = odm.deliver('person', function() {
      this.binary('photo');
    });

    this.mockDb = function(doc, att, params, mixin) {
      var db  = mock.mock('insert')
        , callbackIndex = 3
        , callbackArgs = [null]
        , state = JSON.parse(JSON.stringify(doc))
        ;
      db = db.takes(state, att, params, empty);
      callbackArgs.push(mixin);
      db = db.calls(callbackIndex, callbackArgs);
      return {
        multipart: db,
        config: {url: true, db: true}
      };
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

, 'calls #multipart#insert on save for Buffer binary property': function(t) {
    var Person = this.Person
      , buffer = new Buffer('123')
      , inst = Person.new({photo: buffer, _id: 'moo'})
      , state = {kind: 'person', photo: 'photo', _id: 'moo'}
      , attachments = [{name: 'photo', data: buffer}]
      , mixin = {_id: 'woot', _rev: 'another'}
      , db = this.mockDb(state, attachments, {doc_name: 'moo'}, mixin)
      ;

    inst.to(db).save(function(e, doc) {
      should(e).not.be.ok;
      t.done();
    });
  }

, 'calls #multipart#insert on save for object/Buffer binary property': function(t) {
    var Person = this.Person
      , buffer = new Buffer('123')
      , binary = {content: new Buffer('123'), type: 'application/octet-stream'}
      , inst = Person.new({photo: binary, _id: 'woot', _rev: 'another'})
      , state = {kind: 'person', photo: 'photo'}
      , attachments = [{name: 'photo', data: buffer, content_type: 'application/octet-stream'}]
      , mixin = {_id: 'woot', _rev: 'another'}
      , db = this.mockDb(state, attachments, {doc_name: 'woot', rev: 'another'}, mixin)
      ;

    inst.to(db).save(function(e, doc) {
      should(e).not.be.ok;
      t.done();
    });
  }
};
