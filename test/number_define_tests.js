var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['schema builder has number method'] = function(t) {
	var called = false;
	odm.deliver('discussion', function() {
		called = true;
		this.should.have.property('number');
		this.number.should.be.a.Function;
		this.number.bind(null, 'age').should.not.throw();
	});
	called.should.be.true;
	t.done();
};

exports['number property builder'] = {
	'requires a name': function(t) {
		var Discussion = odm.deliver('discussion', function() {
			this.number.should.throw('number definer requires a name');
		});
		t.done();
	}

, 'generates an instance in the schema': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight');
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can make a required property': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {required: true});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.have.property('required', true);
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can make an explicityly optional property': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {required: false});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.have.property('required', false);
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'does nothing with non-boolean required config': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {required: '123'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can make a nullable property': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {nullable: true});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', ['number', 'null']);
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can make an explicitly non-nullable property': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {nullable: false});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'does nothing with non-boolean nullable config': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {nullable: '123'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can specify minimum value': function(t) {
		var value = Math.random()
		  , Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {minimum: value});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.have.property('minimum', value);
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'ignores nun-numerical minimum values': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {minimum: '123.5'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can specify maximum value': function(t) {
		var value = Math.random()
		  , Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {maximum: value});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.have.property('maximum', value);
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'ignores nun-numerical maximum values': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {maximum: '123.5'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can specify exclusive minimum value': function(t) {
		var value = Math.random()
		  , Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {exclusiveMinimum: value});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.have.property('exclusiveMinimum', value);
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'ignores nun-numerical exclusive minimum values': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {exclusiveMinimum: '123.5'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can specify exclusive maximum value': function(t) {
		var value = Math.random()
		  , Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {exclusiveMaximum: value});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.have.property('exclusiveMaximum', value);
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'ignores nun-numerical exclusive maximum values': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {exclusiveMaximum: '123.5'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('exclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}

, 'can specify divisible by value': function(t) {
		var value = Math.random()
		  , Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {divisibleBy: value});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.have.property('divisibleBy', value);
		t.done();
	}

, 'ignores nun-numerical divisibility values': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', {divisibleBy: '123.5'});
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}
, 'works with instances': function(t) {
		var options = {
		      nullable: true
			  , minimum: 123
				, exclusiveMaximum: 126
				, divisibleBy: 2	
				}
		  , Vehicle = odm.deliver('vehicle', function() {
					this.number('weight', options);
				})
		  , vehicle = Vehicle.new()
		  , weights = [null
		  	, 122
		  	, 123
		  	, 124
		  	, 125
		  	, 126
		  	]
		  , results = [true, false, false, true, false, false]
		  ;

		vehicle.validate().valid.should.be.true;

		weights.forEach(function(weight, i) {
			vehicle.weight = weight;
			vehicle.validate().valid.should.be[results[i]];
		});
		t.done();
	}
};