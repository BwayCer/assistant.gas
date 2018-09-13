
/**
 * 初始化 init for Apps Script
 *
 * @module init
 */

'use strict';


/**
 * 時間戳： 紀錄開始時間。
 *
 * @memberof module:init.
 * @var {Number} timestamp_origin
 */
var timestamp_origin = +new Date();

var gasOrder = function () {
    /**
     * 訂單： 解決 Google Apps Script 載入順序問題。
     * <br><br>
     * 接受 {@link module:init.gasOrder._menu|gasOrder._menu}
     * 與 {@link module:init.gasOrder._handle|gasOrder._handle}
     * 的參數寫法。
     *
     * @memberof module:init.
     * @func gasOrder
     * @param {String} id - 識別碼。
     * @param {Function} factory - 工廠。
     * @throws {TypeError} "id" 參數必須為 `String`。
     * @throws {TypeError} "factory" 參數必須為 `Function`。
     */
    function gasOrder(id, factory) {
        if (typeof id !== 'string')
            throw TypeError(
                'The "id" argument must be of `String`.'
                + ' Received `' + (typeof id) + '` type.'
            );

        if (typeof factory !== 'function')
            throw TypeError(
                'The "factory" argument must be of `Function`.'
                + ' Received `' + (typeof factory) + '` type.'
            );

        gasOrder._cache[id] = factory;
        gasOrder._handle(id);
    }

    /**
     * 菜單： 確認模組載入順序與方法問題。
     *
     * @memberof! module:init.
     * @alias gasOrder.menu
     * @func  gasOrder.menu
     * @param {String} envState - 環境狀態。
     * @param {Array} dependencyList - 模組依賴順序。
     * @param {Function} [notify] - 完成通知。
     * @param {Object} [container] - 儲放依賴的容器。
     * @throws {Error} `gasOrder#menu` 僅能調用一次。
     * @throws {TypeError} "envState" 參數必須為 `String`。
     * @throws {TypeError} "envState" 參數必須為 `String`。
     */
    gasOrder.menu = function (envState, dependencyList, notify, container) {
        if (this._cacheNotify)
            throw Error('There\'s only one to call `gasOrder#menu`.');

        if (typeof envState !== 'string')
            throw TypeError(
                'The "envState" argument must be of `String`.'
                + ' Received `' + (typeof envState) + '` type.'
            );

        if (dependencyList == null || dependencyList.constructor !== Array)
            throw TypeError(
                'The "dependencyList" argument must be of `Array`.'
                + ' Received `' + (typeof dependencyList) + '` type.'
            );

        var arguNotify, arguContainer;

        if (arguments.length === 3) {
            switch (notify && typeof notify) {
                case 'function':
                    arguNotify = notify;
                    arguContainer = null;
                    break;
                case 'object':
                    arguNotify = null;
                    arguContainer = notify;
                    break;
                // null & 其他
                default:
                    throw TypeError(
                        'The "notify" argument must be of `Object|Function`.'
                        + ' Received `' + (typeof notify) + '` type.'
                    );
            }
        } else {
            if (notify == null || typeof notify !== 'function')
                throw TypeError(
                    'The "notify" argument must be of `Function`.'
                    + ' Received `' + (typeof notify) + '` type.'
                );

            if (container == null || typeof container !== 'object')
                throw TypeError(
                    'The "container" argument must be of `Object`.'
                    + ' Received `' + (typeof container) + '` type.'
                );

            arguNotify = notify;
            arguContainer = container;
        }

        var deps, cacheNotify, envStateInfo;

        envStateInfo = this._envStateInfo;
        deps = arguContainer || {};
        deps.timestamp_origin = timestamp_origin;
        deps.envStateInfo = envStateInfo;
        deps.env = envStateInfo[
            envStateInfo.hasOwnProperty(envState) ? envState : 'DEVELOPMENT'
        ];

        cacheNotify = this._cacheNotify = arguNotify || {};
        cacheNotify._depsList = dependencyList;
        cacheNotify._depsIdx = 0;
        cacheNotify._deps = deps;

        this.state = this.stateInfo.HANDLE;
        this._handle('MENURECEIVED');
    };

    // 環境狀態資訊
    gasOrder._envStateInfo = {
        PRODUCTION: 'PRODUCTION',   // 正式
        DEVELOPMENT: 'DEVELOPMENT', // 開發
        TEST: 'TEST', // 測試
    };

    gasOrder.stateInfo = {
        WAITING: 'WAITING',
        HANDLE: 'HANDLE',
        FINISH: 'FINISH',
    };
    gasOrder.state = gasOrder.stateInfo.WAITING;
    gasOrder._cache = {};
    gasOrder._cacheNotify = null;

    /**
     * 處理訂單。
     *
     * @memberof module:init.
     * @alias gasOrder._handle
     * @func  gasOrder._handle
     * @param {String} id - 識別碼。
     * @throws {Error} Error("gasOrder" module error.)
     */
    gasOrder._handle = function (id) {
        if (this.state !== this.stateInfo.HANDLE) return;

        var notify = this._cacheNotify;
        var depsList = notify._depsList;
        var runIdx = notify._depsIdx;

        // 兩種情境：
        //   * 收到訂單，此時依賴可能完成。
        //   * 收到模組，檢查第一筆依賴是否為該模組。
        if (id !== 'MENURECEIVED' && depsList[runIdx] !== id) return;

        var runLen, runId;
        var isNotify = true;
        var deps = notify._deps;
        var cache = this._cache;
        var gasLog = deps.gasLog;
        var isHasGasLog = typeof gasLog === 'function';

        if (!isHasGasLog && depsList[runIdx] === 'assistant/gasLog') {
            runId = 'assistant/gasLog';

            if (cache.hasOwnProperty(runId)) {
                cache[runId](deps);
                notify._depsIdx = ++runIdx;

                gasLog = deps.gasLog;
                isHasGasLog = typeof gasLog === 'function';
            }
        }

        for (runLen = depsList.length; runIdx < runLen; runIdx++) {
            runId = depsList[runIdx];

            if (!cache.hasOwnProperty(runId)) {
                isNotify = false;
                break;
            }

            if (isHasGasLog) gasLog('gasOrder', 'start: ' + runId);
            cache[runId](deps);
            if (isHasGasLog) gasLog('gasOrder', 'done: ' + runId);
        }

        notify._depsIdx = runIdx;

        if (isNotify) {
            gasOrder.state = gasOrder.stateInfo.FINISH;
            if (typeof notify === 'function') notify(deps);
        }
    };

    return gasOrder;
}();


gasOrder('assistant/gasLog', function (deps) {
    /**
     * 谷歌應用程式腳本日誌： 除錯用日誌。
     *
     * @memberof module:init.
     * @func gasLog
     * @param {String} name - 日誌目錄名。
     * @param {*} [msg] - 訊息。
     */
    function gasLog(name, msg) {
        if (deps.env === deps.envStateInfo.PRODUCTION) return;

        var nowTimeMs = +new Date();
        var cache = gasLog._cache;
        var logTxt = cache[name];

        if (!logTxt) {
            logTxt = cache[name] = [['runOrder', 'runTime', 'msg']];
            logTxt._runOrder = 0;
            logTxt._nowTimeMs = nowTimeMs;
        }

        if (msg) {
            logTxt.unshift([
                logTxt._runOrder++,
                nowTimeMs - logTxt._nowTimeMs,
                msg
            ]);

            logTxt._nowTimeMs = nowTimeMs;
        }
    }

    gasLog._cache = {};

    deps.gasLog = gasLog;
});

