var should = require('should')
  , util = require('utile')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has array method'] = function(t) {
  var called = false;
  odm.deliver('discussion', function() {
    called = true;
    this.should.have.property('array');
    this.array.should.be.a.Function;
    this.array.bind(null, 'age').should.not.throw();
  });
  called.should.be.true;
  t.done();
};

exports['array property builder'] = {
  'requires a name': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this.array.should.throw('array definer requires a name');
    });
    t.done();
  }

, 'generates an instance in the schema': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags');
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can make a required property': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {required: true});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.have.property('required', true);
    properties.tags.should.not.have.properties([
      'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can make an explicitly optional property': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {required: false});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.have.property('required', false);
    properties.tags.should.not.have.properties([
      'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'does nothing with non-boolean required config': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {required: 'sherbet is a rat'});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can make a nullable property': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {nullable: true});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', ['array', 'null']);
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can make an explicitly non-nullable property': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {nullable: false});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'does nothing with non-boolean nullable config': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {nullable: 'sherbet is a rat'});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can specify minimum number of items': function(t) {
    var minimum = Math.ceil(Math.random() * 100)
      , Discussion = odm.deliver('discussion', function() {
          this.array('tags', {minItems: minimum});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.have.property('minItems', minimum);
    properties.tags.should.not.have.properties([
      'required', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'does nothing with non-numeric minimum items': function(t) {
    var minimum = Math.ceil(Math.random() * 100)
      , Discussion = odm.deliver('discussion', function() {
          this.array('tags', {minItems: minimum.toString()});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can specify maximum number of items': function(t) {
    var maximum = Math.ceil(Math.random() * 100)
      , Discussion = odm.deliver('discussion', function() {
          this.array('tags', {maxItems: maximum});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.have.property('maxItems', maximum);
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'does nothing with non-numeric maximum items': function(t) {
    var maximum = Math.ceil(Math.random() * 100)
      , Discussion = odm.deliver('discussion', function() {
          this.array('tags', {maxItems: maximum.toString()});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'can make a set': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {uniqueItems: true});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.have.property('uniqueItems', true);
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems'
    ]);
    t.done();
  }

, 'can make an explicitly listy property': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {uniqueItems: false});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.have.property('uniqueItems', false);
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems'
    ]);
    t.done();
  }

, 'does nothing with non-boolean uniqueItems config': function(t) {
    var Discussion = odm.deliver('discussion', function() {
          this.array('tags', {uniqueItems: 'sherbet is a rat'});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;

    properties.should.have.property('tags');
    properties.tags.should.have.property('type', 'array');
    properties.tags.should.not.have.properties([
      'required', 'minItems', 'maxItems', 'uniqueItems'
    ]);
    t.done();
  }

, 'works with instances': function(t) {
    var options = {
          required: true
        , minItems: 5
        , maxItems: 8
        , uniqueItems: true
        }
      , Discussion = odm.deliver('discussion', function() {
          this.array('tags', options);
        })
      , discussion = Discussion.new()
      , tagses = [
          null
        , [1, 2, 3, 4]
        , [1, 2, 3, 4, 5]
        , [1, 2, 3, 4, 5, 6, 7, 8]
        , [1, 2, 3, 4, 5, 6, 7, 8, 9]
        , [1, 2, 3, 1, 2, 3]
        ]
      , results = [false, false, true, true, false, false]
      ;

    discussion.validate().valid.should.be.false;

    tagses.forEach(function(tags, i) {
      discussion.tags = tags;
      discussion.validate().valid.should.be[results[i]];
    });
    t.done();
  }
};
