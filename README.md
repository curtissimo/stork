stork [![Build Status](https://travis-ci.org/realistschuckle/stork.png)](https://travis-ci.org/realistschuckle/stork)
=====

__NOTE:__ _We will end up moving this repository to another account and renaming
it. Fair warning provided._

Stork provides a layer of document management over the CouchDB with multitenant
support and the use of CouchDB view indexing to support parent/child
relationships.

Inspired by [resourceful](https://github.com/flatiron/resourceful).

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

  // DOES NOT EXIST, YET: this.ref
  this.ref('author', User, { required: true });
});

BlogPost = odm.deliver('discussion', function() {
  this.string('title', { required: true });
  this.string('content');
  this.bool('isSticky');
  this.timestamps();
  this.view('byUpdatedOn', ['updatedOn']);

  // DOES NOT EXIST, YET: this.ref
  this.ref('author', User, { required: true });

  // DOES NOT EXIST, YET: this.children
  this.children('comments', Comment);

  // DOES NOT EXIST, YET: this.childview
  this.childview('withComments', [ 'comments'] );

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

## API

You can find documentation about **stork** over at the [Wiki](./wiki).

## Developing

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
