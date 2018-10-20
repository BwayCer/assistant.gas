
describe('gasRouter 谷歌腳本路由器', function () {
    let need = {
        GasRouter: function () {
            let deps = {};
            let gasGlobal = requireEval([
                './src/gasInit.js',
                './src/supportLite.js',
                './src/support.js',
                './src/juruo.js',
                './src/gasRouter.js',
            ], ['gasOrder']);
            gasGlobal.gasOrder.menu('DEVELOPMENT', [
                'assistant/supportLite',
                'assistant/support',
                'assistant/juruo',
                'assistant/gasRouter',
            ], deps);

            return deps.GasRouter;
        }(),
        gasRouter: null,
    };

    // beforeEach(function () {
    //     need.gasRouter = new need.GasRouter();
    // });

    it('"GasRouter" 是否載入', function () {
        assert.strictEqual(typeof need.GasRouter, 'function', '"GasRouter" 模組不存在。');
    });

    it('確認執行路徑', function () {
        let router = new need.GasRouter();
        // 以記憶體位置確認
        let checkRequest = {method: 'path'};
        let checkOutputInfo = {};
        let checkData = {};
        let checkOutputValue = {};

        // 創建資訊格式
        router.createOutputInfo = function (requestInfo) {
            // 介面必要值
            checkOutputInfo.requestList = [requestInfo];
            // 非必要，模擬使用情境
            checkOutputInfo.data = [];
            return checkOutputInfo;
        };

        // 依接收值執行相關處理
        router.call = function (outputInfo, request) {
            assert.ok(
                outputInfo === checkOutputInfo,
                '"outputInfo" 參數不符合預期的接收值。（非同一記憶體位置物件）'
            );
            assert.ok(
                request === checkRequest,
                '"request" 參數不符合預期的接收值。（非同一記憶體位置物件）'
            );

            var method = request && request.method;
            if (this._cache.hasOwnProperty(method)) {
                outputInfo.data.push(this._cache[method](request));
            } else {
                outputInfo.data.push(null);
            }
        };

        // 輸出
        router.outputHandle = function (outputInfo) {
            assert.ok(
                outputInfo === checkOutputInfo,
                '"outputInfo" 參數不符合預期的接收值。（非同一記憶體位置物件）'
            );
            assert.ok(
                outputInfo.data[0] === checkData,
                '"outputInfo.data[0]" 不符合預期的接收值。（非同一記憶體位置物件）'
            );
            return checkOutputValue;
        };

        router
            .add(checkRequest.method, function () {
                return checkData;
            })
        ;

        assert.ok(
            router.input(checkRequest) === checkOutputValue,
            '"router#input" 回傳值不符合預期的接收值。（非同一記憶體位置物件）'
        );
    });
});

