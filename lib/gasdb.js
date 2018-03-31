
assistant.order( 'assistant/gasdb', function ( self ) {
    /**
     * 谷歌腳本資料庫。
     *
     * @see [谷歌開發者文件 Apps Script - Class Sheet]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
     * @see [谷歌開發者文件 Apps Script - Class Range]{@link https://developers.google.com/apps-script/reference/spreadsheet/range}
     *
     * @memberof module:assistant.
     * @func gasdb
     * @param {String} spreadsheetName - 試算表名稱（依設定文件）。
     * @param {String} tableName - 表格名稱（依設定文件）。
     * @return {module:assistant.gasdb~gasdbCRUD} 谷歌試算表操作物件。
     * @throws {Error} 不符預期的調用。 Error(21, _inconsistentExpectation)
     *
     * @example
     * var dbSheet = gasdb( 'spreadsheetName', 'tableName' );
     */
    function gasdb( strSheetName, strTableName ) {
        var lenArgs = arguments.length;

        if ( lenArgs !== 2 )
            throw Error( log.err( 21, '_inconsistentExpectation', 'gasdb' ) );

        var sheet, table;
        var spreadsheetList = gasdb._spreadsheetList;
        var cache = gasdb._cache;
        var sheet_id = strSheetName + '_id';
        var sheet_table = strSheetName + '_table';
        var sheetKeyOfCache = 'sheet_' + strSheetName;
        var tableKeyOfCache = 'table_' + strSheetName + '_' + strTableName;

        if ( cache.hasOwnProperty( tableKeyOfCache ) ) {
            sheet = cache[ sheetKeyOfCache ];
            table = cache[ tableKeyOfCache ];
        } else {
            if ( cache.hasOwnProperty( sheetKeyOfCache ) )
                sheet = cache[ sheetKeyOfCache ];
            else if ( spreadsheetList.hasOwnProperty( sheet_id ) )
                // 如果資料不正確會拋出錯誤
                sheet = cache[ sheetKeyOfCache ]
                    = SpreadsheetApp.openById( spreadsheetList[ sheet_id ] );
            else
                throw Error( log.err( 21, 'assistant_notExistSheet', strSheetName ) );

            if ( spreadsheetList[ sheet_table ].hasOwnProperty( strTableName ) )
                // 如果資料不正確會拋出錯誤
                table = cache[ tableKeyOfCache ] = sheet.getSheetByName(
                    spreadsheetList[ sheet_table ][ strTableName ]
                );
            else
                throw Error(
                    log.err( 21, 'assistant_notExistSheetTable', strTableName, strSheetName )
                );
        }

        return new gasdbCRUD( sheet, table );
    }

    gasdb._spreadsheetList = self._config.spreadsheet;
    gasdb._cache = {};

    /**
     * 連接資料表。
     *
     * @memberof module:assistant.gasdb.
     * @func join
     * @param {...Array} tableJoinInfoList - 資料表的連接資訊清單。
     * @param {Number} tableJoinInfoList.0 - 連接的參考位置。
     * @param {Array} tableJoinInfoList.1 - 資料表。
     * @param {...Number} [tableJoinInfoList.2] - 需要的行位編號。
     * @throws {TypeError} (21, _restrictedType)
     * @throws {RangeError} (21, assistant_notEqualLengthColumn)
     * @throws {Error} (21, assistant_tableSameKeys)
     * @return {Array}
     */
    gasdb.join = function join() {
        var arraySlice = Array.prototype.slice;
        var args = arraySlice.call( arguments );

        var len, idx;
        var row, column, keyList, countEmptyKey;
        var newTableInfo = args.reduce( function ( arrAccumlator, arrJoinInfo ) {
            if ( arrJoinInfo == null || arrJoinInfo.constructor !== Array )
                throw TypeError(
                    log.err( 21, '_restrictedType', 'tableJoinInfoList', 'Array' )
                );

            var idxKey = arrJoinInfo[ 0 ];
            var table  = arrJoinInfo[ 1 ];

            if ( table == null || table.constructor !== Array )
                throw TypeError(
                    log.err( 21, '_restrictedType', 'tableJoinInfoList[ 1 ]', 'Array' )
                );

            var len, idx, val;
            var key, bisEmptyKey;
            var keyList = arrAccumlator[ 1 ];
            var tableKeyList = new Array( table.length );
            var column = table[ 0 ].length

            if ( arrJoinInfo.length === 2 )
                arrAccumlator[ 0 ] += column;
            else
                arrAccumlator[ 0 ] += arrJoinInfo.length - 2;

            for ( idx = 0, len = table.length; idx < len ; idx++ ) {
                val = table[ idx ];

                if ( val == null || val.constructor !== Array )
                    throw TypeError( log.err(
                        21, '_restrictedType',
                        'tableJoinInfoList[ 1 ][ ' + idx + ' ]', 'Array'
                    ) );
                if ( val.length !== column )
                    throw RangeError(
                        log.err( 21, 'assistant_notEqualLengthColumn' )
                    );

                key = val[ idxKey ];
                bisEmptyKey = key == null || key === '';

                if ( !bisEmptyKey && ~tableKeyList.indexOf( key ) )
                    throw Error( log.err( 21, 'assistant_tableSameKeys' ) );

                tableKeyList.push( key );
                if ( bisEmptyKey ) arrAccumlator[ 2 ]++;
                else if ( !~keyList.indexOf( key ) ) keyList.push( key );
            }

            return arrAccumlator;
        }, [ 0, [], 0 ] );
        column = newTableInfo[ 0 ] + 1;
        keyList = newTableInfo[ 1 ].sort();
        countEmptyKey = newTableInfo[ 2 ];
        row = keyList.length + countEmptyKey;

        var len, idx, val;
        var pickElemList;
        var pointerIdxEmptyKeyRow = [ keyList.length ];
        var idxColumn = 1;
        var newTable = new Array( row );

        for ( idx = 0, len = args.length; idx < len ; idx++ ) {
            val = args[ idx ];
            pickElemList = val.length === 2
                ? 'All' : arraySlice.call( val, 2 );

            join.concat(
                newTable, val[ 1 ], val[ 0 ], pickElemList,
                keyList, pointerIdxEmptyKeyRow, column, idxColumn
            );
            idxColumn += ( pickElemList === 'All' ? val[ 1 ][ 0 ] : pickElemList ).length;
        }

        return newTable;
    };

    gasdb.join.concat = function (
        arrNewTable, arrSourceTable, numIdxKey, arrPickElemList,
        arrKeyList, arrIdxEmptyKeyRow, numColumn, numIdxStart
    ) {
        var pointerIdxEmptyKeyRow = arrIdxEmptyKeyRow;

        var len, idx, val;
        var key, idxRow, rowList, pickElemVal;
        var tableKeyList = new Array( arrSourceTable.length );

        pickElemVal = arrPickElemList === 'All'
            ? this.pickElemVal_all
            : this.pickElemVal_cho
        ;

        for ( idx = 0, len = arrSourceTable.length; idx < len ; idx++ ) {
            val = arrSourceTable[ idx ];
            key = val[ numIdxKey ];
            idxRow = arrKeyList.indexOf( key );
            rowList = null;

            if ( ~idxRow && !!arrNewTable[ idxRow ] ) {
                rowList = arrNewTable[ idxRow ];
            } else {
                rowList
                    = arrNewTable[ ~idxRow ? idxRow : pointerIdxEmptyKeyRow[ 0 ]++ ]
                    = this.createEmptyArray( numColumn );
                rowList[ 0 ] = key;
            }

            pickElemVal( rowList, val, numIdxStart, arrPickElemList );
        }
    };

    gasdb.join.createEmptyArray = function ( numLen ) {
        var newArr = new Array( numLen );
        var len = numLen;
        while ( len-- ) newArr[ len ] = '';
        return newArr;
    };

    gasdb.join.pickElemVal_all = function ( arrTarget, arrSource, numIdxStart ) {
        var len, idx;
        var idxStart = numIdxStart;

        for ( idx = 0, len = arrSource.length; idx < len ; idx++ )
            arrTarget[ idxStart++ ] = arrSource[ idx ];
    };

    gasdb.join.pickElemVal_cho = function (
        arrTarget, arrSource, numIdxStart, arrPickElemList
    ) {
        var len, idx;
        var idxStart = numIdxStart;

        for ( idx = 0, len = arrPickElemList.length; idx < len ; idx++ )
            arrTarget[ idxStart++ ] = arrSource[ arrPickElemList[ idx ] ];
    };

    /**
     * 谷歌試算表操作。
     *
     * @memberof module:assistant.gasdb~
     * @class gasdbCRUD
     * @param {Object} sheet - 谷歌試算表物件。
     * @param {Object} table - 谷歌試算表表格物件。
     */
    function gasdbCRUD( objSheet, objTable ) {
        this.sheet = objSheet;
        this.table = objTable;

        this.dbId = objSheet.getId();
        this.tableId = objTable.getSheetId();
        this.tableName = objTable.getSheetName();
        this.url = 'https://docs.google.com/spreadsheets/d/' + this.dbId;
    }

    /**
     * 創建。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func create
     * @param {Array} value - 數組化表格（單行）。
     */
    gasdbCRUD.prototype.create = function ( arrValue ) {
        // 時間文字會被轉成時間格式
        // this.table.appendRow( arrValue );
        this.update( [ this.RowNew(), 1 ], [ arrValue ] );
    };

    /**
     * 讀取。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func read
     * @param {Array} range - 範圍描述。
     * @param {Number} range.0 - 橫列引索。
     * @param {Number} range.1 - 橫列位置向下取多少列。
     * @return {Array} 數組化表格。
     */
    gasdbCRUD.prototype.read = function ( arrRange ) {
        return this.table
            .getRange(
                arrRange[ 0 ], 1,
                arrRange[ 1 ], this.ColumnMax()
            )
            .getValues();
    };

    /**
     * 讀取指定範圍。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func readRange
     * @param {Array} range - 範圍描述。
     * @param {Number} range.0 - 橫列引索。
     * @param {Number} range.1 - 直行引索。
     * @param {Number} [range.2] - 橫列位置向下取多少列。
     * @param {Number} [range.3] - 直行位置向右取多少行。
     * @return {*} 該格物件或數組化表格。
     * @throws {Error} 不符預期的調用。 Error(21, _inconsistentExpectation)
     */
    gasdbCRUD.prototype.readRange = function ( arrRange ) {
        switch ( arrRange.length ) {
            case 2:
                return this.table
                    .getRange( arrRange[ 0 ], arrRange[ 1 ] )
                    .getValue();
            case 4:
                return this.table
                    .getRange(
                        arrRange[ 0 ], arrRange[ 1 ],
                        arrRange[ 2 ], arrRange[ 3 ]
                    )
                    .getValues();
            default:
                throw Error( log.err( 21, '_inconsistentExpectation', 'gasdbCRUD' ) );
        }
    };

    /**
     * 更新。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func update
     * @param {Array} range - 範圍描述。
     * @param {Number} range.0 - 橫列引索。
     * @param {Number} range.1 - 橫列位置向下取多少列。
     * @param {Array} values - 數組化表格。
     */
    gasdbCRUD.prototype.update = function ( arrRange, arrValues ) {
        this.table
            .getRange(
                arrRange[ 0 ], 1,
                arrRange[ 1 ], this.ColumnMax()
            )
            .setValues( arrValues );
    };

    /**
     * 更新指定範圍。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func updateRange
     * @param {Array} range - 範圍描述。
     * @param {Number} range.0 - 橫列引索。
     * @param {Number} range.1 - 直行引索。
     * @param {Number} [range.2] - 橫列位置向下取多少列。
     * @param {Number} [range.3] - 直行位置向右取多少行。
     * @param {*} value - 該格物件或數組化表格。
     * @return {*} 該格物件或數組化表格。
     * @throws {Error} 不符預期的調用。 Error(21, _inconsistentExpectation)
     */
    gasdbCRUD.prototype.updateRange = function ( arrRange, anyValue ) {
        switch ( arrRange.length ) {
            case 2:
                return this.table
                    .getRange( arrRange[ 0 ], arrRange[ 1 ] )
                    .setValue( anyValue );
            case 4:
                return this.table
                    .getRange(
                        arrRange[ 0 ], arrRange[ 1 ],
                        arrRange[ 2 ], arrRange[ 3 ]
                    )
                    .setValues( anyValue );
            default:
                throw Error( log.err( 21, '_inconsistentExpectation', 'gasdbCRUD' ) );
        }
    };

    /**
     * 移除。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func remove
     * @param {Number} rowIdx - 橫列引索位置。
     */
    gasdbCRUD.prototype.remove = function ( numRowIdx, bisRight ) {
        if ( bisRight ) {
            this.table.deleteRow( numRowIdx );
            return;
        }

        var clearVal = [ '-' ];
        this.update( [ numRowIdx, 1 ], [ this.fill( clearVal ) ] );
    };

    /**
     * 填充。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func fill
     * @param {Array} values - 數組化表格。
     */
    gasdbCRUD.prototype.fill = function ( arrValue ) {
        var idx = arrValue.length;
        var len = this.ColumnMax();
        while ( idx < len ) arrValue[ idx++ ] = '';
        return arrValue;
    };

    /**
     * 橫列最後一筆引索值。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func RowLast
     */
    gasdbCRUD.prototype.RowLast = function () {
        return this.table.getLastRow();
    };

    /**
     * 表格最新一列引索值。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func RowNew
     */
    gasdbCRUD.prototype.RowNew = function () {
        return this.table.getLastRow() + 1;
    };

    /**
     * 表格最後一列引索值。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func RowMax
     */
    gasdbCRUD.prototype.RowMax = function () {
        return this.table.getMaxRows();
    };

    /**
     * 直行最後一筆引索值。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func ColumnLast
     */
    gasdbCRUD.prototype.ColumnLast = function () {
        return this.table.getLastColumn();
    };

    /**
     * 表格最新一行引索值。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func ColumnNew
     */
    gasdbCRUD.prototype.ColumnNew = function () {
        return this.table.getLastColumn() + 1;
    };

    /**
     * 表格最後一行引索值。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func ColumnMax
     */
    gasdbCRUD.prototype.ColumnMax = function () {
        return this.table.getMaxColumns();
    };

    /**
     * 取得該行網址。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func getUrl
     * @param {?Number} rowIdx - 橫列引索位置。
     */
    gasdbCRUD.prototype.getUrl = function ( numRowIdx ) {
        var range = numRowIdx == null ? '' : '&range=' + numRowIdx + ':' + numRowIdx;
        return this.url + '/view' + '#gid=' + this.tableId + range;
    };

    /**
     * 取得該行網址鏈結函式。
     *
     * @memberof module:assistant.gasdb~gasdbCRUD#
     * @func getUrlLinkFunc
     * @param {?Number} rowIdx - 橫列引索位置。
     * @param {?Number} numDbKey - 橫列引索位置。
     */
    gasdbCRUD.prototype.getUrlLinkFunc = function ( numRowIdx, numDbKey ) {
        var url = this.getUrl( numRowIdx );
        var linkInfo = this.tableName
            + ( numRowIdx == null ?  '' : ':' + numRowIdx )
            + ( numDbKey  == null ?  '' : ':key' + numDbKey );
        return '=HYPERLINK("' + url + '", "' + linkInfo + '")';
    };

    self.gasdb = gasdb;
} );

