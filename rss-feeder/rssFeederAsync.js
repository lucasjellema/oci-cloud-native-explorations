const rp = require('request-promise');
const Feed = require('rss-to-json');
const log = require('./logger.js').log;

const os = require('os');
const ociRequestor = require('./ociRequestor');
const fs = require('fs');
const https = require('https');
const configs = require('./oci-configuration').configs;

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
            callback(responseBody);
        });
    }
}

// messages is any array of objects with one or two properties: payload (a string) and key (also a string)
// streamId is the OCID of the stream to publish to
function publishMessages(streamId, messages, callback) {
    var options = {
        host: configs.streamingAPIEndpoint,
        path: "/20180418/streams/" + encodeURIComponent(streamId) + "/messages",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    let msg =
        {
            "messages":
                []
        };
    // add each message to the messages collection with the payload base64 encoded    
    messages.forEach(m => { msg.messages.push({"key":m.key,"value": new Buffer(m.payload).toString('base64')})})
    body = JSON.stringify(msg)
    var request = https.request(options, handleRequest(callback));
    signRequest(request, body);
    request.write(body)
    request.end();
};

function rssToJson(rssURL) {
    // in order to allow invokers to await the return from this function
    // the function result is returned as a Promise that resolves when the callback function is 
    // invoked with the result from the asynchronous operation.
    // Technically, this function is not async, but it could and should be treated as such
    return new Promise((resolve, reject) => {
        Feed.load(rssURL, function (err, rss) {
            if (err) {
                return reject(err)
            }
            else
                return resolve(rss)
        })
    })
}

// this function accepts an RSS Feed URL. 
// It will retrieve the RSS Feed from that URL, turn its contents into JSON 
// and publish an event to OCI Streaming that should trigger execution of a function 
// to save the resulting JSON file to OCI Object Storage under the filename indicated
async function processRSSAsync(rssURL, filename) {
    
    const result = await rssToJson(rssURL);
    log(`RSS Result received, with ${result.items.length} items`, 'processRSS')

    // now publish the event
    const streamId = process.env['function_triggering_stream_ocid'];
    publishMessages(streamId, [{"key":"file-writer", "payload":"Hello World"}], function (data) {
        console.log("Messages Published to Stream.");
        log(JSON.stringify(data))
    });


    return { "rssDoc": result, "eventPublishedf": "result of publishing event" };
}


module.exports = {
    processRSSAsync: processRSSAsync
}

// export function_triggering_stream_ocid='the OCID of the Stream' 
// export function_triggering_stream_ocid='ocid1.stream.oc1.iad.amaaaaaa6sde7caa4mjocclrqlxxi2dtdj7o5aia66zem23hd6f23muer47a' 
// invoke on the command line with :
// node rssFeederAsync "https://technology.amis.nl/feed/" "amis-blog-rss.json"
run = async function () {
    if (process.argv && process.argv[2]) {
        let response = await processRSSAsync(process.argv[2], process.argv[3])
        console.log("response: " + response.rssDoc.title)
        console.log("response2: " + JSON.stringify(response.eventPublishedf))
    }
}

run()
