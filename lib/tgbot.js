
assistant.order( 'assistant/tgbot', function ( self ) {
    /**
     * 電報機器人。
     *
     * @memberof module:assistant.
     * @class tgbot
     * @param {String} service - 服務名稱或網址。
     * @param {String} env - 開發 `development` 或生產 `production` 環境。
     * @param {String} item - 項目。
     * @param {String} botName - 機器人名稱。
     * @param {String} method - 電報程式介面方法。
     * @param {String} contentType - 內容類型。
     * @param {String} payload - 有效負載。
     * @param {Boolean} [showReceiveContentWithJson] - 是否以 `JSON` 顯示接收內容。
     * @param {Boolean} [showRequestContentWithJson] - 是否以 `JSON` 顯示請求內容。
     * @throws {Error} Error(21, tgbot_notExistTgbot)
     * @return {module:assistant.gasFetch} 谷歌腳本抓取。
     */
    function tgbot(
        strService, strEnv, strItem, strBotName, strMethod, strContentType, anyPayload,
        bisShowReceiveContentWithJson, bisShowRequestContentWithJson
    ) {
        var fhr, tgBotToken, tgBotUrl, fetchOpt, contentType, jsonPayload;
        var bisShowRequestContent = bisShowRequestContentWithJson;
        var bisShowReceiveContent = bisShowReceiveContentWithJson;
        var botTokenList = tgbot._botTokenList;

        if ( botTokenList.hasOwnProperty( strBotName ) )
            tgBotToken = botTokenList[ strBotName ];
        else
            throw Error( log.err( 21, 'tgbot_notExistTgbot', strBotName ) );

        tgBotUrl = 'https://api.telegram.org/' + tgBotToken + '/' + strMethod;

        if ( strContentType === 'JSON' ) {
            contentType = 'application/json';
            bisShowRequestContent = true;
            anyPayload = jsonPayload = typeof anyPayload === 'string'
                ? anyPayload : JSON.stringify( anyPayload );
        } else {
            contentType = strContentType;
        }

        bisShowRequestContent = bisShowRequestContent === true ? true : false;
        bisShowReceiveContent = bisShowReceiveContent === true ? true : false;

        fetchOpt = {
            method: 'post',
            contentType: contentType,
            payload: anyPayload,
        };

        fhr = new gasFetch(
            strService, strEnv, strItem, tgBotUrl, fetchOpt,
            false, false
        );

        if ( bisShowRequestContent )
            fhr.replyRequestContent( 'JSON', jsonPayload );

        if ( bisShowReceiveContent && /^2\d{2}$/.test( fhr.statusCode ) ) {
            receiveContent = fhr.receive.info.getContentText();
            fhr.content = JSON.parse( receiveContent );
            fhr.replyReceiveContent( 'JSON', receiveContent );
        }

        return fhr;
    }

    tgbot._botTokenList = self._config.tgBotToken;

    self.tgbot = tgbot;
} );

