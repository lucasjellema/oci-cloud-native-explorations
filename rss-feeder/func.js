const fdk = require('@fnproject/fdk');

const rssFeeder = require('./rssFeederAsync')
fdk.handle(function (input) {
  try {
    const x = rssFeeder.processRSSAsync(input.rssFeedURL, input.filename)
    console.log(`invoked rssFeeder;result: ${JSON.stringify(x)}`)
    return x
  } catch (e) {
    console.log(`failed: invoked rssFeeder;result: ${JSON.stringify(e)}`)
    throw e;

  }
})

// invoke with :
// echo -n '{"rssFeedURL":"https://technology.amis.nl/feed/","filename":"amis-blog-rss-overview.json"}' | fn invoke lab-app rss-feeder

// deploy with :
// fn deploy --app lab-app 
// set config variable:
// fn config function lab-app rss-feeder file_writer_endpoint https://ohv2pohm.apigateway.us-ashburn-1.oci.customer-oci.com/fn/persist