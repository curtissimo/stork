var docco, gulp, jslint, nodeunit;

gulp = require('gulp');
jslint = require('gulp-jslint');
nodeunit = require('gulp-nodeunit');

gulp.task('test', function () {
  'use strict';
  return gulp
    .src('./test/*.js')
    .pipe(nodeunit());
});

gulp.task('lint', function () {
  'use strict';
  return gulp
    .src(['./lib/*.js', './gulpfile.js'])
    .pipe(jslint({ indent: 2, node: true }));
});

gulp.task('watch', function () {
  'use strict';
  gulp.watch('./test/*.js', [ 'test', 'lint' ]);
  gulp.watch('./lib/*.js', [ 'test', 'lint' ]);
  gulp.watch('./gulpfile.js', [ 'lint' ]);
});

gulp.task('dev', [ 'test', 'lint', 'watch' ]);
gulp.task('ci', [ 'test', 'lint' ]);
