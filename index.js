
const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
let state = "0"
let temperature = 25
// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
app.use(express.json({limit: '1000mb'}))
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
  if(event.message.text === "on" || event.message.text === "off"){
    state =  event.message.text
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
  if(state!="0"){
    // old_state = state
    state = "0"

    let xx = [0x02, 0x20, 0xE0, 0x04, 0x00, 0x00, 0x00, 0x06, 0x02, 0x20, 0xE0, 0x04, 0x00, 0x31, 0x34, 0x80, 0xAF, 0x0D, 0x00, 0x06, 0x60, 0x40, 0x00, 0x81, 0x00, 0x04, 0xD2];
    let cmd_msg = {
      status:0,
      state:xx
    }
    res.send(JSON.stringify(cmd_msg))
  }else{
    res.send("0")
  }

})
// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});