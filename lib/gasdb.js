
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
        var configList = gasdb._configList;
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
            else if ( configList.hasOwnProperty( sheet_id ) )
                // 如果資料不正確會拋出錯誤
                sheet = cache[ sheetKeyOfCache ]
                    = SpreadsheetApp.openById( configList[ sheet_id ] );
            else
                throw Error( log.err( 21, 'assistant_notExistSheet', strSheetName ) );

            if ( configList[ sheet_table ].hasOwnProperty( strTableName ) )
                // 如果資料不正確會拋出錯誤
                table = cache[ tableKeyOfCache ]
                    = sheet.getSheetByName( configList[ sheet_table ][ strTableName ] );
            else
                throw Error(
                    log.err( 21, 'assistant_notExistSheetTable', strTableName, strSheetName )
                );
        }

        return new gasdbCRUD( sheet, table );
    }

    gasdb._configList = self._config.spreadsheet;
    gasdb._cache = {};

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
        return this.table.getRange(
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
        this.table.getRange(
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

        var len, idx;
        var clearVal = [ '-' ];
        for ( idx = 1, len = this.ColumnMax(); idx < len ; idx++ ) clearVal[ idx ] = '';
        this.update( [ numRowIdx, 1 ], [ clearVal ] );
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

