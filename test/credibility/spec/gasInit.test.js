
describe('gasInit 初始化', function () {
    let need = {
        gasOrder: null,
        recordOrder: '',
    };
    let beforInfo = function () {
        let moduleInfo = ['A', 'B', 'C', 'D', 'E'].map(val => {
            return {
                id: 'test/' + val,
                factory: function (deps) {
                    need.recordOrder += val;
                    deps[val] = val;
                },
            };
        });

        return {
            moduleInfo,
        };
    }();

    beforeEach(function () {
        // "gasOrder" 基於一次性使用的概念上，
        // 所以以重新讀取方式重建。
        let gasGlobal = requireEval(['./src/gasInit.js'], ['gasOrder']);

        need.gasOrder = gasGlobal.gasOrder;
        // gasOrder 增加模組的方式
        beforInfo.moduleInfo.forEach(item => {
            need.gasOrder(item.id, item.factory);
        });

        need.recordOrder = '';
    });

    it('"gasOrder"、"gasLog" 是否載入', function () {
        assert.strictEqual(typeof need.gasOrder, 'function', '"gasOrder" 模組不存在。');

        let deps = {};
        need.gasOrder.menu('DEVELOPMENT', ['assistant/gasLog'], deps);
        assert.strictEqual(typeof deps.gasLog, 'function', '"gasLog" 模組不存在。');
    });

    describe('環境設定', function () {
        let envTestSet = function (envState) {
            let isHasNotify = false;
            need.gasOrder.menu(envState, [], function (deps) {
                isHasNotify = true;
                assert.strictEqual(
                    deps.env,
                    deps.envStateInfo[envState],
                    `"${envState}" 環境參數不符合預期。`
                );
            });
            assert.ok(isHasNotify, '測試程式執行不完全。');
        };

        it('正式環境 "PRODUCTION"', function () {
            envTestSet('PRODUCTION');
        });

        it('開發環境 "DEVELOPMENT"', function () {
            envTestSet('DEVELOPMENT');
        });

        it('測試環境 "TEST"', function () {
            envTestSet('TEST');
        });

        it('錯誤測試： 不存在的環境 "BWAY"', function () {
            let isNotHasNotify = true;
            let isHasCatchError = false;
            let envState = 'BWAY';
            try {
                need.gasOrder.menu(envState, [], function () {
                    isNotHasNotify = false;
                });
            } catch (err) {
                isHasCatchError = true;
                assert.strictEqual(
                    err.name,
                    'TypeError',
                    '不符合預期的錯誤類型。'
                );
                assert.strictEqual(
                    err.message,
                    'The "envState" argument must be of "PRODUCTION|DEVELOPMENT|TEST".'
                        + ' Received "BWAY" value.',
                    '不符合預期的錯誤類型。'
                );
            }
            assert.ok(isHasCatchError, '應捕獲而未捕獲的錯誤。');
            assert.ok(isNotHasNotify, '"notify" 函式不應執行而執行的錯誤。');
        });
    });

    describe('讀取順序', function () {
        let orderTestSet = function (orderDepList) {
            let deps = {};
            need.gasOrder.menu(
                'DEVELOPMENT',
                orderDepList.map(val => { return 'test/' + val; }),
                deps
            );

            assert.strictEqual(
                need.recordOrder,
                orderDepList.join(''),
                '不符合預期的執行順序。'
            );
            assert.deepEqual(
                deps,
                orderDepList.reduce((expected, val) => {
                    expected[val] = val;
                    return expected;
                }, Object.assign({}, deps)),
                '不符合預期的模組。'
            );
        };

        it('全部讀取', function () {
            orderTestSet(['A', 'B', 'C', 'D', 'E']);
        });

        it('反序全部讀取', function () {
            orderTestSet(['E', 'D', 'C', 'B', 'A']);
        });

        it('跳躍讀取', function () {
            orderTestSet(['A', 'C', 'E']);
        });

        it('錯誤測試： 調用菜單多次', function () {
            let isNotHasNotify = true;
            let isHasCatchError = false;
            try {
                need.gasOrder.menu('DEVELOPMENT', [], {});
                need.gasOrder.menu('DEVELOPMENT', [], function () {
                    isNotHasNotify = false;
                });
            } catch (err) {
                isHasCatchError = true;
                assert.strictEqual(
                    err.name,
                    'Error',
                    '不符合預期的錯誤類型。'
                );
                assert.strictEqual(
                    err.message,
                    'There\'s only one to call `gasOrder#menu`.',
                    '不符合預期的錯誤類型。'
                );
            }
            assert.ok(isHasCatchError, '應捕獲而未捕獲的錯誤。');
            assert.ok(isNotHasNotify, '"notify" 函式不應執行而執行的錯誤。');
        });
    });

    describe('"assistant/gasLog" 紀錄', function () {
        it('讀取順序紀錄', function () {
            let deps = {};
            let orderDepList = ['A', 'C', 'E'];

            need.gasOrder.menu(
                'DEVELOPMENT',
                ['assistant/gasLog'].concat(
                    orderDepList.map(val => { return 'test/' + val; })
                ),
                deps
            );

            let logGasOrder = deps.gasLog._cache.gasOrder;
            let lenLogGasOrder = logGasOrder.length;
            assert.deepEqual(
                logGasOrder,
                orderDepList.reduce((expected, val, idx) => {
                    let reviseIdx = lenLogGasOrder - 1 - (1 * idx);
                    expected[reviseIdx][2] = 'start: test/' + val;
                    expected[reviseIdx - 1][2] = 'done: test/' + val;
                    return expected;
                }, Object.assign([].concat(logGasOrder), logGasOrder)),
                '不符合預期。'
            );
        });
    });
});

