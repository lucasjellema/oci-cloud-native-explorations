const os = require('os');
const ociRequestor = require('./ociRequestor');
const fs = require('fs');
const https = require('https');
const configs = require('./oci-configuration').configs;
const log = require('./logger').l

let privateKeyPath = configs.privateKeyPath
if (privateKeyPath.indexOf("~/") === 0) {
    privateKeyPath = privateKeyPath.replace("~", os.homedir())
}
const privateKey = fs.readFileSync(privateKeyPath, 'ascii');

function signRequest(request, body = "") {
    ociRequestor.sign(request, {
        privateKey: privateKey,
        keyFingerprint: configs.keyFingerprint,
        tenancyId: configs.tenancyId,
        userId: configs.authUserId,
        "passphrase": configs.pass_phrase,
    }, body);
}
// generates a function to handle the https.request response object
function handleRequest(callback) {

    return function (response) {
        var responseBody = "";
        //log(JSON.stringify(response.headers), "callback function defined in handleRequest")
        response.on('data', function (chunk) {
            responseBody += chunk;
        });

        response.on('end', function () {
            //log("Response:" + responseBody)
            callback(JSON.parse(responseBody));
        });
    }
}


function publishMessages(streamId, messages, callback) {
    var options = {
        host: configs.streamingAPIEndpoint,
        path: "/20180418/streams/" + encodeURIComponent(streamId) + "/messages",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    const message = new Buffer('my personal message - to be encoded in order to be published').toString('base64');
    msg =
        {
            "messages":
                [
                    {
                        "key": null,
                        "value": "VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wZWQgb3ZlciB0aGUgbGF6eSBkb2cu"
                    },
                    {
                        "key": "personal",
                        "value": message
                    },
                    {
                        "key": null,
                        "value": "UGFjayBteSBib3ggd2l0aCBmaXZlIGRvemVuIGxpcXVvciBqdWdzLg=="
                    }
                ]
        };
    body = JSON.stringify(msg)
    var request = https.request(options, handleRequest(callback));
    signRequest(request, body);
    request.write(body)
    request.end();
};

function pubMessages(streamId) {
    publishMessages(streamId, {}, function (data) {
        console.log("Messages Published to Stream.");
        log(JSON.stringify(data))
    });
    return { "Status": "OK" }
}

module.exports = {
    publish: pubMessages
}

// invoke on the command line with :
// node fileWriter '{"bucket":"TOKEN","fileName":"secret2", "contents":{"File Contents":"Contents, Contents"}}'
const { execSync } = require('child_process');

function overrideNowBasedOnOS() {
    Date.now = function () {
        const osdate = execSync('date');
        const da = Date.parse(osdate)
        return da;
    }

}


// invoke with
// node stream-publisher '{"streamId":"ocid1.stream.oc1.iad.amaaaaaa6sde7caa4mjocclrqlxxi2dtdj7o5aia66zem23hd6f23muer47a"}'


run = async function () {
    // const osdate = execSync('date');
    // const d = Date.parse(osdate)
    // const nowDate = new Date(d)
    // if (d - Date.now() > 10000) {
    //     // in this case the mapping from system clock to Date() is corrupt somehow
    //     overrideNowBasedOnOS()
    // }
    if (process.argv && process.argv[2]) {
        log("input:" + process.argv[2])
        const input = JSON.parse(process.argv[2])
        log("input: " + JSON.stringify(input))
        let response = pubMessages(input.streamId)
        log("response: " + JSON.stringify(response))
    }
}


run2 = async function () {

    const input = { "streamId": "ocid1.stream.oc1.iad.amaaaaaa6sde7caa4mjocclrqlxxi2dtdj7o5aia66zem23hd6f23muer47a" }
    log("input: " + JSON.stringify(input))
    let response = pubMessages(input.streamId)
    log("response: " + JSON.stringify(response))
}


run2()
