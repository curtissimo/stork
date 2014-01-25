var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['instance has #validate'] = {
	setUp: function(cb) {
		this.expectedKind = util.randomString(10)
		this.User = odm.deliver(this.expectedKind);
		cb();
	}
, 'and returns structure with valid property': function(t) {
		var user = this.User.new();
		user.should.have.property('validate');
		user.validate.should.be.a.Function;
		user.validate.should.not.throw();
		user.validate().should.have.property('valid');
		t.done();
	}
};
