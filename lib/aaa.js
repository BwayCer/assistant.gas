
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

