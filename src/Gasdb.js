import {juruo} from './juruo.js';
import {
  getNewDbKey, findRowIndexByDbKey,
} from './GasdbSuppor.js';


juruo.set({
  _assistant_notExistSheet: 'The "{spreadsheet}" spreadsheet is not exist.',
  _assistant_notExistSheetTable:
    'The "{table}" table of "{spreadsheet}" spreadsheet is not exist.',
  _assistant_notSpreadsheetConfigType:
    'The "{config}" spreadsheet config is not of `{id: "...", tables: {...}}` type.',
});


/**
 * 谷歌腳本資料庫： 簡易谷歌試算表的操作工具。
 *
 * @see [谷歌開發者文件 Apps Script - Class Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 * @see [谷歌開發者文件 Apps Script - Class Range]{@link https://developers.google.com/apps-script/reference/spreadsheet/range}
 *
 * @memberof module:assistant.
 * @class Gasdb
 * @param {String} sheetName - 試算表名稱（依設定文件）。
 * @param {String} tableName - 表格名稱（依設定文件）。
 * @throws {Error} "Gasdb" 的用法不符預期。
 * @throws {Error} "{spreadsheet}" 試算表不存在。
 * @throws {Error} "{spreadsheet}" 試算表的 "{table}" 表不存在。
 * @throws {Error} 由 `SpreadsheetApp.openById()` 拋出錯誤。
 * @throws {Error} 由 `sheet.getSheetByName()` 拋出錯誤。
 *
 * @example
 * let dbSheet = new Gasdb('spreadsheetName', 'tableName');
 */
