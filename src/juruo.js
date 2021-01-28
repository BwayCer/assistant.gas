
// 空枚舉
const _emptyEnum = function emptyEnum() { return; };
_emptyEnum.prototype = Object.create(null);

/**
 * 蒟蒻。
 *
 * @class Juruo
 * @param {Object} defaultLangPkg - 預設語言包。
 */
export function Juruo(defaultLangPkg) {
  this._langPkg_local = new _emptyEnum();
  this._langPkg_default = new _emptyEnum();
  this._langPkg_program = new _emptyEnum();

  if (defaultLangPkg) {
    this.pkg('default', defaultLangPkg);
  }
}

/**
 * 讓渡語言包。
 *
 * @memberof Juruo~
 * @func _assignPkg
 * @param {Object} target - 目標物件。
 * @param {Object} langPkg - 語言包。
 * @throws {TypeError} Translation Text must be a `String` type.
 */
function _assignPkg(target, langPkg) {
  let idx, name, val;
  let loop = 2;
  let ownKey = Object.getOwnPropertyNames(langPkg);
  let len = ownKey.length;

  // 第一次迴圈檢查
  // 第二次迴圈設置
  for (; loop-- ;) {
    for (idx = 0; idx < len ; idx++) {
      name = ownKey[idx];
      val = langPkg[name];
      if (loop === 0) {
        target[name] = val;
      } else if (typeof val !== 'string') {
        throw TypeError('Translation Text must be a `String` type.');
      }
    }
  }
}

/**
 * 包： 增加語言包。
 *
 * @memberof Juruo#
 * @func pkg
 * @param {String} langPkgType - 語言包類型。
 * @param {Object} langPkg - 語言包。
 * @throws {Error} Unspecified language package.
 * @throws {TypeError} "langPkg" argument must be a `Object` type.
 * @throws {TypeError} 見 {@link Juruo~_assignPkg|Juruo~_assignPkg}
 */
Juruo.prototype.pkg = function (langPkgType, langPkg) {
  let target;

  switch (langPkgType) {
    case 'default':
      target = this._langPkg_default;
      break;
    case 'local':
      target = this._langPkg_local;
      break;
    default:
      throw Error('Unspecified language package.');
  }

  if (langPkg || langPkg.constructor !== Object) {
    throw TypeError(
      'The "langPkg" must be of `Object`.'
      + ' Received `' + typeof langPkg + '` type.'
    );
  }

  _assignPkg(target, langPkg);
};

/**
 * 設定： 增加程式語言包，新的覆蓋舊的。
 *
 * @memberof Juruo#
 * @func set
 * @param {(String|Object)} key - 翻譯文本鍵，亦可為鍵值列表。
 * @param {String} [txt] - 翻譯文本值。
 * @throws {TypeError} The argument is not of the expected.
 */
Juruo.prototype.set = function (key, txt) {
  let typeOfMsgOption = key ? key.constructor : null;

  if (typeOfMsgOption !== Object
    && !(typeOfMsgOption === String && typeof txt === 'string')
  ) {
    throw TypeError('The "argument" is not of the expected.');
  }

  let target = this._langPkg_program;

  switch (typeOfMsgOption) {
    case String:
      target[key] = txt;
      break;
    case Object:
      _assignPkg(target, key);
      break;
  }
};

const _regexSpecifySymbol = /\{([A-Za-z0-9]*)\}/g;

/**
 * 文字插入。
 *
 * @memberof Juruo~
 * @func _strins
 * @param {String} txt - 一段文字。
 * @param {Object} replaceMsgInfo - 替代訊息資訊。
 * @return {String}
 */
function _strins(txt, replaceMsgInfo) {
  if (!_regexSpecifySymbol.test(txt)) {
    return txt;
  }

  return txt.replace(_regexSpecifySymbol, function (matchTxt, key) {
    if (replaceMsgInfo.hasOwnProperty(key)) {
      return replaceMsgInfo[key];
    } else {
      return matchTxt;
    }
  });
}

/**
 * 取得翻譯文本。
 * <br><br>
 * 讀取順序： 本地 > 預設 > 程式
 *
 * @memberof Juruo#
 * @func get
 * @param {String} key - 翻譯文本鍵。
 * @param {Object} [replaceMsgInfo] - 替代訊息資訊。
 * @return {String} 翻譯文本或 `_undefined` 文本的內容。
 */
Juruo.prototype.get = function (key, replaceMsgInfo) {
  let idx;
  let target, langTxt;
  let pkgList = ['_langPkg_local', '_langPkg_default', '_langPkg_program'];

  for (idx = 0; idx < 3 ; idx++) {
    target = this[pkgList[idx]];
    if (key in target) {
      langTxt = target[key];
      break;
    }
  }

  if (!langTxt) {
    return this._langPkg_program.__undefined;
  } else if (replaceMsgInfo instanceof Object) {
    return _strins(langTxt, replaceMsgInfo);
  } else {
    return langTxt;
  }
};


// gasJuruo
export let juruo = new Juruo();

juruo.set({
  __undefined: 'Unexpected log message.',
  __illegalInvocation: 'Illegal invocation.',
  __inconsistentExpectation: 'The usage of "{name}" is inconsistent with expectation.',
  __notExpected: 'The "{name}" is not of the expected.',
  __typeError: 'A value is not of the expected type.',
  __restrictedType: 'The "{name}" must be of `{type}`. Received `{actual}` type.',
  __restrictedNotType: 'The "{name}" must not be of `{type}`. Received `{actual}` type.',
});

