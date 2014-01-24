var should = require('should')
	;

var odm = require('../lib/stork')
	;

exports['test deliver fails with non-string first argument'] = function(t) {
	odm.deliver.should.throw('deliver requires type name');
	t.done();
};