export default function Gasdb(sheetName, tableName) {
  let lenArgs = arguments.length;

  if (lenArgs !== 2) {
    throw Error(juruo.get('__inconsistentExpectation', {name: 'Gasdb'}));
  }

  let sheet, table, sheetConfig;
  let cache = Gasdb._cache;
  let sheetConfigs = Gasdb._spreadsheetConfigs;
  let sheetKeyOfCache = 'sheet_' + sheetName;
  let tableKeyOfCache = 'table_' + sheetName + '_' + tableName;

  if (cache.hasOwnProperty(tableKeyOfCache)) {
    sheet = cache[sheetKeyOfCache];
    table = cache[tableKeyOfCache];
  } else {
    if (sheetConfigs.hasOwnProperty(sheetName)) {
      sheetConfig = sheetConfigs[sheetName];

      if (cache.hasOwnProperty(sheetKeyOfCache)) {
        sheet = cache[sheetKeyOfCache];
      } else {
        // 如果資料不正確會拋出錯誤
        sheet = cache[sheetKeyOfCache]
          = SpreadsheetApp.openById(sheetConfig.id);
      }
    } else {
      throw Error(
        juruo.get('_assistant_notExistSheet', {spreadsheet: sheetName})
      );
    }

    if (sheetConfig.tables.hasOwnProperty(tableName)) {
      // 如果資料不正確會拋出錯誤
      table = cache[tableKeyOfCache]
        = sheet.getSheetByName(sheetConfig.tables[tableName]);
    } else {
      throw Error(
        juruo.get('_assistant_notExistSheetTable', {
          spreadsheet: sheetName,
          table: tableName,
        })
      );
    }
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
Gasdb._spreadsheetConfigs = {};

Gasdb.getNewDbKey = getNewDbKey;
Gasdb.findRowIndexByDbKey = findRowIndexByDbKey;

/**
 * 設定 Gasdb 試算表列表。
 *
 * @memberof module:assistant.Gasdb.
 * @func setSheetConfig
 * @param {Gasdb} sheetConfigs - 試算表設定列表。
 * @throws {Error} "{config}" 試算表設定資訊不是 `{id: "...", tables: {...}}` 的預期類型。
 *
 * @example
 * Gasdb.setSheetConfig({
 *   sheetName: {id: '...', tables: {...}},
 *   ...
 * });
 */
Gasdb.setSheetConfig = function (sheetConfigs) {
  let sheetName, config, id, tables;
  for (sheetName in sheetConfigs) {
    config = sheetConfigs[sheetName];
    id = config['id'];
    tables = config['tables'];

    if (typeof id !== 'string' || (tables != null && typeof tables !== 'object')) {
      throw Error(
        juruo.get('_assistant_notSpreadsheetConfigType', {config: sheetName})
      );
    }

    Gasdb._spreadsheetConfigs[sheetName] = {id, tables};
  }
};

/**
 * 創建。
 *
 * @memberof module:assistant.Gasdb#
 * @func create
 * @param {Array} value - 數組化表格（單行）。
 */
Gasdb.prototype.create = function (value) {
  // 時間文字會被轉成時間格式
  // this.table.appendRow(value);
  this.update([this.RowNew(), 1], [value]);
};

/**
 * 讀取。
 *
 * @memberof module:assistant.Gasdb#
 * @func read
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 橫列位置向下取多少列。
 * @return {Array} 數組化表格。
 */
Gasdb.prototype.read = function (range) {
  return this.table
    .getRange(
      range[0], 1,
      range[1], this.ColumnMax()
    )
    .getValues()
  ;
};

/**
 * 讀取指定範圍。
 *
 * @memberof module:assistant.Gasdb#
 * @func readRange
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 直行引索。
 * @param {Number} [range.2] - 橫列位置向下取多少列。
 * @param {Number} [range.3] - 直行位置向右取多少行。
 * @throws {Error} "Gasdb#readRange" 的用法不符預期。
 * @return {*} 該格物件或數組化表格。
 */
Gasdb.prototype.readRange = function (range) {
  switch (range.length) {
    case 2:
      return this.table
        .getRange(range[0], range[1])
        .getValue()
      ;
    case 4:
      return this.table
        .getRange(
          range[0], range[1],
          range[2], range[3]
        )
        .getValues()
      ;
    default:
      throw Error(
        juruo.get('__inconsistentExpectation', {name: 'Gasdb#readRange'})
      );
  }
};

/**
 * 更新。
 *
 * @memberof module:assistant.Gasdb#
 * @func update
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 橫列位置向下取多少列。
 * @param {Array} values - 數組化表格。
 */
Gasdb.prototype.update = function (range, values) {
  this.table
    .getRange(
      range[0], 1,
      range[1], this.ColumnMax()
    )
    .setValues(values)
  ;
};

/**
 * 更新指定範圍。
 *
 * @memberof module:assistant.Gasdb#
 * @func updateRange
 * @param {Array} range - 範圍描述。
 * @param {Number} range.0 - 橫列引索。
 * @param {Number} range.1 - 直行引索。
 * @param {Number} [range.2] - 橫列位置向下取多少列。
 * @param {Number} [range.3] - 直行位置向右取多少行。
 * @param {*} value - 該格物件或數組化表格。
 * @throws {Error} "Gasdb#updateRange" 的用法不符預期。
 * @return {*} 該格物件或數組化表格。
 */
Gasdb.prototype.updateRange = function (range, value) {
  switch (range.length) {
    case 2:
      return this.table
        .getRange(range[0], range[1])
        .setValue(value)
      ;
    case 4:
      return this.table
        .getRange(
          range[0], range[1],
          range[2], range[3]
        )
        .setValues(value)
      ;
    default:
      throw Error(
        juruo.get('__inconsistentExpectation', {name: 'Gasdb#updateRange'})
      );
  }
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
 * @param {Array} values - 數組化表格。
 * @param {Number} [columnAmount] - 需填充的直行數量。
 */
Gasdb.prototype.fill = function (values, columnAmount) {
  let _columnAmount = columnAmount > 0 ? columnAmount : this.ColumnMax();

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
 * @param {Array} rows - 數組化表格。
 * @param {Number} [columnAmount] - 需填充的直行數量。
 */
Gasdb.prototype.fillRows = function (rows, columnAmount) {
  let _columnAmount = columnAmount > 0 ? columnAmount : this.ColumnMax();

  let newRows = [];
  for (let rowIdx = 0, rowLen = rows.length; rowIdx < rowLen; rowIdx++) {
    newRows.push(this.fill(rows[rowIdx], _columnAmount));
  }
  return newRows;
};

/**
 * 橫列最後一筆引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func RowLast
 */
Gasdb.prototype.RowLast = function () {
  return this.table.getLastRow();
};

/**
 * 表格最新一列引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func RowNew
 */
Gasdb.prototype.RowNew = function () {
  return this.table.getLastRow() + 1;
};

/**
 * 表格最後一列引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func RowMax
 */
Gasdb.prototype.RowMax = function () {
  return this.table.getMaxRows();
};

/**
 * 直行最後一筆引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func ColumnLast
 */
Gasdb.prototype.ColumnLast = function () {
  return this.table.getLastColumn();
};

/**
 * 表格最新一行引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func ColumnNew
 */
Gasdb.prototype.ColumnNew = function () {
  return this.table.getLastColumn() + 1;
};

/**
 * 表格最後一行引索值。
 *
 * @memberof module:assistant.Gasdb#
 * @func ColumnMax
 */
Gasdb.prototype.ColumnMax = function () {
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

