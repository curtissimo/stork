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
			self.id.bind({}, arg).should.throw('id requires a configuration spec');
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

exports['id builder allows for format'] = function(t) {
	var Ghost = odm.deliver('ghost', function() {
				this.id({format: 'email'});
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
	properties._id.should.have.property('format', 'email');
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
