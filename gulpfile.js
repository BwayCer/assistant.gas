
import gulp from 'gulp';
import rollup from 'gulp-better-rollup';
import rollupOptions from '@bwaycer/ht-modern-web/rollup/options';
import rollupNodePolyfills from 'rollup-plugin-node-polyfills';


const {parallel, dest} = gulp;


let assetRollupPlugins = rollupOptions.parsePlugins(
  'asset',
  (name, handle, options) =>
    name !== 'nodePolyfills' ? handle(options) : rollupNodePolyfills()
);


export let test_gasTest = parallel(
  () => gulp
    .src([
      'test/gasTest/.clasp.json',
      'test/gasTest/.claspignore',
      'test/gasTest/appsscript.json',
      'test/gasTest/test/apiEntryTest.js',
    ], {
      base: 'test/gasTest/',
    })
    .pipe(dest('dist'))
  ,
  () => gulp
    .src('test/gasTest/test/apiALib.js')
    .pipe(rollup({
      plugins: assetRollupPlugins,
    }, 'es'))
    .pipe(dest('dist/test'))
  ,
);

