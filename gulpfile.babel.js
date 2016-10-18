import path       from 'path'
import gulp       from 'gulp'
import less       from 'gulp-less'
import babel      from 'gulp-babel'
import livereload from 'gulp-livereload'
import rename     from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'
import gutil      from 'gulp-util'

const files = [
  'styles/acf-drop-files-on-fields.less',
  'scripts/acf-drop-files-on-fields.es6'
]

files.forEach(file => {
  gulp.task(file, () => compile(file))
  gulp.task(`${file}-build`, () => compile(file, true))
})

gulp.task('watch', () => {
  livereload.listen()
  files.forEach(file =>
    gulp.watch(file, [file])
  )
})

gulp.task('default',
  files.map(file => `${file}-build`)
)

function compile(src, build = false) {
  const isScript = /\.es6$/.test(src)
  const transformation = isScript
    ? babel({
        minified: build,
        comments: false
      })
    : less({
        compress: build,
        paths: [path.join(__dirname, 'node_modules')]
      })
  const name = !build
    ? gutil.noop()
    : isScript
      ? rename(path => path.extname = '.min.js')
      : rename(path => path.extname = '.min.css')

  return gulp.src(src)
    .pipe(build || isScript ? sourcemaps.init() : gutil.noop())
    .pipe(transformation)
    .on('error', error)
    .pipe(name)
    .pipe(build || isScript ? sourcemaps.write('.') : gutil.noop())
    .pipe(gulp.dest(src.substr(0, src.lastIndexOf('/'))))
    .pipe(build ? gutil.noop() : livereload())
}

function error(err) {
  console.error(err.stack || err)
  this.emit('end')
}
