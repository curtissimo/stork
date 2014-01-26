stork [![Build Status](https://travis-ci.org/realistschuckle/stork.png)](https://travis-ci.org/realistschuckle/stork)
=====

__NOTE:__ _We will end up moving this repository to another account and renaming
it. Fair warning provided._

Stork provides a layer of document management over the CouchDB with multitenant
support and the use of CouchDB view indexing to support parent/child
relationships.

Inspired by [resourceful](https://github.com/flatiron/resourceful).

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
