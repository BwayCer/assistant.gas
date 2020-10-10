
/**
 * 爪哇腳本語言支援補充 精簡版。
 *
 * @memberof module:assistant.
 * @var {Object} supportLite
 */
export default {
    /**
     * 檢查屬性。
     *
     * @memberof! module:assistant.
     * @alias supportLite.checkProp
     * @func  supportLite.checkProp
     * @param {!*} main - 檢查之物件。
     * @param {Array} propertyList - 檢查的屬性名清單。
     * @param {String} noPropOpt - 無屬性時操作。
     * @throws {Error} JS Not Support. (%object).(%propname)。
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
    checkProp: function checkProp(anyMain, propertyList, strNoPropOpt) {
        var noPropOpt = strNoPropOpt || 'JS Not Support. (%object).(%propname)';

        propertyList.some(function (strPropName) {
            if (strPropName in anyMain) return false;

            var objectInfo = Object.prototype
                .toString.call(anyMain).replace(/\[(.+)\]/, '$1');
            var err = Error(
                noPropOpt
                    .replace(/%object/g, objectInfo)
                    .replace(/%propname/g, strPropName)
            );
            err.object = anyMain;
            err.propname = strPropName;
            throw err;
        });

        return this;
    },

    /**
     * 增加屬性： 直接將屬性讓渡給指定物件。
     *
     * @memberof! module:assistant.
     * @alias supportLite.addProp
     * @func  supportLite.addProp
     * @param {!*} main - 檢查之物件。
     * @param {String} propName - 檢查的屬性名。
     * @param {*} prop - 補充的屬性。
     * @return {this}
     */
    addProp: function addProp(anyMain, propName, prop) {
        if (!(propName in anyMain)) anyMain[propName] = prop;
        return this;
    },

    /**
     * 客製化屬性： 以函式回傳值為屬性渡給指定物件。
     *
     * @memberof! module:assistant.
     * @alias supportLite.customProp
     * @func  supportLite.customProp
     * @param {!*} main - 檢查之物件。
     * @param {String} propName - 檢查的屬性名。
     * @param {Function} custom - 客製化的屬性。
     * @return {this}
     */
    customProp: function customProp(anyMain, propName, custom) {
        if (!(propName in anyMain)) custom(anyMain, propName);
        return this;
    },
};

