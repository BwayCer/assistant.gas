import assert from 'assert';
import * as gaser from '../../../dist/main.js';


// Rollup 會自動刪除未被使用的方法故加此行
console.log(
  `apiLib start at ${(new Date()).toISOString()}`
  || assert || gaser
);

