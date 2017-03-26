var gulp 			        = require('gulp');
var less              = require('gulp-less');
var concat 			      = require('gulp-concat');
var tempateCache  	  = require('gulp-angular-templatecache');
var addStream         = require('add-stream');

gulp.task('js', function() {
	 process.stdout.write('JS Task');
   gulp.src('./app/js/**/*.js')
  	.pipe(addStream.obj(prepareTemplates()))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./app/'));
});

gulp.task('css', function(){
  gulp.src('./app/css/less/**/*.less')
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./app/'))
});
// 
// 
// 

function prepareTemplates() {
  return gulp.src('./app/js/**/*.template.html')
    //.pipe(minify and preprocess the template html here)
    .pipe(tempateCache());
}


gulp.task('default',  function () {
  process.stdout.write('Starting to watch files\n');
  gulp.watch('./app/js/**/*.js', ['js']);
  gulp.watch('./app/js/**/*.template.html', ['js']);
  gulp.watch('./app/css/less/**/*.less', ['css']);
  // gulp.start('watch');
});