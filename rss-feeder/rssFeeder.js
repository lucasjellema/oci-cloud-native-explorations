const rp = require('request-promise');
const Feed = require('rss-to-json');
const log = require('./logger.js').log;

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
// It will retrieve the RSS Feed from that URL, turn its contents into JSON and save the resulting JSON file to OCI Object Storage
// under the filename indicated
async function processRSS(rssURL, filename) {
    let endpoint = process.env['file_writer_endpoint'];
    const result = await rssToJson(rssURL);
    log(`RSS Result received, with ${result.items.length} items`, 'processRSS')

    // now the call to the file_writer_endpoint
    var options = {
        method: 'POST', uri: endpoint,
        json: true,
        body: {
            "bucketname": "fn-bucket"
            , "filename": filename
            , "contents": JSON.stringify(result)
        },
    };
    const result2 = await rp(options);
    log(`File Written to Object Storage with ${JSON.stringify(result2)} as response `, 'processRSS')
    return { "rssDoc": result, "fileWrite": result2 };
}

module.exports = {
    processRSS: processRSS
}

// export file_writer_endpoint='the API ENDPOINT URL for the File Writer Function' 
// export file_writer_endpoint='https://ohv25mm.apigateway.us-ashburn-1.oci.customer-oci.com/fn/persist'
// invoke on the command line with :
// node rssFeeder "https://technology.amis.nl/feed/" "amis-blog-rss.json"
run = async function () {
    if (process.argv && process.argv[2]) {
        let response = await processRSS(process.argv[2], process.argv[3])
        console.log("response: " + response.rssDoc.title)
        console.log("response2: " + JSON.stringify(response.fileWrite))
    }
}

run()
