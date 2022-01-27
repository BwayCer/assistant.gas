
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
export function getNewDbKey(dbSheet) {
  let dbKey;
  let idxRowLast = dbSheet.rowLast();

  if (idxRowLast === 0) {
    dbKey = 1;
  } else {
    let prevDbKey = dbSheet.readRange([idxRowLast, 1]);
    dbKey = prevDbKey > 0
      ? prevDbKey + 1
      : dbSheet.RowNew()
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
export function findRowIndexByDbKey(table, dbKey) {
  let idx, len;

  for (idx = 0, len = table.length; idx < len ; idx++) {
    if (table[idx][0] === dbKey) {
      return idx + 1;
    }
  }

  return -1;
}


export function isErrorValue(value) {
  switch (value) {
    case '#NULL!':
    case '#DIV/0!':
    case '#VALUE!':
    case '#REF!':
    case '#NAME?':
    case '#NUM!':
    case '#N/A':
    case '#ERROR!':
      return true;
    default:
      return false;
  }
}

