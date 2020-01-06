const os = require('os');
const ociRequestor = require('./ociRequestor');
const fs = require('fs');
const https = require('https');
const configs = require('./oci-configuration').configs;
const log = require('./logger').l
const lg = log


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
        response.on('data', function (chunk) {
            responseBody += chunk;
        });

        response.on('end', function () {
            callback(JSON.responseBody ? parse(responseBody) : { "no": "contents" });
        });
    }
}

function createFileObject(bucket, filename, contentsAsString, callback) {
    var options = {
        host: configs.objectStorageAPIEndpoint,
        path: "/n/" + encodeURIComponent(configs.namespaceName) + "/b/" + encodeURIComponent(bucket) + "/o/" + encodeURIComponent(filename),
        method: 'PUT',
        headers: {
            'Content-Type': 'text/plain',
        }
    };
    var request = https.request(options, handleRequest(callback));
    let body = contentsAsString
    signRequest(request, body);
    request.write(body)
    delete options.body;
    request.end();
};

function readFileObject(bucket, filename, contentsAsString) {
    var options = {
        host: configs.objectStorageAPIEndpoint,
        path: "/n/" + encodeURIComponent(configs.namespaceName) + "/b/" + encodeURIComponent(bucket) + "/o/" + encodeURIComponent(filename),
        method: 'GET',
        headers: {
        }
    };

    var request = https.request(options, handleCacheRestore);
    signRequest(request);
    request.end();
};

const CACHE_PERSISTED_FILE = "fn-cache-database.json"
// flag to indicate that cache has changed since last persist operation
let cacheChanged = false

persistCache = function () {
    const cacheAsString = encodeURIComponent(JSON.stringify(cache)) // base64 as next level up: new Buffer.from(encodeURIComponent(JSON.stringify(cache))).toString('base64')
    createFileObject(configs.bucketName, CACHE_PERSISTED_FILE, cacheAsString, (data) => { log(`response from createFileObject ${JSON.stringify(data)}`, 'persistCache()') })
}

restoreCache = function () {
    log(`try to restore cache ${CACHE_PERSISTED_FILE}`, 'restoreCache')
    readFileObject(configs.bucketName, CACHE_PERSISTED_FILE)
}

function handleCacheRestore(response) {
    log('handleCacheRestore', 'handleCacheRestore')
    try {
        var responseBody = "";
        response.on('data', function (chunk) {
            responseBody += chunk;
        });

        response.on('end', function () {
            try {
                var cacheAsString = decodeURIComponent(responseBody)
                cache = JSON.parse(cacheAsString)
            } catch (e) {
                log(`Cache restore response on failed with exception ${e}`, 'handleCacheRestore')
            }
        });
    } catch (e) {
        log(`Cache restore failed with exception ${e}`, 'handleCacheRestore')
    }
}

// create and initialize cache
let cache = { "cacheCreationTime": new Date(), "numberOfReads": 0 }

function writeToCache(cacheKey, value) {
    cache[cacheKey] = value;
    cache["cacheUpdateTime"] = new Date()
    cacheChanged = true
    // take 10 seconds - to gather other cache updates - then persist the cache to file
    setTimeout(function () { log('time out fired, go persist cache', ' timeout set by writeToCache'); persistCache() }, 10000)

    lg(`Write value to cache under key ${cacheKey}`)
    return { "Status": "OK", "UpdatedValueWithKey": cacheKey }
}

function readFromCache(cacheKey) {
    let nor = cache['numberOfReads'] + 1
    cache['numberOfReads'] = nor
    let value
    if ("ALL_CACHE" == cacheKey) {
        log("ALL CACHE")
        const cacheAsString = encodeURIComponent(JSON.stringify(cache)) // base64 as next level up: new Buffer.from(encodeURIComponent(JSON.stringify(cache))).toString('base64')
        value = cacheAsString
    }
    else if ("RESTORE_CACHE" == cacheKey) {
        log("RESTORE CACHE")
        restoreCache()
        value = "tried to restore cache"
    }
    else {
        value = cache[cacheKey]
    }
    try {
        return { "cacheKey": cacheKey, "cacheValue": value, "numberOfCacheReads": nor }
    } catch (e) {
        return { "cacheKey": cacheKey, "error": JSON.stringify(e), "value": value }

    }
}

module.exports = {
    readFromCache: readFromCache,
    writeToCache: writeToCache,
    restoreCache: restoreCache

}


run = async function () {
    if (process.argv && process.argv[2]) {
        const input = JSON.parse(process.argv[2])
        log("input: " + JSON.stringify(input))
        let response = getFromCache(input.key)
        log("response: " + JSON.stringify(response))
    }
}

run()
