'use strict';

var browserify   = require('browserify');
var browserSync  = require('browser-sync');
var gulp         = require('gulp');
var npmMainFiles = require('npm-main-files')
var path         = require('path');
var rimraf       = require('rimraf');
var source       = require('vinyl-source-stream');
var url          = require('url')
var useref       = require('gulp-useref');
var file         = require('gulp-file');
var util         = require('gulp-util');
var filter       = require('gulp-filter');
var ngTemplates  = require('gulp-ng-templates');
var debug        = require('gulp-debug');

var bundler = browserify({
    entries      : ['app/src/app.js'],
    transform    : ['babelify'],
    debug        : true,
    insertGlobals: true,
    fullPaths    : true,
    cache        : {},
    packageCache : {},
})

gulp.task('scripts', function(cb) {
    function logBrowserifyError(err) {
        console.log(err.message);
        if(err.codeFrame) {
            console.log('====================');
            console.log(err.codeFrame);
            console.log('====================');
        }
    }

    function onError(err) {
        logBrowserifyError(err);
        if(cb) {cb(); cb = null}
    }

    return bundler
        .bundle()
        .on('log', util.log)
        .on('error', onError)
        .pipe(source('app.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('browsersync-scripts-dev', function() {
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(filter('app/browsersync.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('browsersync-scripts-prod', function() {
    return file('browsersync.js', '', {src: true})
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor-scripts', function() {
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(filter('app/vendor.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor-styles', function() {
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(filter('app/vendor.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor-images', function() {
    return gulp.src('vendor/images/**/*.*')
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(filter('app/app.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
    return gulp.src('app/images/**/*.*')
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
    return gulp
        .src(npmMainFiles('**/*.{eot,svg,ttf,woff,woff2}').concat('app/fonts/**/*'))
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('index', function() {
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(filter('app/index.html'))
        .pipe(gulp.dest('dist'));
});

gulp.task('html', function() {
    return gulp.src('app/src/**/*.html')
        .pipe(ngTemplates({
            filename: 'templates.js',
            module: 'vrApp/templates',
            path: function (path, base) {return path.replace(base, '').replace('/templates', '')}
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb) {
    rimraf('dist', cb);
});

gulp.task('watch', [
    'index',
    'html',
    'styles',
    'scripts',
    'fonts',
    'images',
    'vendor-scripts',
    'vendor-styles',
    'vendor-images',
    'browsersync-scripts-dev'], function() {
    browserSync({
        port     : 3000,
        ui       : false,
        open     : false,
        notify   : false,
        ghostMode: false,
        logPrefix: 'BS',
        logLevel: 'silent',
        server: {baseDir: 'dist'}
    });

    const watchParams = {read: false, ignoreInitial: false};

    gulp.watch('app/index.html', watchParams, ['index']);
    gulp.watch('app/**/*.html', watchParams, ['html']);
    gulp.watch('app/**/*.js', watchParams, ['scripts']);
    gulp.watch('app/**/*.css', watchParams, ['styles']);
    gulp.watch('app/images/**/*.*', watchParams, ['images']);
    gulp.watch('app/fonts/**/*.*', watchParams, ['fonts']);
    gulp.watch('dist/**/*.*', watchParams, browserSync.reload);
});

gulp.task('default', [
    'index',
    'html',
    'styles',
    'scripts',
    'fonts',
    'images',
    'vendor-scripts',
    'vendor-styles',
    'vendor-images',
    'browsersync-scripts-prod'], process.exit);
