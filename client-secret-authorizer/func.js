const fdk = require('@fnproject/fdk');
const authorizer = require('./authorizer.js');

fdk.handle(function (input, ctx) {
  console.log(`Authorizer Function is invoked with input ${JSON.stringify(input)}`)
  console.log(`Authorizer Function is invoked with ctx ${JSON.stringify(ctx)}`)
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