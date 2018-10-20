
gasOrder('assistant/crypto', function (deps) {
    var crypto = deps.crypto = {};

    /***
     * MD5。
     *
     * @see [GitHub Gist: mogsdad/digest.js]{@link https://gist.github.com/mogsdad/5464686}
     *
     * @func md5
     * @param {String} value
     * @return {String}
     */
    crypto.md5 = function md5(value) {
        var idx, len, val, hex;
        var byteSignature = Utilities.computeDigest(
            Utilities.DigestAlgorithm.MD5,
            value,
            Utilities.Charset.US_ASCII
        );
        var digest = '';
        for (idx = 0, len = byteSignature.length; idx < len; idx++) {
            val = byteSignature[idx];
            val = val >= 0 ? val : (~val ^ 255); // = val + 256
            hex = val.toString(16);
            digest += (hex.length === 1 ? '0' : '') + hex;
        }

        return digest;
    };
} );

