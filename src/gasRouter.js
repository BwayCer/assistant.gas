
gasOrder('assistant/gasRouter', function (deps) {
    /**
     * 谷歌腳本路由器 Gas Router。
     *
     * @memberof module:assistant.
     * @class  CallMethod
     */
    function GasRouter() {
        /**
         * 快取： 儲存調用方法。
         *
         * @memberof module:assistant.GasRouter#
         * @var {String} _cache
         */
        this._cache = {};
    }

    /**
     * 增加： 增加調用方法。
     *
     * @memberof module:assistant.GasRouter#
     * @func add
     * @param {String} key
     * @param {!*} methodHandle
     * @throws {TypeError} "key" 必須為 `String`。
     * @throws {TypeError} "methodHandle" 必須不為 `undefined|null`。
     * @return {GasRouter}
     */
    GasRouter.prototype.add = function (key, methodHandle) {
        if (typeof key !== 'string')
            throw TypeError(
                deps.juruo.get('__restrictedType', {
                    name: 'key',
                    type: 'String',
                    actual: typeof key,
                })
            );
        if (methodHandle == null)
            throw TypeError(
                deps.juruo.get('__restrictedNotType', {
                    name: 'methodHandle',
                    type: 'undefined|null',
                    actual: typeof methodHandle,
                })
            );

        this._cache[key] = methodHandle;
        return this;
    };

    /**
     * 創建輸出資訊。
     *
     * @abstract
     * @memberof module:assistant.GasRouter#
     * @func createOutputInfo
     * @param {*} requestInfo
     * @return {Object}
     * {
     *     requestList: [...],
     *     ...
     * }
     */

    /**
     * 調用： 調用方法並存入處理結果。
     *
     * @abstract
     * @memberof module:assistant.GasRouter#
     * @func call
     * @param {Object} outputInfo
     * @param {*} request
     */

    /**
     * 輸出處理
     *
     * @abstract
     * @memberof module:assistant.GasRouter#
     * @func outputHandle
     * @param {Object} outputInfo
     * @return {*}
     */

    /**
     * 輸入： 請求處理。
     *
     * @memberof module:assistant.GasRouter#
     * @func input
     * @param {Object} requestInfo
     * @throws {TypeError} "requestList" 必須為 `Array`。
     */
    GasRouter.prototype.input = function (requestInfo) {
        var idx, len;
        var outputInfo = this.createOutputInfo(requestInfo);
        var requestList = outputInfo.requestList;

        if (requestList == null || requestList.constructor !== Array)
            throw TypeError(
                deps.juruo.get('__restrictedType', {
                    name: 'requestList',
                    type: 'Array',
                    actual: typeof requestList,
                })
            );

        for (idx = 0, len = requestList.length; idx < len ; idx++)
            this.call(outputInfo, requestList[idx]);

        return this.outputHandle(outputInfo);
    };

    deps.GasRouter = GasRouter;
} );

