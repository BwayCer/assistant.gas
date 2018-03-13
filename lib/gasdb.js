
assistant.order( 'assistant/gasdb', function ( self ) {
    /**
     * 谷歌腳本資料庫。
     *
     * @memberof module:assistant.
     * @func gasdb
     * @param {...Array} dbInfoList - 資料表資訊， 連接指定資料表。 值為 `[...[ config_spreadsheet_id, 表格名稱 ]]`。
     * @param {Function} done - 回調函式。
     */
    function gasdb() {
        var idx, len, val;
        var spreadsheetName;
        var spreadsheet, table;
        var spreadsheetIdList = self._config.spreadsheet;
        var list = [];

        for ( idx = 0, len = arguments.length; idx < len ; idx++ ) {
            val = arguments[ idx ];
            spreadsheetName = val[ 0 ];

            if ( !spreadsheetIdList.hasOwnProperty( spreadsheetName ) )
                throw Error(
                    log.err( 21, 'assistant_gasdb_notExistSpreadsheet', spreadsheetName )
                );

            // 如果資料不正確會拋出錯誤
            spreadsheet = SpreadsheetApp.openById( spreadsheetIdList[ spreadsheetName ] );
            table = spreadsheet.getSheetByName( val[ 1 ] );

            list.push( table );
        }

        return list;
    }

    self.gasdb = gasdb;
} );

