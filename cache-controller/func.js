const fdk=require('@fnproject/fdk');
const cacheController = require( './cacheController.js' );

fdk.handle(async function(input){
  let cacheName = 'default';
  if (input.cache) {
    cacheName = input.cache;
  }
  let cacheKey = 'defaultKey';
  if (input.key) {
    cacheKey = input.key;
  }
  var x = await cacheController.getFromCache(cacheKey, cacheName)
  return {'valueFromCache':x}
})

// invoke with :
// echo -n '{"key":"NA","cache":"physics"}' | fn invoke lab-app cache-controller
