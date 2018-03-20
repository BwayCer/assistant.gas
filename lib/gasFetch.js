
assistant.order( 'assistant/gasFetch', function ( self ) {
    /**
     * 谷歌腳本抓取。
     *
     * @memberof module:assistant.
     * @class gasFetch
     * @param {String} service - 服務名稱或網址。
     * @param {String} env - 開發 `development` 或生產 `production` 環境。
     * @param {String} item - 項目。
     * @param {String} url - 網址。
     * @param {Object} [params] - `UrlFetchApp.fetch` 的設定參數。
     * @param {Boolean} [showRequestContent] - 是否顯示請求內容。
     * @param {Boolean} [showReceiveContent] - 是否顯示接收內容。
     *
     * @example
     * var valTime = +new Date();
     * var fhr = new gasFetch(
     *     '服務', '環境', '項目',
     *     'https://tool.magiclen.org/ip'
     * );
     * fhr.replyState( '成功', +new Date() - valTime );
     */
    function gasFetch(
        strService, strEnv, strItem, strUrl, objParams,
        bisShowRequestContent, bisShowReceiveContent
    ) {
        objParams = objParams == null ? {} : objParams;
        objParams.muteHttpExceptions = true;

        if ( bisShowRequestContent == null )
            bisShowRequestContent = true;
        if ( bisShowReceiveContent == null )
            bisShowReceiveContent = true;

        var timeStamp = getTimeStamping();
        var urlInfo, request, response, timeFetch;
        var dbSheet = this._dbSheet = gasdb( 'webRecorder', 'sendRequest' );
        var newRow  = this._newRow  = dbSheet.RowNew();
        var dbKey   = dbSheet.readRange( [ dbSheet.RowLast(), 1 ] ) + 1;

        urlInfo = strUrl.split( '?' );
        urlInfo[ 1 ] = !!urlInfo[ 1 ] ? urlInfo[ 1 ] : '';

        request = this.request
            = new gasFetch._request( strUrl, objParams, bisShowRequestContent );

        dbSheet.create( dbSheet.fill( [
            dbKey, timeStamp.time, timeStamp.readable, strEnv, strService, strItem,
            '等待', '', '',
            request.method,
            urlInfo[ 0 ], urlInfo[ 1 ],
            JSON.stringify( request.headers ),
            request.contentType,
            request.contentLength,
            request.contentReadableType,
            request.contentReadable,
            JSON.stringify( request.info ),
        ] ) );

        receive = this.receive
            = new gasFetch._receive( strUrl, objParams, bisShowReceiveContent );

        dbSheet.updateRange( [ newRow, 9 ], receive.spendTime );
        dbSheet.updateRange(
            [ newRow, 19, 1, 6 ],
            [ [
                receive.statusCode,
                JSON.stringify( receive.headers ),
                receive.contentType,
                receive.contentLength,
                receive.contentReadableType,
                receive.contentReadable,
            ] ]
        );
    }

    gasFetch._request = function request( strUrl, objParams, bisShowContent ) {
        var request = this.info = UrlFetchApp.getRequest( strUrl, objParams );

        this.method        = request.method;
        this.headers       = request.headers;
        this.contentType   = request.contentType;
        this.contentLength = request.payload.length;
        this.content       = request.payload;

        if ( !bisShowContent ) {
            this.contentReadableType = 'NotShow'
            this.contentReadable = ''
        } else {
            this.contentReadableType = 'Text'
            this.contentReadable = request.payload;
        }
        // TODO 轉換為 Blob 的方法
    };

    gasFetch._receive = function ( strUrl, objParams, bisShowContent ) {
        var timeFetch, receive, headers, contentReadable;

        timeFetch = +new Date();
        receive = this.info = UrlFetchApp.fetch( strUrl, objParams );
        timeFetch = +new Date() - timeFetch;

        receive_headers = receive.getHeaders();

        this.spendTime     = timeFetch;
        this.statusCode    = receive.getResponseCode();
        this.headers       = receive_headers;
        this.contentType   = receive_headers[ 'Content-Type' ];
        this.contentLength = receive_headers[ 'Content-Length' ];

        if ( !bisShowContent ) {
            this.contentReadableType = 'NotShow'
            contentReadable = ''
        } else if ( /^text\//.test( this.contentType ) ) {
            this.contentReadableType = 'Text'
            contentReadable = receive.getContentText();
        } else {
            this.contentReadableType = 'Blob'
            contentReadable = JSON.stringify( receive.getContent() );
        }

        this.content = this.contentReadable = contentReadable;
    };

    gasFetch.prototype.replyState = function ( strState, numTimeMs ) {
        this._dbSheet.updateRange(
            [ this._newRow, 7, 1, 2 ],
            [ [ strState, numTimeMs ] ]
        );
    };

    self.gasFetch = gasFetch;
} );

