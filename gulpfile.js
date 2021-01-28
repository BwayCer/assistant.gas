
const {task, series, parallel, watch, src, dest} = require('gulp');

const rollup = require('gulp-better-rollup');
const rollupNodePolyfills = require('rollup-plugin-node-polyfills');
const rollupBabel = require('@rollup/plugin-babel');
const rollupTerser = require('rollup-plugin-terser');


let rollupPlugins = [
  rollupNodePolyfills(),
  rollupBabel.babel({babelHelpers: 'bundled'}),
  rollupTerser.terser({
    compress: false,
    mangle: false,
    format: {
      beautify: true,
      comments: false,
      indent_level: 2,
    },
  })
];

task('build', function rollupWrap() {
  return src('src/main.js')
    .pipe(rollup({
      plugins: rollupPlugins,
    }, 'es'))
    .pipe(dest('dist'))
  ;
});

task('build:test', series(
  function rollupWrap() {
    return src('test/gasTest/src/apiALib.js')
      .pipe(rollup({
        plugins: rollupPlugins,
      }, 'cjs'))
      .pipe(dest('test/gasTest/dist'))
    ;
  },
  function cpFiles() {
    return src([
        'test/gasTest/src/apiEntry*.js',
      ])
      .pipe(dest('test/gasTest/dist'))
    ;
  }
));

