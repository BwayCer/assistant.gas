
const _defaultJuruoLangPkg = {
  __undefined: 'Unexpected log message.',
  __undefinedError: 'Unexpected error message.',
  __illegalInvocation: 'Illegal invocation.',
  __inconsistentExpectation:
    'The usage of "{{name}}" is inconsistent with expectation.',
  __notExpected:
    'The "{{name}}" is not of the expected.',
  __notExpectedType:
    'The "{name}" is not of the expected type.',
  __typeError:
    'A value is not of the expected type.',
  __restrictedType:
    'The "{{name}}" must be of `{{type}}`. Received `{{actual}}` type.',
  __restrictedNotType:
    'The "{{name}}" must not be of `{{type}}`. Received `{{actual}}` type.',
};

/**
 * 蒟蒻替換： 將固定格式訊息中的關鍵詞替換成當前情境的訊息。
 *
 * @func juruoReplace
 */
export function juruoReplace(text, replaceInfo) {
  let txt = _defaultJuruoLangPkg.hasOwnProperty(text)
    ? _defaultJuruoLangPkg[text]
    : text
  ;
  return Object.entries(replaceInfo).reduce(
    (accu, [key, value]) => accu.replaceAll('{{' + key + '}}', value),
    txt,
  );
}

