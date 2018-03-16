
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
            _inconsistentExpectation: 'The usage of "%s" is inconsistent with expectation.',
            _typeError: 'a value is not of the expected type.',
            _restrictedType: '"%s" argument must be a "%s" type.',
            _restrictedNotType: '"%s" argument must be not a "%s" type.',
        },
        logMsgTable: {
            assistant_notExistSheet: 'The "%s" spreadsheet is not exist.',
            assistant_notExistSheetTable: 'The "%s" table of "%s" spreadsheet is not exist.',
        },
    };

    /**
     * 讓渡： 相關請見 {@link module:support|support} 。
     *
     * @memberof! module:assistant.
     * @alias config.assign
     * @func  config.assign
     */
    config.assign = Object.assignEacyDeep;

    self._config = config;
} );

