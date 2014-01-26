var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['schema builder has bool method'] = function(t) {
	var called = false;
	odm.deliver('discussion', function() {
		called = true;
		this.should.have.property('bool');
		this.bool.should.be.a.Function;
		this.bool.bind(null, 'sticky').should.not.throw();
	});
	called.should.be.true;
	t.done();
};

exports['bool property builder'] = {
	'requires a name': function(t) {
		var Discussion = odm.deliver('discussion', function() {
			this.bool.should.throw('bool definer requires a name');
		});
		t.done();
	}

, 'generates an instance in the schema': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky');
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', 'boolean');
		properties.sticky.should.not.have.property('required');
		t.done();
	}

, 'can make a required property': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {required: true});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', 'boolean');
		properties.sticky.should.have.property('required', true);
		t.done();
	}

, 'can make an explicitly optional property': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {required: false});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', 'boolean');
		properties.sticky.should.have.property('required', false);
		t.done();
	}

, 'does nothing with non-boolean required config': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {required: 'sherbet is a rat'});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', 'boolean');
		properties.sticky.should.not.have.property('required');
		t.done();
	}

, 'can make a nullable property': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {nullable: true});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', ['boolean', 'null']);
		properties.sticky.should.not.have.property('required');
		t.done();
	}

, 'can make an explicitly non-nullable property': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {nullable: false});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', 'boolean');
		properties.sticky.should.not.have.property('required');
		t.done();
	}

, 'does nothing with non-boolean nullable config': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {nullable: false});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('sticky');
		properties.sticky.should.have.property('type', 'boolean');
		properties.sticky.should.not.have.property('required');
		t.done();
	}

, 'works with instances': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.bool('sticky', {required: true});
				})
		  , discussion = Discussion.new({sticky: true})
		  , validation = discussion.validate()
		  , error
		  ;

		validation.valid.should.be.true;

		discussion = Discussion.new();
		validation = discussion.validate({sticky: 'margarine'});
		validation.valid.should.be.false;
		validation.errors.should.have.length(1);
		error = validation.errors[0];
		error.should.have.property('attribute', 'required');
		error.should.have.property('property', 'sticky');
		error.should.have.property('expected', true);
		error.should.have.property('message', 'is required');

		t.done();
	}
};
