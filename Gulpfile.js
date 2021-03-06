// generated on 2016-08-23 using generator-webapp 2.1.0
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
var child = require('child_process');
var fs = require('fs');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('public/styles/**/*.scss')
    .pipe($.plumber())
  //.pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'compressed',
      precision: 2,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 1 versions']}))
    //.pipe($.sourcemaps.write())
    .pipe(gulp.dest('public/styles'))
    .pipe(reload({stream: true}));
});


function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});


gulp.task('html', ['styles'], () => {
  return gulp.src('views/*.ejs')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: false, colormin:true,convertValues:true,autoprefixer: false,discardComments:true,discardDuplicates:true,discardOverridden:true,filterOptimiser:true,functionOptimiser:true,mergeIdents:true,mergeLonghand:true,mergeRules:true})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true,html5:true,quoteCharacter: "'",removeAttributeQuotes:true,removeRedundantAttributes:true })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('public/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['dist']));


gulp.task('serve', function() {
  var server = child.spawn('node', ['index.js']);
  var log = fs.createWriteStream('server.log', {flags: 'a'});
  server.stdout.pipe(log);
  server.stderr.pipe(log);

  gulp.watch([
    '*.html',
    'public/scripts/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('public/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);

});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 8080,
    server: {
      baseDir: ['dist']
    }
  });
});



// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['clean','lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean', 'styles'], () => {
  gulp.start('serve');
});
