var gulp = require('gulp'),
    // sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    wrap = require('gulp-wrap');

var version = 'v2.0.1';

var paths = {
    styles: [
        'src/css/base.scss'
    ],
    dist: 'dist/'
};

gulp.task('clean', function () {
    return gulp.src(['dist/'], {read: false})
        .pipe(clean());
});

gulp.task('styles', function () {
    return gulp.src(paths.styles)
        .pipe(rename({basename: 'gh-profile-card'}))
        // .pipe(sass())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(wrap(header(version) + '<%= contents %>'))
        .pipe(gulp.dest(paths.dist))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(wrap(header(version) + '<%= contents %>'))
        .pipe(gulp.dest(paths.dist));
});

// Re-run the task when files are changing
gulp.task('watch', function () {
    gulp.start('default');
    gulp.watch(paths.styles, ['styles']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['clean'], function () {
    gulp.start('styles');
});

function header(version) {
    return '/** GitHub Profile Card - ' + version + ' **/ \n';
}
