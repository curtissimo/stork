stork [![Build Status](https://travis-ci.org/curtissimo/stork.png?branch=master)](https://travis-ci.org/realistschuckle/stork) [![Dependency Status](https://gemnasium.com/curtissimo/stork.svg)](https://gemnasium.com/curtissimo/stork)

Stork provides a layer of document management over the CouchDB with multitenant
support and the use of CouchDB view indexing to support parent/child
relationships.

Inspired by [resourceful](https://github.com/flatiron/resourceful).

## TOC

* [What's it look like?](#whats-it-look-like)
* [How to use it](#how-to-use-it)
  * [Install stork for your project](#install-stork-for-your-project)
  * [Require stork](#require-stork)
  * [Declare an entity](#declare-an-entity)
  * _more to come..._
* [How to contribute](#how-to-contribute)
* [Installing](#installing)

## What's it look like?

```JavaScript
var odm = require('stork');

var dburl = 'http://localhost:5984/stork_test'
  , User
  , BlogPost
  , Comment
  ;

User = odm.deliver('user', function() {
  this.sort('lastName', 'firstName');
  this.string('firstName');
  this.string('lastName', { required: true });
  this.string('email', { required: true, format: 'email' });
});

Comment = odm.devlier('comment', function() {
  this.string('title', { required: true });
  this.string('content');
  this.timestamps();

  this.ref('author', User, { required: true });
});

BlogPost = odm.deliver('discussion', function() {
  this.string('title', { required: true });
  this.string('content');
  this.bool('isSticky');
  this.timestamps();
  this.view('byUpdatedOn', ['updatedOn']);

  this.ref('author', User, { required: true });

  this.composes('comments', Comment);

  // DOES NOT EXIST, YET: this.method
  this.method('addComment', function (title, content, author) {
    var comment = Comment.new({
          title: title
        , content: content
        , author: author
        })
      ;
    this.comments.push(comment);
  });

  // DOES NOT EXIST, YET
  this.method('removeComment', function (comment) {
    var childIds = this.children.map(function(child) {
          return child._id
        })
      , childIndex = childIds.indexOf(comment._id)
      ;
    if (childIndex < 0) {
      return;
    }
    this.comments.splice(childIndex, 1);
  });
});

BlogPost.from(dburl).withComments(function(err, posts) {
  posts.forEach(function (post) {
    console.log(post);
    post.comments.forEach(function (comment) {
      console.log('\t', comment);
    });
  });
});
```

## How to use it

This section contains a task-based set of instructions on how to use `stork` for your CouchDB ODM needs. It models a simple reservation system.

### Install stork for your project

Follow the instructions, below, in [Installing](#installing).

### require stork

Yeah, that seems pretty self evident.

```JavaScript
var odm = require('stork');
```

### Declare an entity

Let's declare an entity that stork knows about. When we declare entities, we provide a name and, if we want, a function that will describe a schema for us. We can define arrays, booleans, children, date/times, numbers, objects with their own schema, references to other documents, strings, timestamps, and views.

`stork` uses the schema of the object to provide validation for you. You can save invalid documents to CouchDB, if you'd like. `stork` does not judge. `stork` just delivers.

```JavaScript
var event = odm.stork('event', function() {
  this.string('name', { required: true, maxLength: 100 });
  this.string('description', { required: true });
  this.object('venue', { required: true }, function() {
    this.string('url', { format: 'url' });
    this.string('name');
    this.string('address', { required: true });
    this.string('city');
    this.string('state');
    this.string('zip', { format: /\d{5}/ });
  });

  this.number('maximumGuests', { required: true });
  this.boolean('cancelled');

  this.array('rsvps');

  this.timestamps();
});
```

## How to contribute

0. Make sure you have [grunt-cli](http://gruntjs.com/getting-started)
   installed.
1. Clone. You know how. This is GitHub, for goodness' sake.
2. Install stuff. ``npm install``
3. Run the autotester. ``SKIP_STORK_DB_TESTS=1 ./node_modules/autotest/autotest.js --npm``
4. Or, if you want to run with db tests. ```./node_modules/autotest/autotest.js --npm``
5. Find an [issue](https://github.com/realistschuckle/stork/issues)
6. Write a test.
7. Write nice code.
8. Run `grunt` and make sure you have no errors either in tests or in jslint.
8. Commit.
9. Make a PULL REQUEST if you're not already a contributor.

## Installing

Because we're still developing, this ain't on npm, yet. So, right now, you
can run the following commands to include it in your project.

```
git clone https://github.com/realistschuckle/stork.git
cd stork
npm link
```

Read more about the [`npm-link`](https://npmjs.org/doc/cli/npm-link.html)
command.
