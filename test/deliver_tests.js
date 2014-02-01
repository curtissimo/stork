var should = require('should')
  ;

var odm = require('../lib/stork')
  ;

exports['test deliver fails with non-string first argument'] = function(t) {
  var otherArgs = [null, 0, true, [1, 2, 3], {}, arguments[arguments.length]]
    ;

  otherArgs.forEach(function(arg) {
    odm.deliver.bind(null, arg).should.throw('deliver requires type name as its first argument');
  });
  t.done();
};

exports['test deliver fails with non-function second argument'] = function(t) {
  var message = 'deliver requires a schema-defining function as its second argument'
    , otherArgs = [null, 0, 'hello', true, [1, 2, 3], {}]
    ;

  otherArgs.forEach(function(arg) {
    odm.deliver.bind(null, 'name', arg).should.throw(message);
  });
  t.done();
};

exports['test deliver returns an object'] = function(t) {
  var Thing = odm.deliver('thing', function() {});

  Thing.should.be.ok;

  t.ok(true);
  t.done();
};
