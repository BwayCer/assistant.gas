'use strict';


function v8Test() {
  console.log(Object.assign({}, {a: 1}, {a: 2, b: 2}));
  console.log(Reflect.apply(Math.floor, undefined, [1.75]));
}

function pureTest() {
  (function runTest(title, groups) {
    let topTitle = title + ' > ';
    for (let group of groups) {
      let groupTitle = topTitle + group.title;
      console.log(groupTitle);

      if (Reflect.has(group, 'its')) {
        for (let item of group.its) {
          let itemTitle = groupTitle + ' > ' + item.title;
          console.log(itemTitle);
          item.fn();
          console.log('ok: ' + item.title);
        }
      }
      if (Reflect.has(group, 'describes')) {
        runTest(groupTitle, group.describes);
      }
    }
  })('/', [
    {
      title: 'juruo 蒟蒻',
      describes: [
        {
          title: '設定與取得語言包',
          its: [
            {
              title: '取得不存在的語言包會取得 "Unexpected log message." 訊息',
              fn() {
                assert.strictEqual(
                  gaser.juruo.get('bway'),
                  'Unexpected log message.',
                  '不符合預期。'
                );
              },
            },
            {
              title: '普通設定並取得語言包',
              fn() {
                gaser.juruo.set('bway', 'Im BwayCer.');
                assert.strictEqual(
                  gaser.juruo.get('bway'),
                  'Im BwayCer.',
                  '不符合預期。'
                );
              },
            },
            {
              title: '參數設定並取得語言包',
              fn() {
                gaser.juruo.set('who', 'Im {name}.');
                assert.strictEqual(
                  gaser.juruo.get('who', {name: 'BwayCer'}),
                  'Im BwayCer.',
                  '不符合預期。'
                );
                assert.strictEqual(
                  gaser.juruo.get('who'),
                  'Im {name}.',
                  '不符合預期的無參數時不替換任何文字。'
                );
              },
            },
          ],
        },
      ],
    }
  ]);
}

function gasTest() {
  gaser.juruo.set('who', 'Im {name}.');
  console.log(gaser.juruo.get('who', {name: 'BwayCer'}));
}

