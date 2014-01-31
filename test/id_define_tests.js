var should = require('should')
  , util = require('utile')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has id method'] = function(t) {
  var called = false
    , undefined = arguments[arguments.length]
    , args = ['string', 1, [1, 'two'], false, null, undefined]
    ;

  odm.deliver('discussion', function() {
    var self = this;
    called = true;
    this.should.have.property('id');
    this.id.should.be.a.Function;
    args.forEach(function(arg) {
      self.id.bind(null, arg).should.throw('id requires a configuration spec');
    });
  });
  called.should.be.true;
  t.done();
};

exports['id builder configures type string'] = function(t) {
  var Ghost = odm.deliver('ghost', function() {
        this.id({});
      })
    , annie = Ghost.new({name: 'annie'})
    , properties = annie['$schema'].properties
    ;

  properties.should.have.property('_id');
  properties._id.should.have.property('type');
  properties._id.should.not.have.property('required');
  properties._id.type.should.be.Array;
  properties._id.type.should.containEql('string');
  properties._id.type.should.containEql('null');
  t.done();
};

exports['id builder allows for minimum length'] = function(t) {
  var Ghost = odm.deliver('ghost', function() {
        this.id({minLength: 5});
      })
    , annie = Ghost.new({name: 'annie'})
    , properties = annie['$schema'].properties
    ;

  properties.should.have.property('_id');
  properties._id.should.have.property('type');
  properties._id.should.not.have.property('required');
  properties._id.type.should.be.Array;
  properties._id.type.should.containEql('string');
  properties._id.type.should.containEql('null');
  properties._id.should.have.property('minLength', 5);
  t.done();
};

exports['id builder allows for maximum length'] = function(t) {
  var Ghost = odm.deliver('ghost', function() {
        this.id({maxLength: 15});
      })
    , annie = Ghost.new({name: 'annie'})
    , properties = annie['$schema'].properties
    ;

  properties.should.have.property('_id');
  properties._id.should.have.property('type');
  properties._id.should.not.have.property('required');
  properties._id.type.should.be.Array;
  properties._id.type.should.containEql('string');
  properties._id.type.should.containEql('null');
  properties._id.should.have.property('maxLength', 15);
  t.done();
};

exports['id builder does not respect required'] = function(t) {
  var Ghost = odm.deliver('ghost', function() {
        this.id({required: true});
      })
    , annie = Ghost.new({name: 'annie'})
    , properties = annie['$schema'].properties
    ;

  properties.should.have.property('_id');
  properties._id.should.have.property('type');
  properties._id.should.not.have.property('required');
  properties._id.type.should.be.Array;
  properties._id.type.should.containEql('string');
  properties._id.type.should.containEql('null');
  properties._id.should.not.have.property('maxLength');
  t.done();
};

exports['id builder allows for format'] = function(t) {
  var goodFormats = [
        'url', 'email', 'ip-address', 'ipv6', 'date-time', 'date', 'time'
      , 'color', 'host-name', 'utc-millisec',
      ]
    , otherGoodFormats = [
        /abc/
      ]
    , badFormats = [{}, [1, 2, 3], true, null, 5, 'whatever']
    ;

  otherGoodFormats.forEach(function(format) {
    var Discussion = odm.deliver('discussion', function() {
          this.id({format: format});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;
    properties.should.have.property('_id');
    properties._id.should.have.property('type', ['string', 'null']);
    properties._id.should.not.have.property('required');
    properties._id.should.not.have.property('format');
    properties._id.should.not.have.property('minLength');
    properties._id.should.not.have.property('maxLength');
    properties._id.should.have.property('pattern');
    properties._id.pattern.toString().should.equal(/abc/.toString());
  });

  goodFormats.forEach(function(format) {
    var Discussion = odm.deliver('discussion', function() {
          this.id({format: format});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;
    properties.should.have.property('_id');
    properties._id.should.have.property('type', ['string', 'null']);
    properties._id.should.not.have.property('required');
    properties._id.should.have.property('format', format);
    properties._id.should.not.have.property('minLength');
    properties._id.should.not.have.property('maxLength');
  });

  badFormats.forEach(function(format) {
    var Discussion = odm.deliver('discussion', function() {
          this.id({format: format});
        })
      , discussion = Discussion.new()
      , properties = discussion['$schema'].properties
      ;
    properties.should.have.property('_id');
    properties._id.should.have.property('type', ['string', 'null']);
    properties._id.should.not.have.property('required');
    properties._id.should.not.have.property('format');
    properties._id.should.not.have.property('minLength');
    properties._id.should.not.have.property('maxLength');
  });
  t.done();
};

exports['id builder works with instances'] = function(t) {
  var Discussion = odm.deliver('discussion', function() {
        this.id({
          minLength: 20,
          maxLength: 40,
          format: 'url'
        });
      })
    , discussion = Discussion.new('http://schlak.com')
    ;

  discussion.validate().valid.should.be.false;

  discussion._id = 'http://curtis.schlak.com';
  discussion.validate().valid.should.be.true;

  discussion._id = 'http://curtis.schlak.com/some/awesome/path';
  discussion.validate().valid.should.be.false;

  t.done();
};
