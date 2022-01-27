'use strict';


const _conf = {
  "spreadsheet": {
    "test": {
      "id": "1U2xpIxpEO5c8qLtlhODJquKl_JYCXqozQ2bUu3sbe-8",
      "tables": {
        "gasdb": "Gasdb",
      },
    },
    "webRecorder": {
      "id": "1U2xpIxpEO5c8qLtlhODJquKl_JYCXqozQ2bUu3sbe-8",
      "tables": {
        "track": "Track",
        "error": "Error",
      },
    },
  },
};


function v8Test() {
  console.log(Object.assign({}, {a: 1}, {a: 2, b: 2}));
  console.log(Reflect.apply(Math.floor, undefined, [1.75]));
}

function pureTest() {
  const {
    juruoReplace,
  } = assistant;


  _runTest('/', [
    {
      title: 'juruo 蒟蒻',
      describes: [
        {
          title: '設定與取得語言包',
          its: [
            {
              title: '參數設定並取得語言包',
              fn() {
                assert.strictEqual(
                  juruoReplace('Im {{name}}.', {name: 'BwayCer'}),
                  'Im BwayCer.',
                  '不符合預期。'
                );
                assert.strictEqual(
                  juruoReplace('Im {{name}}.', {}),
                  'Im {{name}}.',
                  '不符合預期的無參數時不替換任何文字。'
                );
              },
            },
          ],
        },
      ],
    },
  ]);
}

function gasTest() {
  const {
    crypto,
    Gasdb, GasWebRecorder,
  } = assistant;


  Gasdb.setSheetConfig(_conf.spreadsheet);

  let _conf_webRecorder = {
    request: {
      'queryString': 'username=jsmith&age=21&age=49',
      'parameter': {
        'username': 'jsmith',
        'age': '21'
      },
      'contextPath': '',
      'parameters': {
        'username': ['jsmith'],
        'age': ['21', '49']
      },
      'contentLength': -1,
    },
  };

  _runTest('/', [
    {
      title: 'crypto 加密',
      its: [
        {
          title: 'md5',
          fn() {
            assert.strictEqual(
              crypto.md5('abcdefg'),
              '7ac66c0f148de9519b8bd264312c4d64',
              '不符合預期。'
            );
          },
        },
      ],
    },
    {
      title: 'Gasdb 谷歌腳本資料庫',
      its: [
        {
          title: 'gasdb.create',
          fn() {
            let dbSheet = new Gasdb('test', 'gasdb');
            let dbKey = Gasdb.getNewDbKey(dbSheet);
            let newData = [
              dbKey,
              (new Date()).toISOString(),
              '測 1',
              '測 2',
            ];
            dbSheet.create(dbSheet.fill(newData));

            let data = dbSheet.readRange([dbSheet.RowLast(), 1, 1, 4]);
            assert.deepEqual(
              data, [newData],
              '`gasdb.create` 不符合預期。'
            );
          },
        },
        {
          title: 'gasdb.update',
          fn() {
            let dbSheet = new Gasdb('test', 'gasdb');
            let dbKey = Gasdb.getNewDbKey(dbSheet);
            let rowNew = dbSheet.RowNew();

            let data;
            let addData = dbSheet.fillRows([
              [dbKey,     '測 rm1'],
              [dbKey + 1, '測 rm2'],
            ]);
            let clearData = dbSheet.fillRows([[], []]);

            dbSheet.update([rowNew, 2], addData);
            data = dbSheet.read([rowNew, 2]);
            assert.deepEqual(
              data, addData,
              '`gasdb.update` 不符合預期的寫入。'
            );

            dbSheet.update([rowNew, 2], clearData);
            data = dbSheet.read([rowNew, 2]);
            assert.deepEqual(
              data, clearData,
              '`gasdb.update` 不符合預期的清除。'
            );
          },
        },
      ],
    },
    {
      title: 'GasWebRecorder 網路黑盒子',
      its: [
        {
          title: 'gasWebRecorder.receiver Success',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let receiver = webRecorder.receiver(
              'Receiver Success',
              function (request) {
                debugger;
              }
            );

            receiver(_conf_webRecorder.request);
          },
        },
        {
          title: 'gasWebRecorder.receiver Error',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let receiver = webRecorder.receiver(
              'Receiver Error',
              function (request) {
                throw TypeError('Illegal invocation.');
              }
            );

            assert.throws(
              () => receiver(_conf_webRecorder.request),
              function (err) {
                return (
                  err instanceof TypeError
                  && !!~err.message.indexOf('Illegal invocation.')
                );
              },
              '不符合預期的錯誤。'
            );
          },
        },
        {
          title: 'gasWebRecorder.trigger Success',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let action = webRecorder.trigger(
              'Trigger Success',
              function () {
                debugger;
              }
            );

            action();
          },
        },
        {
          title: 'gasWebRecorder.trigger Error',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let action = webRecorder.trigger(
              'Trigger Error',
              function () {
                throw TypeError('Illegal invocation.');
              }
            );

            assert.throws(
              () => action(),
              function (err) {
                return (
                  err instanceof TypeError
                  && !!~err.message.indexOf('Illegal invocation.')
                );
              },
              '不符合預期的錯誤。'
            );
          },
        },
        {
          title: 'gasWebRecorder.fetch Success',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let url = 'https://tool.magiclen.org/ip/';
            let options = null;
            let fhrData = webRecorder.fetch(
              'Fetch Success', url, options,
              'NotShow', 'Text'
            );
          },
        },
        {
          title: 'gasWebRecorder.fetch Image Success',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let url = 'http://img1.gamersky.com/image2018/07/20180707_xdj_187_9/image002_S.jpg';
            let options = null;
            let fhrData = webRecorder.fetch(
              'Fetch Success', url, options,
              'NotShow', 'Blob'
            );
            // 儲存圖片
            // let imageBlob = fhrData.info.getAs(fhrData.contentType);
            // DriveApp.createFile(imageBlob);
          },
        },
        {
          title: 'gasWebRecorder.fetch Post Success',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let url = 'https://api.telegram.org/bot373213534:AAEmUiQkoFeqCpfN9dV3r67O3BOqZ03sJh4/sendMessage';
            let postBody = {
              chat_id: '281634169',
              // chat_id: '-194592154', //普群識別碼 留存
              // chat_id: '-1001325775761',
              parse_mode: 'Markdown',
              text: 'hi',
            };
            let options = {
              method: 'post',
              contentType: 'application/json',
              payload: JSON.stringify(postBody),
            };
            let fhrData = webRecorder.fetch(
              'Fetch Success', url, options,
              'Text', 'Text'
            );
          },
        },
        {
          title: 'gasWebRecorder.fetch Error',
          fn() {
            let webRecorder = new GasWebRecorder('webRecorder');
            let url = 'https://httpstat.us/404';
            let options = {muteHttpExceptions: true};
            let fhrData = webRecorder.fetch(
              'Fetch Error', url, options,
              'NotShow', 'Text'
            );
          },
        },
      ],
    },
  ]);
}

function _runTest(title, groups) {
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
      _runTest(groupTitle, group.describes);
    }
  }
}

