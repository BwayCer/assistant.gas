#!/bin/bash
# 谷歌應用程式腳本 - 上傳測試文件


##shStyle ###


# fnTmp <推送測試設定文件>
fnTmp() {
    local _filename="claspPushTest.sh"
    local _br=$fnTmp_br

    local arguClaspPushConfigFilename="$1"

    which "clasp" &> /dev/null
    if [ $? -ne 0 ]; then
        echo "[$_filename]: 找不到 \"clasp\" 命令。" >&2
        return 1
    fi

    if [ -z "$arguClaspPushConfigFilename" ]; then
        echo "[$_filename]: 未提供推送清單文件。" >&2
        return 1
    fi
    if [ ! -f "$arguClaspPushConfigFilename" ]; then
        echo "[$_filename]: 找不到 \"$arguClaspPushConfigFilename\" 文件。" >&2
        return 1
    fi

    local claspPushConfigFilename=`realpath $arguClaspPushConfigFilename`
    local testDirname=`dirname $claspPushConfigFilename`

    fnTmp_createEnv "$testDirname"

    local claspignoreFilename="$testDirname/.claspignore"
    local ignoreTxt=$fnTmp_configClaspignore

    while read filename
    do
        [ -z "$filename" ] && continue
        if [ ! -f "$filename" ]; then
            echo "[$_filename]: 找不到 \"$filename\" 文件 。" >&2
            return 1
        fi
        ignoreTxt+="$_br!$filename"
    done < "$claspPushConfigFilename"

    # clasp 預設推送目錄下全部文件，無法於命令中指定，
    # 但可靠 ".claspignore" 來設定要忽略的文件。
    echo "-> 建立 \"$claspignoreFilename\" 文件"
    echo "$ignoreTxt" > "$claspignoreFilename"
    clasp push
}
fnTmp_br="
"
fnTmp_createEnv() {
    local dirnameToCreateEnv="$1"
    local catFile_claspJson=$fnTmp_configCatFile_claspJson
    local catFile_appsscriptJson=$fnTmp_configCatFile_appsscriptJson

    local claspJsonFilename="$dirnameToCreateEnv/.clasp.json"
    local appsscriptJsonFilename="$dirnameToCreateEnv/appsscript.json"

    if [ ! -f "$claspJsonFilename" ]; then
        echo "-> 建立 \"$claspJsonFilename\" 文件"
        echo "$catFile_claspJson" > "$claspJsonFilename"
    fi
    if [ ! -f "$appsscriptJsonFilename" ]; then
        echo "-> 建立 \"$appsscriptJsonFilename\" 文件"
        echo "$catFile_appsscriptJson" > "$appsscriptJsonFilename"
    fi
}
# .clasp.json
fnTmp_configCatFile_claspJson='{"scriptId":"1uucIV7V20MaZqY-7G5PwAbowXDiSOtIshWRoVK92qEN3U-MyDk0rijbj"}'
# .claspignore
fnTmp_configClaspignore='
**/**
!appsscript.json
'
# appsscript.json
fnTmp_configCatFile_appsscriptJson='{
  "timeZone": "Asia/Taipei",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER"
}'
fnTmp "$@"

