var should = require('should')
  , util = require('utile')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has binary method'] = function(t) {
  var called = false;
  odm.deliver('house', function() {
    called = true;
    this.should.have.property('binary');
    this.binary.should.be.a.Function;
    this.binary.bind(null, 'photo').should.not.throw();
  });
  called.should.be.true;
  t.done();
};

exports['binary property builder'] = {
  'requires a name': function(t) {
    var House = odm.deliver('house', function() {
      this.binary.should.throw('binary definer requires a name');
    });
    t.done();
  }

, 'generates an instance in the schema': function(t) {
    var House = odm.deliver('house', function() {
          this.binary('photo');
        })
      , house = House.new()
      , properties = house['$schema'].properties
      ;

    properties.should.have.property('photo');
    properties.photo.should.have.property('type', 'object');
    properties.photo.should.not.have.property('required');
    t.done();
  }

, 'can make a required property': function(t) {
    var House = odm.deliver('house', function() {
          this.binary('photo', {required: true});
        })
      , house = House.new()
      , properties = house['$schema'].properties
      ;

    properties.should.have.property('photo');
    properties.photo.should.have.property('type', 'object');
    properties.photo.should.have.property('required', true);
    t.done();
  }

, 'can make an explicitly optional property': function(t) {
    var House = odm.deliver('house', function() {
          this.binary('photo', {required: false});
        })
      , house = House.new()
      , properties = house['$schema'].properties
      ;

    properties.should.have.property('photo');
    properties.photo.should.have.property('type', 'object');
    properties.photo.should.have.property('required', false);
    t.done();
  }

, 'does nothing with non-binary required config': function(t) {
    var House = odm.deliver('house', function() {
          this.binary('photo', {required: 'sherbet is a rat'});
        })
      , house = House.new()
      , properties = house['$schema'].properties
      ;

    properties.should.have.property('photo');
    properties.photo.should.have.property('type', 'object');
    properties.photo.should.not.have.property('required');
    t.done();
  }

, 'works with instances': function(t) {
    var House = odm.deliver('house', function() {
          this.binary('photo', {required: true});
        })
      , house = House.new({photo: new Buffer('123', 'utf8')})
      , validation = house.validate()
      , error
      ;

    validation.valid.should.be.true;

    house = House.new();
    validation = house.validate();
    validation.valid.should.be.false;
    validation.errors.should.have.length(1);
    error = validation.errors[0];
    error.should.have.property('attribute', 'required');
    error.should.have.property('property', 'photo');
    error.should.have.property('expected', true);
    error.should.have.property('message', 'is required');

    t.done();
  }
};
