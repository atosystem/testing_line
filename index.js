
const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
let state = 0
// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  if(event.message.text === "s"){
    state = 1
    return client.replyMessage(event.replyToken, { type: 'text', text: "got it" });
  }else{
    // create a echoing text message
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
  
}


app.get('/send',(req,res) =>{
    let message = {
        type: 'text',
        text: 'Hello World!'
      };
    client.pushMessage("Ue521265b814673aaf5f56d1216979d54",message)
    .then(() => {
        console.log("Message pushed")
        res.send("message sent")
    })
    .catch((err) => {
        res.send("error pushing message")
    // error handling
    });
})


app.get('/check',(req,res)=>{
  if(state==1){
    state = 0
    res.send("1")
  }else{
    res.send("0")
  }

})
// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});