
gasOrder.menu(
    'TEST',
    [
        'assistant/gasLog',
        'assistant/juruo',
        '_config',
        'assistant/Gasdb',
        'assistant/getTimeStamping',
        'assistant/GasWebRecorder',
        '_config_setWebRecorderSpreadsheet',
    ],
    this
);

gasOrder('_config', function (deps) {
    // 設定文件
    deps._config = {
        spreadsheet: {
            test_id: '11-IM9P1ynVTRfpVHLNuwAAhAyKjwYjpX8qI9NPO6CeM',
            test_table: {
                gasdb: 'Gasdb',
            },
        },
    };
} );

gasOrder('_config_setWebRecorderSpreadsheet', function (deps) {
    deps.GasWebRecorder.setSheetConfig(
        deps._config.spreadsheet,
        'webRecorder',
        '1oSrpcLCiITJr6EcjzI-rEJTFwctidn2MU5it8RP3V0g'
    );
} );

function test_GasWebRecorder_receiverSuccess() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var run = function (request) {
        debugger;
    };
    var receiver = webRecorder.receiver('Receiver Success', run);
    var request = {
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
        'contentLength': -1
    };

    receiver(request);
}

function test_GasWebRecorder_receiverError() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var run = function (request) {
        throw TypeError('Illegal invocation.');
    };
    var receiver = webRecorder.receiver('Receiver Error', run);
    var request = {
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
        'contentLength': -1
    };

    receiver(request);
}

function test_GasWebRecorder_triggerSuccess() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var run = function () {
        debugger;
    };
    var action = webRecorder.trigger('Trigger Success', run);

    action();
}

function test_GasWebRecorder_triggerError() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var run = function () {
        throw TypeError('Illegal invocation.');
    };
    var action = webRecorder.trigger('Trigger Error', run);

    action();
}

function test_GasWebRecorder_fetchSuccess() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var url = 'https://tool.magiclen.org/ip/';
    var options = null;
    var fhrData = webRecorder.fetch(
        'Fetch Success', url, options,
        'NotShow', 'Text'
    );
}

function test_GasWebRecorder_fetchImageSuccess() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var url = 'http://img1.gamersky.com/image2018/07/20180707_xdj_187_9/image002_S.jpg';
    var options = null;
    var fhrData = webRecorder.fetch(
        'Fetch Success', url, options,
        'NotShow', 'Blob'
    );
    // 儲存圖片
    // var imageBlob = fhrData.info.getAs(fhrData.contentType);
    // DriveApp.createFile(imageBlob);
}

function test_GasWebRecorder_fetchPostSuccess() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var url = 'https://api.telegram.org/bot373213534:AAEmUiQkoFeqCpfN9dV3r67O3BOqZ03sJh4/sendMessage';
    var postBody = {
        chat_id: '281634169',
        // chat_id: '-194592154', //普群識別碼 留存
        // chat_id: '-1001325775761',
        parse_mode: 'Markdown',
        text: 'hi'
    };
    var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(postBody),
    };
    var fhrData = webRecorder.fetch(
        'Fetch Success', url, options,
        'Text', 'Text'
    );
}

function test_GasWebRecorder_fetchError() {
    var deps = this;

    var webRecorder = new deps.GasWebRecorder('webRecorder');
    var url = 'https://tool.magiclen.org/ip/';
    var options = null;
    var fhrData = webRecorder.fetch(
        'Fetch Error', url, options,
        'NotShow', 'Text'
    );
}

