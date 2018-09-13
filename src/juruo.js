
gasOrder('assistant/juruo', function (deps) {
    // 空枚舉
    var _emptyEnum = function emptyEnum() {};
    _emptyEnum.prototype = Object.create(null);

    /**
     * 蒟蒻。
     *
     * @class Juruo
     * @param {Object} spreadsheetName - 試算表名稱（依設定文件）。
     */
    function Juruo(defaultLangPkg) {
        this.langPkg_local = new _emptyEnum();
        this.langPkg_default = new _emptyEnum();
        this.langPkg_program = new _emptyEnum();

        if (defaultLangPkg)
            this.pkg('default', defaultLangPkg);
    }

    /**
     * 讓渡語言包。
     *
     * @memberof Juruo~
     * @func _assignPkg
     * @param {Object} target - 語言包目標物件。
     * @param {Object} pkg - 語言包來源物件。
     * @throws {TypeError} Translation Text must be a `String` type.
     */
    function _assignPkg(objTarget, objPkg) {
        var idx, name, val;
        var loop = 2;
        var ownKey = Object.getOwnPropertyNames(objPkg);
        var len = ownKey.length;

        for ( ; loop-- ; ) {
            for (idx = 0; idx < len ; idx++) {
                name = ownKey[idx];
                val = objPkg[name];
                if (loop === 0) {
                    objTarget[name] = val;
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
     * @param {(String|Object)} msgOption - 訊息選項，可為名稱或清單。
     * @param {String} msg - 訊息內容。
     * @throws {Error} Unspecified language package.
     * @throws {TypeError} "pkg" argument must be a `Object` type.
     * @throws {TypeError} 見 {@link Juruo~_assignPkg|Juruo~_assignPkg}
     */
    Juruo.prototype.pkg = function (strType, objPkg) {
        var target;

        switch (strType) {
            case 'default':
                target = this.langPkg_default;
                break;
            case 'local':
                target = this.langPkg_local;
                break;
            default:
                throw Error('Unspecified language package.');
        }

        if (objPkg || objPkg.constructor !== Object)
            throw TypeError(
                'The "pkg" must be of `Object`.'
                + ' Received `' + typeof objPkg + '` type.'
            );

        _assignPkg(target, objPkg);
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
    Juruo.prototype.set = function (anyKey, strTxt) {
        var typeOfMsgOption = anyKey ? anyKey.constructor : null;

        if (typeOfMsgOption !== Object
            && !(typeOfMsgOption === String && typeof strTxt === 'string'))
            throw TypeError('The "argument" is not of the expected.');

        var target = this.langPkg_program;

        switch ( typeOfMsgOption ) {
            case String:
                target[anyKey] = strTxt;
                break;
            case Object:
                _assignPkg(target, anyKey);
                break;
        }
    };

    var _regexSpecifySymbol = /\{([A-Za-z0-9]*)\}/g;

    /**
     * 文字插入。
     *
     * @memberof Juruo~
     * @func _strins
     * @param {String} txt - 一段文字。
     * @param {Object} replaceMsgInfo - 替代訊息資訊。
     * @return {String}
     */
    function _strins(strTxt, objReplaceMsgInfo) {
        if (!_regexSpecifySymbol.test(strTxt)) return strTxt;

        return strTxt.replace(_regexSpecifySymbol, function (strMatch, strKey) {
            if (objReplaceMsgInfo.hasOwnProperty(strKey))
                return objReplaceMsgInfo[strKey];
            else
                return strMatch;
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
    Juruo.prototype.get = function (strKey, objReplaceMsgInfo) {
        var idx;
        var target, langTxt;
        var pkgList = ['langPkg_local', 'langPkg_default', 'langPkg_program'];

        for (idx = 0; idx < 3 ; idx++) {
            target = this[pkgList[idx]];
            if (strKey in target) {
                langTxt = target[strKey];
                break;
            }
        }

        if (!langTxt)
            return this.langPkg_default.__undefined;
        else if (objReplaceMsgInfo instanceof Object)
            return _strins(langTxt, objReplaceMsgInfo);
        else
            return langTxt;
    };


    // gasJuruo
    var juruo = deps.juruo = new Juruo();

    juruo.set({
        __undefined:
            'Unexpected log message.',
        __illegalInvocation:
            'Illegal invocation.',
        __inconsistentExpectation:
            'The usage of "{name}" is inconsistent with expectation.',
        __notExpected:
            'The "{name}" is not of the expected.',
        __typeError:
            'A value is not of the expected type.',
        __restrictedType:
            'The "{name}" must be of `{type}`. Received `{actual}` type.',
        __restrictedNotType:
            'The "{name}" must not be of `{type}`. Received `{actual}` type.',
    });
});

