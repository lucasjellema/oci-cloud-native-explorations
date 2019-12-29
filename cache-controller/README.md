# Cache-Controller
This little project create a Function (with Fn) that invokes an OCI API Gateway to access an API with Stock Response backend and treat the response as a read only cache. The Function is written in Node. It makes the call to the API - using an environment variable or Fn configuration setting called `stock_api_endpoint` to indicate the end point.

The Node application - cacheController.js - can run locally, standalone without Fn interaction. It was created using the request-promise NPM module:

```
npm i request --save
npm i request-promise --save
npm install
```

Before running the Node application, environment variable stock_api_endpoint should be set:
`export stock_api_endpoint='https://ohv2poh465mm.apigateway.us-ashburn-1.oci.customer-oci.com/fn/cache'` 

The command line call to the Node application is like this:
```
node cacheController NA  physics
```
where NA is the cache key and physics is the name of the cache. Note: the name of the cache should correspond to an API Route in the API Gateway at $stock_api_endpoint/<cache name>.

The steps with Fn were as follows - assuming a Function Application called lab-app:

```
fn init  --runtime node cache-controller

fn deploy --app lab-app

fn list functions lab-app

fn config function lab-app cache-controller stock_api_endpoint https://ohv2poh5mm.apigateway.us-ashburn-1.oci.customer-oci.com/fn/cache
```

To invoke the Function, pass an input object that contains key and (name of) cache:
```
echo -n '{"key":"NA","cache":"physics" }' | fn invoke lab-app cache-controller
```

