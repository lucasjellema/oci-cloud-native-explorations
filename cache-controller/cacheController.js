var rp = require('request-promise');

async function getValueFromCache(key,cacheName) {
    const cache = await getRawCache(cacheName);
    let value = cache.body[key];
    if (!value) {
       value = cache.headers[key]
    }
    return value
}

async function getRawCache(cacheName) {
    let endpoint = process.env['stock_api_endpoint'];
    var _include_headers = function (body, response, resolveWithFullResponse) {
        return { 'headers': response.headers, 'body': body };
    };
    var options = {
        uri: endpoint+'/'+cacheName,
        json: true,
        transform: _include_headers,
    };
    const result = await rp(options);
    return { "cacheResponse": "We Found Absolutely Nothing!!", "headers": result.headers, "body": result.body, "cache-endpoint": encodeURIComponent(endpoint) };
}

module.exports = {
    getFromCache: getValueFromCache
}

// export stock_api_endpoint='the API ENDPOINT URL' 
// invoke on the command line with :
// node cacheController NA physics '{"key":"NA","cacheName":"physics","otherValue":"isIgnored", "payload":{"you":"lovely person"}}'
run = async function () {
    if (process.argv && process.argv[2]) {
        let response = await getValueFromCache(process.argv[2],process.argv[3])
        console.log("response: " + JSON.stringify(response))
    }
}

run()
