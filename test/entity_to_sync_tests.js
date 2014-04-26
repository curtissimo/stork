var should = require('should')
  , mock = require('nodemock')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

var empty = function() {}
  , makeName = function() {
      return util.randomString(10).replace('_', '');
    }
  ;

exports['Entity#to has #sync'] = {
  setUp: function(cb) {
    var docName = '_design/entity'
      , rev = 5
      ;
    this.entity = function() {
      return odm.deliver('entity', this.views);
    };
    this.mockDb = function(doc, err, result) {
      var db = mock.mock('insert')
        .takes(doc, {}, empty)
        .calls(2, [err, result]);
      db.mock('get')
        .takes(docName, empty)
        .calls(1, [err, {_id: docName, _rev: rev}]);
      db.config = {url: true, db: true};
      return db;
    };
    this.views = function() {};

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

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }

, 'that includes allSort in #all, if applicable': function(t) {
    var doc = {
          views: {
            all: {
              map: [
                "function(doc) {",
                "  if(doc.kind === 'entity') {",
                "    emit([doc['st/a\\\\te'],doc['ssn']], null);",
                "  }",
                "}"
              ].join('\n')
            }
          }
        }
      , db = this.mockDb(doc, null, {})
      ;

    this.views = function() {
      this.string('ssn');
      this.string('state');
      this.sort('st/a\\te', 'ssn');
    };

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }

, 'that includes complex-key query as part of the definition': function(t, _) {
    var viewName = makeName()
      , keyName = makeName()
      , customView = {
          map: [
            "function(doc) {",
            "  if(doc.kind === 'entity') {",
            "    emit([doc['" + keyName + "'],doc['ssn']], null);",
            "  }",
            "}"
          ].join('\n')
        }
      , doc = {
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
      , db
      ;

    doc.views[viewName] = customView;
    db = this.mockDb(doc, null, {});

    this.views = function() {
      this.string('ssn');
      this.string('state');
      this.view(viewName, [keyName, 'ssn']);
    };

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }

, 'that includes complex-key query with custom mutator as part of the definition': function(t, _) {
    var viewName = makeName()
      , keyName = makeName()
      , customFunction = function(doc) { return doc.state.toUpperCase(); }
      , customView = {
          map: [
            "function(doc) {",
            "  var keys = [];",
            "  if(doc.kind === 'entity') {",
            "    keys[0] = (function (doc) { return doc.state.toUpperCase(); }(doc));",
            "    emit([keys[0],doc['ssn']], null);",
            "  }",
            "}"
          ].join('\n')
        }
      , doc = {
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

    doc.views[viewName] = customView;

    this.views = function() {
      this.string('ssn');
      this.string('state');
      this.view(viewName, [{keyName: customFunction}, 'ssn']);
    };

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }

, 'that includes composed relationship as part of the definition': function(t, _) {
    var relName = makeName()
      , viewName = 'with' + util.capitalize(relName)
      , keyName = makeName()
      , composed = odm.deliver('composed')
      , customView = {
          map: [
            "function(doc) {",
            "  if(doc.kind === 'entity') {",
            "    emit([doc._id, 0], null);",
            "  }",
            "  if(doc.kind === 'composed' && doc.$entity_" + relName + "_id) {",
            "    emit([doc.$entity_" + relName + "_id, 1, doc.$entity_" + relName + "_order], null);",
            "  }",
            "}"
          ].join('\n')
        }
      , doc = {
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

    doc.views[viewName] = customView;

    this.views = function() {
      this.composes(relName, composed);
    };

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }

, 'that includes multi-composed relationship as part of the definition': function(t, _) {
    var relName = makeName()
      , viewName = 'with' + util.capitalize(relName)
      , keyName = makeName()
      , composed = odm.deliver('composed')
      , composeded = odm.deliver('composeded')
      , customView = {
          map: [
            "function(doc) {",
            "  if(doc.kind === 'entity') {",
            "    emit([doc._id, 0], null);",
            "  }",
            "  if(doc.kind === 'composed' && doc.$entity_" + relName + "_id) {",
            "    emit([doc.$entity_" + relName + "_id, 1, doc.$entity_" + relName + "_order], null);",
            "  }",
            "  if(doc.kind === 'composeded' && doc.$entity_" + relName + "_id) {",
            "    emit([doc.$entity_" + relName + "_id, 1, doc.$entity_" + relName + "_order], null);",
            "  }",
            "}"
          ].join('\n')
        }
      , doc = {
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

    doc.views[viewName] = customView;

    this.views = function() {
      this.composes(relName, composed, composeded);
    };

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }

, 'that includes custom query as part of the definition': function(t, _) {
    var viewName = makeName()
      , keyFn = function (doc, emitKey) { emitKey(doc.key); }
      , customView = {
          map: [
            "function(doc) {",
            "  if(doc.kind === 'entity') {",
            "    (function (doc, emitKey) { emitKey(doc.key); }(doc, emit));",
            "  }",
            "}"
          ].join('\n')
        }
      , doc = {
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
      , db
      ;

    doc.views[viewName] = customView;
    db = this.mockDb(doc, null, {});

    this.views = function() {
      this.string('key');
      this.view(viewName, keyFn);
    };

    this.entity().to(db).sync(function(err) {
      should(err).not.be.ok;
      db.assertThrows();
      t.done();
    });
  }
};
