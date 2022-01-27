import {juruo} from './juruo.js';


juruo.set({
    _assistant_notExistTgbot: 'Telegram bot "{botName}" is not exist.',
});


/**
 * 電報機器人。
 *
 * @memberof module:assistant.
 * @func tgbot
 * @param {String} actItem - 執行項目。
 * @param {String} botName - 機器人名稱。
 * @param {String} method - 電報程式介面方法。
 * @param {Object} anyOptions - 請求選項。
 * 可以客製，也可以只是有效負載。
 * @param {String} requestContentShowMethod - 請求內容的顯示方式。
 * 有效值有 `Text|NotShow`， 預設為 `NotShow`。
 * @param {String} receiveContentShowMethod - 接收內容的顯示方式。
 * 有效值有 `Text|Blob|NotShow`， 預設為 `NotShow`。
 * @throws {Error} Error(21, tgbot_notExistTgbot)
 * @return {Object}
 * { {Object} info, // UrlFetchApp.fetch 的返回值
 *   {Number} statusCode,
 *   {Object} headers,
 *   {String} contentType,
 *   {Number} contentLength,
 *   {String} content }
 */
export function tgbot(
    actItem, botName, method, anyOptions,
    requestContentShowMethodArgu, receiveContentShowMethodArgu
) {
    var requestContentShowMethod = requestContentShowMethodArgu || 'Text';
    var receiveContentShowMethod = receiveContentShowMethodArgu || 'Text';

    var fhrData, tgBotToken, tgBotUrl, options;
    var botTokenList = deps._config.tgBotToken;

    if (botTokenList.hasOwnProperty(botName)) {
        tgBotToken = botTokenList[botName];
    } else {
        throw Error(
            juruo.get('_assistant_notExistTgbot', {
                botName: botName,
            })
        );
    }

    tgBotUrl = 'https://api.telegram.org/' + tgBotToken + '/' + method;

    // 由於在谷歌應用程式腳本中送出 Blob 似乎不容易，
    // 故在電報介面中採取默認為 JSON，否則則給予高度客製。
    if (anyOptions.hasOwnProperty('method')) {
        options = anyOptions;
    } else {
        options = {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(anyOptions),
        };
    }

    fhrData = deps.webRecorder.fetch(
        actItem, tgBotUrl, options,
        requestContentShowMethod, receiveContentShowMethod
    );

    if (receiveContentShowMethod === 'Text') {
        fhrData.content = JSON.parse(fhrData.content);
    }

    return fhrData;
};

