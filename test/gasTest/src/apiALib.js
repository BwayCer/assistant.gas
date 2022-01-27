import assert from 'assert';
import {
  juruo, timeStamp, crypto,
  Gasdb, GasWebRecorder,
} from '../../../dist/main.js';


let _conf = {
  "spreadsheet": {
    "test": {
      "id": "1U2xpIxpEO5c8qLtlhODJquKl_JYCXqozQ2bUu3sbe-8",
      "tables": {
        "gasdb": "Gasdb",
      },
    },
    "webRecorder": {
      "id": "1U2xpIxpEO5c8qLtlhODJquKl_JYCXqozQ2bUu3sbe-8",
      "tables": {
        "track": "Track",
        "error": "Error",
      },
    },
  },
};

// Rollup 會自動刪除未被使用的方法故加此行
console.log(
  `apiLib start at ${(new Date()).toISOString()}`
  || assert || _conf || {
    juruo, timeStamp, crypto,
    Gasdb, GasWebRecorder,
  }
);

