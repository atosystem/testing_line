
const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
let cmds = [
  {
    state : 0,
    cmd : "off",
    ir_state : []
  },
  {
    state : 0,
    cmd : "off",
    ir_state : []
  }
]

const on_state = [0x02, 0x20, 0xE0, 0x04, 0x00, 0x00, 0x00, 0x06, 0x02, 0x20, 0xE0, 0x04, 0x00, 0x31, 0x32, 0x80, 0xAF, 0x0D, 0x00, 0x06, 0x60, 0x40, 0x00, 0x81, 0x00, 0x04, 0xD0]
const off_state = [0x02, 0x20, 0xE0, 0x04, 0x00, 0x00, 0x00, 0x06, 0x02, 0x20, 0xE0, 0x04, 0x00, 0x30, 0x32, 0x80, 0xAF, 0x0D, 0x00, 0x06, 0x60, 0x40, 0x00, 0x81, 0x00, 0x04, 0xCF]

let temperature = 25
// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
// app.use(express.json({limit: '1000mb'}))
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
  console.log(event)
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  if(event.message.text === "on" || event.message.text === "off"){
    if(event.message.text === "on")
    {
      for (let i = 0; i < cmds.length; i++) {
        cmds[i].state = 1
        cmds[i].cmd = "on"
        cmds[i].ir_state = on_state
      }
    }else{
      for (let i = 0; i < cmds.length; i++) {
        cmds[i].state = 1
        cmds[i].cmd = "off"
        cmds[i].ir_state = off_state
      }
    }
    // state =  event.message.text
    return client.replyMessage(event.replyToken, { type: 'text', text: "got it" });
  }else if(!isNaN(event.message.text)){
    temperature = Number(event.message.text)
    state = "settemp"
    return client.replyMessage(event.replyToken, { type: 'text', text: "change temp" });
  }else{
    // create a echoing text message
    // const echo = { type: 'text', text: event.message.text };
    const echo = { type: 'text', text: "輸入規則\non來開冷氣\noff來關冷氣" };

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
  let machine_id = req.query.id
  console.log(`Check from client ${machine_id}`)
  if(cmds[machine_id].state)
  {
    let cmd_msg = {
      status:1,
      state : cmds[machine_id].ir_state
    }
    let msg_send = JSON.stringify(cmd_msg)
    cmds[machine_id].state = 0
    cmds[machine_id].ir_state = []
    res.send(msg_send)
  }else{
    let cmd_msg = {
      status:0,
      state : []
    }
    let msg_send = JSON.stringify(cmd_msg)
    res.send(msg_send)
  }
  
})

// app.get('/check/2',(req,res)=>{
//   let on_state = [0x02, 0x20, 0xE0, 0x04, 0x00, 0x00, 0x00, 0x06, 0x02, 0x20, 0xE0, 0x04, 0x00, 0x31, 0x32, 0x80, 0xAF, 0x0D, 0x00, 0x06, 0x60, 0x40, 0x00, 0x81, 0x00, 0x04, 0xD0]
//   let off_state = [0x02, 0x20, 0xE0, 0x04, 0x00, 0x00, 0x00, 0x06, 0x02, 0x20, 0xE0, 0x04, 0x00, 0x30, 0x32, 0x80, 0xAF, 0x0D, 0x00, 0x06, 0x60, 0x40, 0x00, 0x81, 0x00, 0x04, 0xCF]
//   let cmd_msg = {
//     status:1,
//     state : []
//   }
//   if(state!="0"){
//     // old_state = state
    
//     if(state==="on"){
//       cmd_msg.state = on_state
//       // cmd_msg.state[26] = 0xCF //power on
//     }else if(state==="off"){
//       cmd_msg.state = off_state
//       // cmd_msg.state=[0x02, 0x20, 0xE0, 0x04, 0x00, 0x00, 0x00, 0x06, 0x02, 0x20, 0xE0, 0x04, 0x00, 0x30, 0x32, 0x80, 0xAF, 0x0D, 0x00, 0x06, 0x60, 0x40, 0x00, 0x81, 0x00, 0x04, 0xCF] //power off
//     }else if(state==="settemp"){
//       // cmd_msg.state[14] = temperature*2
//     }
//     state = "0"
    
//     res.send(JSON.stringify(cmd_msg))
//   }else{
//     let cmd_msg = {
//       status:0,
//       state : []
//     }
//     res.send(JSON.stringify(cmd_msg))
//   }

// })

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
