
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
     */
    function webRecorder( strService, strEnv, objRequest ) {
        var requestPostData;
        var tableList = self.gasdb(
            [ 'webRecorder', strEnv === 'production' ? '生產環境' : '開發環境' ]
        );
        var table = tableList[ 0 ];
        var newRow = table.getLastRow() + 1;
        var request = objRequest;
        var contentLength = objRequest.contentLength;
        var isGetType = !~contentLength;

        table.getRange( newRow, 1 ).setValue( self.getTimeStamping().readable );
        table.getRange( newRow, 2 ).setValue( strService );
        table.getRange( newRow, 3 ).setValue( isGetType ? 'GET' : 'POST' );
        table.getRange( newRow, 4 ).setValue( request.queryString );

        if ( !isGetType ) {
            requestPostData = objRequest.postData;
            table.getRange( newRow, 5 ).setValue( requestPostData.postType );
            table.getRange( newRow, 6 ).setValue( contentLength );
            table.getRange( newRow, 7 ).setValue( requestPostData.contents );
        }
    }

    self.webRecorder = webRecorder;
} );

