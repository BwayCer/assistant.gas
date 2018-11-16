#!/bin/bash
# 谷歌應用程式腳本打包


##shStyle 腳本環境


_PWD=$PWD
_br="
"

# 文件路徑資訊
__filename=`realpath "$0"`
_dirsh=`dirname "$__filename"`
_binsh=""
_libsh=""
_fileName=`basename "$0"`


##shStyle ###


# fnTmp
#   -t | --test-env   上傳測試文件
#   <推送設定文件>
fnTmp() {
    local tmp

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
    local wrapFilenNameTmp=$fnTmp_wrapFilenNameTmp
    local storeDirname=$fnTmp_storeDirname

    local claspPushFilename="$1"

    which "clasp" &> /dev/null
    if [ $? -ne 0 ]; then
        echo "[$_fileName]: 找不到 \"clasp\" 命令。" >&2
        return 1
    fi

    if [ -z "$claspPushFilename" ]; then
        echo "[$_fileName]: 未提供推送清單文件。" >&2
        return 1
    elif [ -z `echo "$claspPushFilename" | grep '\.claspPush$'` ]; then
        echo "[$_fileName]: \"$claspPushFilename\" 文件副檔名須為 \".claspPush\"。" >&2
        return 1
    elif [ ! -f "$claspPushFilename" ]; then
        echo "[$_fileName]: 找不到 \"$claspPushFilename\" 文件。" >&2
        return 1
    fi

    local claspJson appsscriptJson pushList
    local code realPushFile
    local realFilename
    local realClaspPushFilename=`realpath "$claspPushFilename"`
    local claspPushOrigin=`dirname "$realClaspPushFilename"`
    local assignName=`basename "$claspPushFilename" | sed "s/\.claspPush$//g"`
    local realWrapFilenNameTmp="$claspPushOrigin/$wrapFilenNameTmp"
    local realStoreDirname="$claspPushOrigin/$storeDirname"
    local wrapJsFilename="$storeDirname/$assignName.js"
    local realWrapJsFilename="$claspPushOrigin/$wrapJsFilename"


    fnTmp_parseClaspPush "$claspPushOrigin" "$realClaspPushFilename"
    tmp=$?; [ $tmp -ne 0 ] && exit $tmp

    claspJson=$fnTmp_parseClaspPush_claspJson
    appsscriptJson=$fnTmp_parseClaspPush_appsscriptJson
    pushList=("${fnTmp_parseClaspPush_pushList[@]}")


    ignoreTxt+="$_br!$wrapJsFilename"

    echo "打包項目："
    for realPushFile in "${pushList[@]}"
    do
        echo "└─ $realPushFile"
        code+="$_br/* $realPushFile */$_br`cat "$realPushFile"`$_br"
    done
    echo "$code" > "$realWrapFilenNameTmp"
    echo

    if [ $opt_testEnv -eq 0 ]; then
        fnTmp_closureCompiler "$realWrapFilenNameTmp"
        tmp=$?; [ $tmp -ne 0 ] && exit $tmp
    fi


    if [ ! -d "$realStoreDirname" ]; then
        mkdir -p "$realStoreDirname"
        tmp=$?; [ $tmp -ne 0 ] && exit $tmp
    fi


    realFilename="$claspPushOrigin/.clasp.json"
    echo "-> 建立 \"$realFilename\" 文件"
    echo "$claspJson" > "$realFilename"

    realFilename="$claspPushOrigin/appsscript.json"
    echo "-> 建立 \"$realFilename\" 文件"
    echo "$appsscriptJson" > "$realFilename"

    realFilename="$claspPushOrigin/.claspignore"
    echo "-> 建立 \"$realFilename\" 文件"
    echo "$ignoreTxt" > "$realFilename"

    echo "-> 建立 \"$realWrapJsFilename\" 文件"
    mv "$realWrapFilenNameTmp" "$realWrapJsFilename"

    # clasp 預設推送目錄下全部文件，無法於命令中指定，
    # 但可靠 ".claspignore" 來設定要忽略的文件。
    echo
    if [ "`realpath "$PWD"`" == "$claspPushOrigin" ]; then
        echo "-> clasp push"
    else
        echo "-> clasp push (cd \"$claspPushOrigin\")"
        cd "$claspPushOrigin"
    fi

    clasp push
}
# .claspignore
fnTmp_configClaspignore='
**/**
!appsscript.json
'
fnTmp_wrapFilenNameTmp=".wrapFile.claspPush.tmp"
fnTmp_storeDirname="lib"
fnTmp_parseClaspPush_claspJson=""
fnTmp_parseClaspPush_appsscriptJson=""
fnTmp_parseClaspPush_pushList=()
fnTmp_parseClaspPush() {
    local claspPushOrigin="$1"
    local realClaspPushFilename="$2"

    local idx line pushFile realPushFile
    local isChangeMethod=0
    local isRepeatedCall=0
    local isHasClaspJsonMethod=0
    local isHasAppsscriptJsonMethod=0
    local isHasPushListMethod=0
    local claspJson=""
    local appsscriptJson=""
    local pushList=()
    local claspPushTxt=`grep "." "$realClaspPushFilename"`
    local len=`echo "$claspPushTxt" | wc -l`
    local method=""

    for idx in `seq 1 $len`
    do
        line="`echo "$claspPushTxt" | sed -n "${idx}p"`"

        case "$line" in
            "#FILE .clasp.json" )
                [ $isHasClaspJsonMethod -ne 0 ] && isRepeatedCall=1
                isChangeMethod=1
                isHasClaspJsonMethod=1
                method="claspJson"
                ;;
            "#FILE appsscript.json" )
                [ $isHasAppsscriptJsonMethod -ne 0 ] && isRepeatedCall=1
                isChangeMethod=1
                isHasAppsscriptJsonMethod=1
                method="appsscriptJson"
                ;;
            "#PUSHlIST" )
                [ $isHasPushListMethod -ne 0 ] && isRepeatedCall=1
                isChangeMethod=1
                isHasPushListMethod=1
                method="pushList"
                ;;
            * )
                isChangeMethod=0
                ;;
        esac

        if [ $isChangeMethod -eq 1 ]; then
            if [ $isRepeatedCall -eq 1 ]; then
                echo "[$_fileName]: 設定文件中重複調用相同的處理方法。" >&2
                return 1
            fi
            continue
        fi

        if [ -z "$method" ]; then
            echo "[$_fileName]: 設定文件中的未指明語意的處理方法。" >&2
            return 1
        fi

        line=`echo "$line" | sed "s/#.*//g"`
        [ -z "$line" ] && continue
        [ -z "`echo "$line" | grep "\S"`" ] && continue

        case "$method" in
            "claspJson" )
                claspJson+=$line$_br
                ;;
            "appsscriptJson" )
                appsscriptJson+=$line$_br
                ;;
            "pushList" )
                pushFile=$line

                realPushFile="$claspPushOrigin/$pushFile"
                if [ ! -f "$realPushFile" ]; then
                    echo "[$_fileName]: 找不到設定文件中的 \"$realPushFile\" 文件。" >&2
                    return 1
                fi

                pushList[${#pushList[@]}]=$realPushFile
                ;;
        esac
    done

    if [ -z "$claspJson" ]; then
        echo "[$_fileName]: 設定文件中的 \".clasp.json\" 文件設定失敗。" >&2
        return 1
    elif [ -z "$appsscriptJson" ]; then
        echo "[$_fileName]: 設定文件中的 \"appsscript.json\" 文件設定失敗。" >&2
        return 1
    elif [ ${#pushList[@]} -eq 0 ]; then
        echo "[$_fileName]: 設定文件中的推送清單設定失敗。" >&2
        return 1
    fi

    fnTmp_parseClaspPush_claspJson="$claspJson"
    fnTmp_parseClaspPush_appsscriptJson="$appsscriptJson"
    fnTmp_parseClaspPush_pushList=("${pushList[@]}")
}
fnTmp_closureCompiler() {
    local realWrapFilenNameTmp="$1"

    local code=`cat "$realWrapFilenNameTmp"`

    curl -s --url "https://closure-compiler.appspot.com/compile" \
        --request "POST" \
        --header "cache-control: no-cache" \
        --header "content-type: application/x-www-form-urlencoded" \
        --data-urlencode "js_code=$code" \
        --data-urlencode "compilation_level=WHITESPACE_ONLY" \
        --data-urlencode "formatting=pretty_print" \
        --data-urlencode "output_info=compiled_code" \
        --data-urlencode "output_format=text" \
        > "$realWrapFilenNameTmp"

    # 若回傳空值則要查看錯誤原因
    if [ -z "`cat "$realWrapFilenNameTmp"`" ]; then
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

fnTmp "$@"

