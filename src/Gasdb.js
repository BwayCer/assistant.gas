import {juruo} from './juruo.js';


juruo.set({
  _assistant_notExistSpreadsheetConfig: 'The spreadsheet config Not set.',
  _assistant_notExistSheet: 'The "{spreadsheet}" spreadsheet is not exist.',
  _assistant_notExistSheetTable:
    'The "{table}" table of "{spreadsheet}" spreadsheet is not exist.',
  _assistant_notEqualLengthColumnOfSheetTable:
    'The column length in each row of the table must be equal.',
  _assistant_tableSameKeys: 'Can\'t have two same keys.',
});


let {getNewDbKey, findRowIndexByDbKey} = function () {
  /**
   * 取得最新的資料庫引索值。
   * <br><br>
   * `dbKey` 為自己設定的引索值，預期被放於各橫列的第一直行欄位中。
   *
   * @memberof module:assistant.Gasdb.
   * @func getNewDbKey
   * @param {Gasdb} dbSheet - 資料庫試算表。
   * @return {Number}
   */
  function getNewDbKey(dbSheet) {
    let dbKey, prevDbKey;
    let idxRowLast = dbSheet.RowLast();

    if (idxRowLast === 0) {
      // idxRow === 0，errMsg： 座標或面積範圍無效。
      // dbSheet.readRange([idxRow, 1]);
      dbKey = 1;
    } else {
      prevDbKey = dbSheet.readRange([idxRowLast, 1]);
      // Number('') === 0
      dbKey = !prevDbKey || isNaN(prevDbKey)
        ? dbSheet.RowNew()
        : prevDbKey + 1
      ;
    }

    return dbKey;
  }

  /**
   * 找尋符合資料庫引索值的橫列引索值。
   * <br><br>
   * 谷歌腳本資料庫的表格起始值為 "1"，與 `Array` 的起始值 "0" 不同。
   *
   * @memberof module:assistant.Gasdb.
   * @func findRowIndexByDbKey
   * @param {Array} table - 表格。
   * @param {Number} dbKey - 查找的引索值。
   * @return {Number}
   */
  function findRowIndexByDbKey(table, dbKey) {
    let idx, len;

    for (idx = 0, len = table.length; idx < len ; idx++) {
      if (table[idx][0] === dbKey) {
        return idx + 1;
      }
    }

    return -1;
  }

  return {getNewDbKey, findRowIndexByDbKey};
}();

let joinTable = function () {
  /**
   * 連接資料表。
   *
   * @memberof module:assistant.Gasdb.
   * @func join
   * @param {...Array} tableJoinInfoList - 資料表的連接資訊清單。
   * @param {Number} tableJoinInfoList.0 - 連接的參考位置。
   * @param {Array} tableJoinInfoList.1 - 資料表。
   * @param {...Number} [tableJoinInfoList.*] - 需要的行位編號。
   * @return {Array}
   */
  let joinTable = function join() {
    let arraySlice = Array.prototype.slice;
    let args = arraySlice.call(arguments);

    let newTableInfo = _getNewTableInfo(args);
    // 指定欄位 + key
    let column = newTableInfo.countColumn + 1;
    let keyList = newTableInfo.keyList.sort();
    let row = keyList.length + newTableInfo.countEmptyRow;

    let len_argu, idx_argu, val_argu;
    let len_concat, idx_concat, val_concat;
    let sourceTable, idxKey, isAllElem, pickElemList, pickElemListLength;
    let key, idxRow, rowList;
    let newTable = new Array(row);
    let idxEmptyKeyRow = keyList.length;
    let idxColumnStart = 1;

    for (
      idx_argu = 0, len_argu = args.length;
      idx_argu < len_argu;
      idx_argu++
    ) {
      val_argu = args[idx_argu];
      idxKey = val_argu[0];
      sourceTable = val_argu[1];
      isAllElem = val_argu.length === 2;
      pickElemList = isAllElem ? 'All' : arraySlice.call(val_argu, 2);
      pickElemListLength = (isAllElem ? val_argu[1][0] : pickElemList).length;


      for (
        idx_concat = 0, len_concat = sourceTable.length;
        idx_concat < len_concat;
        idx_concat++
      ) {
        val_concat = sourceTable[idx_concat];
        key = val_concat[idxKey];
        idxRow = keyList.indexOf(key);
        rowList = null;

        if (~idxRow && !!newTable[idxRow]) {
          rowList = newTable[idxRow];
        } else {
          rowList
            = newTable[~idxRow ? idxRow : idxEmptyKeyRow++]
            = _createEmptyArray(column)
          ;
          rowList[0] = key;
        }

        _pickElemVal(
          rowList,
          val_concat,
          idxColumnStart,
          pickElemList,
          pickElemListLength
        );
      }

      idxColumnStart += pickElemListLength;
    }

    return newTable;
  };

  /**
   * 取得新表資訊。
   *
   * @memberof! module:assistant.Gasdb.
   * @alias join~_getNewTableInfo
   * @func  join~_getNewTableInfo
   * @param {Array} listForTableJoinInfoList - 連接資料表的資訊清單。
   * @throws {TypeError} "tableJoinInfoList" 必須為 `Array`。
   * @throws {TypeError} "tableJoinInfoList[1]" 必須為 `Array`。
   * @throws {TypeError} "tableJoinInfoList[1][?idx]" 必須為 `Array`。
   * @throws {RangeError} 表格中每行的欄位數量必須相等。
   * @throws {Error} 不能有相同的鍵值。
   * @return {Object}
   * {
   *     countColumn: 每一行有幾列,
   *     countEmptyRow: 連接關鍵字清單,
   *     keyList: 無關鍵字的列數量,
   * }
   */
  function _getNewTableInfo(listForTableJoinInfoList) {
    return listForTableJoinInfoList.reduce(function (
      accumlator, tableJoinInfoList
    ) {
      if (tableJoinInfoList == null || tableJoinInfoList.constructor !== Array) {
        throw TypeError(
          juruo.get('__restrictedType', {
            name: 'tableJoinInfoList',
            type: 'Array',
            actual: typeof tableJoinInfoList,
          })
        );
      }

      let idxKey = tableJoinInfoList[0];
      let table  = tableJoinInfoList[1];

      if (table == null || table.constructor !== Array) {
        throw TypeError(
          juruo.get('__restrictedType', {
            name: 'tableJoinInfoList[1]',
            type: 'Array',
            actual: typeof table,
          })
        );
      }

      let keyList = accumlator.keyList;

      let len, idx, val;
      let key, bisEmptyKey;
      let tableKeyList = new Array(table.length);
      let column = table[0].length;

      accumlator.countColumn += tableJoinInfoList.length === 2
        ? column
        : (tableJoinInfoList.length - 2)
      ;

      for (idx = 0, len = table.length; idx < len ; idx++) {
        val = table[idx];

        if (val == null || val.constructor !== Array) {
          throw TypeError(
            juruo.get('__restrictedType', {
              name: 'tableJoinInfoList[1][' + idx + ']',
              type: 'Array',
              actual: typeof val,
            })
          );
        }
        if (val.length !== column) {
          throw RangeError(
            juruo.get('_assistant_notEqualLengthColumnOfSheetTable')
          );
        }

        key = val[idxKey];
        bisEmptyKey = key == null || key === '';

        // 是否 key 引索值重複
        if (!bisEmptyKey && ~tableKeyList.indexOf(key)) {
          throw Error(juruo.get('_assistant_tableSameKeys'));
        }

        tableKeyList.push(key);

        if (bisEmptyKey) {
          accumlator.countEmptyRow++;
        } else if (!~keyList.indexOf(key)) {
          keyList.push(key);
        }
      }

      return accumlator;
    }, {
      countColumn: 0,
      countEmptyRow: 0,
      keyList: [],
    });
  }

  /**
   * @memberof! module:assistant.Gasdb.
   * @alias join~_createEmptyArray
   * @func  join~_createEmptyArray
   * @param {Number} length
   */
  function _createEmptyArray(length) {
    let newArr = new Array(length);
    let len = length;
    for (; len--;) {
      newArr[len] = '';
    }
    return newArr;
  }

  /**
   * @memberof! module:assistant.Gasdb.
   * @alias join~_pickElemVal
   * @func  join~_pickElemVal
   * @param {Array} target
   * @param {Array} source
   * @param {Number} idxStart
   * @param {Array} pickElemList
   */
  function _pickElemVal(
    target, source, numIdxStart, pickElemList, pickElemListLength
  ) {
    let idx, len;
    let idxStart = numIdxStart;
    let isAllElem = pickElemList === 'All';

    for (idx = 0, len = pickElemListLength; idx < len ; idx++) {
      target[idxStart++] = source[isAllElem ? idx : pickElemList[idx]];
    }
  }

  return joinTable;
}();


