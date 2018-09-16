
global.assert = require('assert');

/**
 * 請求賦值： 由於 谷歌應用程式腳本 不為 CommonJS，所以實作載入。
 *
 * @func requireEval
 * @param {String[]} urlList - 起始於 "package.json" 的相對路徑。
 * @param {String[]} catchGlobalList - 捕獲全域變數。 請求文件的全域變數名稱清單。
 * @return {Object} 捕獲的全域變數。
 */
global.requireEval_catch = null;
global.requireEval = function () {
    function requireEval(urlList, catchGlobalList) {
        let catchGlobal;
        let fs = require('fs');
        let code = urlList.reduce(function (code, url) {
            return code + ';' + fs.readFileSync(url, 'utf-8');
        }, '');
        let catchCode = catchGlobalList.reduce(function (code, val) {
            return `${code} requireEval_catch['${val}'] = ${val};`;
        }, '');

        catchGlobal = requireEval_catch = {};
        _mochaGasEval(code + ';' + catchCode);
        requireEval_catch = null;

        return catchGlobal;
    }

    function _mochaGasEval(_code) {
        var Reflect = undefined;
        var Object = _mochaGasEval.store.Object({}, Object);
        Object.assign = undefined;

        eval(_code);
    }
    _mochaGasEval.store = {
        Object,
    };

    return requireEval;
}();

