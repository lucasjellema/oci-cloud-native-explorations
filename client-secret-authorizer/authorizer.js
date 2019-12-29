function authorizeClientSecret(token) {
    const expiryInterval = 3600000 // one hour expressed in miliseconds
    const expiry = new Date( Date.now() + expiryInterval );
    const json = {
        "active": true,
        "principal": "Henk",
        "scope": ["list:hello", "read:hello", "create:hello", "update:hello", "delete:hello", "someScope"],
        "clientId": "clientIdFromHeader",
        "expiresAt": expiry.toISOString(),
        "context": {
          "key": "value", "email":"me@mail.com" ,"input": token
        }
      }
    return json
}


module.exports = {
    authorizeClientSecret: authorizeClientSecret
}

// invoke on the command line with :
// node authorizer '{"type":"TOKEN","token":"secret"}'
run = async function () {
    if (process.argv && process.argv[2]) {
        let response =  authorizeClientSecret(process.argv[2])
        console.log("response: " + JSON.stringify(response))
    }
}

run()
