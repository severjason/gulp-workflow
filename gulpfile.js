(function () {

    const gulp = require('gulp'),
        browserSync = require('browser-sync'),
        del = require('del'),
        babel = require('gulp-babel'),
        cache = require('gulp-cache'),
        gulpIf = require('gulp-if'),
        sass = require('gulp-sass'),
        useref = require('gulp-useref'),
        uglify = require('gulp-uglify'),
        cssNano = require('gulp-cssnano'),
        imageMin = require('gulp-imagemin'),
        sourceMaps = require('gulp-sourcemaps'),
        runSequence = require('run-sequence'),
        ts = require("gulp-typescript"),
        tsProject = ts.createProject("tsconfig.json");

    /**
     *  All paths
     */
    const path = {
        app: 'app/',
        scss: 'app/scss/**/*.scss',
        images: 'app/images/**/*.*+(png|jpeg|jpg|svg|gif)',
        fonts: ['node_modules/bootstrap-sass/assets/fonts/**/*'],
        ts: ['app/ts/**/*.ts'],
        tsCompiled: 'ts/compiled/',
        js: ['app/js/**/*.js']
    };

    /**
     *  Browser sync
     */
    gulp.task('browserSync', function () {
        browserSync({
            server: {
                baseDir: path.app,
                routes: {
                    '/node_modules': 'node_modules'
                }
            }
        });
    });

    /**
     *  All paths
     */
    gulp.task('css', function () {
        return gulp.src(path.scss)
            .pipe(sourceMaps.init())
            //.pipe($.sass({outputStyle: 'expanded'}))
            .pipe(sass({outputStyle: 'compressed'}))
            .on('error', sass.logError)
            .pipe(sourceMaps.write('.'))
            .pipe(gulp.dest(path.app + 'css'))
            .pipe(browserSync.reload({
                stream: true
            }));
    });

    /**
     * Move compiled ts to compiled dir
     */
    gulp.task('ts', function () {
        return tsProject.src()
            .pipe(tsProject())
            .js.pipe(gulp.dest(path.app + path.tsCompiled));
    });

    /**
     *  Concat all js and css into one file
     */
    gulp.task('useref', function () {
        return gulp.src(path.app + '**/*.html')
            .pipe(useref())
            .pipe(gulpIf(['*.js', path.tsCompiled + "*.js"], babel({
                presets: ['es2015']
            })))
            .pipe(gulpIf(['*.js', path.tsCompiled + "*.js"], uglify()))
            .pipe(gulpIf('*.css', cssNano()))
            .pipe(gulp.dest('dist'));
    });

    /**
     *  Move all images to dist
     */
    gulp.task('img', function () {
        return gulp.src(path.images)
            .pipe(cache(imageMin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: false
            })))
            .pipe(gulp.dest('dist/images'))
    });

    /**
     *  AMove all fonts to dist and app
     */
    gulp.task('fonts', function () {
        return gulp.src(path.fonts)
            .pipe(gulp.dest(path.app + 'fonts'))
            .pipe(gulp.dest('dist/fonts'));
    });

    /**
     *  Delete dist folder
     */
    gulp.task('clear', function (callback) {
        del('dist');
        return cache.clearAll(callback);
    });

    /**
     *  Delete all in dist folder except images
     */
    gulp.task('clear:dist', function (callback) {
        del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
    });

    /**
     *  Watch task - for sass
     */
    gulp.task('watch', ['browserSync', 'css'], function () {
        gulp.watch(path.ts, ['ts']);
        gulp.watch(path.scss, ['css']);
        gulp.watch([path.app + "*.html", path.scss, path.app + path.tsCompiled + "**/*.js"]).on('change', browserSync.reload);
    });

    /**
     *  Task to builds an app for production
     */
    gulp.task('build', function () {
        runSequence(['css','ts', 'useref', 'img', 'fonts'])
    });

    /**
     *  Default task
     */
    gulp.task('default', function () {
        runSequence(['css', 'fonts', 'browserSync', 'watch'])
    });
}());
