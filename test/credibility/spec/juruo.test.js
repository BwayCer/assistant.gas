import assert from 'assert';
import * as gaser from '../../../src/main.js';


describe('juruo 蒟蒻', function () {
  let need = {
    juruo: null,
  };

  beforeEach(function () {
    // NOTE:
    // 本想基於一次性使用的概念在每次循環都建立新的方法，
    // 但由於需要 babel 而作罷。
    need.juruo = new gaser.Juruo();
    need.juruo.set({__undefined: 'Unexpected log message.'});
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

