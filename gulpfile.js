var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	livereload = require('gulp-livereload'),
	del = require('del');

var paths = {
	scripts: [
		'src/gh-profile-widget.js'
	],
	styles: [
		'src/css/gh-profile-widget.scss'
	],
	dist: 'dist/'
};

gulp.task('clean', function () {
	return gulp.src(['dist/'], {read: false})
		.pipe(clean());
});

gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe(sass({ style: 'compressed' }))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest(paths.dist))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest(paths.dist))
});

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
	// .pipe(jshint('.jshintrc'))
	// .pipe(jshint.reporter('default'))
	.pipe(concat('gh-profile-widget.js'))
	.pipe(gulp.dest(paths.dist))
	.pipe(rename({suffix: '.min'}))
	.pipe(uglify())
	.pipe(gulp.dest(paths.dist))
	.pipe(notify({ message: 'Scripts task complete' }));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.images, ['styles']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['clean'], function() {
	gulp.start('styles', 'scripts');
});