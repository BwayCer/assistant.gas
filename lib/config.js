
assistant.order( 'assistant/_config', function ( self ) {
    /**
     * 設定文件。
     *
     * @memberof module:assistant.
     * @var config
     */
    var config = Object.create( Object.assignEacy( new Object.emptyEnum(), {
        /**
         * 讓渡：
         * 用 `for(key in Object)` 獲取簡單可枚舉成員，
         * 並對 `Array`、`Object` 深入讀取。
         *
         * @memberof! module:assistant.
         * @alias config.assign
         * @func  config.assign
         * @param {(Object|Array)} source - 來源物件。
         * @param {(Object|Array)} [target] - 目標物件， 預設值為 `this`。
         * @return {(Object|Array)} 回傳第一項參數。
         */
        assign: function assignEacyDeep( anySource, anyTarget ) {
            anyTarget = anyTarget || this;

            if (   anyTarget == null || typeof anyTarget !== 'object'
                || anySource == null || typeof anySource !== 'object' )
                throw Error( 'Illegal invocation.' );

            var key, valT, valS;
            var valT_type, isDeepObject, isDeepRead;

            for ( key in anySource ) {
                valT = valS = '';
                valS = anySource[ key ];
                isDeepObject = false;
                isDeepRead = false;

                if ( key in anyTarget ) {
                    valT = anyTarget[ key ];
                    valT_type = valT.constructor;
                    isDeepObject = valT_type === Array || valT_type === Object;
                    isDeepRead = valT_type === valS.constructor;
                }

                if ( isDeepRead ) assignEacyDeep( valS, valT );
                else if ( !isDeepObject ) anyTarget[ key ] = valS;
            }

            return anyTarget;
        }
    } ) );

    config.assign( {
        // logNeedle
        defaultMsgTable: {
            _undefined: 'Unexpected log message.',
            _illegalInvocation: 'Illegal invocation.',
            _inconsistentExpectation: 'The usage of "%s" is inconsistent with expectation.',
            _typeError: 'A value is not of the expected type.',
            _restrictedType: '"%s" argument must be a "%s" type.',
            _restrictedNotType: '"%s" argument must be not a "%s" type.',
        },
        logMsgTable: {
            assistant_notExistSheet: 'The "%s" spreadsheet is not exist.',
            assistant_notExistSheetTable: 'The "%s" table of "%s" spreadsheet is not exist.',
            assistant_tableNotEqualLengthColumn: 'The length in each column of the table must be equal.',
            assistant_tableSameKeys: "Can't have two same keys.",
        },
        spreadsheet: {
            // webRecorder_id: 'spreadsheet-id',
            // webRecorder_table: {
            //     receiveRequest: '接收請求',
            //     sendRequest:    '發送請求',
            // },
        },
        tgBotToken: {},
    } );

    self._config = config;
} );

