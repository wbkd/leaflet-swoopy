const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
// set env via $ gulp --type production
const environment = $.util.env.type || 'development';
const isProduction = environment === 'production';
const webpackConfig = require('./webpack.config.js').getConfigByType(environment);
const webpack = require('webpack-stream');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

const app = 'app/';
const dist = 'dist/';
const autoprefixerBrowsers = [                 
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 25',
  'chrome >= 34',
  'safari >= 6',
  'opera >= 23',
  'ios >= 6',
  'android >= 4.4',
  'bb >= 10'
];

const scriptsTask = function() {
  return gulp.src(webpackConfig.entry)
    .pipe(webpack(webpackConfig))
    .pipe($.size({ title : 'js' }))
    .pipe(gulp.dest(dist + 'js/'))
    .pipe(reload({ stream:true }));
};

const htmlTask = function() {
  return gulp.src(app + 'index.html')
    .pipe(gulp.dest(dist))
    .pipe($.size({ title : 'html' }))
    .pipe(reload({ stream:true }));
};

const stylusTask = function() {
  // convert stylus to css
  return gulp.src(app + 'stylus/main.styl')
    .pipe($.stylus({
      // only compress if we are in production
      compress: isProduction,
      // include 'normal' css into main.css
      'include css' : true
    }))
    .pipe($.autoprefixer({browsers: autoprefixerBrowsers}))
    .pipe(gulp.dest(dist + 'css/'))
    .pipe($.size({ title : 'css' }))
    .pipe(reload({ stream:true }));
};

const serveTask = function() {
  browserSync({
    server: {
      baseDir: dist
    }
  });
};

const imagesTask = function(){
  return gulp.src(app + 'images/**/*.{png,jpg,jpeg,gif,svg}')
    .pipe($.size({ title : 'images' }))
    .pipe(gulp.dest(dist + 'images/')); 
};

const watchTask = function(){
  gulp.watch(app + 'stylus/*.styl', ['styles']);
  gulp.watch(app + 'index.html', ['html']);
  gulp.watch(app + 'scripts/**/*.js', ['scripts']);
};

gulp.task('scripts', scriptsTask);
gulp.task('html', htmlTask);
gulp.task('styles', stylusTask);
gulp.task('serve', serveTask);
gulp.task('images', imagesTask);
gulp.task('watch', watchTask);

// remove bundels
gulp.task('clean', function(cb) {
  return del([dist], cb);
});

// by default build project and then watch files in order to trigger livereload
gulp.task('default', ['build', 'serve', 'watch']);

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function(){
  imagesTask();
  htmlTask();
  scriptsTask();
  stylusTask();

  return true;
});
