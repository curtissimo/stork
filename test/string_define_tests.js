var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['schema builder has string method'] = function(t) {
	var called = false;
	odm.deliver('discussion', function() {
		called = true;
		this.should.have.property('string');
		this.string.should.be.a.Function;
		this.string.bind(null, 'title').should.not.throw();
	});
	called.should.be.true;
	t.done();
};

exports['string property builder'] = {
	'requires a name': function(t) {
		var Discussion = odm.deliver('discussion', function() {
			this.string.should.throw('string definer requires a name');
		});
		t.done();
	}
, 'generates an instance in the schema': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title');
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type', 'string');
		properties.title.should.not.have.property('required');
		properties.title.should.not.have.property('format');
		properties.title.should.not.have.property('minLength');
		properties.title.should.not.have.property('maxLength');
		t.done();
	}
, 'can be made required': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title', {required: true});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type', 'string');
		properties.title.should.have.property('required', true);
		properties.title.should.not.have.property('format');
		properties.title.should.not.have.property('minLength');
		properties.title.should.not.have.property('maxLength');
		t.done();
	}
, 'can be made non-required': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title', {required: false});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type', 'string');
		properties.title.should.have.property('required', false);
		properties.title.should.not.have.property('format');
		properties.title.should.not.have.property('minLength');
		properties.title.should.not.have.property('maxLength');
		t.done();
	}
, 'can be made nullable': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title', {nullable: true});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type');
		properties.title.type.should.be.Array;
		properties.title.type.should.containEql('string');
		properties.title.type.should.containEql('null');
		properties.title.should.not.have.property('required');
		properties.title.should.not.have.property('format');
		properties.title.should.not.have.property('minLength');
		properties.title.should.not.have.property('maxLength');
		t.done();
	}
, 'can be made explicitly not nullable': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title', {nullable: false});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type', 'string');
		properties.title.should.not.have.property('required');
		properties.title.should.not.have.property('format');
		properties.title.should.not.have.property('minLength');
		properties.title.should.not.have.property('maxLength');
		t.done();
	}
, 'can specify minimum length': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title', {minLength: 5});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type', 'string');
		properties.title.should.not.have.property('required');
		properties.title.should.not.have.property('format');
		properties.title.should.have.property('minLength', 5);
		properties.title.should.not.have.property('maxLength');
		t.done();
	}
, 'can specify maximum length length': function(t) {
		var Discussion = odm.deliver('discussion', function() {
					this.string('title', {maxLength: 25});
				})
		  , discussion = Discussion.new()
		  , properties = discussion['$schema'].properties
		  ;

		properties.should.have.property('title');
		properties.title.should.have.property('type', 'string');
		properties.title.should.not.have.property('required');
		properties.title.should.not.have.property('format');
		properties.title.should.not.have.property('minLength');
		properties.title.should.have.property('maxLength', 25);
		t.done();
	}
, 'can specify format': function(t) {
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
						this.string('title', {format: format});
					})
			  , discussion = Discussion.new()
			  , properties = discussion['$schema'].properties
			  ;
			properties.should.have.property('title');
			properties.title.should.have.property('type', 'string');
			properties.title.should.not.have.property('required');
			properties.title.should.not.have.property('format');
			properties.title.should.not.have.property('minLength');
			properties.title.should.not.have.property('maxLength');
			properties.title.should.have.property('pattern');
			properties.title.pattern.toString().should.equal(/abc/.toString());
		});

		goodFormats.forEach(function(format) {
			var Discussion = odm.deliver('discussion', function() {
						this.string('title', {format: format});
					})
			  , discussion = Discussion.new()
			  , properties = discussion['$schema'].properties
			  ;
			properties.should.have.property('title');
			properties.title.should.have.property('type', 'string');
			properties.title.should.not.have.property('required');
			properties.title.should.have.property('format', format);
			properties.title.should.not.have.property('minLength');
			properties.title.should.not.have.property('maxLength');
		});

		badFormats.forEach(function(format) {
			var Discussion = odm.deliver('discussion', function() {
						this.string('title', {format: format});
					})
			  , discussion = Discussion.new()
			  , properties = discussion['$schema'].properties
			  ;
			properties.should.have.property('title');
			properties.title.should.have.property('type', 'string');
			properties.title.should.not.have.property('required');
			properties.title.should.not.have.property('format');
			properties.title.should.not.have.property('minLength');
			properties.title.should.not.have.property('maxLength');
		});
		t.done();
	}
, 'works with instances': function(t) {
		var options = {
					nullable: true
				, required: true
				, minLength: 10
				, maxLength: 15
				, format: /^a+$/	
				}
		  , Discussion = odm.deliver('discussion', function() {
					this.string('title', options);
				})
		  , discussion = Discussion.new()
		  , titles = [null
		  	, 'aaaaaaaaa'
		  	, 'aaaaaaaaaa'
		  	, 'aaaaaaaaaaaaaaa'
		  	, 'aaaaaaaaaaaaaaaa'
		  	, 'sherbet\'s a rat'
		  	]
		  , results = [true, false, true, true, false, false]
		  ;

		discussion.validate().valid.should.be.false;

		titles.forEach(function(title, i) {
			discussion.title = title;
			discussion.validate().valid.should.be[results[i]];
		});
		t.done();
	}
};
