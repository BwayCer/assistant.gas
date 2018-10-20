
// 參考性質，建議依需求添加即可

gasOrder('assistant/support', function (deps) {
    deps.supportLite
        .checkProp(
            Object,
            ['defineProperty']
        )
        .customProp(String.prototype, 'repeat',
            function (anyMain, strPropName) {
                var anyProp = function (count) {
                    if (this == null) {
                        throw new TypeError(
                            'TypeError: String.prototype.repeat'
                            + 'called on null or undefined'
                        );
                    }
                    var str = '' + this;
                    count = +count;
                    if (count != count) {
                        count = 0;
                    }
                    if (count < 0 || count == Infinity) {
                        throw new RangeError( 'Invalid count value' );
                    }
                    count = Math.floor(count);
                    if (str.length == 0 || count == 0) {
                        return '';
                    }
                    // 確保 count 為 31-bit 的數值。
                    // 當前 (2014.08) 瀏覽器無法處理大於 1 << 28  的字符。
                    if (str.length * count >= 1 << 28) {
                        throw new RangeError( 'repeat count must not overflow maximum string size' );
                    }
                    var idx;
                    var rpt = '';
                    for (idx = 0; idx < count; idx++) {
                        rpt += str;
                    }
                    return rpt;
                };

                Object.defineProperty(anyMain, strPropName, {
                    configurable: true,
                    enumerable: true,
                    value: anyProp,
                });
            }
        )

        .customProp(Array.prototype, 'findIndex',
            function () {
                function arrayFindIndex(self, fnFind, anySelf) {
                    if (typeof fnFind !== 'function')
                        throw TypeError('first argument is not a function');

                    var lenSelf = self.length;

                    if (!(self instanceof Array && 0 < lenSelf))
                        return -1;

                    var isBindSelf = arguments.length > 1;
                    var isFind = false;
                    var idx = 0;

                    while (idx < lenSelf) {
                        isFind = !!( isBindSelf
                            ? fnFind.call(anySelf, self[idx], idx, self)
                            : fnFind(anySelf, self[idx], idx, self));

                        if (isFind) return idx;
                        idx++;
                    }

                    return -1;
                }

                Array.prototype.findIndex = function findIndex(fnFind, anySelf) {
                    return arrayFindIndex(this, fnFind, anySelf);
                };
                Array.prototype.find = function find(fnFind, anySelf) {
                    var idx = arrayFindIndex(this, fnFind, anySelf);
                    if (~idx) return this[idx];
                    else return undefined;
                };
            }
        )

        /**
         * 簡單讓渡：
         * 用 `for(key in Object)` 獲取簡單可枚舉成員，
         *
         * @alias Object.assignEacy
         * @func  Object.assignEacy
         * @param {(Object|Array)} [target] - 目標物件。
         * 若 `this` 非指向 `Object` 則此物件可省略， 預設值為 `this`。
         * @param {...(Object|Array)} source - 來源物件。
         * @return {(Object|Array)} 回傳第一項參數。
         */
        .addProp(Object, 'assign',
            function assignEacy(target) {
                var idx = 1;

                if ( this !== Object ) {
                    idx = 0;
                    target = this;
                }

                if (target == null || typeof target !== 'object')
                    throw Error('Illegal invocation.');

                var len, key, val;

                for (len = arguments.length; idx < len ; idx++) {
                    val = arguments[idx];

                    if (val == null || typeof val !== 'object')
                        throw Error('Illegal invocation.');

                    for (key in val) target[key] = val[key];
                }

                return target;
            }
        )
    ;

    var _support = deps._support = {};

    /***
     * 空枚舉： 創建一個「乾淨」的空物件陣列。
     * <br>
     * 其運用實例實作比調用 `Object.create( null )` 更有效率。（翻譯自 node 注釋）
     *
     * @see [nodejs/node v7.x > events.js#L5 - GitHub]{@link https://github.com/nodejs/node/blob/v7.x/lib/events.js#L5}
     *
     * @func emptyEnum
     */
    _support.emptyEnum = function emptyEnum() {};
    _support.emptyEnum.prototype = Object.create(null);

    /***
     * 陣列的重新包裝。
     *
     * @func rewrapArr
     * @param {Array} source - 複製目標對象。
     * @return {Array}
     */
    _support.rewrapArr = function rewrapArr(source) {
        var len = source.length;
        var arrAns = new Array(len);

        while (len--) arrAns[len] = source[len];
        return arrAns;
    };

    /***
     * 一單位接合。
     * 其效率比 `Array#splice` 使用兩個參數的狀況還快約 1.5 倍。（翻譯自 node 注釋）
     * <br>
     * 但測試結果，陣列項目需少於 16 樣時才有明顯效果。
     * 當陣列長度為 16 時，效率與 `Array#splice` 相比可達近一倍快，且項目愈少愈快。
     *
     * @see [nodejs/node v8.x > events.js#L492 - GitHub]{@link https://github.com/nodejs/node/blob/v8.x/lib/events.js#L492}
     *
     * @func spliceOne
     * @param {Array} list - 目標陣列。
     * @param {Number} index - 刪除項目的引索位置。
     * @return {?*} 移除的物件。
     */
    _support.spliceOne = function spliceOne(list, index) {
        if (index === -1) return null;

        var idx = index;
        var len = list.length - 1;
        var anyAns = list[idx];

        while (idx < len) list[idx] = list[++idx];
        list.pop();

        return anyAns;
    };
} );

