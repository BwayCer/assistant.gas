
assistant.order( 'assistant/_config', function ( self ) {
    /**
     * 設定文件。
     *
     * @memberof module:assistant.
     * @var config
     */
    var config = {
        // logNeedle
        defaultMsgTable: {
            _undefined: 'Unexpected log message.',
            _illegalInvocation: 'Illegal invocation.',
            _typeError: 'a value is not of the expected type.',
            _restrictedType: '"%s" argument must be a "%s" type.',
            _restrictedNotType: '"%s" argument must be not a "%s" type.',
        },
        logMsgTable: {
            assistant_gasdb_notExistSpreadsheet: 'The "%s" spreadsheet is not exist.',
        },
    };

    /**
     * 讓渡。
     *
     * @memberof! module:assistant.
     * @alias config.assign
     * @func  config.assign
     * @param {Object} target - 目標物件。
     * @param {Object} source - 來源物件。
     * @return {Object} 回傳第一項參數。
     */
    config.assign = function assign( objTarget, objSource ) {
        if ( arguments.length === 1 ) {
            objSource = objTarget;
            objTarget = this;
        }

        var key, valT, valS;

        for ( key in objSource ) {
            valS = objSource[ key ];

            if ( !objTarget.hasOwnProperty( key ) ) {
                objTarget[ key ] = valS;
                continue;
            }

            valT = objTarget[ key ];

            if ( valT.constructor === Object && valS.constructor === Object) {
                assign( valT, valS );
            }
        }

        return objTarget;
    };

    self._config = config;
} );

