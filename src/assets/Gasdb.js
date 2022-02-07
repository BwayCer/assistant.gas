
import {
  getNewDbKey, findRowIndexByDbKey,
  isErrorValue,
} from './GasdbSuppor.js';


/**
 * 谷歌腳本資料庫： 簡易谷歌試算表的操作工具。
 *
 * @see [谷歌開發者文件 Apps Script - Class Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 * @see [谷歌開發者文件 Apps Script - Class Range]{@link https://developers.google.com/apps-script/reference/spreadsheet/range}
 *
 * @memberof module:assistant.
 * @class Gasdb
 * @param {String} sheetId - 試算表識別碼。
 * @param {String} tableName - 表格名稱。
 * @throws {Error} "Gasdb" 的用法不符預期。
 * @throws {Error} "{spreadsheet}" 試算表不存在。
 * @throws {Error} "{spreadsheet}" 試算表的 "{table}" 表不存在。
 * @throws {Error} 由 `SpreadsheetApp.openById()` 拋出錯誤。
 * @throws {Error} 由 `sheet.getSheetByName()` 拋出錯誤。
 *
 * @example
 * let dbSheet = new Gasdb('spreadsheetName', 'tableName');
 */
export default function Gasdb(sheetId, tableName) {
  let lenArgs = arguments.length;

  let sheet, table;
  let cache = Gasdb._cache;
  let sheetKeyOfCache = 'sheet_' + sheetId;
  let tableKeyOfCache = 'table_' + sheetId + '_' + tableName;

  if (cache.hasOwnProperty(tableKeyOfCache)) {
    sheet = cache[sheetKeyOfCache];
    table = cache[tableKeyOfCache];
  } else {
    if (cache.hasOwnProperty(sheetKeyOfCache)) {
      sheet = cache[sheetKeyOfCache];
    } else {
      // 如果資料不正確會拋出錯誤
      sheet = cache[sheetKeyOfCache] = SpreadsheetApp.openById(sheetId);
    }

    // 如果資料不正確會拋出錯誤
    table = cache[tableKeyOfCache] = sheet.getSheetByName(tableName);
  }

  // 谷歌試算表物件
  this.sheet = sheet;
  // 谷歌試算表表格物件
  this.table = table;

  this.dbId = sheet.getId();
  this.tableId = table.getSheetId();
  this.tableName = table.getSheetName();
  this.url = 'https://docs.google.com/spreadsheets/d/' + this.dbId;
}

Gasdb._cache = {};

Gasdb.getNewDbKey = getNewDbKey;
Gasdb.findRowIndexByDbKey = findRowIndexByDbKey;
Gasdb.isErrorValue = isErrorValue;

/**
 * 取得指定範圍。
 * <br><br>
 * 座標起始值為 1，若輸入 0 會拋出 "座標或面積範圍無效" 的錯誤。
 *
 * @memberof module:assistant.Gasdb#
 * @func getRange
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 直行引索。
 * @param {Number} [range.2] - 橫列位置向下取多少列。
 * @param {Number} [range.3] - 直行位置向右取多少行。
 * @throws {Error} "Gasdb#getRange" 的用法不符預期。
 * @return {spreadsheet.Range}
 */
Gasdb.prototype.getRange = function (range) {
  switch (range.length) {
    case 2:
      return this.table.getRange(range[0], range[1]);
    case 4:
      return this.table.getRange(range[0], range[1], range[2], range[3]);
    default:
      throw Error(
        juruo.get('__inconsistentExpectation', {name: 'Gasdb#getRange'})
      );
  }
};

/**
 * 創建。
 *
 * @memberof module:assistant.Gasdb#
 * @func create
 * @param {Array} values - 數組化表格。
 * @return {Number} 引索值。
 */
Gasdb.prototype.create = function (values) {
  let idxRowNew = this.rowNew();
  // 時間文字會被轉成時間格式
  // this.table.appendRow(value);
  this.update([idxRowNew, values.length], values);
  return idxRowNew;
};

/**
 * 讀取。
 *
 * @memberof module:assistant.Gasdb#
 * @func read
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} [range.1] - 直行引索。
 * @param {Number} range.2 - 橫列位置向下取多少列。
 * @param {Number} [range.3] - 直行位置向右取多少行。
 * @return {Array} 數組化表格。
 */
Gasdb.prototype.read = function (range) {
  let _range = range.length !== 2 ? range : [
    range[0], 1,
    range[1], this.columnMax(),
  ];
  return this.getRange(_range).getValues();
};

/**
 * 讀取單格。
 *
 * @memberof module:assistant.Gasdb#
 * @func readSingle
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 直行引索。
 * @return {*} 該格物件。
 */
