
assistant.order( 'assistant/_config', function ( self ) {
    /**
     * 設定文件。
     *
     * @var config
     */
    var config = {
    };

    /**
     * 讓渡。
     *
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

