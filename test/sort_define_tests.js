var should = require('should')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has sort method'] = function(t) {
  var called = false;
  odm.deliver('discussion', function() {
    called = true;
    this.should.have.property('sort');
    this.sort.should.be.a.Function;
    this.sort.bind(null, 'sticky').should.not.throw();
  });
  called.should.be.true;
  t.done();
};

exports['bool property builder'] = {
  'requires at least one name': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this.sort.should.throw('sort definer requires at least one name');
    });
    t.done();
  }

, 'generates a sort entry in the schema': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.bool('sticky');
          this.timestamps();
          this.sort('sticky', 'createdOn');
        })
      , discussion = Discussion.new()
      , schema = discussion['$schema']
      ;

    schema.should.have.property('allSort', ['sticky', 'createdOn']);
    t.done();
  }

, 'calls toString on each argument': function(t) {
    var stickyObject = {toString: function() { return 'sticky'; }}
      , Discussion = odm.deliver('discussion', function() {
          this.bool('sticky');
          this.timestamps();
          this.sort(stickyObject, 'createdOn');
        })
      , discussion = Discussion.new()
      , schema = discussion['$schema']
      ;

    schema.should.have.property('allSort', ['sticky', 'createdOn']);
    t.done();
  }
};
