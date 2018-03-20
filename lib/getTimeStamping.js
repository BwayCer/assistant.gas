
assistant.order( 'assistant/getTimeStamping', function ( self ) {
    /**
     * 取得時間戳。
     *
     * @memberof module:assistant.
     * @func getTimeStamping
     * @param {?Date} date - 時間。
     * @throws {TypeError} TypeError(21, _restrictedType)
     * @return {Object} { readable, time }
     */
    function getTimeStamping( objDate ) {
        objDate = objDate || new Date();

        if ( !( objDate instanceof Date ) )
            throw TypeError( log.err( 21, '_restrictedType', 'date', 'Date' ) );

        var setLengthNum = getTimeStamping.setLengthNum;
        var timeMS = objDate.getTime();
        var readable = setLengthNum( objDate.getFullYear(), 4 )
               + '-' + setLengthNum( objDate.getMonth() + 1, 2 )
               + '-' + setLengthNum( objDate.getDate(), 2 )
               + ' ' + setLengthNum( objDate.getHours(), 2 )
               + ':' + setLengthNum( objDate.getMinutes(), 2 )
               + ':' + setLengthNum( objDate.getSeconds(), 2 )
        ;

        return { readable: readable, time: timeMS };
    }

    /**
     * 設定數字長度： 長度不足者由前面加 `0` 補齊。
     *
     * @memberof! module:assistant.
     * @alias getTimeStamping.setLengthNum
     * @func  getTimeStamping.setLengthNum
     * @param {Number} choA - 數值。
     * @param {Number} len - 指定長度。
     * @return {String}
     */
    getTimeStamping.setLengthNum = function ( numChoA, numLen ) {
        var strChoA = numChoA.toString();
        var loop = numLen - strChoA.length;

        return ( loop > 0 ? '0'.repeat( loop ) : '' ) + strChoA;
    };

    self.getTimeStamping = getTimeStamping;
} );

