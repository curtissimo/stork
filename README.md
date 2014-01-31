stork [![Build Status](https://travis-ci.org/realistschuckle/stork.png)](https://travis-ci.org/realistschuckle/stork)
=====

__NOTE:__ _We will end up moving this repository to another account and renaming
it. Fair warning provided._

Stork provides a layer of document management over the CouchDB with multitenant
support and the use of CouchDB view indexing to support parent/child
relationships.

Inspired by [resourceful](https://github.com/flatiron/resourceful).

## Developing

1. Clone. You know how. This is GitHub, for goodness' sake.
2. Install stuff. ``npm install``
3. Run the autotester. ``SKIP_STORK_DB_TESTS=1 ./node_modules/autotest/autotest.js --npm``
4. Or, if you want to run with db tests. ```./node_modules/autotest/autotest.js --npm``
5. Find an [issue](https://github.com/realistschuckle/stork/issues)
6. Write a test.
7. Write nice code.
8. Commit.
9. Make a PULL REQUEST if you're not already a contributor.

## First things first: defining an entity

To create an entity definition with stork, you have to `require` it and
`deliver` the named entity. We require a type name to allow a human-readable
attribute of the document that defines its type.

```JavaScript
var odm = require('stork')
  ;

var User = odm.deliver('user');

// or, if you want some validation and views for the values of your entity

var User = odm.deliver('user', function() {
  // property validation defined here
  // views defined here
  // instance method defined here
});
```
