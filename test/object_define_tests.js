var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['schema builder has object method'] = function(t) {
	var called = false;
	odm.deliver('discussion', function() {
		called = true;
		this.should.have.property('object');
		this.object.should.be.a.Function;
		this.object.bind(null, 'age').should.not.throw();
	});
	called.should.be.true;
	t.done();
};

exports['object property builder'] = {
	'requires a name': function(t) {
		odm.deliver('whatever', function() {
			this.object.should.throw('object definer requires a name');
		});
		t.done();
	}

, 'generates an instance in the schema': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address');
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.not.have.property('required');
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'can make a required property': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {required: true});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.have.property('required', true);
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'can make an explicitly optional property': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {required: false});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.have.property('required', false);
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'does nothing with non-boolean required config': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {required: 'sherbet is a rat'});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.not.have.property('required');
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'can make a nullable property': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {nullable: true});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', ['object', 'null']);
		properties.address.should.not.have.property('required');
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'can make an explicitly non-nullable property': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {nullable: false});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.not.have.property('required');
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'does nothing with non-boolean nullable config': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {nullable: 'sherbet is a rat'});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.not.have.property('required');
		properties.address.should.not.have.property('properties');
		t.done();
	}

, 'accepts schema builder for nested object': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', {}, function() {
						this.string('street', {required: true});
					});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.not.have.property('required');
		properties.address.should.have.property('properties');
		properties.address.properties.should.have.property('street');
		properties.address.properties.street.should.have.property('required', true);
		t.done();
	}

, 'treats options as optional parameter': function(t) {
		var User = odm.deliver('user', function() {
					this.object('address', function() {
						this.string('street', {required: true});
					});
				})
		  , user = User.new()
		  , properties = user['$schema'].properties
		  ;

		properties.should.have.property('address');
		properties.address.should.have.property('type', 'object');
		properties.address.should.not.have.property('required');
		properties.address.should.have.property('properties');
		properties.address.properties.should.have.property('street');
		properties.address.properties.street.should.have.property('required', true);
		t.done();
	}

, 'works with instances': function(t) {
		var options = {
			    required: true
			  , nullable: true
				}
		  , Person = odm.deliver('person', function() {
					this.object('address', options, function() {
						this.string('street', {required: true});
						this.number('zip', {minimum: 0, maximum: 99999});
					});
				})
		  , person = Person.new()
		  , addresses = [
		  	  null
		  	, {}
		  	, {street: 123}
		  	, {street: '123 Main'}
		  	, {zip: 'sherbet is a rat'}
		  	, {zip: 4444}
		  	, {street: '123 Main', zip: 'sherbet is a rat'}
		  	, {street: 234, zip: 3333}
		  	, {street: '123 Main', zip: -4}
		  	, {street: '123 Main', zip: 100000}
		  	, {street: '123 Main', zip: 77001}
		  	]
		  , results = [
		  		true,  false, false, true, false, false,
		  		false, false, false, false, true
		  	]
		  ;

		person.validate().valid.should.be.false;

		addresses.forEach(function(address, i) {
			person.address = address;
			person.validate().valid.should.be[results[i]];
		});
		t.done();
	}
};
