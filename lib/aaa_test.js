//
// 測試區
//


// function test_spreadsheet() {
//     var valTime;
//     var timeStamp, nowRow, newLine, testValues;
//     var dbsA, dbsB;
//     var dbKey, dbsA_nowRow, dbsB_nowRow;
//     var dbSheet_relationalTest = dbsA = gasdb( 'webRecorder', 'relationalTest' );
//     var dbSheet_test           = dbsB = gasdb( 'webRecorder', 'test' );
//
//     // 多行新增, 單格讀取
//     timeStamp = getTimeStamping();
//     dbsA_nowRow = dbKey = dbsA.RowNew();
//     dbsB_nowRow = dbsB.RowNew();
//     dbSheet_relationalTest.update( [ dbsA_nowRow, 3 ], [
//         [
//             dbKey, timeStamp.time, timeStamp.readable, '測試', 'assistant', 'dbCRUD 刪除',
//             '---', '---',
//             dbsB.getUrlLinkFunc( dbsB_nowRow, dbKey ),
//         ], [
//             dbKey + 1, timeStamp.time, timeStamp.readable, '測試', 'assistant', 'dbCRUD 更新',
//             '等待', '',
//             dbsB.getUrlLinkFunc( dbsB_nowRow + 1, dbKey + 1 ),
//         ], [
//             dbKey + 2, timeStamp.time, timeStamp.readable, '測試', 'assistant', 'dbCRUD 更新',
//             '等待', '',
//             dbsB.getUrlLinkFunc( dbsB_nowRow + 2, dbKey + 2 ),
//         ],
//     ] );
//     dbSheet_test.update( [ dbsB_nowRow, 3 ], [
//         [
//             /* 8 */ dbKey, '', '', '測試', 'assistant', '引索', '', '',
//             /* 8 */ '長', '度', '不', '足', '測試', '一定要', '補', '足',
//             /* 8 */ '', '這', '行', '沒有', '被', '正確', '刪', '除',
//             /* 2 */ '', '',
//         ], [
//             dbKey + 1, '', '', '測試', 'assistant', '引索', '', '',
//             '擊鼓', '其鏜', '踴躍', '用兵', '土國', '城漕', '我獨', '南行',
//             '從孫', '子仲', '平陳', '與宋', '不我', '以歸', '憂心', '有忡',
//             '->', '下行接續',
//         ], [
//             dbKey + 2, '', '', '測試', 'assistant', '引索', '', '',
//             '爰居', '爰處', '爰喪', '其馬', '于以', '求之', '于林', '之下',
//             '死生', '契闊', '與子', '成說', '執子', '之手', '與子', '偕老',
//             '->', '未完待續',
//         ],
//     ] );
//     valTime = +new Date() - timeStamp.time;
//     dbSheet_relationalTest.updateRange( [ dbsA_nowRow, 7, 3, 2 ], [
//         [ dbsA.readRange( [ dbsA_nowRow, 7 ] ), '--' ],
//         [ '成功', valTime ],
//         [ '成功', valTime ],
//     ] );
//
//     // 單行新增
//     timeStamp = getTimeStamping();
//     dbsA_nowRow = dbKey = dbsA.RowNew();
//     dbsB_nowRow = dbsB.RowNew();
//     dbSheet_relationalTest.create( [
//         dbKey, timeStamp.time, timeStamp.readable, '測試', 'assistant', 'dbCRUD 新增',
//         '等待', '',
//         dbsB.getUrlLinkFunc( dbsB_nowRow, dbKey ),
//     ] );
//     dbSheet_test.create( [
//         /* 8 */ dbKey, '', '', '測試', 'assistant', '引索', '', '',
//         /* 6 */ 'dbId', dbsA.dbId, '', 'tableId', dbsA.tableId,  '',
//         /* 3 */ 'tableName', dbsA.tableName, '',
//         /* 3 */ 'dbUrl', dbsA.url, '',
//         /* 6 */ '', '', '', '', '', '',
//     ] );
//     valTime = +new Date() - timeStamp.time;
//     dbSheet_relationalTest.updateRange( [ dbsA_nowRow, 7, 1, 2 ], [
//         [ '成功', valTime ],
//     ] );
//
//     // 讀取, 刪除, 如果連結沒有帶 key 值將有可能產生嚴重錯誤
//     timeStamp = getTimeStamping();
//
//     var updateRowIdx = [];
//     var jsTable_relationalTest;
//
//     jsTable_relationalTest = dbSheet_relationalTest.read( [ 1, dbsA.RowLast() ] );
//     jsTable_test_key = dbSheet_relationalTest.readRange( [ 1, 1, dbsA.RowLast(), 1 ] );
//     jsTable_relationalTest.reduce(
//         function ( arrUpdateRowIdx, val, idx ) {
//             if ( val[ 6 ] !== '---' ) return arrUpdateRowIdx;
//
//             var dbKey = val[ 0 ];
//             var rowIdx = jsTable_test_key.find( function ( val ) {
//                 return val [ 0 ] === dbKey;
//             } );
//
//             dbSheet_test.remove( rowIdx );
//             arrUpdateRowIdx.push( idx );
//
//             return arrUpdateRowIdx;
//         },
//         updateRowIdx
//     );
//     valTime = +new Date() - timeStamp.time;
//     updateRowIdx.forEach( function ( val ) {
//         dbSheet_relationalTest.updateRange( [ val, 8 ], [ valTime ] );
//         // 刪除超連結
//         // dbSheet_relationalTest.updateRange( [ idx + 1, 9 ], [ '' ] );
//     } );
//
//     return 'ok';
// }


// function test_webRecorder() {
//     var valTime = +new Date();
//     var assistantWebRecorder = new webRecorder(
//         '程式腳本助理',
//         '測試',
//         {
//             "queryString": "username=jsmith&age=21&age=49",
//             "parameter": {
//                 "username": "jsmith",
//                 "age": "21"
//             },
//             "contextPath": "",
//             "parameters": {
//                 "username": [ "jsmith" ],
//                 "age": [ "21", '49' ]
//             },
//             "contentLength": -1
//         }
//     );
//
//     assistantWebRecorder.replyState(
//         '網路黑盒子測試', '成功', +new Date() - valTime
//     );
// }


// function test_UrlFetchApp() {
//     var url, fhr;
//     var valTime = +new Date();
//
//     url = 'https://tool.magiclen.org/ip';
//     url = 'http://creativecommons.tw/sites/creativecommons.tw/files/logo_0.png';
//
//     var fhr = new gasFetch(
//         'assistant', '測試', 'UrlFetchApp 文字',
//         url
//     );
//
//     fhr.replyState( '成功', +new Date() - valTime );
// }

