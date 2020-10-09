
// https://developers.google.com/apps-script/guides/web
// https://developers.google.com/apps-script/reference/url-fetch/

// 黑盒子試算表樣本：
// https://docs.google.com/spreadsheets/d/19DcWdAVCJcAzhu0dq-G4g51BOQZg6gX3kjPf-lja4ps/edit?usp=sharing

gasOrder('assistant/GasWebRecorder', function (deps) {
    /**
     * 網路黑盒子。
     *
     * @memberof module:assistant.
     * @class GasWebRecorder
     * @param {String} sheetName - 試算表名稱。
     *
     * @example
     * var webRecorder = new GasWebRecorder('webRecorder');
     * var doGet  = webRecorder.receiver('Get  項目', function (request) {...});
     * var doPost = webRecorder.receiver('Post 項目', function (request) {...});
     * var triggerAction = webRecorder.trigger('trigger 項目', function () {...});
     * var fhrData = webRecorder.fetch(
     *     'fetch 項目', <url>, <options>,
     *     <requestContentShowMethod>, <receiveContentShowMethod>
     * );
     *
     * doGet({
     *     "queryString": "username=jsmith&age=21&age=49",
     *     "parameter": {
     *         "username": "jsmith",
     *         "age": "21"
     *     },
     *     "contextPath": "",
     *     "parameters": {
     *         "username": ["jsmith"],
     *         "age": ["21", '49']
     *     },
     *     "contentLength": -1
     * });
     *
     * @example
     * GasWebRecorder.setSheetConfig(spreadsheet, sheetName, id);
     */
    function GasWebRecorder(sheetName) {
        this._sheetName = sheetName;
    }

    /**
     * 設定 Gasdb 試算表列表。
     *
     * @memberof module:assistant.gasWebRecorder.
     * @func setSheetConfig
     * @param {Object} spreadsheetConfig - 試算表設定物件。
     * @param {String} sheetName - 試算表名稱。
     * @param {String} id - 試算表識別碼。
     * @return {Function}
     */
    GasWebRecorder.setSheetConfig = function (spreadsheetConfig, sheetName, id) {
        spreadsheetConfig[sheetName + '_id'] = id;
        spreadsheetConfig[sheetName + '_table'] = {
            track: 'Track',
            error: 'Error',
        };
    };

    function _AddLine(dbSheet, service, actItem) {
        var timeStamp = new deps.timeStamping();

        this._dbSheet = dbSheet;
        this.timeStamp = timeStamp.timeMs;
        this.idxRowNew = dbSheet.RowNew();
        this.dbKey = deps.Gasdb.getNewDbKey(dbSheet);

        dbSheet.create(dbSheet.fill([
            // 0. 引索
            this.dbKey,
            // 1. 標準時間戳
            timeStamp.symbol,
            // 2. 時間戳
            timeStamp.timeMsUTC,
            // 3. 服務
            service,
            // 4. 項目
            actItem,
            // 5. 狀態
            '建立',
            // 6. 錯誤
            // 7. 耗時
            // 8. 請求耗時
            // 9. 網址
            // 10. 方法
            // 11. 請求查詢參數
            // 12. 請求表頭
            // 13. 請求內容類型
            // 14. 請求內容大小
            // 15. 請求內容格式
            // 16. 請求內容
            // 17. 請求所有參數解析
            // 18. 狀態碼
            // 19. 回應表頭
            // 20. 回應內容類型
            // 21. 回應內容大小
            // 22. 回應內容格式
            // 23. 回應內容
        ]));
    }

    _AddLine.prototype.replyState = function (state, errLink, consumeTimeMs) {
        this._dbSheet.updateRange(
            [this.idxRowNew, 6, 1, 3],
            [[state, errLink, consumeTimeMs]]
        );
    };

    function _tryCatchRun(sheetName, run, runArgu) {
        var dbSheetErr, idxRowNewErr, dbKeyErr;
        var rtnVal, err, startTimeMs, consumeTimeMs;

        try {
            startTimeMs = +(new Date());
            rtnVal = arguments.length > 2 ? run(runArgu) : run();
            consumeTimeMs = +(new Date()) - startTimeMs;
        } catch (error) {
            err = error;
        }

        if (err) {
            dbSheetErr = new deps.Gasdb(sheetName, 'error');
            idxRowNewErr = dbSheetErr.RowNew();
            dbKeyErr = deps.Gasdb.getNewDbKey(dbSheetErr);
            dbSheetErr.create(dbSheetErr.fill([
                dbKeyErr,
                err.name, err.message, err.stack
            ]));

            return {
                ok: false,
                err: err,
                errLink: dbSheetErr.getUrlLinkFunc(idxRowNewErr, dbKeyErr),
            };
        } else {
            return {
                ok: true,
                consumeTimeMs: consumeTimeMs,
                returnValue: rtnVal,
            };
        }
    }

    function _runReceiver(sheetName, actItem, request, run) {
        var tryCatchRunInfo;
        var dbSheet = new deps.Gasdb(sheetName, 'track');
        var newLine = new _AddLine(dbSheet, 'WebApp', actItem);

        _runReceiver_recorderRequest(dbSheet, newLine.idxRowNew, request);
        newLine.replyState('接收', '', '');
        tryCatchRunInfo = _tryCatchRun(sheetName, run, request);

        if (tryCatchRunInfo.ok) {
            newLine.replyState('成功', '', +new Date() - newLine.timeStamp);
        } else {
            newLine.replyState('失敗', tryCatchRunInfo.errLink, '');
            throw tryCatchRunInfo.err;
        }
    }

    function _runReceiver_recorderRequest(dbSheet, idxRowNew, request) {
        var requestPostData;
        var contentLength = request.contentLength;
        var isGetType = !~contentLength;

        // 若使用 `new Array(7)` 但沒有賦予值的情況下
        // 試算表會出現 "NOT_FOUND" 提示。
        var newLine = ['', '', '', '', '', '', ''];
        newLine[0] = isGetType ? 'GET' : 'POST';
        newLine[1] = request.queryString;

        if (!isGetType) {
            requestPostData = request.postData;
            newLine[3] = requestPostData.type;
            newLine[4] = contentLength;
            newLine[5] = 'n/a';
            newLine[6] = requestPostData.contents;
        }

        dbSheet.updateRange([idxRowNew, 11, 1, 7], [newLine]);
    }

    function _runTrigger(sheetName, actItem, run) {
        var tryCatchRunInfo;
        var dbSheet = new deps.Gasdb(sheetName, 'track');
        var newLine = new _AddLine(dbSheet, 'Trigger', actItem);

        newLine.replyState('運行', '', '');
        tryCatchRunInfo = _tryCatchRun(sheetName, run);

        if (tryCatchRunInfo.ok) {
            newLine.replyState('成功', '', +new Date() - newLine.timeStamp);
        } else {
            newLine.replyState('失敗', tryCatchRunInfo.errLink, '');
            throw tryCatchRunInfo.err;
        }
    }

    function _runFetch(
        sheetName, actItem, url, options,
        requestContentShowMethod, receiveContentShowMethod
    ) {
        var tryCatchRunInfo, receiveInfo;
        var dbSheet = new deps.Gasdb(sheetName, 'track');
        var newLine = new _AddLine(dbSheet, 'UrlFetchApp', actItem);
        var idxRowNew = newLine.idxRowNew;

        _runFetch_recorderRequest(
            dbSheet, idxRowNew,
            url, options, requestContentShowMethod
        );
        newLine.replyState('請求', '', '');
        tryCatchRunInfo = _tryCatchRun(sheetName, function () {
            return UrlFetchApp.fetch(url, options);
        });

        if (tryCatchRunInfo.ok) {
            // 請求耗時
            dbSheet.updateRange([idxRowNew, 9], tryCatchRunInfo.consumeTimeMs);
            receiveInfo = new _runFetch_recorderReceive(
                dbSheet, idxRowNew,
                tryCatchRunInfo.returnValue,
                receiveContentShowMethod
            );
            newLine.replyState('成功', '', +new Date() - newLine.timeStamp);

            return receiveInfo;
        } else {
            newLine.replyState('失敗', tryCatchRunInfo.errLink, '');
            throw tryCatchRunInfo.err;
        }
    }

    function _runFetch_recorderRequest(
        dbSheet, idxRowNew,
        url, options, contentShowMethod
    ) {
        var readContentType, readContent;
        var newLine = new Array(9);
        var urlInfo = url.split('?');
        var request = UrlFetchApp.getRequest(url, options);

        switch (contentShowMethod) {
            case 'Text':
                readContentType = 'Text';
                // request.payload 為 `String` 類型
                readContent = request.payload;
                break;
            // TODO 轉換為 Blob 的方法
            // case 'Blob': break;
            case 'NotShow':
            default:
                readContentType = 'NotShow';
                readContent = '';
        }

        newLine[0] = urlInfo[0];
        // method
        newLine[1] = request.method || '';
        newLine[2] = urlInfo[1] || '';
        // headers
        newLine[3] = request.headers ? JSON.stringify(request.headers) : '';
        // contentType
        newLine[4] = request.contentType || '';
        // contentLength
        newLine[5] = request.payload.length || '';
        newLine[6] = readContentType;
        newLine[7] = readContent;
        newLine[8] = JSON.stringify(request);

        dbSheet.updateRange([idxRowNew, 10, 1, 9], [newLine]);
    }

    function _runFetch_recorderReceive(dbSheet, idxRowNew, receive, contentShowMethod) {
        var statusCode, readContentType, readContent;
        var receive_headers, headers, contentType, contentLength;
        var newLine = new Array(6);

        this.info = receive;
        statusCode = this.statusCode = receive.getResponseCode();

        receive_headers = receive.getHeaders();
        if (receive_headers) {
            headers       = receive_headers;
            contentType   = receive_headers['Content-Type'] || '';
            contentLength = receive_headers['Content-Length'] || '';
        } else {
            headers = contentType = contentLength = '';
        }
        this.headers       = headers;
        this.contentType   = contentType;
        this.contentLength = +contentLength;

        switch (contentShowMethod) {
            case 'Text':
                readContentType = contentShowMethod;
                readContent = receive.getContentText();
                break;
            case 'Blob':
                readContentType = contentShowMethod;
                readContent = JSON.stringify(receive.getContent());
                break;
            case 'NotShow':
            default:
                readContentType = 'NotShow';
                readContent = '';
        }
        this.content = readContent;

        newLine[0] = statusCode;
        newLine[1] = JSON.stringify(headers);
        newLine[2] = contentType;
        newLine[3] = contentLength;
        newLine[4] = readContentType;
        newLine[5] = readContent;

        dbSheet.updateRange([idxRowNew, 19, 1, 6], [newLine]);
    }

    /**
     * 接收器。
     *
     * @memberof module:assistant.gasWebRecorder#
     * @func receiver
     * @param {String} actItem - 執行項目。
     * @param {Function} run - 運行函式。
     * @return {Function}
     */
    GasWebRecorder.prototype.receiver = function (actItem, run) {
        var sheetName = this._sheetName;
        return function (request) {
            _runReceiver(sheetName, actItem, request, run);
        };
    };

    /**
     * 觸發器。
     *
     * @memberof module:assistant.gasWebRecorder#
     * @func trigger
     * @param {String} actItem - 執行項目。
     * @param {Function} run - 運行函式。
     * @return {Function}
     */
    GasWebRecorder.prototype.trigger = function (actItem, run) {
        var sheetName = this._sheetName;
        return function () {
            _runTrigger(sheetName, actItem, run);
        };
    };

    /**
     * 抓取。
     *
     * @memberof module:assistant.gasWebRecorder#
     * @func fetch
     * @param {String} actItem - 執行項目。
     * @param {String} url - 請求網址。
     * @param {?Object} options - 請求選項。
     * @param {String} requestContentShowMethod - 請求內容的顯示方式。
     * 有效值有 `Text|NotShow`， 預設為 `NotShow`。
     * @param {String} receiveContentShowMethod - 接收內容的顯示方式。
     * 有效值有 `Text|Blob|NotShow`， 預設為 `NotShow`。
     * @return {Object}
     * { {Object} info, // UrlFetchApp.fetch 的返回值
     *   {Number} statusCode,
     *   {Object} headers,
     *   {String} contentType,
     *   {Number} contentLength,
     *   {String} content }
     *
     * @example
     * var webRecorder = new deps.GasWebRecorder('sheetName');
     * var url = 'https://example.com';
     * var options = null;
     * var fhrData = new gasFetch(
     *     'Fetch 範例', url, options,
     *     'NotShow', 'Text'
     * );
     */
    GasWebRecorder.prototype.fetch = function (
        actItem, url, options,
        requestContentShowMethod, receiveContentShowMethod
    ) {
        return _runFetch(
            this._sheetName, actItem, url, options,
            requestContentShowMethod, receiveContentShowMethod
        );
    };

    deps.GasWebRecorder = GasWebRecorder;
});

