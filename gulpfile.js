let gulp = require("gulp");
let runSequence = require("run-sequence");
let mocha = require("gulp-mocha");

let SRC_FILES = "default/**/*.js";
let UNIT_TEST_FILES = "tests/unit/**/*.spec.js";
let COMPONENT_TEST_FILES = "tests/component/**/*.spec.js";

gulp.task("unit", function() {
  let stream =
    gulp.src(UNIT_TEST_FILES)
    .pipe(mocha());
  return stream;
});

gulp.task("unit:verbose", function() {
  let stream =
    gulp.src(UNIT_TEST_FILES)
    .pipe(mocha());
  return stream;
});

gulp.task("component", function() {
  let stream =
    gulp.src(COMPONENT_TEST_FILES)
    .pipe(mocha());
  return stream;
});

gulp.task("component:verbose", function() {
  let stream =
    gulp.src(COMPONENT_TEST_FILES)
    .pipe(mocha());
  return stream;
});

gulp.task("test", function(done) {
  runSequence("unit", "component", done);
});
