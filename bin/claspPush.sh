#!/bin/bash
# 谷歌應用程式腳本打包


##shStyle ###


# fnTmp
#   -t | --test-env   上傳測試文件
#   <推送設定文件>
fnTmp() {
    local tmp
    local _filename="claspPush.sh"
    local _br=$fnTmp_br

    local opt_testEnv=0

    while [ -n "y" ]
    do
        case "$1" in
            -t | --test-env )
                opt_testEnv=1
                shift
                ;;
            * ) break ;;
        esac
    done

    local ignoreTxt=$fnTmp_configClaspignore
    local wrapFilename=$fnTmp_claspWrapPush_wrapFilename

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

    local filename code
    local isShowWrapItemText=0
    local claspPushConfigFilename=`realpath "$arguClaspPushConfigFilename"`
    local mainDirname=`dirname "$claspPushConfigFilename"`
    local claspignoreFilename="$mainDirname/.claspignore"

    if [ $opt_testEnv -eq 0 ]; then
        for filename in "$mainDirname/.clasp.json" "$mainDirname/appsscript.json"
        do
            if [ ! -f "$filename" ]; then
                echo "[$_filename]: 找不到 \"$filename\" 文件。" >&2
                return 1
            fi
        done
    fi

    while read filename
    do
        [ -z "$filename" ] && continue

        filename="$mainDirname/$filename"
        if [ ! -f "$filename" ]; then
            echo "[$_filename]: 找不到 \"$filename\" 文件 。" >&2
            return 1
        fi

        if [ $opt_testEnv -eq 0 ]; then
            if [ $isShowWrapItemText -eq 0 ]; then
                isShowWrapItemText=1
                echo "打包項目："
            fi
            echo "└─ $filename"
            code+="`cat "$filename"`$_br"
        else
            ignoreTxt+="$_br!$filename"
        fi
    done < "$claspPushConfigFilename"

    if [ $opt_testEnv -eq 0 ]; then
        fnTmp_claspWrapPush_code=$code
        fnTmp_claspWrapPush "$mainDirname"
        tmp=$?; [ $tmp -ne 0 ] && exit $tmp

        if [ ! -f "$claspignoreFilename" ]; then
            echo
            ignoreTxt+="$_br!$wrapFilename"
            echo "-> 建立 \"$claspignoreFilename\" 文件"
            echo "$ignoreTxt" > "$claspignoreFilename"
        fi
    else
        fnTmp_createTestClaspEnv "$mainDirname"

        echo "-> 建立 \"$claspignoreFilename\" 文件"
        echo "$ignoreTxt" > "$claspignoreFilename"
    fi

    # clasp 預設推送目錄下全部文件，無法於命令中指定，
    # 但可靠 ".claspignore" 來設定要忽略的文件。
    echo
    if [ "`realpath "$PWD"`" == "$mainDirname" ]; then
        echo "clasp push"
    else
        echo "clasp push (cd \"$mainDirname\")"
        cd "$mainDirname"
    fi
    clasp push
}
fnTmp_br="
"
# .claspignore
fnTmp_configClaspignore='
**/**
!appsscript.json
'
fnTmp_claspWrapPush() {
    local wrapFilename=$fnTmp_claspWrapPush_wrapFilename
    local code=$fnTmp_claspWrapPush_code

    local mainDirname="$1"

    local wrapFile="$mainDirname/$wrapFilename"
    local storeDirname=`dirname "$mainDirname/$wrapFilename"`

    [ ! -d "$storeDirname" ] && mkdir -p "$storeDirname"

    curl -s --url "https://closure-compiler.appspot.com/compile" \
        --request "POST" \
        --header "cache-control: no-cache" \
        --header "content-type: application/x-www-form-urlencoded" \
        --data-urlencode "js_code=$code" \
        --data-urlencode "compilation_level=WHITESPACE_ONLY" \
        --data-urlencode "formatting=pretty_print" \
        --data-urlencode "output_info=compiled_code" \
        --data-urlencode "output_format=text" \
        > "$wrapFile"

    # 若回傳空值則要查看錯誤原因
    if [ -z "`cat $wrapFile`" ]; then
        curl -s --url "https://closure-compiler.appspot.com/compile" \
            --request "POST" \
            --header "cache-control: no-cache" \
            --header "content-type: application/x-www-form-urlencoded" \
            --data-urlencode "js_code=$code" \
            --data-urlencode "compilation_level=WHITESPACE_ONLY" \
            --data-urlencode "formatting=pretty_print" \
            --data-urlencode "output_info=warnings" \
            --data-urlencode "output_info=errors" \
            --data-urlencode "output_format=text"
        return 1
    fi
}
fnTmp_claspWrapPush_wrapFilename="lib/aaa.js"
fnTmp_claspWrapPush_code=""
fnTmp_createTestClaspEnv() {
    local catFile_claspJson=$fnTmp_createEnv_configCatFile_claspJson
    local catFile_appsscriptJson=$fnTmp_createEnv_configCatFile_appsscriptJson

    local mainDirname="$1"

    local claspJsonFilename="$mainDirname/.clasp.json"
    local appsscriptJsonFilename="$mainDirname/appsscript.json"

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
fnTmp_createEnv_configCatFile_claspJson='{"scriptId":"1uucIV7V20MaZqY-7G5PwAbowXDiSOtIshWRoVK92qEN3U-MyDk0rijbj"}'
# appsscript.json
fnTmp_createEnv_configCatFile_appsscriptJson='{
  "timeZone": "Asia/Taipei",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER"
}'

fnTmp "$@"

