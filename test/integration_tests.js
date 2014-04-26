var nano = require('nano')
  , os = require('os')
  , async = require('async')
  , util = require('utile')
  , odm = require('../lib/stork')
  ;

// Put your own CouchDb endpoint in the dbOverrides to customize where your
// integration test runs.
var dbOverrides = {
      druthers: 'http://couchdb15:5984/stork_test'
    }
  , dburl = dbOverrides[os.hostname()] || 'http://localhost:5984/stork_test'
  , db = nano(dburl)
  , dbms = nano(db.config.url)
  , db = dbms.use(db.config.db)
  , integration = function(o) {
      var run = !process.env['SKIP_STORK_DB_TESTS']
        ;

      if (run) {
        return o;
      }
      return {};
    }
  ;

module.exports = integration({
  setUp: function(cb) {
    dbms.db.destroy(db.config.db, function(err) {
      if (err) {
        cb(err);
      }
      setTimeout(function () {
        dbms.db.create(db.config.db, function(err) {
          cb(err);
        });
      }, 0);
    });
  }

, 'create default entity design document': function(t) {
    var entityName = 'defaulty'
      , entity = odm.deliver(entityName)
      ;

    entity.to(dburl).sync(function(e) {
      if (e) {
        return t.done(e);
      }
      db.get('_design/' + entityName, function(e, doc) {
        if (e) {
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

, 'update entity design document': function(t) {
    var entityName = 'defaulty'
      , entity = odm.deliver(entityName)
      ;

    entity.to(dburl).sync(function(e, answer1) {
      if (e) {
        return t.done(e);
      }
      entity.to(dburl).sync(function(e, answer2) {
        if (e) {
          return t.done(e);
        }
        answer1.id.should.equal(answer2.id);
        answer1.rev.should.not.equal(answer2.rev);
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
      if (e) {
        return t.done(e);
      }
      db.get('_design/' + entityName, function(e, doc) {
        if (e) {
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

, 'save new object': function(t) {
    var entityName = 'sorty'
      , entity = odm.deliver(entityName, function() {
          this.string('s', {required: true});
          this.datetime('dt', {required: true});
        })
      , instance = entity.new({
          s: 'text'
        , dt: new Date(2012, 6, 14)
        , extra: 1
        })
      ;

    instance.to(dburl).save(function(e, result) {
      if (e) {
        return t.done(e);
      }
      result.should.have.property('_id');
      result.should.have.property('_rev');
      db.get(result._id, function(e, doc) {
        if (e) {
          return t.done(e);
        }

        doc.dt = new Date(doc.dt);
        doc.should.be.ok;
        doc.should.have.property('_id', result._id);
        doc.should.have.property('s', result.s);
        doc.should.have.property('dt', result.dt);
        doc.should.have.property('extra', result.extra);
        doc.should.have.property('_rev', result._rev);
        t.done();
      });
    });
  }

, 'save new object with explicit id': function(t) {
    var entityName = 'sorty'
      , entity = odm.deliver(entityName, function() {
          this.string('s', {required: true});
          this.datetime('dt', {required: true});
        })
      , instance = entity.new({
          s: 'text'
        , dt: new Date(2012, 6, 14)
        , extra: 1
        , _id: 'hello mary!'
        })
      ;

    instance.to(dburl).save(function(e, result) {
      if (e) {
        return t.done(e);
      }
      result.should.have.property('_id', instance._id);
      result.should.have.property('_rev');
      db.get(result._id, function(e, doc) {
        if (e) {
          return t.done(e);
        }
        doc.dt = new Date(doc.dt);
        doc.should.be.ok;
        doc.should.have.property('_id', result._id);
        doc.should.have.property('s', result.s);
        doc.should.have.property('dt', result.dt);
        doc.should.have.property('extra', result.extra);
        doc.should.have.property('_rev', result._rev);
        t.done();
      });
    });
  }

, 'save previously saved object': function(t) {
    var entityName = 'sorty'
      , entity = odm.deliver(entityName, function() {
          this.string('s', {required: true});
          this.datetime('dt', {required: true});
        })
      , instance = entity.new({
          s: 'text'
        , dt: new Date(2012, 6, 14)
        , extra: 1
        })
      ;

    instance.to(dburl).save(function(e, result) {
      if (e) {
        return t.done(e);
      }
      instance.to(dburl).save(function(e, result) {
        if (e) {
          return t.done(e);
        }
        db.get(result._id, function(e, doc) {
          if (e) {
            return t.done(e);
          }
          doc.dt = new Date(doc.dt);
          doc.should.be.ok;
          doc.should.have.property('_id', result._id);
          doc.should.have.property('s', result.s);
          doc.should.have.property('dt', result.dt);
          doc.should.have.property('extra', result.extra);
          doc.should.have.property('_rev', result._rev);
          t.done();
        });
      });
    });
  }

, 'query entity#all': function(t) {
    var entityName = 'sorty'
      , Entity = odm.deliver(entityName, function() {
          this.string('s', {required: true});
          this.datetime('dt', {required: true});
        })
      , instances = [
          Entity.new({s: 'text', dt: new Date(2012, 6, 14), extra: 1})
        , Entity.new({s: 'txet', dt: new Date(2013, 9, 21), extra: -1})
        ]
      ;

    async.series([
      function(cb) { Entity.to(dburl).sync(cb); }
    , function(cb) { instances[0].to(dburl).save(cb); }
    , function(cb) { instances[1].to(dburl).save(cb); }
    , function(cb) { Entity.from(dburl).all(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      var objs = results[results.length - 1]
        ;
      objs.should.be.an.Array;
      objs.should.have.length(2);
      objs.forEach(function(obj, i) {
        Object.keys(obj).forEach(function(key) {
          if (typeof obj[key] === 'function') {
            return;
          }
          obj[key].should.be.eql(instances[i][key]);
        });
      });
      t.done();
    });
  }

, 'get a previously saved object': function(t) {
    var entityName = 'sorty'
      , Entity = odm.deliver(entityName, function() {
          this.string('s', {required: true});
          this.datetime('dt', {required: true});
        })
      , nakeds = [
          {s: 'text', dt: new Date(2012, 6, 14), extra: 1}
        , {s: 'txet', dt: new Date(2013, 9, 21), extra: -1}
        ]
      , instances = [
          Entity.new(nakeds[0])
        , Entity.new(nakeds[1])
        ]
      , from = Entity.from(dburl)
      ;

    async.series([
      function(cb) { Entity.to(dburl).sync(cb); }
    , function(cb) { instances[0].to(dburl).save(cb); }
    , function(cb) { instances[1].to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      async.series([
        from.get.bind(from, results[1]._id)
      , from.get.bind(from, results[2]._id)
      ], function(err, results) {
        if (err) {
          return t.done(err);
        }
        results[0].should.have.properties(nakeds[0]);
        results[0].should.have.property('$schema', instances[0].$schema);
        results[1].should.have.properties(nakeds[1]);
        results[1].should.have.property('$schema', instances[1].$schema);
        t.done();
      });
    });
  }

, 'get a previously saved object with stork#form': function(t) {
    var entityName = 'sorty'
      , Entity = odm.deliver(entityName, function() {
          this.string('s', {required: true});
          this.datetime('dt', {required: true});
        })
      , nakeds = [
          {s: 'text', dt: new Date(2012, 6, 14), extra: 1}
        , {s: 'txet', dt: new Date(2013, 9, 21), extra: -1}
        ]
      , instances = [
          Entity.new(nakeds[0])
        , Entity.new(nakeds[1])
        ]
      , from = odm.from(dburl)
      ;

    async.series([
      function(cb) { Entity.to(dburl).sync(cb); }
    , function(cb) { instances[0].to(dburl).save(cb); }
    , function(cb) { instances[1].to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      async.series([
        from.get.bind(from, [ Entity ], results[1]._id)
      , from.get.bind(from, [ Entity ], results[2]._id)
      ], function(err, results) {
        if (err) {
          return t.done(err);
        }
        results[0].should.have.properties(nakeds[0]);
        results[0].should.have.property('$schema', instances[0].$schema);
        results[1].should.have.properties(nakeds[1]);
        results[1].should.have.property('$schema', instances[1].$schema);
        t.done();
      });
    });
  }

, 'create entity design document with complex-key query': function(t) {
    var entityName = util.randomString(10).replace('_', '')
      , field1 = util.randomString(10).replace('_', '')
      , field2 = util.randomString(10).replace('_', '')
      , viewName = util.randomString(10).replace('_', '')
      , entity = odm.deliver(entityName, function() {
          this.string(field1);
          this.string(field2);
          this.view(viewName, [field1, field2]);
        })
      ;

    entity.to(dburl).sync(function(e) {
      if (e) {
        return t.done(e);
      }
      db.get('_design/' + entityName, function(e, doc) {
        var customView
          ;
        if (e) {
          return t.done(e);
        }
        doc.should.be.ok;
        doc.should.have.property('views');
        doc.views.should.have.property('all');
        doc.views.all.should.have.property('map');
        doc.views.all.map.indexOf('emit(doc._id').should.be.greaterThan(-1);

        doc.views.should.have.property(viewName);
        doc.views[viewName].should.have.property('map');
        customView = doc.views[viewName].map;
        customView.indexOf('\'' + field1 + '\'').should.be.greaterThan(-1);
        customView.indexOf('\'' + field2 + '\'').should.be.greaterThan(-1);
        customView.indexOf('doc.kind === \'' + entityName + '\'').should.be.greaterThan(-1);
        t.done();
      });
    });
  }

, 'create entity design document with complex-key key mutator query': function(t) {
    var entityName = util.randomString(10).replace('_', '')
      , field1 = util.randomString(10).replace('_', '')
      , field2 = util.randomString(10).replace('_', '')
      , value1 = util.randomString(20).toLowerCase().replace('_', '')
      , value2 = util.randomString(20).toLowerCase().replace('_', '')
      , viewName = util.randomString(10)
      , field1Function = new Function("return doc['" + field1 + "'].toUpperCase();")
      , field2Function = new Function("return doc['" + field2 + "'].toUpperCase();")
      , firstKey = {}
      , _ = firstKey[field2] = field1Function
      , secondKey = {}
      , _ = secondKey[field2] = field2Function
      , Entity = odm.deliver(entityName, function() {
          this.string(field1);
          this.string(field2);
          this.view(viewName, [firstKey, secondKey]);
        })
      , instances = [
          Entity.new()
        , Entity.new()
        ]
      , firstIndex = value1 < value2? 0 : 1
      , secondIndex = 1 - firstIndex
      ;

    instances[0][field1] = value1;
    instances[0][field2] = value2;

    instances[1][field1] = value2;
    instances[1][field2] = value1;

    async.series([
      function(cb) { Entity.to(dburl).sync(cb); }
    , function(cb) { instances[0].to(dburl).save(cb); }
    , function(cb) { instances[1].to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      db.view(entityName, viewName, function(err, result) {
        if (err) {
          return t.done(err);
        }
        result.total_rows.should.equal(2);
        result.rows.should.have.length(2);
        result.rows[firstIndex].key.should.eql([value1.toUpperCase(), value2.toUpperCase()]);
        result.rows[secondIndex].key.should.eql([value2.toUpperCase(), value1.toUpperCase()]);
        t.done();
      });
    });
  }

, 'execute complex-key query for entity from special method': function(t) {
    var Entity = odm.deliver('someEntity', function() {
          this.string('s');
          this.string('dt');
          this.view('someView', ['dt', 's']);
        })
      , nakeds = [
          {s: 'text', dt: new Date(2012, 6, 14), extra: 1}
        , {s: 'txet', dt: new Date(2010, 9, 21), extra: -1}
        ]
      , instances = [
          Entity.new(nakeds[0])
        , Entity.new(nakeds[1])
        ]
      , from = Entity.from(dburl)
      ;

    async.series([
      function(cb) { Entity.to(dburl).sync(cb); }
    , function(cb) { instances[0].to(dburl).save(cb); }
    , function(cb) { instances[1].to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      Entity.from(db).someView(function(err, results) {
        results[0].should.have.properties(nakeds[1]);
        results[1].should.have.properties(nakeds[0]);
        t.done();
      });
    });
  }

, 'save object with ref': function(t) {
    var entityName = 'sorty'
      , referredName = 'morty'
      , Morty = odm.deliver(referredName)
      , Entity = odm.deliver(entityName, function() {
          this.ref('other', Morty)
        })
      , referred = Morty.new()
      , entity = Entity.new({ other: referred })
      ;

    async.series([
      function(cb) { referred.to(dburl).save(cb); }
    , function(cb) { entity.to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      db.get(entity._id, function(e, doc) {
        if (e) {
          return t.done(e);
        }
        doc.should.have.property('$otherId', referred._id);
        t.done();
      });
    });
  }

, 'get object withRef': function(t) {
    var entityName = 'sorty'
      , referredName = 'morty'
      , entityId = 'some id for me'
      , Morty = odm.deliver(referredName)
      , Entity = odm.deliver(entityName, function() {
          this.ref('other', Morty)
        })
      , referred = Morty.new({ firstName: referredName })
      , entity = Entity.new({ _id: entityId, other: referred })
      ;

    async.series([
      function(cb) { referred.to(dburl).save(cb); }
    , function(cb) { entity.to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      Entity.from(dburl).withRefs().get(entityId, function(e, entity) {
        entity.other.firstName.should.be.equal(referredName);
        t.done();
      });
    });
  }

, 'save object with composed relationship': function(t) {
    var entityName = 'sorty'
      , referredName = 'morty'
      , Morty = odm.deliver(referredName)
      , Entity = odm.deliver(entityName, function() {
          this.composes('others', Morty)
        })
      , referred = Morty.new()
      , entity = Entity.new({ others: [ referred ]})
      ;

    async.series([
      function(cb) { referred.to(dburl).save(cb); }
    , function(cb) { entity.to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      entity.others[0].should.have.property('$sorty_others_id', entity._id);
      t.done();
    });
  }

, 'execute custom query for entity from special method': function(t) {
    var Entity = odm.deliver('someEntity', function() {
          this.string('s');
          this.string('dt');
          this.view('someView', function(d, e) {
            if(d.s) {e(d.s);}
            if(d.dt) {e(d.dt);}
          });
        })
      , nakeds = [
          {s: 'key1', extra: 1}
        , {s: 'key2', dt: 'key1', extra: -1}
        ]
      , instances = [
          Entity.new(nakeds[0])
        , Entity.new(nakeds[1])
        ]
      , from = Entity.from(dburl)
      ;

    async.series([
      function(cb) { Entity.to(dburl).sync(cb); }
    , function(cb) { instances[0].to(dburl).save(cb); }
    , function(cb) { instances[1].to(dburl).save(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      Entity.from(db).someView('key1', function(err, results) {
        results[0].should.have.properties(nakeds[0]);
        results[1].should.have.properties(nakeds[1]);

        Entity.from(db).someView('key2', function(err, results) {
          results[0].should.have.properties(nakeds[1]);
          t.done();
        });
      });
    });
  }

, 'get composed objects through withXXX query': function(t) {
    var Comment = odm.deliver('comment', function() {
          this.string('text');
        })
      , Response = odm.deliver('response', function() {
          this.string('text');
        })
      , Discussion = odm.deliver('discussion', function() {
          this.string('text');
          this.composes('comments', Comment, Response);
        })
      , comments = [
          Comment.new({ text: 'hello!' })
        , Response.new({ text: 'goofy!' })
        , Comment.new({ text: 'world!' })
        ]
      , otherComment = Comment.new({ text: 'not me!' })
      , discussionId = 'discussion#1'
      , discussion = Discussion.new({
          _id: discussionId
        , comments: comments
        , text: 'First Post!'
        })
      , otherDiscussion = Discussion.new({
          _id: 'whatever'
        , comments: [ otherComment ]
        , text: 'ligature'
        })
      ;

    async.series([
      function(cb) { comments[2].to(dburl).save(cb); }
    , function(cb) { comments[1].to(dburl).save(cb); }
    , function(cb) { comments[0].to(dburl).save(cb); }
    , function(cb) { discussion.to(dburl).save(cb); }
    , function(cb) { otherComment.to(dburl).save(cb); }
    , function(cb) { otherDiscussion.to(dburl).save(cb); }
    , function(cb) { Discussion.to(dburl).sync(cb); }
    ], function(err, results) {
      if (err) {
        return t.done(err);
      }
      try {
        Discussion.from(dburl).withComments(discussionId, function(e, d) {
          var i;
          if (e) {
            return t.done(e);
          }
          d.text.should.equal('First Post!');
          d.comments.should.have.length(3);
          for (i = 0; i < 3; i += 1) {
            d.comments[i].should.have.property('_id', comments[i]._id);
          }
          t.done();
        });
      } catch (e) {
        t.done(e);
      }
    });
  }
});
