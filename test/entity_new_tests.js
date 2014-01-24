var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['entity has new function'] = {
	setUp: function(cb) {
		this.expectedKind = util.randomString(10)
		this.User = odm.deliver(this.expectedKind);
		cb();
	}
,	'invokable with no parameters': function(t) {
		this.User.new.should.not.throw();
		t.done();
	}
, 'returns instance with appropriate "kind"': function(t) {
		var user = this.User.new();
		user.should.have.property('kind', this.expectedKind);
		t.done();
	}
, 'when invoked with no parameters, has no id': function(t) {
		var user = this.User.new();
		user.should.not.have.property('id');
		t.done();
	}
, 'when invoked with a string, has an id of the passed value': function(t) {
		var randomId = Math.random().toString()
			,	user = this.User.new(randomId)
			;

		user.should.have.property('id', randomId);
		t.done();
	}
,	'when invoked with an object, mixins the object\'s non-functional properties': function(t) {
		var proto = {
					name: 'bob'
				, age: 34
				, saySomething: function() {console.log("HEY!");}
				}
			, keys = Object.keys(proto)
			, user = this.User.new(proto)
			;

		keys.forEach(function(key) {
			if(typeof proto[key] === 'function') {
				user.should.not.have.property(key);
				return;
			}
			user.should.have.property(key, proto[key]);
		});
		t.done();
	}
, 'when invoked with a string and object, makes an id and does the mixin': function(t) {
		var proto = {
					name: 'mary'
				, age: 26
				, saySomething: function() {console.log("Cool!");}
				}
			, id = util.randomString(10)
			, keys = Object.keys(proto)
			, user = this.User.new(id, proto)
			;


		user.should.have.property('id', id);
		keys.forEach(function(key) {
			if(typeof proto[key] === 'function') {
				user.should.not.have.property(key);
				return;
			}
			user.should.have.property(key, proto[key]);
		});
		t.done();
	}
, 'when invoked with a string and object that contains an id, ignores the id in the proto': function(t) {
		var proto = {
					name: 'mary'
				, age: 26
				, id: 'foo'
				, saySomething: function() {console.log("Cool!");}
				}
			, id = util.randomString(10)
			, keys = Object.keys(proto)
			, user = this.User.new(id, proto)
			;


		user.should.have.property('id', id);
		keys.forEach(function(key) {
			if(key === 'id') {
				return;
			}
			if(typeof proto[key] === 'function') {
				user.should.not.have.property(key);
				return;
			}
			user.should.have.property(key, proto[key]);
		});
		t.done();
	}
};
