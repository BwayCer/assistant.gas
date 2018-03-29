
// https://developers.google.com/apps-script/guides/web

assistant.order( 'assistant/webRecorder', function ( self ) {
    /**
     * 網路黑盒子。
     *
     * @memberof module:assistant.
     * @class webRecorder
     * @param {String} service - 服務名稱或網址。
     * @param {String} env - 開發 `development` 或生產 `production` 環境。
     * @param {Object} request - 請求物件。
     * @example
     * var valTime = +new Date();
     * var assistantWebRecorder = new webRecorder(
     *     '程式腳本助理',
     *     '測試',
     *     {
     *         "queryString": "username=jsmith&age=21&age=49",
     *         "parameter": {
     *             "username": "jsmith",
     *             "age": "21"
     *         },
     *         "contextPath": "",
     *         "parameters": {
     *             "username": [ "jsmith" ],
     *             "age": [ "21", '49' ]
     *         },
     *         "contentLength": -1
     *     }
     * );
     * assistantWebRecorder.replyState(
     *     '網路黑盒子測試', '成功', +new Date() - valTime
     * );
     */
    function webRecorder( strService, strEnv, objRequest ) {
        var dbKey, newRow, dbSheet;
        var newLine, requestPostData;
        var timeStamp = self.getTimeStamping();
        var contentLength = objRequest.contentLength;
        var isGetType = !~contentLength;

        dbSheet = gasdb( 'webRecorder', 'receiveRequest' );
        newRow = dbSheet.RowNew();
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

        this._dbSheet = dbSheet;
        this._newRow  = newRow;
    }

    webRecorder.prototype.replyState = function ( strItem, strState, numTimeMs ) {
        this._dbSheet.updateRange(
            [ this._newRow, 6, 1, 3 ],
            [ [ strItem, strState, numTimeMs ] ]
        );
    };

    self.webRecorder = webRecorder;
} );

