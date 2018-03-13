/*! 爪哇腳本語言支援補充 精簡版 Support Lite - BwayCer (https://bwaycer.github.io/) */

'use strict';

assistant.order( 'assistant/supportLite', function () {
    !function ( getSupportLite ) {
        getSupportLite()
            .checkProp(
                Object,
                [ 'defineProperty' ]
            )
            .addProp( Array, 'splice', Array.prototype.splice )
            .addProp( Object, 'setPrototypeOf',
                function ( obj, proto ) {
                    obj.__proto__ = proto;
                    return obj;
                }
            )
        ;
    }(
    // getSupportLite
    function () {
        /**
         * 爪哇腳本語言支援補充 精簡版。
         *
         * @class supportLite
         */
        function supportLite() {};

        supportLite.prototype.checkProp = checkProp;

        /**
         * 檢查屬性。
         *
         * @memberof supportLite#
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
         * @memberof supportLite#
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
         * 增加原型鏈屬性： 自動將檢查之物件對象換作指定物件的原型鏈。
         * 參數見 {@link supportLite#addProp|supportLite#addProp} 。
         *
         * @memberof supportLite#
         * @func addProtoProp
         * @return {this}
         */
        supportLite.prototype.addProtoProp = function addProtoProp( anyMain, strPropName, anyProp ) {
            anyMainProto = anyMain.prototype;
            return this.addProp( anyMainProto, strPropName, anyProp );
        };

        /**
         * 客製化屬性： 以函式回傳值為屬性渡給指定物件。
         *
         * @memberof supportLite#
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
         * 客製化原型鏈屬性： 自動將檢查之物件對象換作指定物件的原型鏈。
         * 參數見 {@link supportLite#customProp|supportLite#customProp} 。
         *
         * @memberof supportLite#
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