/**
 * 谷歌腳本資料庫： 簡易谷歌試算表的操作工具。
 *
 * @see [谷歌開發者文件 Apps Script - Class Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
 * @see [谷歌開發者文件 Apps Script - Class Range]{@link https://developers.google.com/apps-script/reference/spreadsheet/range}
 *
 * @memberof module:assistant.
 * @class Gasdb
 * @param {String} spreadsheetName - 試算表名稱（依設定文件）。
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
export default function Gasdb(strSheetName, strTableName) {
  let lenArgs = arguments.length;

  if (lenArgs !== 2) {
    throw Error(juruo.get('__inconsistentExpectation', {name: 'Gasdb'}));
  }

  let spreadsheetList = deps._config.spreadsheet;
  if (!spreadsheetList) {
    throw Error(juruo.get('_assistant_notExistSpreadsheetConfig'));
  }

  let sheet, table;
  let cache = Gasdb._cache;
  let sheet_id = strSheetName + '_id';
  let sheet_table = strSheetName + '_table';
  let sheetKeyOfCache = 'sheet_' + strSheetName;
  let tableKeyOfCache = 'table_' + strSheetName + '_' + strTableName;

  if (cache.hasOwnProperty(tableKeyOfCache)) {
    sheet = cache[sheetKeyOfCache];
    table = cache[tableKeyOfCache];
  } else {
    if (cache.hasOwnProperty(sheetKeyOfCache)) {
      sheet = cache[sheetKeyOfCache];
    } else if (spreadsheetList.hasOwnProperty(sheet_id)) {
      // 如果資料不正確會拋出錯誤
      sheet = cache[sheetKeyOfCache]
        = SpreadsheetApp.openById(spreadsheetList[sheet_id]);
    } else {
      throw Error(
        juruo.get('_assistant_notExistSheet', {spreadsheet: strSheetName})
      );
    }

    if (spreadsheetList[sheet_table].hasOwnProperty(strTableName)) {
      // 如果資料不正確會拋出錯誤
      table = cache[tableKeyOfCache] = sheet.getSheetByName(
        spreadsheetList[sheet_table][strTableName]
      );
    } else {
      throw Error(
        juruo.get('_assistant_notExistSheetTable', {
          spreadsheet: strSheetName,
          table: strTableName,
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

Gasdb.getNewDbKey = getNewDbKey;
Gasdb.findRowIndexByDbKey = findRowIndexByDbKey;
Gasdb.join = joinTable;

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
 */
Gasdb.prototype.fill = function (values) {
  let idx = values.length;
  let len = this.ColumnMax();
  while (idx < len) {
    values[idx++] = '';
  }
  return values;
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

