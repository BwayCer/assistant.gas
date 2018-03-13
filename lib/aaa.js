
/**
 * 谷歌應用程式腳本助理 Assistant for Apps Script
 *
 * @module assistant
 */

"use strict";

assistant.order(
    'assistant', this, [
        'assistant/_config',
        'assistant/_config_himitsu',
        'assistant/supportLite',
        'assistant/logNeedle',
        'assistant/getTimeStamping',
    ],
    function ( self ) {
        var assistant = self.assistant;
        self.gasLog = assistant.gasLog;
        self.order = assistant.order;
        delete self.assistant;
    }
);

