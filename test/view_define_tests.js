var should = require('should')
  , util = require('utile')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has view method'] = function(t) {
  var called = false;
  odm.deliver('discussion', function() {
    called = true;
    this.should.have.property('view');
    this.view.should.be.a.Function;
  });
  called.should.be.true;
  t.done();
};

exports['view builder'] = {
  'requires a name': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this.view.should.throw('view definer requires a name');
    });
    t.done();
  }

, 'requires an array or a function for a second argument': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this
        .view
        .bind(this.view, 'view_name')
        .should
        .throw('view definer requires key definitions or a function');
    });
    t.done();
  }

, 'if an array as second argument, requires at least one entry': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this
        .view
        .bind(this.view, 'view_name', [])
        .should
        .throw('view definer requires key definitions in the array');
    });
    t.done();
  }

, 'creates an entry in the schema views': function(t, _) {
    var viewName = util.randomString(10).replace('_', '')
      , Discussion = odm.deliver('discussion', function() {
          this.view(viewName, ['key']);
        })
      , discussion = Discussion.new()
      , views = discussion['$schema'].views
      ;

    views.should.have.property(viewName);
    t.done();
  }

, 'entry has a copy of the array': function(t) {
    var viewName = util.randomString(10).replace('_', '')
      , keys = ['key1', 'key2']
      , expected = [
          {key1: undefined}
        , {key2: undefined}
        ]
      , Discussion = odm.deliver('discussion', function() {
          this.string('key1');
          this.string('key2');
          this.view(viewName, keys);
        })
      , discussion = Discussion.new()
      , views = discussion['$schema'].views
      ;

    views[viewName].should.eql(expected);
    t.done();
  }

, 'entry has a copy of the array': function(t) {
    var viewName = util.randomString(10).replace('_', '')
      , keys = [
          {key1: function() {}}
        , 'key2'
        ]
      , expected = [
          {key1: function() {}}
        , {key2: undefined}
        ]
      , Discussion = odm.deliver('discussion', function() {
          this.string('key1');
          this.string('key2');
          this.view(viewName, keys);
        })
      , discussion = Discussion.new()
      , views = discussion['$schema'].views
      , viewSpec = views[viewName]
      ;

    viewSpec.should.have.length(2);
    viewSpec[0].key1.should.be.Function;
    viewSpec[0].key1.toString().should.equal(expected[0].key1.toString());
    viewSpec[1].should.have.property('key2', undefined);
    t.done();
  }

, 'entry has a reference to the function': function(t) {
    var viewName = util.randomString(10).replace('_', '')
      , fn = function () {}
      , Discussion = odm.deliver('discussion', function() {
          this.string('key1');
          this.string('key2');
          this.view(viewName, fn);
        })
      , discussion = Discussion.new()
      , views = discussion['$schema'].views
      , viewSpec = views[viewName]
      ;

    viewSpec.should.be.Function;
    viewSpec.should.be.equal(fn);
    t.done();
  }
};
