/*! 爪哇腳本語言支援補充 精簡版 Support Lite - BwayCer (https://bwaycer.github.io/) */

/**
 * 爪哇腳本語言支援補充 Support
 *
 * @file
 * @author 張本微
 * @license CC-BY-4.0
 * @see [個人網站]{@link https://bwaycer.github.io/}
 */

'use strict';

/**
 * 爪哇腳本語言支援補充。
 *
 * @module support
 */

assistant.order( 'assistant/supportLite', function () {
    !function ( getSupportLite ) {
        getSupportLite()
            .checkProp(
                Object,
                [ 'defineProperty' ]
            )
            .addProtoProp( String, 'repeat',
                function ( count ) {
                    if ( this == null ) {
                        throw new TypeError( 'TypeError: String.prototype.repeat called on null or undefined' );
                    }
                    var str = '' + this;
                    count = +count;
                    if ( count != count ) {
                        count = 0;
                    }
                    if ( count < 0 || count == Infinity ) {
                        throw new RangeError( 'Invalid count value' );
                    }
                    count = Math.floor( count );
                    if ( str.length == 0 || count == 0 ) {
                        return '';
                    }
                    // 確保 count 為 31-bit 的數值。
                    // 當前 (2014.08) 瀏覽器無法處理大於 1 << 28  的字符。
                    if ( str.length * count >= 1 << 28 ) {
                        throw new RangeError( 'repeat count must not overflow maximum string size' );
                    }
                    var rpt = '';
                    for ( var i = 0; i < count; i++ ) {
                        rpt += str;
                    }
                    return rpt;
                }
            )
            .addProp( Array, 'splice', Array.prototype.splice )
            // // Apps Script 使用類似於 Symbol() 的原型鏈
            // // `prototype`、`__proto_` 皆看成物件屬性
            // // `prototype` 雖然當成物件 但在 `function` 時仍然有效
            // .addProp( Object, 'setPrototypeOf', ( obj, proto ) => {} )
            /**
             * 空枚舉： 創建一個「乾淨」的空物件陣列。
             * <br>
             * 其運用實例實作比調用 `Object.create( null )` 更有效率。（翻譯自 node 注釋）
             *
             * @see [nodejs/node v7.x > events.js#L5 - GitHub]{@link https://github.com/nodejs/node/blob/v7.x/lib/events.js#L5}
             *
             * @memberof module:initJS~
             * @func emptyEnum
             */
            .customProp( Object, 'emptyEnum',
                function () {
                    function emptyEnum() {}
                    emptyEnum.prototype = Object.create( null );
                    Object.emptyEnum = emptyEnum;
                }
            )
            /**
             * 簡單讓渡：
             * 用 `for(key in Object)` 獲取簡單可沒舉成員，
             *
             * @alias Object.assignEacy
             * @func  Object.assignEacy
             * @param {(Object|Array)} [target] - 目標物件。
             * 若 `this` 非指向 `Object` 則此物件可省略， 預設值為 `this`。
             * @param {...(Object|Array)} source - 來源物件。
             * @return {(Object|Array)} 回傳第一項參數。
             */
            .addProp( Object, 'assignEacy',
                function assignEacy( anyTarget ) {
                    var idx = 1;

                    if ( this !== Object ) {
                        idx = 0;
                        anyTarget = this;
                    }

                    if ( anyTarget == null || typeof anyTarget !== 'object' )
                        throw Error( 'Illegal invocation.' );

                    var len, key, val;

                    for ( len = arguments.length; idx < len ; idx++ ) {
                        val = arguments[ idx ];

                        if ( val == null || typeof val !== 'object' )
                            throw Error( 'Illegal invocation.' );

                        for ( key in val ) anyTarget[ key ] = val[ key ];
                    }

                    return anyTarget;
                }
            )
            /**
             * 簡單深層讓渡：
             * 用 `for(key in Object)` 獲取簡單可沒舉成員，
             * 並對 `Array`、`Object` 深入讀取。
             *
             * @alias Object.assignEacyDeep
             * @func  Object.assignEacyDeep
             * @param {(Object|Array)} [target] - 目標物件。
             * 若 `this` 非指向 `Object` 則此物件可省略， 預設值為 `this`。
             * @param {(Object|Array)} source - 來源物件。
             * @param {Function} [isOwnProperty] - 判斷是否擁有成員。
             * @return {(Object|Array)} 回傳第一項參數。
             */
            .addProp( Object, 'assignEacyDeep',
                function assignEacyDeep( anyTarget, anySource, fnIsOwnProperty ) {
                    if ( this !== Object ) {
                        fnIsOwnProperty = anySource;
                        anySource = anyTarget;
                        anyTarget = this;
                    }

                    if (   anyTarget == null || typeof anyTarget !== 'object'
                        || anySource == null || typeof anySource !== 'object' )
                        throw Error( 'Illegal invocation.' );

                    fnIsOwnProperty
                        = fnIsOwnProperty
                        || function ( anyTarget, anyKey ) {
                            return anyTarget.hasOwnProperty( key );
                        };

                    var key, valT, valS;
                    var isDeepRead;

                    for ( key in anySource ) {
                        valT = valS = '';
                        valS = anySource[ key ];
                        isDeepRead = false;

                        if ( fnIsOwnProperty( anyTarget, key ) ) {
                            valT = anyTarget[ key ];
                            isDeepRead = ( valT.constructor === Array  && valS.constructor === Array  )
                                      || ( valT.constructor === Object && valS.constructor === Object );
                        }

                        if ( isDeepRead ) assignEacyDeep( valT, valS, fnIsOwnProperty );
                        else anyTarget[ key ] = valS;
                    }

                    return anyTarget;
                }
            )
        ;
    }(
    // getSupportLite
    function () {
        /**
         * 爪哇腳本語言支援補充 精簡版。
         *
         * @memberof module:support.
         * @class supportLite
         */
        function supportLite() {};

        supportLite.prototype.checkProp = checkProp;

        /**
         * 檢查屬性。
         *
         * @memberof module:support.supportLite#
         * @func checkProp
         * @param {!*} main - 檢查之物件。
         * @param {Array} propertyList - 檢查的屬性名清單。
         * @param {String} noPropOpt - 無屬性時操作。
         * @return {this}
         *
         * @example
         * // 錯誤訊息提供 `%object`、`%propname` 兩個特殊關鍵字可做使用。
         * supportLite
         *     .checkProp(
         *         Object,
         *         [ 'defineProperty' ],
         *         'JS Run Platform Not Support. ( %main.%method )'
         *     )
         *     .checkProp(
         *         Array.prototype,
         *         [ 'filter', 'find', 'map', 'every', 'some' 'reduce' ],
         *         '基礎應用不支持。 ( %main.%method )'
         *     )
         * ;
         */
        function checkProp( anyMain, arrPropList, strNoPropOpt ) {
            checkProp._main = anyMain;
            checkProp._noPropOpt = strNoPropOpt || 'JS Not Support. (%object).(%propname)';
            arrPropList.some( checkProp._check );

            return this;
        }

        checkProp._main = null;
        checkProp._noPropOpt = null;
        checkProp._check = (function ( strPropName ) {
            var anyMain = this._main;

            if ( strPropName in anyMain ) return false;

            var objectInfo = Object.prototype.toString( anyMain ).replace( /\[(.+)\]/, '$1' );
            var err = Error(
                this._noPropOpt
                    .replace( /%object/g, objectInfo )
                    .replace( /%propname/g, strPropName )
            );
            err.object = anyMain;
            err.propname = strPropName;
            throw err;
        }).bind( checkProp );

        /**
         * 增加屬性： 直接將屬性讓渡給指定物件。
         *
         * @memberof module:support.supportLite#
         * @func addProp
         * @param {!*} main - 檢查之物件。
         * @param {String} propName - 檢查的屬性名。
         * @param {*} prop - 補充的屬性。
         * @return {this}
         */
        supportLite.prototype.addProp = function addProp( anyMain, strPropName, anyProp ) {
            if ( !( strPropName in anyMain ) ) anyMain[ strPropName ] = anyProp;
            return this;
        };

        /**
         * 客製化屬性： 以函式回傳值為屬性渡給指定物件。
         *
         * @memberof module:support.supportLite#
         * @func customProp
         * @param {!*} main - 檢查之物件。
         * @param {String} propName - 檢查的屬性名。
         * @param {Function} custom - 客製化的屬性。
         * @return {this}
         */
        supportLite.prototype.customProp = function customProp( anyMain, strPropName, fnCustom ) {
            if ( !( strPropName in anyMain ) ) fnCustom( anyMain, strPropName );
            return this;
        };

        /**
         * 增加原型鏈屬性： 自動將檢查之物件對象換作指定物件的原型鏈。
         * 參數見 {@link module:support.supportLite#addProp|supportLite#addProp} 。
         *
         * @memberof module:support.supportLite#
         * @func addProtoProp
         * @return {this}
         */
        supportLite.prototype.addProtoProp = function addProtoProp( anyMain, strPropName, anyProp ) {
            anyMainProto = anyMain.prototype;
            return this.customProp(
                anyMainProto, strPropName,
                function ( anyMain, strPropName ) {
                    Object.defineProperty( anyMain, strPropName, {
                        configurable: true,
                        enumerable: true,
                        value: anyProp,
                    } );
                }
            );
        };

        /**
         * 客製化原型鏈屬性： 自動將檢查之物件對象換作指定物件的原型鏈。
         * 參數見 {@link module:support.supportLite#customProp|supportLite#customProp} 。
         *
         * @memberof module:support.supportLite#
         * @func customProtoProp
         * @return {this}
         */
        supportLite.prototype.customProtoProp = function customProtoProp( anyMain, strPropName, fnCustom ) {
            anyMainProto = anyMain.prototype;
            return this.customProp( anyMainProto, strPropName, fnCustom );
        };

        return new supportLite;
    }
    );
} );

