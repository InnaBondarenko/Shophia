var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');


var reload = browserSync.reload;

var markup = './markup';
var dist = './dist';

var markupPaths = {
	html: [markup + '/*.html'],
	js: [markup + '/assets/js/**/*.js'],
	scss: [markup + '/assets/scss/**/*.scss']
}

'use strict';

gulp.task('html', function () {
  return gulp.src(markupPaths.html)
    .pipe(gulp.dest('./dist'))
    .pipe(reload({
		stream: true
	}));
});

gulp.task('js', function () {
  return gulp.src(markupPaths.js)
    .pipe(sourcemaps.init())
    .pipe(concat('assets.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(reload({
		stream: true
	}));
});

gulp.task('sass', function () {
  return gulp.src(markupPaths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 4 versions', 'ie 9']
      }))
    .pipe(sourcemaps.write('markup'))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(reload({
		stream: true
	}));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './dist'
        },
        logConnections: true,
        debugInfo: true,
        injectChanges: true,
        port: 3004,
        open: true,
        browser: 'default',
        startPath: '/index.html',
        notify: true,
        reloadOnRestart: true
    });
});


gulp.task('watch', function () {
	watch(markupPaths.html, function(){
    	gulp.start('html');
    });
    watch(markupPaths.js, function(){
    	gulp.start('js');
    });
    watch(markupPaths.scss, function(){
    	gulp.start('sass');
    });
});

gulp.task('dev', ['watch', 'browser-sync']);
