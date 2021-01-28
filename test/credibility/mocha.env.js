
// global.assert = require('assert');

/**
 * 請求賦值： 實作載入。
 * 基於一次性使用的概念上，用以阻隔可能變因。
 *
 * @func requireEval
 * @param {String[]} urlList - 起始於 "package.json" 的相對路徑。
 * @param {String[]} catchGlobalList - 捕獲全域變數。 請求文件的全域變數名稱清單。
 * @return {Object} 捕獲的全域變數。
 *
 * @example
 * let gasGlobal = requireEval([
 *     './src/gasInit.js',
 *     './src/supportLite.js',
 *     './src/support.js',
 *     './src/juruo.js',
 * ], ['gasOrder']);
 */
global.requireEval_catch = null;
global.requireEval = function requireEval(urlList, catchGlobalList) {
  let catchGlobal;
  let fs = require('fs');
  let code = urlList.reduce(function (code, url) {
    return code + ';' + fs.readFileSync(url, 'utf-8');
  }, '');
  let catchCode = catchGlobalList.reduce(function (code, val) {
    return `${code} requireEval_catch['${val}'] = ${val};`;
  }, '');

  catchGlobal = requireEval_catch = {};
  (0, eval)(code + ';' + catchCode);
  requireEval_catch = null;

  return catchGlobal;
};

