
gasOrder('assistant/timeStamping', function (deps) {
    /**
     * 取得時間戳。
     *
     * @memberof module:assistant.
     * @class timeStamping
     * @param {Date} [assignDate] - 指定日。
     * @throws {TypeError} "assignDate" 必須為 `Date`。
     */
    function timeStamping(assignDateArgu) {
        var assignDate = assignDateArgu || new Date();

        if (!(assignDate instanceof Date))
            throw TypeError(
                deps.juruo.get('__restrictedType', {
                    name: 'assignDate',
                    type: 'Date',
                    actual: typeof assignDate,
                })
            );

        var timezoneOffset = assignDate.getTimezoneOffset();
        this.timeMsUTC = +assignDate + timezoneOffset * 60000;
        // 方便轉換文字日期時間而建立，切勿使用
        this._dateUTC = new Date(this.timeMsUTC);
        this.date = new Date(+assignDate);

        // YYYY-MM-DDThh:mm:ss.mmmZ
        // !! JSON.stringify(assignDate)
        //      == '"2018-11-04T14:46:06.164Z"'
        this.symbol = this.readable('UTC:{YMD}T{hms}.{ms}Z');
        this.timeMs = assignDate.getTime();
    }

    /**
     * 設定數字長度： 長度不足者由前面加 `0` 補齊。
     *
     * @memberof module:assistant.timeStamping~
     * @func _setLengthNum
     * @param {Number} choA - 數值。
     * @param {Number} length - 指定長度。
     * @return {String}
     */
    function _setLengthNum(numChoA, length) {
        var strChoA = numChoA.toString();
        var loop = length - strChoA.length;
        var addStr = '';
        for ( ; loop > 0 ; loop--) addStr += '0';
        return addStr + strChoA;
    }

    /**
     * 取得可讀日期時間。
     *
     * @memberof module:assistant.timeStamping~
     * @func _getReadableInfo
     * @param {Date} assignDate - 指定日。
     * @return {Object}
     */
    function _getReadableInfo(assignDate) {
        return {
            dateTxt: _setLengthNum(assignDate.getFullYear(), 4)
                + '-' + _setLengthNum(assignDate.getMonth() + 1, 2)
                + '-' + _setLengthNum(assignDate.getDate(), 2),
            timeTxt: _setLengthNum(assignDate.getHours(), 2)
                + ':' + _setLengthNum(assignDate.getMinutes(), 2)
                + ':' + _setLengthNum(assignDate.getSeconds(), 2),
            ms: _setLengthNum(assignDate.getMilliseconds(), 3),
        };
    }

    /**
     * 可讀化。
     *
     * @memberof module:assistant.timeStamping#
     * @func readable
     * @param {String} [format] - 格式化文字。
     * 可用參數有 `{YMD}`、`{hms}`、`{ms}`。
     * @return {String}
     */
    timeStamping.prototype.readable = function (formatArgu) {
        var assignDate, readableInfo, txt;

        if (formatArgu.indexOf('UTC:') === 0) {
            assignDate = this._dateUTC;
            txt = formatArgu.substr(4);
        } else {
            assignDate = this.date;
            txt = formatArgu || '{YMD} {hms}';
        }

        readableInfo = _getReadableInfo(assignDate);
        return txt
            .replace(/\{YMD\}/g, readableInfo.dateTxt)
            .replace(/\{hms\}/g, readableInfo.timeTxt)
            .replace(/\{ms\}/g,  readableInfo.ms)
        ;
    };

    deps.timeStamping = timeStamping;
} );

