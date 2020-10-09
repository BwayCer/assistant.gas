谷歌應用程式腳本助理
=======


> 授權： [CC-BY-4.0](./LICENSE.md)

> 版本： v3.1.0


谷歌應用程式腳本常用工具集合。



## 推薦谷歌應用程式腳本


谷歌應用程式腳本 Google Apps Script
是一個為 [谷歌雲端硬碟][google_drive] 所設計的腳本程式，
讓你可以用 *JavaScript* 設計自己的擴充工具。

這不是一個功能陽春的平台，
谷歌為了讓你能隨心所欲的開發自己的小工具，
其功能設計堪比程式碼運行平台，
不過如果用途非著墨在 [谷歌雲端硬碟][google_drive]
上的話還是建議另外挑選個 *Node.js* 的程式碼運行平台比較適合。


網路資料與服務：

  * 指南文件
    * [谷歌開發者文件 Apps Script](https://developers.google.com/apps-script/)
  * 開發工具
    * [GitHub google/clasp](https://github.com/google/clasp)
      ： 在本地端開發應用程式腳本工具。
    * [Apps Script 平台](https://script.google.com)
      ： 在谷歌雲端硬碟外， 另一個可查看且只以應用程式腳本的主的網站。
    * [谷歌雲平台 日誌介面](https://console.cloud.google.com)
  * 限制
    * [谷歌開發者文件 服務配額](https://developers.google.com/apps-script/guides/services/quotas)
    * [谷歌雲端硬碟 配額限制](https://script.google.com/dashboard)



## 打包及推送工具


工具： [`bin/claspPush.sh`](./bin/claspPush.sh)


### 使用方式


1. 創建推送設定文件：

描述欲上傳的文件，
其路徑是相對於 "推送設定文件" 的目錄路徑。

**"推送設定文件" 預期與 ".clasp.json" 在同一層目錄下。**

```
echo "
./src/gasInit.js
./src/juruo.js
./src/supportLite.js
" > ".claspWrap"
```

2. 推送命令：


```
# 正式： 打包 + 推送
# 備註： 使用 Google Closure Compiler 執行「僅刪除註釋和空格」的打包方式。
#        不使用更優化的壓縮方式是考慮到發生錯誤時除錯的困難度。
./bin/claspPush.sh ./path/to/.claspWrap

# 測試： 推送
# 備註： 若 .clasp.json、appsscript.json
#        兩文件不存在時會建立預設的內容。
#        * .clasp.json 的預設內容指向作者的谷歌雲端硬碟，建議更改。
./bin/claspPush.sh --test-env ./path/to/.claspWrap
```




[google_drive]: https://drive.google.com/

