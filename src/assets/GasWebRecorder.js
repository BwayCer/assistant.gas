
import Gasdb from './Gasdb.js';


// https://developers.google.com/apps-script/guides/web
// https://developers.google.com/apps-script/reference/url-fetch/

// 黑盒子試算表樣本：
// https://docs.google.com/spreadsheets/d/19DcWdAVCJcAzhu0dq-G4g51BOQZg6gX3kjPf-lja4ps/edit?usp=sharing


const _sheetTableMap = {
  track: 'Track',
  error: 'Error',
};


/**
 * 網路黑盒子。
 *
 * @memberof module:assistant.
 * @class GasWebRecorder
 * @param {String} sheetId - 試算表識別碼。
 *
 * @example
 * let webRecorder = new GasWebRecorder(<sheetId>);
 * let doGet  = webRecorder.receiver('Get  項目', function (request) {...});
 * let doPost = webRecorder.receiver('Post 項目', function (request) {...});
 * let triggerAction = webRecorder.trigger('trigger 項目', function () {...});
 * let fhrData = webRecorder.fetch(
 *   'fetch 項目', <url>, <options>,
 *   <requestContentShowMethod>, <receiveContentShowMethod>
 * );
 *
 * doGet({
 *   "queryString": "username=jsmith&age=21&age=49",
 *   "parameter": {
 *     "username": "jsmith",
 *     "age": "21"
 *   },
 *   "contextPath": "",
 *   "parameters": {
 *     "username": ["jsmith"],
 *     "age": ["21", '49']
 *   },
 *   "contentLength": -1
 * });
 */
export default function GasWebRecorder(sheetId) {
  this._sheetId = sheetId;
}

function _AddLine(dbSheet, service, actItem) {
  let now = new Date();

  this._dbSheet = dbSheet;
  this.timeStamp = +now;
  this.dbKey = Gasdb.getNewDbKey(dbSheet);

  // 若使用 `new Array(n)` 但沒有賦予值的情況下
  // 試算表會出現 "NOT_FOUND" 提示。
  this.followUpLineValue
    = Array.from(new Array(19), function () { return '' });
  this.idxRowNew = dbSheet.create([dbSheet.fill([
    // 0. 引索
    this.dbKey,
    // 1. 標準時間戳
    now.toISOString(),
    // 2. 時間戳
    this.timeStamp,
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
  ])]);
}

_AddLine.prototype.recorderRequest = function (readContentType, request) {
  let isFetch = readContentType !== 'n/a';
  let payload = request.hasOwnProperty('payload') ? request.payload : '';
  let isHasPayload = payload.length > 0;

  let urlInfo = request.url.split('?');

  // 空值可能有 "n/a" 和 "NotShow"
  let readContent = '';
  if (readContentType === 'Text' || (!isFetch && isHasPayload)) {
    // request.payload 為 `String` 類型
    readContent = payload;
  }
  // TODO 轉換為 Blob 的方法


  this.followUpLineValue[4] = urlInfo[0];
  // method
  this.followUpLineValue[5] = request.method.toUpperCase() || '';
  this.followUpLineValue[6] = urlInfo[1] || '';
  // headers
  this.followUpLineValue[7]
    = request.hasOwnProperty('headers') ? JSON.stringify(request.headers) : '';
  // contentType
  this.followUpLineValue[8]
    = request.hasOwnProperty('contentType') ? request.contentType : '';

  if (isFetch || isHasPayload) {
    // contentLength
    this.followUpLineValue[9] = payload.length;
    this.followUpLineValue[10] = readContentType;
    this.followUpLineValue[11] = readContent;
  }

  // 只需紀錄 UrlFetchApp 的請求所有參數解析
  if (isFetch) {
    this.followUpLineValue[12] = JSON.stringify(request);
  }
};

_AddLine.prototype.recorderReceive = function (readContentType, receive) {
  this.followUpLineValue[13] = receive.statusCode;
  let headers = receive.headers;
  this.followUpLineValue[14] = headers === '' ? '' : JSON.stringify(headers);
  this.followUpLineValue[15] = receive.contentType;
  this.followUpLineValue[16] = receive.contentLength;
  this.followUpLineValue[17] = readContentType;
  this.followUpLineValue[18] = receive.content;
};

_AddLine.prototype.finish = function (tryCatchRunInfo) {
  let state = '成功';
  let errLink = '';
  if (!tryCatchRunInfo.ok) {
    state = '失敗';
    errLink = tryCatchRunInfo.errLink;
  }
  this.followUpLineValue[0] = state;
  this.followUpLineValue[1] = errLink;
  this.followUpLineValue[2] = +new Date() - this.timeStamp;
  this.followUpLineValue[3] = tryCatchRunInfo.consumeTimeMs;
  this._dbSheet.update([this.idxRowNew, 6, 1, 19], [this.followUpLineValue]);
};


