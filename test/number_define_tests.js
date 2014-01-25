var should = require('should')
  , util = require('utile')
	;

var odm = require('../lib/stork')
	;

exports['schema builder has number method'] = function(t) {
	var called = false;
	odm.deliver('discussion', function() {
		called = true;
		this.should.have.property('number');
		this.number.should.be.a.Function;
		this.number.bind(null, 'age').should.not.throw();
	});
	called.should.be.true;
	t.done();
};

exports['number property builder'] = {
	'requires a name': function(t) {
		var Discussion = odm.deliver('discussion', function() {
			this.number.should.throw('number definer requires a name');
		});
		t.done();
	}
, 'generates an instance in the schema': function(t) {
		var Vehicle = odm.deliver('vehicle', function() {
					this.number('weight');
				})
		  , vehicle = Vehicle.new()
		  , properties = vehicle['$schema'].properties
		  ;

		properties.should.have.property('weight');
		properties.weight.should.have.property('type', 'number');
		properties.weight.should.not.have.property('required');
		properties.weight.should.not.have.property('minimum');
		properties.weight.should.not.have.property('maximum');
		properties.weight.should.not.have.property('exclusiveMinimum');
		properties.weight.should.not.have.property('eclusiveMaximum');
		properties.weight.should.not.have.property('divisibleBy');
		t.done();
	}
};
