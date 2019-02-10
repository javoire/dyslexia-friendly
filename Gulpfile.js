'use strict';

//npm install gulp gulp-minify-css gulp-uglify gulp-clean gulp-cleanhtml gulp-jshint gulp-strip-debug gulp-zip --save-dev

var gulp = require('gulp');
var clean = require('gulp-clean');
var cleanhtml = require('gulp-cleanhtml');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var gutil = require('gulp-util');
var open = require('gulp-open');
var webserver = require('gulp-webserver');

// For UI prototyping
gulp.task('serve', function() {
  gulp.src('src').pipe(
    webserver({
      livereload: true,
      open: true,
    }),
  );
});

//clean build directory
gulp.task('clean', function() {
  return gulp.src('build/**', {read: false}).pipe(clean());
});

//copy static folders to build directory
gulp.task('copy', function() {
  gulp.src('src/fonts/**').pipe(gulp.dest('build/fonts'));
  gulp.src('src/icons/**').pipe(gulp.dest('build/icons'));
  gulp.src('src/images/**').pipe(gulp.dest('build/images'));
  gulp.src('src/_locales/**').pipe(gulp.dest('build/_locales'));
  return gulp.src('src/manifest.json').pipe(gulp.dest('build'));
});

//copy and compress HTML files
gulp.task('html', function() {
  return gulp
    .src('src/*.html')
    .pipe(cleanhtml())
    .pipe(gulp.dest('build'));
});

//run scripts through JSHint
gulp.task('jshint', function() {
  return gulp
    .src('src/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('scripts', function() {
  gulp
    .src('./node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('build/node_modules/jquery/dist/'));
  gulp
    .src('./node_modules/materialize-css/dist/js/materialize.min.js')
    .pipe(gulp.dest('build/node_modules/materialize-css/dist/js/'));
  return gulp
    .src(['src/scripts/**/*.js', '!src/scripts/vendors/**/*.js'])
    .pipe(stripdebug())
    .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest('build/scripts'));
});

//minify styles
gulp.task('styles', function() {
  // 	return gulp.src('src/styles/**/*.css')
  // 		.pipe(minifycss({root: 'src/styles', keepSpecialComments: 0}))
  // 		.pipe(gulp.dest('build/styles'));
  gulp.src('src/styles/**').pipe(gulp.dest('build/styles'));
  return gulp.src('src/styles/**').pipe(gulp.dest('build/styles'));
});

// Build files
gulp.task('build', ['html', 'scripts', 'styles', 'copy']);

//build ditributable and sourcemaps after other tasks completed
// NOTE: broken. skips most font files... gulp-zip?
gulp.task('zip', ['build'], function() {
  var manifest = require('./src/manifest'),
    distFileName = manifest.name + ' v' + manifest.version + '.zip',
    mapFileName = manifest.name + ' v' + manifest.version + '-maps.zip';

  //collect all source maps
  gulp
    .src('build/scripts/**/*.map')
    .pipe(zip(mapFileName))
    .pipe(gulp.dest('dist'));

  //build distributable extension
  return gulp
    .src(['build/**/*', '!build/scripts/**/*.map'])
    .pipe(zip(distFileName))
    .pipe(gulp.dest('dist'));
});

// Switches to chrome window unfortunately
gulp.task('reload', function() {
  // using https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid
  gulp
    .src('src')
    .pipe(open({uri: 'http://reload.extensions', app: 'google chrome'}));
});

// watch and build
gulp.task('default', ['build'], function() {
  gulp.watch(['src/**'], ['build']);
});