function _tryCatchRun(sheetId, run, runArgu) {
  let rtnVal, err, consumeTimeMs;
  try {
    let startTimeMs = +new Date();
    rtnVal = arguments.length > 2 ? run(runArgu) : run();
    consumeTimeMs = +new Date() - startTimeMs;
  } catch (error) {
    err = error;
  }

  if (err) {
    let dbSheetErr = new Gasdb(sheetId, _sheetTableMap.error);
    let dbKeyErr = Gasdb.getNewDbKey(dbSheetErr);
    let idxRowNewErr = dbSheetErr.create([dbSheetErr.fill([
      dbKeyErr,
      err.name, err.message, err.stack
    ])]);

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

function _runBase(service, sheetId, actItem, request, run) {
  let dbSheet = new Gasdb(sheetId, _sheetTableMap.track);
  let newLine = new _AddLine(dbSheet, service, actItem);

  if (service === 'WebApp') {
    _runReceiver_recorderRequest(newLine, request);
  }
  let tryCatchRunInfo = _tryCatchRun(sheetId, run, request);

  if (tryCatchRunInfo.ok) {
    newLine.finish(tryCatchRunInfo);
    return tryCatchRunInfo.returnValue;
  } else {
    newLine.finish(tryCatchRunInfo);
    throw tryCatchRunInfo.err;
  }
}

function _runReceiver_recorderRequest(newLine, request) {
  let isGetType = !~request.contentLength;
  let requestInfo = {
    url: '?' + request.queryString,
    method: isGetType ? 'GET' : 'POST',
  };
  if (!isGetType && request.hasOwnProperty('postData')) {
    let requestPostData = request.postData;
    requestInfo.contentType = requestPostData.type;
    requestInfo.payload = requestPostData.contents;
  }
  newLine.recorderRequest('n/a', requestInfo);
}

function _runFetch(
  sheetId, actItem, url, options,
  requestContentShowMethod, receiveContentShowMethod
) {
  let dbSheet = new Gasdb(sheetId, _sheetTableMap.track);
  let newLine = new _AddLine(dbSheet, 'UrlFetchApp', actItem);

  newLine.recorderRequest(
    requestContentShowMethod,
    UrlFetchApp.getRequest(url, options)
  );
  let tryCatchRunInfo = _tryCatchRun(sheetId, function () {
    return UrlFetchApp.fetch(url, options);
  });

  if (tryCatchRunInfo.ok) {
    let receiveInfo = new FetchReceive(
      tryCatchRunInfo.returnValue,
      receiveContentShowMethod
    );
    newLine.recorderReceive(receiveContentShowMethod, receiveInfo);
    newLine.finish(tryCatchRunInfo);
    return receiveInfo;
  } else {
    newLine.finish(tryCatchRunInfo);
    throw tryCatchRunInfo.err;
  }
}

function FetchReceive(receive, contentShowMethod) {
  this.info = receive;
  this.statusCode = receive.getResponseCode();

  let receive_headers = receive.getHeaders();
  if (receive_headers) {
    this.headers = receive_headers;
    this.contentType = receive_headers['Content-Type'] || '';
  } else {
    this.headers = this.contentType = '';
  }

  let contentText = receive.getContentText();
  // == +(receive.getHeaders()['Content-Length'])
  this.contentLength = contentText.length;

  let readContentType;
  // this.content 需等同 readContent 屬於 `String` 類型
  switch (contentShowMethod) {
    case 'Text':
      readContentType = contentShowMethod;
      this.content = contentText;
      break;
    case 'Blob':
      readContentType = contentShowMethod;
      this.content = JSON.stringify(receive.getContent());
      break;
    case 'NotShow':
    default:
      readContentType = 'NotShow';
      this.content = '';
  }
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
  let sheetId = this._sheetId;
  return function (request) {
    return _runBase('WebApp', sheetId, actItem, request, run);
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
  let sheetId = this._sheetId;
  return function () {
    return _runBase('Trigger', sheetId, actItem, undefined, run);
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
 * let webRecorder = new GasWebRecorder(<sheetId>);
 * let url = 'https://example.com';
 * let options = null;
 * let fhrData = new gasFetch(
 *     'Fetch 範例', url, options,
 *     'NotShow', 'Text'
 * );
 */
GasWebRecorder.prototype.fetch = function (
  actItem, url, options,
  requestContentShowMethod, receiveContentShowMethod
) {
  return _runFetch(
    this._sheetId, actItem, url, options,
    requestContentShowMethod, receiveContentShowMethod
  );
};

