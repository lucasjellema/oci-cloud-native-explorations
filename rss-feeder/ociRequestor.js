var httpSignature = require('http-signature');
var jsSHA = require("jssha");


// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
function sign(request, options, body) {

    var apiKeyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;

    var headersToSign = [
        "host",
        "date",
        "(request-target)"
    ];

    var methodsThatRequireExtraHeaders = ["POST", "PUT"];

    if (methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
        options.body = body || "";

        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(options.body);
        request.setHeader("Content-Length", options.body.length);
        request.setHeader("x-content-sha256", shaObj.getHash('B64'));
        headersToSign = headersToSign.concat([
            "content-type",
            "content-length",
            "x-content-sha256"
        ]);
    }

    httpSignature.sign(request, {
        key: options.privateKey,
        keyId: apiKeyId,
        headers: headersToSign,
        passphrase: options.passphrase // only required if the Private Key file is passphrase protected; note: 
    });

    var newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
    request.setHeader("Authorization", newAuthHeaderValue);
}


module.exports = {
    sign: sign
}
