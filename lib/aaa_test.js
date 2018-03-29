//
// 測試區
//


// function test_logCode() {
//     log.tell( 23, '打印訊息： %s', '測試' );
//     var codeInfo = log.codeInfo;
//     if ( codeInfo[ 3 ] !== 3 ) throw Error( '不符合預期。' );
// }


// function test_spreadsheet() {
//     var valTime;
//     var timeStamp;
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


// function test_joinSpreadsheet() {
//     var len, idx, val;
//     var timeStamp, valTime;
//     var testRelationalLine, testContentLine;
//     var joinTable, line, readRelationalLine, readContentLine;
//     var dbsA, dbsA_dbKey, dbsA_newRow;
//     var dbsB, dbsB_dbKey, dbsB_newRow;
//     var dbSheet_relationalTest = dbsA = gasdb( 'webRecorder', 'relationalTest' );
//     var dbSheet_test           = dbsB = gasdb( 'webRecorder', 'test' );
//
//     // 寫入
//     timeStamp = getTimeStamping();
//     dbsA_dbKey   = dbsA.readRange( [ dbsA.RowLast(), 1 ] ) + 1;
//     dbsB_dbKey   = dbsB.readRange( [ dbsB.RowLast(), 1 ] ) + 1;
//     dbsA_newRow = dbsA.RowNew();
//     dbsB_newRow = dbsB.RowNew();
//     testRelationalLine = [
//         dbsA_dbKey, timeStamp.time, timeStamp.readable,
//         '測試', 'assistant', 'join table',
//         '等待', '',
//         dbsB.getUrlLinkFunc( dbsB_newRow, dbsB_dbKey ), dbsB_dbKey,
//     ];
//     testContentLine = [
//         dbsB_dbKey, '', '', '', '', '',
//         '', '',
//         dbsA.getUrlLinkFunc( dbsA_newRow, dbsA_dbKey ), dbsA_dbKey,
//     ];
//     dbSheet_relationalTest.create( testRelationalLine );
//     dbSheet_test.create( dbsB.fill( testContentLine ) );
//
//     valTime = +new Date() - timeStamp.time;
//     testRelationalLine[ 6 ] = '成功';
//     testRelationalLine[ 7 ] = valTime;
//     dbSheet_relationalTest.updateRange( [ dbsA_newRow, 7, 1, 2 ], [
//         [ '成功', valTime ],
//     ] );
//
//     // 讀取
//     readRelationalLine = dbSheet_relationalTest.read( [ dbsA_newRow, 1 ] );
//     readContentLine = dbSheet_test.read( [ dbsB_newRow, 1 ] );
//     joinTable = gasdb.join(
//         [ 0, readRelationalLine ],
//         [ 9, readContentLine, 0 ]
//     );
//     line = joinTable[ 0 ];
//
//     idx = 0;
//     if ( line[ idx ] !== dbsA_dbKey )
//         throw Error( '0: "' + line[ idx ] + '" !== "' + dbsA_dbKey + '"' );
//
//     for ( idx++, len = testRelationalLine.length + 1; idx < len ; idx++ ) {
//         if ( idx === 3 || idx === 9 ) continue;
//         // idx === 3, line[ 3 ] is Date type
//         // idx === 9, Sheet URL Link Function
//
//         val = testRelationalLine[ idx - 1 ];
//         if ( line[ idx ] !== val )
//             throw Error( idx + ': "' + line[ idx ] + '" !== "' + val + '"' );
//     }
//
//     if ( line[ idx ] !== dbsB_dbKey )
//         throw Error( idx + ': "' + line[ idx ] + '" !== "' + dbsB_dbKey + '"' );
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
//     var url, fhr, fetchOpt, receiveContent;
//     var valTime = +new Date();
//
//     url = 'https://tool.magiclen.org/ip';
//     url = 'http://creativecommons.tw/sites/creativecommons.tw/files/logo_0.png';
//     fetchOpt = null;
//     url = 'https://my-json-server.typicode.com/typicode/demo/posts';
//     fetchOpt = {
//         method: 'POST',
//         contentType: 'application/json',
//         payload: JSON.stringify( {
//             goal: "assistant test",
//         } ),
//     };
//     url = 'https://my-json-server.typicode.com/typicode/demo/posts/3';
//     fetchOpt = {
//         method: 'PUT',
//         contentType: 'application/json',
//         payload: JSON.stringify( {
//             goal: "assistant test",
//         } ),
//     };
//
//     var fhr = new gasFetch(
//         'assistant', '測試', 'UrlFetchApp 文字',
//         url, fetchOpt,
//         true, false
//     );
//     fhr.replyRequestContent( 'JSON', fetchOpt.payload );
//
//     if ( !/^2\d{2}$/.test( fhr.statusCode ) ) {
//         fhr.replyState( '失敗', +new Date() - valTime );
//         return;
//     }
//
//     receiveContent = fhr.receive.info.getContentText();
//     fhr.content = JSON.parse( receiveContent );
//
//     fhr.replyState( '成功', +new Date() - valTime );
//     fhr.replyReceiveContent( 'JSON', receiveContent );
// }


// function test_tgBot() {
//     var fhr, payload;
//     var valTime = +new Date();
//
//     payload = {
//         chat_id: _config.tgChatId.bwaycer,
//         parse_mode: 'Markdown',
//         text: '*assistant* 測試',
//     };
//
//     fhr = tgbot(
//         _service, _env, 'tgBot',
//         'child3rd', 'sendMessage',
//         'JSON', payload,
//         true
//     );
//
//     if ( !/^2\d{2}$/.test( fhr.statusCode ) ) {
//         fhr.replyState( '失敗', +new Date() - valTime );
//         return;
//     }
//
//     fhr.replyState( '成功', +new Date() - valTime );
// }

