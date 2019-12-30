const fdk = require('@fnproject/fdk');
const authorizer = require('./authorizer.js');

fdk.handle(function (input, ctx) {
  if (!input || !input.type || !(input.type == 'TOKEN' ? input.token : input.header)) {
    // no token is passed in
    const x =
    {
      "active": false,
      "expiresAt": "2019-05-30T10:15:30+01:00",
      "context": {
        "email": "james.doe@example.com"
        , "input": input
      },
      "wwwAuthenticate": "Bearer realm=\"provide.token.next.time.round\" "
    }
    // this status causes the authorization to fail and the API Gateway to reject the request with a 401 to the original caller
    //ctx.setResponseHeader('Fn-Http-Status', 500)
    return x
  }
  const x = authorizer.authorizeClientSecret(input.type == 'TOKEN' ? input.token : input.header)
  ctx.setResponseHeader("Greeting", "Goedendag")
  ctx.setResponseHeader("secret-header", input.header)
  ctx.setResponseHeader("secret-token", input.token)
  ctx.setResponseHeader("secret-type", input.type)
  return x
})

// invoke with :
// echo -n '{"type":"TOKEN","token":"secret2"}' | fn invoke lab-app client-secret-authorizer