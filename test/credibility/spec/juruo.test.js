
describe('juruo 蒟蒻', function () {
    let need = {
        juruo: null,
    };

    beforeEach(function () {
        // "juruo" 基於一次性使用的概念上，
        // 所以以重新讀取方式重建。
        let deps = {};
        let gasGlobal = requireEval([
            './src/gasInit.js',
            './src/supportLite.js',
            './src/support.js',
            './src/juruo.js',
        ], ['gasOrder']);
        gasGlobal.gasOrder.menu('DEVELOPMENT', [
            'assistant/supportLite',
            'assistant/support',
            'assistant/juruo',
        ], deps);

        need.juruo = deps.juruo;
    });

    it('"juruo" 是否載入', function () {
        assert.strictEqual(typeof need.juruo, 'object', '"juruo" 模組不存在。');
        assert.strictEqual(
            need.juruo.constructor.name, 'Juruo', '"juruo" 模組不存在。'
        );
    });

    describe('設定與取得語言包', function () {
        it('取得不存在的語言包取得 "Unexpected log message." 訊息', function () {
            assert.strictEqual(
                need.juruo.get('bway'),
                'Unexpected log message.',
                '不符合預期。'
            );
        });

        it('普通設定並取得語言包', function () {
            need.juruo.set('bway', 'Im BwayCer.');
            assert.strictEqual(
                need.juruo.get('bway'),
                'Im BwayCer.',
                '不符合預期。'
            );
        });

        it('參數設定並取得語言包', function () {
            need.juruo.set('who', 'Im {name}.');
            assert.strictEqual(
                need.juruo.get('who', {name: 'BwayCer'}),
                'Im BwayCer.',
                '不符合預期。'
            );
            assert.strictEqual(
                need.juruo.get('who'),
                'Im {name}.',
                '不符合預期的無參數時不替換任何文字。'
            );
        });
    });
});

