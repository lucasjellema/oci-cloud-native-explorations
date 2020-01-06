// log the message to the console output with source and timestamp
function log(message, caller=log.caller.name) {
  
   console.log( `${new Date(Date.now())} - ${message} - Logged from ${caller}`)
}

module.exports = {log:log, l:log}