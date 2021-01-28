import {juruo} from './juruo.js';


/**
 * 時間戳。
 *
 * @module TimeStamping
 */

/**
 * 取得數字長度： 長度不足者則在前面加 `0` 補齊。
 *
 * @memberof module:TimeStamping~
 * @func _getLengthNum
 * @param {(String|Number)} txt - 數值。
 * @param {Number} length - 指定長度。
 * @return {String}
 */
function _getLengthNum(number, length) {
  let txt = number.toString();
  return '0'.repeat(length - txt.length) + txt;
}

/**
 * 可讀化： 取得自設定的日期時間格式。
 *
 * @memberof module:TimeStamping.
 * @func readable
 * @param {Date} dt - 指定日。
 * @param {String} formatTxt - 格式化文字。
 * 可用參數有 `%%, %Y, %m, %d, %H, %M, %S, %N, %t`，
 * 若為 UTC 時間則加上 `UTC:` 前綴即可。
 * @throws {TypeError} "dt" 必須為 `Date`。
 * @return {String}
 */
export function readable(dt, formatTxt = '') {
  if (!(dt instanceof Date)) {
    throw TypeError(
      juruo.get('__restrictedType', {
        name: 'dt',
        type: 'Date',
        actual: typeof dt,
      })
    );
  }

  if (!~formatTxt.indexOf('%')) {
    return formatTxt;
  }

  let isUTCTime = formatTxt.indexOf('UTC:') === 0;
  let newFormatTxt = isUTCTime ? formatTxt.substr(4) : formatTxt;
  return newFormatTxt.replace(
    /%(?:%|Y|m|d|H|M|S|N|t)/g,
    function (key) {
      switch (key) {
        case '%%':
          return '%';
        case '%Y':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}FullYear`](), 4);
        case '%m':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}Month`]() + 1, 2);
        case '%d':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}Date`](), 2);
        case '%H':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}Hours`](), 2);
        case '%M':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}Minutes`](), 2);
        case '%S':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}Seconds`](), 2);
        case '%N':
          return _getLengthNum(dt[`get${isUTCTime ? 'UTC' : ''}Milliseconds`](), 3);
        case '%t':
          return dt.getTime();
        default:
          return key;
      }
    }
  );
}

