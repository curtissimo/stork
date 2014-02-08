stork [![Build Status](https://travis-ci.org/realistschuckle/stork.png)](https://travis-ci.org/realistschuckle/stork)
=====

__NOTE:__ _We will end up moving this repository to another account and renaming
it. Fair warning provided._

Stork provides a layer of document management over the CouchDB with multitenant
support and the use of CouchDB view indexing to support parent/child
relationships.

Inspired by [resourceful](https://github.com/flatiron/resourceful).

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

## API

You can find documentation about **stork** over at the [Wiki](./wiki).