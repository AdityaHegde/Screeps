import * as gulp from "gulp";
import * as mocha from "gulp-mocha";
import * as ts from "gulp-typescript";
import * as del from "del";

const SRC_FILES = "src/**/*.ts";
const UNIT_TEST_FILES = "tests/unit/**/*.spec.js";
const COMPONENT_TEST_FILES = "tests/component/**/*.spec.js";

const tsProject = ts.createProject("tsconfig.json");

function clean() {
  return del(["build"]);
}

function build() {
  return gulp.src(SRC_FILES)
        .pipe(tsProject())
        .pipe(gulp.dest("build"));
}

function unit() {
  return gulp.src(UNIT_TEST_FILES)
        .pipe(mocha());
}

function component() {
  return gulp.src(COMPONENT_TEST_FILES)
        .pipe(mocha());
}

export {
  clean,
  build,
  unit,
  component,
}
