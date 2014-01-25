var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['definition builder has bool method'] = function(t) {
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

exports['definition builder requires a name'] = function(t) {
	var Discussion = odm.deliver('discussion', function() {
		this.bool.should.throw('bool definer requires a name');
	});
	t.done();
};
