var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['entity has #new'] = {
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
, 'invoked with no parameters, has no _id': function(t) {
		var user = this.User.new();
		user.should.not.have.property('_id');
		t.done();
	}
, 'invoked with a string, has an _id of the passed value': function(t) {
		var randomId = Math.random().toString()
			,	user = this.User.new(randomId)
			;

		user.should.have.property('_id', randomId);
		t.done();
	}
,	'invoked with an object, gets the object\'s non-function props': function(t) {
		var proto = {
					name: 'bob'
				, age: 34
				, saySomething: function() {console.log("HEY!");}
				, _id: 'satchmo'
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
, 'invoked with a string and object, makes an _id and mixins': function(t) {
		var proto = {
					name: 'mary'
				, age: 26
				, saySomething: function() {console.log("Cool!");}
				}
			, id = util.randomString(10)
			, keys = Object.keys(proto)
			, user = this.User.new(id, proto)
			;


		user.should.have.property('_id', id);
		keys.forEach(function(key) {
			if(typeof proto[key] === 'function') {
				user.should.not.have.property(key);
				return;
			}
			user.should.have.property(key, proto[key]);
		});
		t.done();
	}
, 'invoked with a string and object with _id, ignores object _id': function(t) {
		var proto = {
					name: 'mary'
				, age: 26
				, _id: 'foo'
				, saySomething: function() {console.log("Cool!");}
				}
			, id = util.randomString(10)
			, keys = Object.keys(proto)
			, user = this.User.new(id, proto)
			;


		user.should.have.property('_id', id);
		keys.forEach(function(key) {
			if(key === '_id') {
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
