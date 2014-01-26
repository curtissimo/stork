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
		user.validate().should.not.have.property('errors');
		t.done();
	}

, 'and schema violations return invalid': function(t) {
		var user = this.User.new()
		  , validation
		  , error
		  ;
		user['$schema'].properties = {
			name: {
				type: 'string',
				required: true
			}
		}

		validation = user.validate();

		validation.should.have.property('valid');
		validation.should.have.property('errors');
		validation.valid.should.be.false;
		validation.errors.should.have.length(1);
		
		error = validation.errors[0];
		error.property.should.be.equal('name');
		error.attribute.should.be.equal('required');
		error.expected.should.be.true;
		(typeof error.actual).should.be.equal('undefined');
		error.message.should.be.equal('is required');
		t.done();
	}

, 'and schema compliance returns valid': function(t) {
		var user = this.User.new({name: 'Curtis'})
		  , validation
		  , error
		  ;
		user['$schema'].properties = {
			name: {
				type: 'string',
				required: true
			}
		}

		validation = user.validate();

		validation.should.have.property('valid');
		validation.should.not.have.property('errors');
		validation.valid.should.be.true;
		t.done();
	}
};
