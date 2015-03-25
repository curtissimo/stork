var should = require('should')
  , util = require('utile')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has datetime method'] = function(t) {
  var called = false;
  odm.deliver('discussion', function() {
    called = true;
    this.should.have.property('datetime');
    this.datetime.should.be.a.Function;
    this.datetime.bind(null, 'age').should.not.throw();
  });
  called.should.be.true;
  t.done();
};

exports['datetime property builder'] = {
  'requires a name': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this.datetime.should.throw('datetime definer requires a name');
    });
    t.done();
  }

, 'generates an instance in the schema': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', { minimum: new Date() });

          this.object('sub', function () {
            this.datetime('date', { minimum: new Date() });
          });
        })
      , vehicle = Vehicle.new()
      , schema = vehicle['$schema']
      , properties = schema.properties
      ;

    schema.coercedProperties.should.containEql('createdOn');
    schema.coercedProperties.should.containEql('sub.date');
    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'can make a required property': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {required: true});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.have.property('required', true);
    properties.createdOn.should.not.have.properties([
      'minimum', 'maximum'
    ]);
    t.done();
  }

, 'can make an explicityly optional property': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {required: false});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.have.property('required', false);
    properties.createdOn.should.not.have.properties([
      'minimum', 'maximum'
    ]);
    t.done();
  }

, 'does nothing with non-boolean required config': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {required: 'sherbet is a rat'});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'can make a nullable property': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {nullable: true});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', ['number', 'null']);
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'can make an explicitly non-nullable property': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {nullable: false});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'does nothing with non-boolean nullable config': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {nullable: 'sherbet is a rat'});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'can specify minimum value': function(t) {
    var now = new Date()
      , Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {minimum: now});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.have.property('minimum', now.valueOf());
    properties.createdOn.should.not.have.properties([
      'required', 'maximum'
    ]);
    t.done();
  }

, 'ignores nun-date minimum values': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {minimum: 'sherbet is a rat'});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'can specify maximum value': function(t) {
    var now = new Date()
      , Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {maximum: now});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.have.property('maximum', now.valueOf());
    properties.createdOn.should.not.have.properties([
      'required', 'minimum'
    ]);
    t.done();
  }

, 'ignores nun-date maximum values': function(t) {
    var Vehicle = odm.deliver('vehicle', function() {
          this.datetime('createdOn', {maximum: 'sherbet is a rat'});
        })
      , vehicle = Vehicle.new()
      , properties = vehicle['$schema'].properties
      ;

    properties.should.have.property('createdOn');
    properties.createdOn.should.have.property('type', 'number');
    properties.createdOn.should.not.have.properties([
      'required', 'minimum', 'maximum'
    ]);
    t.done();
  }

, 'works with instances': function(t) {
    var options = {
          required: true
        , nullable: true
        , minimum: new Date(2012, 1, 1)
        , maximum: new Date(2012, 12, 31)
        }
      , Vehicle = odm.deliver('vehicle', function() {
          this.datetime('manufacturerDate', options);
          this.object('sub', function () {
            this.object('sub', function () {
              this.datetime('anotherDate', {required: true, nullable: true});
            });
          });
        })
      , vehicle = Vehicle.new()
      , dates = [
          null
        , new Date(2011, 12, 31)
        , new Date(2012, 1, 1)
        , new Date(2012, 12, 31)
        , new Date(2013, 1, 1)
        , 'sherbet is a rat'
        ]
      , results = [true, false, true, true, false, false]
      ;

    vehicle.validate().valid.should.be.false;

    dates.forEach(function(date, i) {
      vehicle.manufacturerDate = date;
      vehicle.sub = { sub: { anotherDate: date } };
      try {
        vehicle.validate().valid.should.be[results[i]];
      } catch(e) {
        console.error('ERROR:', i, date, vehicle.validate().errors);
        throw e;
      }
      if (!vehicle.manufacturerDate) {
        return;
      }
      vehicle.manufacturerDate.should.be.equal(date);
    });
    t.done();
  }
};
