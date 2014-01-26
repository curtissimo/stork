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
		properties.tags.should.not.have.property('required');
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
		properties.tags.should.not.have.property('required');
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
		properties.tags.should.not.have.property('required');
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
		properties.tags.should.not.have.property('required');
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
		properties.tags.should.not.have.property('required');
		properties.tags.should.not.have.property('minItems');
		properties.tags.should.not.have.property('maxItems');
		properties.tags.should.not.have.property('uniqueItems');
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
