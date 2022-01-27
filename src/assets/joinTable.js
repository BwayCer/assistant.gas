
import {juruoReplace} from './juruo.js';


const _msgPkg = {
  _assistant_notEqualLengthColumnOfSheetTable:
    'The column length in each row of the table must be equal.',
  _assistant_tableSameKeys: 'Can\'t have two same keys.',
};


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
export default function join() {
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
        juruoReplace('__restrictedType', {
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
        juruoReplace('__restrictedType', {
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
          juruoReplace('__restrictedType', {
            name: 'tableJoinInfoList[1][' + idx + ']',
            type: 'Array',
            actual: typeof val,
          })
        );
      }
      if (val.length !== column) {
        throw RangeError(_msgPkg._assistant_notEqualLengthColumnOfSheetTable);
      }

      key = val[idxKey];
      bisEmptyKey = key == null || key === '';

      // 是否 key 引索值重複
      if (!bisEmptyKey && ~tableKeyList.indexOf(key)) {
        throw Error(_msgPkg._assistant_tableSameKeys);
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

