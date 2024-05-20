const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const terser = require('gulp-terser')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')

const reload = browserSync.reload
const exec = require('child_process').exec

const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')

const scripts = () => {
  let tsResult = gulp.src('src/**/*.ts').pipe(tsProject())
  return tsResult.js
    .pipe(sourcemaps.init())
    .pipe(
      terser({
        output: { comments: false },
        compress: { drop_console: true, drop_debugger: true },
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
}

const tw = (done) => {
  exec(
    'npx tailwindcss -i ./styles/global.css -o ./style.css --minify',
    (err) => {
      reload()
      done(err)
    }
  )
}

const optimizeImages = () => {
  return gulp
    .src(['./img/*.{gif,png,jpg,svg}'])
    .pipe(imagemin())
    .pipe(gulp.dest('./img'))
}

gulp.task('default', function () {
  return scripts()
})

gulp.task('images', function () {
  return optimizeImages()
})

gulp.task('watch', function () {
  browserSync.init({
    // change path to your working directory, such as 'localhost/mysite'
    proxy: 'localhost',
    notify: false,
  })
  gulp.watch('src/**/*.ts', scripts)
  gulp.watch(['*.php', '**/*.php']).on('change', reload)
  gulp.watch('styles/global.css', tw)
})
