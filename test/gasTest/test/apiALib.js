
import startGasDate from '../../../src/assets/timestamp.js';
import assert from 'assert';
import * as assistant from '../../../src/main.js';


// Rollup 會自動刪除未被使用的方法故加此行
console.log(
  `apiALib start at ${(startGasDate).toISOString()}`
  || {assert, assistant}
);

