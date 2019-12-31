const fdk=require('@fnproject/fdk');
const fileWriter=require('./fileWriter')
fdk.handle(function(input){
  const x = fileWriter.fileWriter(input.bucketname, input.filename, JSON.stringify(input.contents))
  return x
})



// invoke with :
// echo -n '{"bucketname":"fn-bucket","filename":"my-special-file.txt","contents":"De inhoud van de nieuwe file"}' | fn invoke lab-app file-writer

// deploy with :
// fn deploy --app lab-app 