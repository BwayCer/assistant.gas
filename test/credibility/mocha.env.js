
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
        // 環境設置
        _mochaGasEval.storeList.forEach((keyPath) => {
            let keyPathList = keyPath.split('.');
            let lastIdx = keyPathList.length - 1;
            keyPathList.reduce((target, key, idx) => {
                if (idx !== lastIdx)
                    return target[key];
                else
                    target[key] = undefined;
            }, global);
        });

        // 執行
        eval(_code);

        // 環境還原
        _mochaGasEval.storeList.forEach((keyPath) => {
            let keyPathList = keyPath.split('.');
            let lastIdx = keyPathList.length - 1;
            keyPathList.reduce((target, key, idx) => {
                if (idx !== lastIdx)
                    return target[key];
                else
                    target[key] = _mochaGasEval.store[keyPath];
            }, global);
        });
    }
    _mochaGasEval.storeList = [
        'Reflect',
        'Object.assign',
    ];
    _mochaGasEval.store = _mochaGasEval.storeList.reduce((store, keyPath) => {
        store[keyPath] = keyPath.split('.').reduce((target, key) => target[key], global);
        return store;
    }, {});

    return requireEval;
}();