Gasdb.prototype.readSingle = function (range) {
  return this.getRange(range).getValue();
};

/**
 * 更新。
 *
 * @memberof module:assistant.Gasdb#
 * @func update
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} [range.1] - 直行引索。
 * @param {Number} range.2 - 橫列位置向下取多少列。
 * @param {Number} [range.3] - 直行位置向右取多少行。
 * @param {Array} values - 數組化表格。
 */
Gasdb.prototype.update = function (range, values) {
  let _range = range.length !== 2 ? range : [
    range[0], 1,
    range[1], this.columnMax(),
  ];
  this.getRange(_range).setValues(values);
};

/**
 * 讀取單格。
 *
 * @memberof module:assistant.Gasdb#
 * @func readSingle
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 直行引索。
 * @param {*} value - 該格物件。
 */
Gasdb.prototype.updateSingle = function (range, value) {
  this.getRange(range).setValue(value);
};

/**
 * 移除。
 *
 * @memberof module:assistant.Gasdb#
 * @func remove
 * @param {Number} rowIdx - 橫列引索位置。
 * @param {Boolean} isRight - 是否徹底刪除。
 */
Gasdb.prototype.remove = function (rowIdx, isRight) {
  if (isRight) {
    this.table.deleteRow(rowIdx);
    return;
  }

  // 通常第一格為引索值
  let clearVal = ['-'];
  this.update([rowIdx, 1], [this.fill(clearVal)]);
};

/**
 * 填充。
 *
 * @memberof module:assistant.Gasdb#
 * @func fill
 * @param {Array} values - 單行數組化表格。
 * @param {Number} [columnAmount] - 需填充的直行數量。
 */
Gasdb.prototype.fill = function (values, columnAmount) {
  let _columnAmount = columnAmount > 0 ? columnAmount : this.columnMax();

  let newValues = [];
  let idx = 0;
  let len = values.length;
  while (idx < len) {
    newValues[idx] = values[idx++];
  }
  while (idx < _columnAmount) {
    newValues[idx++] = '';
  }

  return newValues;
};

/**
 * 填充多列。
 *
 * @memberof module:assistant.Gasdb#
 * @func fillRows
 * @param {Array} values - 數組化表格。
 * @param {Number} [columnAmount] - 需填充的直行數量。
 */
Gasdb.prototype.fillRows = function (values, columnAmount) {
  let _columnAmount = columnAmount > 0 ? columnAmount : this.columnMax();

  let newRows = [];
  for (let rowIdx = 0, rowLen = values.length; rowIdx < rowLen; rowIdx++) {
    newRows.push(this.fill(values[rowIdx], _columnAmount));
  }
  return newRows;
};

/**
 * 橫列最後一筆引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func rowLast
 */
Gasdb.prototype.rowLast = function () {
  return this.table.getLastRow();
};

/**
 * 表格最新一列引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func rowNew
 */
Gasdb.prototype.rowNew = function () {
  return this.table.getLastRow() + 1;
};

/**
 * 表格最後一列引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func rowMax
 */
Gasdb.prototype.rowMax = function () {
  return this.table.getMaxRows();
};

/**
 * 直行最後一筆引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func columnLast
 */
Gasdb.prototype.columnLast = function () {
  return this.table.getLastColumn();
};

/**
 * 表格最新一行引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func columnNew
 */
Gasdb.prototype.columnNew = function () {
  return this.table.getLastColumn() + 1;
};

/**
 * 表格最後一行引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func columnMax
 */
Gasdb.prototype.columnMax = function () {
  return this.table.getMaxColumns();
};


/**
 * 取得該行網址。
 *
 * @memberof module:assistant.Gasdb#
 * @func getUrl
 * @param {?Number} rowIdx - 橫列引索位置。
 */
Gasdb.prototype.getUrl = function (rowIdx) {
  let range = rowIdx == null ? '' : '&range=' + rowIdx + ':' + rowIdx;
  return this.url + '/view' + '#gid=' + this.tableId + range;
};

/**
 * 取得該行網址鏈結函式。
 *
 * @memberof module:assistant.Gasdb#
 * @func getUrlLinkFunc
 * @param {?Number} rowIdx - 橫列引索位置。
 * @param {?Number} dbKey - 橫列引索位置。
 */
Gasdb.prototype.getUrlLinkFunc = function (rowIdx, dbKey) {
  let url = this.getUrl(rowIdx);
  let linkInfo
    = this.tableName
      + (rowIdx == null ?  '' : ':' + rowIdx)
      + (dbKey  == null ?  '' : ':key' + dbKey)
  ;
  return '=HYPERLINK("' + url + '", "' + linkInfo + '")';
};

