const fdk=require('@fnproject/fdk');
const authorizer = require( './authorizer.js' );

fdk.handle(function(input, ctx){
   let x = authorizer.authorizeClientSecret(input)
   ctx.setResponseHeader('Fn-Http-Status', 200)
   ctx.setResponseHeader("Greeting", "Goedendag")
   ctx.setResponseHeader("secret-header", input.header)
   ctx.setResponseHeader("secret-token", input.token)
   ctx.setResponseHeader("secret-type", input.type)
   if (Math.random() < 0.4) {
     // simulate authorization error
     x=
     {
      "active": false,
      "expiresAt": "2019-05-30T10:15:30+01:00",
      "context": {
        "email": "james.doe@example.com"
        , "input" : input
        },
      "wwwAuthenticate": "Bearer realm=\"lucas.jellema.com\""
    }
    // this status causes the authorization to fail and the API Gateway to reject the request with a 401 to the original caller
    ctx.setResponseHeader('Fn-Http-Status', 500)
    
   }
  return x
})

// invoke with :
// echo -n '{"type":"TOKEN","token":"secret"}' | fn invoke lab-app client-secret-authorizer