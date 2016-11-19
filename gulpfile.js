var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');

var paths = {
    libs: [
        'js/libs/jquery.min.js',
        'js/libs/underscore.min.js',
        'js/libs/backbone.min.js'
    ],
    scripts: [
        'js/init.js',
        'js/utils.js',
        'js/models.js',
        'js/views.js',
        'js/router.js',
        'js/main.js'
    ],
    styles: [
        'css/main.scss'
    ]
};

gulp.task('default', ['compile-styles', 'compile-scripts', 'compile-libs']);

gulp.task('compile-styles', function() {
    return gulp.src(paths.styles)
        .pipe(sourcemaps.init())
            .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'));
});

gulp.task('compile-scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
            .pipe(babel({ presets: ['es2015'] }))
            .pipe(uglify().on('error', function(err){throw err;}))
            .pipe(concat('js/main.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./'));
});

gulp.task('compile-libs', function() {
    return gulp.src(paths.libs)
        .pipe(sourcemaps.init())
        .pipe(concat('js/libs.min.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('build', function() {
    // do build stuff
});
