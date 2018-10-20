
gasOrder.menu(
    'TEST',
    [
        'assistant/gasLog',
        'assistant/juruo',
        '_config',
        'assistant/Gasdb',
    ],
    this
);

gasOrder('_config', function (deps) {
    // 設定文件
    deps._config = {
        spreadsheet: {
            // webRecorder_id: 'spreadsheet-id',
            // webRecorder_table: {
            //     receiveRequest: '接收請求',
            //     sendRequest:    '發送請求',
            // },
            test_id: '11-IM9P1ynVTRfpVHLNuwAAhAyKjwYjpX8qI9NPO6CeM',
            test_table: {
                gasdb: 'Gasdb',
            },
        },
    };
} );

function test_Gasdb_create() {
    var deps = this;

    var dbSheet = new deps.Gasdb('test', 'gasdb');
    var dbKey = deps.Gasdb.getNewDbKey(dbSheet);

    dbSheet.create(dbSheet.fill([
        dbKey,
        '測 1',
        '測 2',
        '測 3',
    ]));
}

function test_Gasdb_removeForce() {
    var deps = this;

    var dbSheet = new deps.Gasdb('test', 'gasdb');
    var table = dbSheet.read([1, dbSheet.RowLast()]);
    var idxRow = deps.Gasdb.findRowIndexByDbKey(table, 1);

    if (~idxRow) {
        dbSheet.remove(idxRow);
        // dbSheet.remove(idxRow, true);
    }
}

