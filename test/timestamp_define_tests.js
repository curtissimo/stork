var should = require('should')
  , odm = require('../lib/stork')
  ;

exports['schema builder has timestamps method'] = function(t) {
  var called = false;
  odm.deliver('discussion', function() {
    called = true;
    this.should.have.property('timestamps');
    this.timestamps.should.be.a.Function;
    this.timestamps.bind(null).should.not.throw();
  });
  called.should.be.true;
  t.done();
};

exports['timestamps property builder'] = {
  'creates a createdOn number schema entry': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.timestamps();
        })
      , discussion = Discussion.new()
      , properties = discussion.$schema.properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');

    t.done();
  }

, 'creates an updatedOn number schema entry': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.timestamps();
        })
      , discussion = Discussion.new()
      , properties = discussion.$schema.properties
      ;

    properties.should.have.property('updatedOn');
    properties.updatedOn.should.have.property('type', 'number');

    t.done();
  }

, 'unsaved instance#createdOn returns undefined': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.timestamps();
        })
      , discussion = Discussion.new()
      ;

    discussion.should.have.property('createdOn', undefined);
    t.done();
  }

, 'unsaved instance#updatedOn returns undefined': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.timestamps();
        })
      , discussion = Discussion.new()
      ;

    discussion.should.have.property('updatedOn', undefined);
    t.done();
  }

, 'setting instance#createdOn results no error': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.timestamps();
        })
      , discussion = Discussion.new()
      , setter = function() {'use strict'; discussion.createdOn = new Date();}
      ;

    setter.should.not.throw();
    t.done();
  }

, 'setting instance#updatedOn results no error': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.timestamps();
        })
      , discussion = Discussion.new()
      , setter = function() {'use strict'; discussion.updatedOn = new Date();}
      ;

    setter.should.not.throw();
    t.done();
  }
};
