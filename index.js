var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')

var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function(req, res) {
  res.send('hello world');
});

app.post('/slack/slash-commands/send-me-buttons', urlencodedParser, (req, res) => {
  res.status(200).end()
  var reqBody = req.body
  var responseURL = reqBody.response_url

  if (reqBody.token != process.env.VERIFICATION_TOKEN) {
    res.status(403).end("Access Forbidden")
  } else {
    var message = {
      "text": "This is your first interactive message",
      "response_type": "in_channel",
      "attachments": [
        {
          "text": "◯◯のタスク終わりましたか？",
          "fallback": "Shame..buttons areN7t supported in this land",
          "callback_id": "task_check",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "done",
              "text": "完了",
              "type": "button",
              "value": "done"
            }
          ]
        }
      ]
    }

    sendMessageToSlackResponseURL(responseURL, message)
  }
})

app.post('/slack/slash-commands/send-me-menus', urlencodedParser, (req, res) => {
  res.status(200).end()
  var reqBody = req.body
  var responseURL = reqBody.response_url

  if (reqBody.token != process.env.VERIFICATION_TOKEN) {
    res.status(403).end("Access Forbidden")
  } else {
    var message = {
      "text": "Would you like to play a game?",
      "response_type": "in_channel",
      "attachments": [
        {
          "text": "Choose a game to play",
          "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "callback_id": "game_selection",
          "actions": [
            {
              "name": "games_list",
              "text": "Pick a game...",
              "type": "select",
              "options": [
                {
                  "text": "Hearts",
                  "value": "hearts"
                },
                {
                  "text": "Bridge",
                  "value": "bridge"
                },
                {
                  "text": "Checkers",
                  "value": "checkers"
                },
                {
                  "text": "Chess",
                  "value": "chess"
                },
                {
                  "text": "Poker",
                  "value": "poker"
                },
                {
                  "text": "Falken's Maze",
                  "value": "maze"
                },
                {
                  "text": "Global Thermonuclear War",
                  "value": "war"
                }
              ]
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
  var message = null
  switch (actionJSONPayload.callback_id) {
    case 'task_check':
//       message = {
//         "text": actionJSONPayload.user.name + " clicked: " + actionJSONPayload.actions[0].name,
// "replace_original": false
//       }
        chatUpdate(actionJSONPayload);
      break
    case 'game_selection':
      message = {
        "text": actionJSONPayload.user.name + " selected: " + actionJSONPayload.actions[0].selected_options[0].value,
"replace_original": false
      }
      sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
      break
  }

})

function chatUpdate(payload) {
  console.log('called chatUpdate')

  console.log(JSON.stringify(payload));
  let postOptions = {
      uri: 'https://slack.com/api/chat.update',
      method: 'POST',
      form: {
        token: process.env.AUTHENTICATION_TOKEN,
        channel: payload.channel.id,
        text: 'Hello World',
        ts: payload.original_message.ts,
        as_user: true
      }
  }
  console.log("token: " + postOptions.form.token)
  console.log("channel: " + postOptions.form.channel)
  console.log("ts: " + postOptions.form.ts)

  request(postOptions, (error, response, body) => {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body);
      if (error) {
      }
  })
}

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
    if (error) {
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
