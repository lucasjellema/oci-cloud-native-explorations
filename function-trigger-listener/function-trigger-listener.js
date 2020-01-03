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

function getStreams(callback) {
    var options = {
        host: configs.streamingAPIEndpoint,
        path: "/20180418/streams?compartmentId=" + encodeURIComponent(configs.compartmentId) + "&limit=10&page=&sortBy=TIMECREATED&sortOrder=desc&lifecycleState=",
        method: "GET"
    };
    var request = https.request(options, handleRequest(callback));
    //log("Go Sign and Send Request") 
    signRequest(request);
    request.end();

}
function getStream(streamId, callback) {
    var options = {
        host: configs.streamingAPIEndpoint,
        path: "/20180418/streams/ocid1.stream.oc1.iad.amaaaaaa6sde7caa4mjocclrqlxxi2dtdj7o5aia66zem23hd6f23muer47a",
        method: "GET"
    };
    var request = https.request(options, handleRequest(callback));
    //log("Go Sign and Send Request") 
    signRequest(request);
    request.end();

}


function getCursor(streamId, callback) {
    var options = {
        host: configs.streamingAPIEndpoint,
        path: "/20180418/streams/" + encodeURIComponent(streamId) + "/cursors",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    var request = https.request(options, handleRequest(callback));
    //log("Go Sign and Send Request") 
    const payload = {
        "partition": "0",
        "type": "TRIM_HORIZON"
    }
    let body = JSON.stringify(payload)
    signRequest(request, body);
    request.write(body)
    request.end();
};

function getMessages(streamId, cursor, callback) {
    var options = {
        host: configs.streamingAPIEndpoint,
        path: "/20180418/streams/" + encodeURIComponent(streamId) + "/messages?cursor=" + encodeURIComponent(cursor) + "&limit=100",
        method: 'GET',
        headers: {
        }
    };
    var request = https.request(options, handleRequest(callback));
    signRequest(request);
    request.end();
};

function consumeMessages(streamId) {
    // first open a cursor for the stream - for all messages still available in the stream
    getCursor(streamId, function (data) {
        // using the cursor, retrieve all available messages
        getMessages(streamId, data.value, function (data) {
            console.log("Messages Consumed from Stream:");
            data.forEach((e) => {
                let buff = new Buffer.from(e.value, 'base64');
                let text = buff.toString('ascii');
                log( text)
            })
        })
    });
    return { "Status": "OK" }
}

module.exports = {
    consume: consumeMessages
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
// node stream-consumer '{"streamId":"ocid1.stream.oc1.iad.amaaaaaa6sde7caa4mjocclrqlxxi2dtdj7o5aia66zem23hd6f23muer47a"}'


run = async function () {
    const osdate = execSync('date');
    const d = Date.parse(osdate)
    const nowDate = new Date(d)
//    if (d - Date.now() > 10000) {
        // in this case the mapping from system clock to Date() is corrupt somehow
        overrideNowBasedOnOS()
  //  }
    if (process.argv && process.argv[2]) {
        log("input:" + process.argv[2])
        const input = JSON.parse(process.argv[2])
        log("input: " + JSON.stringify(input))
        let response = consumeMessages(input.streamId)
        log("response: " + JSON.stringify(response))
    }
}


run2 = async function () {

    const input = { "streamId": "ocid1.stream.oc1.iad.amaaaaaa6sde7caa4mjocclrqlxxi2dtdj7o5aia66zem23hd6f23muer47a" }
    log("input: " + JSON.stringify(input))
    let response = consumeMessages(input.streamId)
    log("response: " + response)
    log("response: " + JSON.stringify(response))
}


run2()
