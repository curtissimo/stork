var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['bool property builder has bool method'] = function(t) {
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

exports['bool property builder requires a name'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
		this.bool.should.throw('bool definer requires a name');
	});
	t.done();
};

exports['bool property builder generates an instance in the schema'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
				this.bool('sticky');
			})
	  , discussion = Discussion.new()
	  , properties = discussion['$schema'].properties
	  ;

	properties.should.have.property('sticky');
	properties.sticky.should.have.property('type', 'bool');
	properties.sticky.should.not.have.property('required');
	t.done();
};

exports['bool property builder applies required'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
				this.bool('sticky', {required: true});
			})
	  , discussion = Discussion.new()
	  , properties = discussion['$schema'].properties
	  ;

	properties.should.have.property('sticky');
	properties.sticky.should.have.property('type', 'bool');
	properties.sticky.should.have.property('required');
	properties.sticky.required.should.be.true;
	t.done();
};

exports['bool property builder applies not required'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
				this.bool('sticky', {required: false});
			})
	  , discussion = Discussion.new()
	  , properties = discussion['$schema'].properties
	  ;

	properties.should.have.property('sticky');
	properties.sticky.should.have.property('type', 'bool');
	properties.sticky.should.have.property('required');
	properties.sticky.required.should.be.false;
	t.done();
};

exports['bool property builder applies nullable'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
				this.bool('sticky', {nullable: true});
			})
	  , discussion = Discussion.new()
	  , properties = discussion['$schema'].properties
	  ;

	properties.should.have.property('sticky');
	properties.sticky.should.have.property('type');
	properties.sticky.type.should.be.an.Array;
	properties.sticky.type.should.have.length(2);
	properties.sticky.type.should.containEql('bool');
	properties.sticky.type.should.containEql('null');
	t.done();
};

exports['bool property builder does nothing with not nullable'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
				this.bool('sticky', {nullable: false});
			})
	  , discussion = Discussion.new()
	  , properties = discussion['$schema'].properties
	  ;

	properties.should.have.property('sticky');
	properties.sticky.should.have.property('type', 'bool');
	t.done();
};
