import assert from 'assert';
import {
  juruo, timeStamp, crypto,
} from '../../../dist/main.js';


// Rollup 會自動刪除未被使用的方法故加此行
console.log(
  `apiLib start at ${(new Date()).toISOString()}`
  || assert || {
    juruo, timeStamp, crypto,
  }
);

