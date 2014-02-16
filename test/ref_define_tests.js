var should = require('should')
  , util = require('utile')
  ;

var odm = require('../lib/stork')
  ;

exports['schema builder has ref method'] = function(t) {
  var called = false;
  odm.deliver('discussion', function() {
    called = true;
    this.should.have.property('ref');
    this.ref.should.be.a.Function;
  });
  called.should.be.true;
  t.done();
};

exports['ref property builder'] = {
  'requires a name': function(t) {
    var Discussion = odm.deliver('discussion', function() {
      this.ref.should.throw('ref definer requires a name');
    });
    t.done();
  }

, 'requires an entity': function(t) {
    var Comment = odm.deliver('comment')
      , things = [undefined, null, 'foo', 2, true, {}, [], new Date()]
      ;

    odm.deliver('discussion', function () {
      this.ref.bind(this, 'name', Comment).should.not.throw();
    });

    things.forEach(function(thing) {
      odm.deliver('discussion', function () {
        var boundChildren = this.ref.bind(this, 'name', thing);            
        boundChildren.should.throw('ref definer requires an entity');
      });
    });
    t.done();
  }

, 'generates an instance in the schema': function(t) {
    var Person = odm.deliver('person')
      , Discussion = odm.deliver('discussion', function () {
          this.ref('author', Person);
        })
      , discussion = Discussion.new()
      , properties = discussion.$schema.properties
      ;

    properties.should.have.property('author');
    properties.author.should.have.property('type', ['null', 'string']);
    properties.author.should.have.property('entity', Person);
    t.done();
  }

, 'can make a required property': function(t) {
    var Person = odm.deliver('person')
      , Discussion = odm.deliver('discussion', function () {
          this.ref('author', Person, {required: true});
        })
      , discussion = Discussion.new()
      , properties = discussion.$schema.properties
      ;

    properties.should.have.property('author');
    properties.author.should.have.property('type', ['null', 'string']);
    properties.author.should.have.property('required', true);
    t.done();
  }

, 'can make an explicitly optional property': function(t) {
    var Person = odm.deliver('person')
      , Discussion = odm.deliver('discussion', function () {
          this.ref('author', Person, {required: false});
        })
      , discussion = Discussion.new()
      , properties = discussion.$schema.properties
      ;

    properties.should.have.property('author');
    properties.author.should.have.property('type', ['null', 'string']);
    properties.author.should.have.property('required', false);
    t.done();
  }


, 'does nothing with non-boolean required config': function(t) {
    var Person = odm.deliver('person')
      , Discussion = odm.deliver('discussion', function () {
          this.ref('author', Person, {required: 'whatever'});
        })
      , discussion = Discussion.new()
      , properties = discussion.$schema.properties
      ;

    properties.should.have.property('author');
    properties.author.should.have.property('type', ['null', 'string']);
    properties.author.should.not.have.property('required');
    t.done();
  }


, 'works with instances': function(t) {
    var options = {
          required: true
        }
      , Person = odm.deliver('person')
      , DiscussionRequiredAuthor = odm.deliver('discussion', function () {
          this.ref('author', Person, {required: true});
        })
      , DiscussionOptionalAuthor = odm.deliver('discussion', function () {
          this.ref('author', Person);
        })
      , requiredAuthor = DiscussionRequiredAuthor.new()
      , optionalAuthor = DiscussionOptionalAuthor.new()
      , people = [null
        , Person.new({_id: 'already saved'})
        , 'aaaaaaaaaa'
        ]
      , resultsForRequired = [false, true, false]
      , resultsForOptional = [true, true, false]
      ;

    requiredAuthor.validate().valid.should.be.false;
    optionalAuthor.validate().valid.should.be.true;

    people.forEach(function(author, i) {
      requiredAuthor.author = author;
      requiredAuthor.validate().valid.should.equal(resultsForRequired[i]);

      optionalAuthor.author = author;
      optionalAuthor.validate().valid.should.equal(resultsForOptional[i]);
    });
    t.done();
  }
};
