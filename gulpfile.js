const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const terser = require('gulp-terser')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const concat = require('gulp-concat')
const cleanCSS = require('gulp-clean-css')

const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')

const reload = browserSync.reload
const exec = require('child_process').exec

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
    }
  )
}

const optimizeImages = () => {
  return gulp
    .src(['./img/*.{gif,png,jpg,svg}'])
    .pipe(imagemin())
    .pipe(gulp.dest('./img'))
}

const vendorStyles = () => {
  return gulp
    .src(
      [
        './node_modules/slick-carousel/slick/slick.css',
        './node_modules/slick-carousel/slick/slick-theme.css',
      ],
      { allowEmpty: true }
    )
    .pipe(concat('vendor.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/vendor'))
}

const vendorScripts = () => {
  return gulp
    .src(['./node_modules/slick-carousel/slick/slick.js'], { allowEmpty: true })
    .pipe(
      concat('vendor.js', {
        newLine: ';',
      })
    )
    .pipe(
      terser({
        output: { preserve_annotations: true, comments: false },
        compress: { drop_console: true, drop_debugger: true },
      })
    )
    .pipe(gulp.dest('./dist/vendor'))
}

gulp.task('images', function () {
  return optimizeImages()
})

gulp.task('vendor', function () {
  vendorStyles()
  vendorScripts()
  return Promise.resolve(':: done ::')
})

gulp.task('watch', function () {
  browserSync.init({
    // change path to your working directory, such as 'localhost/mysite'
    proxy: 'localhost',
    notify: false,
  })
  gulp.watch('src/**/*.ts', scripts)
  gulp.watch(['*.php', '**/*.php', 'styles/*.css']).on('change', tw)
})
