gulp-sass-glob-import
=====================

gulp task to allow importing directories in your SCSS.

Different from [gulp-sass-bulk-import](https://github.com/mathisonian/gulp-sass-bulk-import) in that I needed the output to not include the absolute path. Also using `Globs` for more flexibility.


## installation

```
npm install --save-dev gulp-sass-glob-import
```


## usage


#### in your .scss file

```scss

@import "some/path/*";

// becomes
// @import "some/path/file1.scss";
// @import "some/path/file2.scss";
// ...

```

#### in your gulpfile

```js
var bulkSass = require('gulp-sass-bulk-import');

gulp.task('css', function() {
    return gulp
            .src(srcDir + 'stylesheets/app.scss')
            .pipe(bulkSass())
            .pipe(
                sass({
                    includePaths: ['src/stylesheets']
                }))
            .pipe( gulp.dest('./public/css/') );
});
```

