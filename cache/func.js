const fdk = require('@fnproject/fdk');
const cache = require('./cache')
const log = require('./logger').l

// from: https://davidwalsh.name/query-string-javascript
function getUrlParameter(url, name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(url);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

let firstCall = true
try {
  if (firstCall) {
    log('go try restore cache because first call')
    cache.restoreCache()
    firstCall = false
  }
} catch (e) {
  log(`error in attempt to restore cache ${JSON.stringify(e)}`)
}

fdk.handle(function (input, ctx) {


  // operation can be read from input document (if available) or from ctx._headers["Fn-Http-Method"])
  try {
    let result = {};
    ctx.logs = []
    const requestURL = (ctx && ctx._headers && ctx._headers["Fn-Http-Request-Url"]) ? ctx._headers["Fn-Http-Request-Url"] : ""
    // ctx.requestURL = requestURL
    // ctx.logs.push(`requestURL = ${requestURL}`)
    try {
      if (requestURL && requestURL.endsWith("heartbeat")) {
        // result does not matter because health check is only interested in 20X response code - which it will get
        result.heartBeat = "true"
        return result
      }
    } catch (e) {
        log(`exception when checking for heartbeat ${e} on ${requestURL}`)
    }

    // log(`input = ${JSON.stringify(input)}`)
    // ctx.logs.push(`input = ${JSON.stringify(input)}`)
    const operation = input ? input.operation : ctx._headers["Fn-Http-Method"];
    // log(`operation ${operation}`)
    // ctx.logs.push(`operation ${operation}`)

    let key 
    if (ctx._headers && ctx._headers["Fn-Http-Request-Url"]) {
      key = getUrlParameter(ctx._headers["Fn-Http-Request-Url"], "key")
      // ctx.key = key
      // log(`key found in URL ${key}`)
      // ctx.logs.push(`key found in URL ${key}`)
    }
    const key2 = (input && input.key) ? input.key : key;
    // ctx.logs.push(`key2 ${key2}`)
    // ctx.key2 = key2
    // log(`key = ${key2}`)
    if ("GET" == operation) {
      ctx.operation = 'GET'
      try {
        result = cache.readFromCache(key2)
        // ctx.logs.push(`result in GET ${JSON.stringify(result)}`)
      } catch (e) {
        ctx.GET_RESULT_ERROR = e;
        result = { "error": "in readfromcache", "err": JSON.stringify(e) }
        throw e
      }
    }
    else if ("PUT" == operation) {
      // ctx.operation = 'PUT'
      try {
        result = cache.writeToCache(key2, input.value)
      } catch (e) {
        // ctx.logs.push(`exception in PUT - writeToCache ${e}`)
        log(`Write to cache failed with error ${e}`)
      }
    }
    // log(`result is ready ${result}`)
    // ctx.logs.push(`result ${JSON.stringify(result)}`)
    // result.contxt = ctx;
    return result
  } catch (e) {
      return { "error": e, "version": "1.01", "ctx": ctx }
  }
})


// invoke with :
// echo -n '{"operation":"GET","key":"somekey"}' | fn invoke lab-app cache
// echo -n '{"operation":"PUT","key":"somekey","value":"cached value"}' | fn invoke lab-app cache

// deploy with :
// fn deploy --app lab-app 
