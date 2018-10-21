
/**
 * 谷歌應用程式腳本助理 Assistant for Apps Script
 *
 * @module assistant
 */

"use strict";

var _service = 'assistant';
var _env = '正式';
// var _env = '測試';

assistant.order(
    'assistant', this, [
        'assistant/supportLite',
        'assistant/_config',
        'assistant/_config_himitsu',
        'assistant/logNeedle',
        'assistant/getTimeStamping',
        'assistant/gasdb',
        'assistant/webRecorder',
        'assistant/gasFetch',
        'assistant/tgbot',
    ],
    function ( self ) {
        var assistant = self.assistant;
        self.timestamp_origin = self.timestamp = assistant.timestamp;
        self.timestamp_assistant = +new Date();
        self.gasLog = assistant.gasLog;
        self.order = assistant.order;
        delete self.assistant;
    }
);

// var template = HtmlService.createTemplateFromFile( 'index' );
// template.data = telegramInfo;
// return template.evaluate();

function doGet(){
    var gasLog_aaa = gasLog( 'aaa' );
    var gasLog_loop = gasLog( 'loop', 'loop' );
    for ( var loop = 10000; loop-- === 0; ) {
      var gasLog_aaa = gasLog( 'loop', loop );
    }
    gasLog( 'aaa', { rt: 555, yy: 66 } );
    return 123;
}

