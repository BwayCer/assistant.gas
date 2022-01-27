谷歌應用程式腳本助理
=======


> 授權： [CC-BY-4.0](https://choosealicense.com/licenses/cc-by-4.0/)

> 版本： v5.0.0


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
    * [Apps Script 平台][google_script]
      ： 在谷歌雲端硬碟外， 另一個可查看且只以應用程式腳本的主的網站。
    * [谷歌雲平台 日誌介面](https://console.cloud.google.com)
  * 限制
    * [谷歌開發者文件 服務配額](https://developers.google.com/apps-script/guides/services/quotas)



## 快速入門


1. 在 [Apps Script 平台][google_script] 建立新專案。
2. 執行 `clasp clone` 下載專案。
3. [建議使用 V8 引擎運行腳本](https://developers.google.com/apps-script/guides/v8-runtime)，
   將 `"runtimeVersion": "V8"` 設定寫入 "appsscript.json" 文件中。
4. 建議使用 [rollup.js](https://rollupjs.org) 打包工具打包程式碼後再上傳，
   因為程式不見得依預期的順序執行，
   選用 rollup.js 而非 webpack 是因為打包後的程式碼更精簡。
5. 執行 `clasp push` 推送專案，
   可以搭配 ".claspignore" 文件設定不需被推送的文件。



### 紀錄已知 V8 版本無法使用的功能


```
import, export
```




[google_drive]: https://drive.google.com
[google_script]: https://script.google.com

