var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')

var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function(req, res) {
  res.send('hello world');
});

app.post('/slack/slash-commands/send-me-buttons', urlencodedParser, (req, res) => {
  console.log("called /slack/slash-commands/send-me-buttons")
  res.status(200).end()
  var reqBody = req.body
  var responseURL = reqBody.response_url

  if (reqBody.token != process.env.VERIFICATION_TOKEN) {
  console.log("failed token check")
  console.log("reqBody.token: " + reqBody.token)
  console.log("VERIFICATION_TOKEN: " + process.env.VERIFICATION_TOKEN)
    res.status(403).end("Access Forbidden")
  } else {
  console.log("successed token check")
    var message = {
      "text": "This is your first interactive message",
      "attachments": [
        {
          "text": "Building buttons is easy right?",
          "fallback": "Shame..buttons areN7t supported in this land",
          "callback_id": "button_tutorial",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "yes",
              "text": "yes",
              "type": "buton",
              "value": "yes"
            },
            {
              "name": "no",
              "text": "no",
              "type": "buton",
              "value": "no"
            }
          ]
        }
      ]
    }

    sendMessageToSlackResponseURL(responseURL, message)
  }
})

app.post('/slack/actions', urlencodedParser, (req, res) => {
  res.status(200).end()
  var actionJSONPayload = JSON.parse(req.body.payload)
  var message = {
    "text": actionJSONPayload.user.name + " clicked: " + actionJSONPayload.actions[0].name,
    "replace_original": false
  }
  sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})

function sendMessageToSlackResponseURL(responseURL, JSONMessage) {
  var postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONMessage
  }

  request(postOptions, (error, response, body) => {
    if (errror) {
      // handle errors as you see fit
    }
  })
}

const port = process.env.PORT || 3000;
app.listen(port);
app.on("listening", ()=>{
  console.log(`listening on ${port}`);
});
app.on("error", (err)=>{
  console.error(err);
});
