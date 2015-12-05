/**
 * Created by severjason on 01.12.2015.
 */

const gulp = require('gulp'),
    browserSync = require('browser-sync'),
    del = require('del'),
    runSequence = require('run-sequence'),
    $ = require('gulp-load-plugins')();

/**
 *  All paths
 */
const path = {
    scss: 'app/scss/**/*.scss',
    images: 'app/images/**/*.+(png|jpg|gif|svg)',
    fonts: ['bower_components/bootstrap-sass/assets/fonts/**/*'],
    libJs: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js'],
    js: ['app/js/**/*.js']
};

/**
 *  Browser sync
 */
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        }
    });
});

/**
 *  All paths
 */
gulp.task('css', function () {
    return gulp.src(path.scss)
        .pipe($.sourcemaps.init())
        .pipe($.sass({outputStyle: 'expanded'}))
        .on('error', $.sass.logError)
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

/**
 *  AMove all bower js files to app/lib
 */
gulp.task('js', function () {
    return gulp.src(path.libJs)
        .pipe(gulp.dest('app/lib'));
});

/**
 *  Concat all js and css into one file
 */
gulp.task('useref', function () {
    return gulp.src('app/*.html')
        .pipe($.useref())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.minifyCss()))
        .pipe(gulp.dest('dist'));
});

/**
 *  Move all images to dist
 */
gulp.task('img', function () {
    return gulp.src(path.images)
        .pipe($.cache($.imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});

/**
 *  AMove all fonts to dist and app
 */
gulp.task('fonts', function () {
    return gulp.src(path.fonts)
        .pipe(gulp.dest('app/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});

/**
 *  Delete dist folder
 */
gulp.task('clean', function (callback) {
    del('dist');
    return $.cache.clearAll(callback);
});

/**
 *  Delete all in dist folder except images
 */
gulp.task('clean:dist', function (callback) {
    del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});

/**
 *  Watch task - for sass
 */
gulp.task('watch', ['browserSync', 'css'], function () {
    gulp.watch(path.scss, ['css']);
});

/**
 *  Task to builds an app for production
 */
gulp.task('build', function () {
    runSequence(['css', 'useref', 'img', 'fonts'])
});

/**
 *  Default task
 */
gulp.task('default', function () {
    runSequence(['css', 'js', 'fonts', 'browserSync', 'watch'])
});