/*! 日誌類物件 logNeedle - BwayCer (https://bwaycer.github.io/) */

"use strict";

assistant.order( 'assistant/logNeedle', function ( self ) {
    var defaultMsgTable = self._config.defaultMsgTable;
    var logMsgTable     = self._config.logMsgTable;

    /**
     * 日誌類物件
     *
     * @memberof module:assistant.
     * @class logNeedle
     * @param {?Boolean} print - 是否打印（皆允許拋錯）。
     * @param {?Object} preMsgTable - 預設訊息表。
     * 其訊息表的原型鏈會指向 {@link module:assistant.logNeedle#defaultMsgTable}。
     */
    function logNeedle( bisPrint, objPreMsgTable ) {
        this._isPrint = ( typeof bisPrint === 'boolean' ) ? bisPrint : true;
        this.msgTable = objPreMsgTable
            ? Object.setPrototypeOf( objPreMsgTable, this.defaultMsgTable )
            : Object.create( this.defaultMsgTable );
    }

    /**
     * 接收器： 用戶可以此獲取日誌並打印於其他地方。
     *
     * @abstract
     * @memberof module:assistant.logNeedle#
     * @func receiver
     * @param {String} origName - 執行來源。 其值有 `tell`、`warn`、`err`。
     * @param {Number} code - 訊息代碼。 其中 `2x` 開頭表示本物件。
     * @param {String} msg - 訊息。
     */
    logNeedle.prototype.receiver = null;

    /**
     * 預設訊息表。
     * <br>
     * 關於訊息表的名稱建議以 `(...(來源)_)(內容資訊)` 的方式命名，預設值加以 `_` 為前綴。
     *
     * @memberof module:assistant.logNeedle#
     * @var {Object} defaultMsgTable
     */
    logNeedle.prototype.defaultMsgTable = Object.setPrototypeOf( defaultMsgTable, null );

    var _arraySlice = Array.prototype.slice;

    var _regexSpecifySymbol = /%(.)/g;

    /**
     * 文字插入。
     *
     * @memberof module:assistant.logNeedle~
     * @func _strins
     * @param {String} msg - 訊息。
     * @param {...String} [replaceMsg] - 替代訊息。
     * @return {String}
     */
    function _strins( strTxt ) {
        if ( !_regexSpecifySymbol.test( strTxt ) ) return strTxt;

        var idx = 1;
        var args = arguments;

        return strTxt.replace( _regexSpecifySymbol, function () {
            switch ( arguments[ 1 ] ) {
                case '%': return '%';
                case 's': return args[ idx++ ];
                default: return 'undefined';
            }
        } );
    }

    /**
     * 口述。
     *
     * @memberof module:assistant.logNeedle#
     * @func tell
     * @param {Number} code - 訊息代碼。
     * @param {String} msg - 打印訊息。
     * @param {...String} [replaceMsg] - 替代訊息。
     */
    logNeedle.prototype.tell = function ( numCode, strMsg ) {
        var txt;
        var bisSendMsg = typeof this.receiver === 'function';

        if ( typeof strMsg !== 'string' ) txt = this.msgTable._undefined;
        else if ( arguments.length === 2 ) txt = _strins.call( null, strMsg );
        else txt = _strins.apply( null, _arraySlice.call( arguments, 1 ) );

        if ( bisSendMsg ) this.receiver( 'tell', numCode, 'log_tell', txt );
        if ( this._isPrint ) console.log( txt );
    };

    /**
     * 解析警告訊息。
     *
     * @memberof module:assistant.logNeedle~
     * @func _parseWarnTxt
     * @param {Number} code - 訊息代碼。
     * @param {String} msgCode - 打印訊息的日誌代碼。
     * @param {...String} [replaceMsg] - 替代訊息。
     * @return {String}
     */
    function _parseWarnTxt( numCode, strMsgCode ) {
        var msgTable = this.msgTable;

        if ( typeof strMsgCode !== 'string' ) return msgTable._undefined;

        var args;
        var msg = msgTable[ strMsgCode ];
        var strAns;

        if ( !msg ) return msgTable._undefined;

        if ( arguments.length === 2 ) strAns = _strins.call( null, msg );
        else {
            args = _arraySlice.call( arguments, 1 );
            args[ 0 ] = msg;
            strAns = _strins.apply( null, args );
        }

        return strAns;
    }

    /**
     * 警告。
     *
     * @memberof module:assistant.logNeedle#
     * @func warn
     * @param {Number} code - 訊息代碼。
     * @param {String} msgCode - 打印訊息的日誌代碼。
     * @param {...String} [replaceMsg] - 替代訊息。
     */
    logNeedle.prototype.warn = function ( numCode, strMsgCode ) {
        var txt = _parseWarnTxt.apply( this, arguments );
        var bisSendMsg = typeof this.receiver === 'function';

        if ( bisSendMsg ) this.receiver( 'warn', numCode, strMsgCode, txt );
        if ( this._isPrint ) console.error( txt );
    };

    /**
     * 錯誤。
     *
     * @memberof module:assistant.logNeedle#
     * @func err
     * @param {Number} code - 訊息代碼。
     * @param {String} msgCode - 打印訊息的日誌代碼。
     * @param {...String} [replaceMsg] - 替代訊息。
     * @return {String} 錯誤訊息。
     */
    logNeedle.prototype.err = function ( numCode, strMsgCode ) {
        var txt = _parseWarnTxt.apply( this, arguments );
        var bisSendMsg = typeof this.receiver === 'function';

        if ( bisSendMsg ) this.receiver( 'err', numCode, strMsgCode, txt );
        return txt;
    };

    /**
     * 設定訊息表。
     *
     * @memberof module:assistant.logNeedle#
     * @func setMsg
     * @param {(String|Object)} msgOption - 訊息選項，可為名稱或清單。
     * @param {String} msg - 訊息內容。
     */
    logNeedle.prototype.setMsg = function ( anyMsgOption, strMsg ) {
        var typeOfMsgOption = anyMsgOption ? anyMsgOption.constructor : null;
        var bisMsgStrType = typeof strMsg === 'string';

        if ( !( typeOfMsgOption === Object || ( typeOfMsgOption === String && bisMsgStrType ) ) )
            throw TypeError( this.err( 21, '_typeError' ) );

        var key;
        var msgTable = this.msgTable;

        switch ( typeOfMsgOption ) {
            case String:
                msgTable[ anyMsgOption ] = strMsg;
                break;
            case Object:
                for( key in anyMsgOption ) msgTable[ key ] = anyMsgOption[ key ];
                break;
        }
    };

    /**
     * 取得訊息表內容。
     *
     * @memberof module:assistant.logNeedle#
     * @func getMsg
     * @param {String} msgCode - 訊息代碼的日誌代碼。
     * @return {String} 其訊息代碼或 `_undefined` 代碼的內容。
     */
    logNeedle.prototype.getMsg = function ( strMsgCode ) {
        var msgTable = this.msgTable;
        return msgTable[ strMsgCode ] || msgTable._undefined;
    };

    self.logNeedle = logNeedle;
    self.log       = new logNeedle( true, logMsgTable );
} );

