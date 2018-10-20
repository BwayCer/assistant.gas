
gasOrder('assistant/getTimeStamping', function (deps) {
    /**
     * 取得時間戳。
     *
     * @memberof module:assistant.
     * @func getTimeStamping
     * @param {Date} [dateTime] - 時間。
     * @throws {TypeError} "dateTime" 必須為 `Date`。
     * @return {Object} 
     * {readableUTC, timeUTC, readable, time}
     */
    function getTimeStamping(dateTimeArgu) {
        var dateTimeUTC, timezoneOffset;
        var dateTime = dateTimeArgu || new Date();

        if (!(dateTime instanceof Date))
            throw TypeError(
                deps.juruo.get('__restrictedType', {
                    name: 'dateTime',
                    type: 'Date',
                    actual: typeof dateTime,
                })
            );

        timezoneOffset = dateTime.getTimezoneOffset();
        dateTimeUTC = timezoneOffset === 0
            ? dateTime
            : new Date(dateTime.getTime() + timezoneOffset * 60000)
        ;

        return {
            readableUTC: _getReadableDate(dateTimeUTC),
            timeUTC: dateTimeUTC.getTime(),
            readable: _getReadableDate(dateTime),
            time: dateTime.getTime(),
        };
    }

    /**
     * 設定數字長度： 長度不足者由前面加 `0` 補齊。
     *
     * @memberof! module:assistant.
     * @alias getTimeStamping~_setLengthNum
     * @func  getTimeStamping~_setLengthNum
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
     * @memberof! module:assistant.
     * @alias getTimeStamping~_getReadableDate
     * @func  getTimeStamping~_getReadableDate
     * @param {Date} dateTime - 時間。
     * @return {String}
     */
    function _getReadableDate(dateTime) {
        return _setLengthNum(dateTime.getFullYear(), 4)
            + '-' + _setLengthNum(dateTime.getMonth() + 1, 2)
            + '-' + _setLengthNum(dateTime.getDate(), 2)
            + ' ' + _setLengthNum(dateTime.getHours(), 2)
            + ':' + _setLengthNum(dateTime.getMinutes(), 2)
            + ':' + _setLengthNum(dateTime.getSeconds(), 2)
        ;

    }

    deps.getTimeStamping = getTimeStamping;
} );

