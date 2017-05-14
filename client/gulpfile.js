'use strict';

var $                = require('gulp-load-plugins')();
var browserify       = require('browserify');
var browserSync      = require('browser-sync');
var browserSyncProxy = require('proxy-middleware')
var del              = require('del');
var gulp             = require('gulp');
var npmMainFiles     = require('npm-main-files')
var path             = require('path');
var rimraf           = require('rimraf');
var source           = require('vinyl-source-stream');
var url              = require('url')
var watchify         = require('watchify');

var config = {
    srcEntryPoint : './app/scripts/app.js',
    destEntryPoint: 'app.js',
    destFolder    : './dist/scripts'
}

var bundler = browserify({
    entries      : [config.srcEntryPoint],
    transform    : ['babelify'],
    debug        : true,
    insertGlobals: true,
    fullPaths    : true,
    cache        : {},
    packageCache : {},
    plugin       : [watchify]
});

// bundler.on('update', rebundle);
bundler.on('log', $.util.log);

function logBrowserifyError(err) {
    console.log(err.message);
    if(err.codeFrame) {
        console.log('====================');
        console.log(err.codeFrame);
        console.log('====================');
    }
}

gulp.task('html', ['clean'], function() {
    return gulp.src('app/**/*.html')
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .on('end', function() {browserSync.reload()});
});

gulp.task('scripts', ['clean'], function(cb) {

    function onError(err) {
        logBrowserifyError(err);

        if(cb) {
            cb();
            cb = null;
        }
    }

    return bundler.bundle()
        .on('error', onError)
        .pipe(source(config.destEntryPoint))
        .pipe(gulp.dest(config.destFolder))
        .on('end', function() {browserSync.reload()});
});

gulp.task('scripts-vendor', ['clean'], function(cb) {
    return gulp.src(['./app/vendor/*.js'])
        .pipe(gulp.dest('dist/scripts'))
        .on('end', function() {browserSync.reload()});
});

gulp.task('styles', ['clean'], function() {
    gulp.src(['./app/styles/**/*.css'], { base: './app/styles/' })
        .pipe(gulp.dest('dist/styles'))
        .on('end', function() {browserSync.reload()});
});

gulp.task('images', ['clean'], function() {
    return gulp.src('app/images/**/*')
        .pipe(gulp.dest('dist/images'))
        .on('end', function() {browserSync.reload()});
});

gulp.task('fonts', ['clean'], function() {
    var fontFiles = npmMainFiles('**/*.{eot,svg,ttf,woff,woff2}')
      .concat('app/fonts/**/*');

    return gulp
        .src(fontFiles)
        .pipe(gulp.dest('dist/fonts'))
        .on('end', function() {browserSync.reload()});
});

gulp.task('clean', function(cb) {
    // $.cache.clearAll();
    // rimraf('dist', cb);
    cb();
});

// gulp.task('buildScripts', function() {
//     return browserify(config.srcEntryPoint)
//         .bundle()
//         .pipe(source(config.destEntryPoint))
//         .pipe(gulp.dest('dist/scripts'));
// });

// gulp.task('bundle', ['styles', 'scripts'], function() {
//     return gulp.src('./app/**/*.html')
//         .pipe($.useref())
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries'], function() {
//     return gulp.src('./app/**/*.html')
//         .pipe($.useref())
//         .pipe(gulp.dest('dist'));
// });

// gulp.task('moveLibraries', ['clean'], function(){
//     // Move JS Files and Libraries
//     // the base option sets the relative root for the set of files,
//     // preserving the folder structure
//     gulp.src(['./app/scripts/**/*.js'], { base: './app/scripts/' })
//         .pipe(gulp.dest('dist/scripts'));
// });

gulp.task('default', ['html', 'styles', 'scripts', 'scripts-vendor', 'fonts', 'images'], function() {
    var backendHost = 'localhost';
    var backendPort = '8000';

    console.log('Proxying to', backendHost, ',', backendPort);

    var proxyConfig = url.parse('http://' + backendHost + ':' + backendPort + '/api')
    proxyConfig.route = '/'

    browserSync({
        port     : 3000,
        ui       : false,
        open     : false,
        notify   : false,
        ghostMode: false,
        logPrefix: 'BS',
        server: {
            baseDir: 'dist',
            middleware: [browserSyncProxy(proxyConfig)]
        }
    });

    gulp.watch('app/**/*.html', ['html']);
    gulp.watch('app/**/*.js', ['scripts']);
    gulp.watch('app/styles/**/*.css', ['styles']);
    gulp.watch('app/images/**/*', ['images']);
});

gulp.task('build', ['clean', 'html', 'styles', 'scripts', 'fonts', 'images'], function() {
    process.exit();
});
