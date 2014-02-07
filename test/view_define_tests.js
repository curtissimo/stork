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

, 'requires an array for a second argument': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this
        .view
        .bind(this.view, 'view_name')
        .should
        .throw('view definer requires key definitions');
    });
    t.done();
  }

, 'requires an array with at least one entry for a second argument': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this
        .view
        .bind(this.view, 'view_name', [])
        .should
        .throw('view definer requires key definitions');
    });
    t.done();
  }

, 'creates an entry in the schema views': function(t, _) {
    var viewName = util.randomString(10)
      , Discussion = odm.deliver('discussion', function() {
          this.view(viewName, ['key']);
        })
      , discussion = Discussion.new()
      , views = discussion['$schema'].views
      ;

    views.should.have.property(viewName);
    t.done();
  }

, 'entry has a copy of the array': function(t, _) {
    var viewName = util.randomString(10)
      , keys = ['key1', 'key2']
      , expected = [{key1: undefined}, {key2: undefined}]
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
};
