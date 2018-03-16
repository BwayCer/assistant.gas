
// https://developers.google.com/apps-script/guides/web

assistant.order( 'assistant/webRecorder', function ( self ) {
    /**
     * 網路黑盒子。
     *
     * @memberof module:assistant.
     * @func webRecorder
     * @param {String} service - 服務名稱或網址。
     * @param {String} env - 開發 `development` 或生產 `production` 環境。
     * @param {Object} request - 請求物件。
     * @return {Number} 橫列引索位置。
     */
    function webRecorder( strService, strEnv, objRequest ) {
        var dbKey, dbSheet;
        var newLine, requestPostData;
        var timeStamp = self.getTimeStamping();
        var contentLength = objRequest.contentLength;
        var isGetType = !~contentLength;

        dbSheet = self.gasdb(
            'webRecorder',
            strEnv === '正式' ? 'receiveRequest' : 'test'
        );
        dbKey = dbSheet.readRange( [ dbSheet.RowLast(), 1 ] ) + 1;

        newLine = [
            /* 4 */ dbKey, timeStamp.time, timeStamp.readable, strEnv,
            /* 4 */ strService, '', '接收', '',
            isGetType ? 'GET' : 'POST',
            objRequest.queryString,
            '', '', '', '',
        ];

        if ( !isGetType ) {
            requestPostData = objRequest.postData;
            newLine[ 10 ] = requestPostData.postType;
            newLine[ 11 ] = contentLength;
            newLine[ 11 ] = requestPostData.contents;
        }

        dbSheet.fill( newLine );
        dbSheet.create( newLine );

        return dbSheet.RowLast();
    }

    self.webRecorder = webRecorder;
} );

