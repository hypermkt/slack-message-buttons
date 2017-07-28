const http = require('http');
const { createMessageAdapter } = require('@slack/interactive-messages');
const slackMessages = createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

// Initialize an Express application
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// You must use a body parser for the urlencoded format before mounting the adapter
app.use(bodyParser.urlencoded({ extended: false }));

// Mount the event handler on a route
// NOTE: you must mount to a path that matches the Request URL and/or Options URL that was configured
app.use('/slack/actions', slackMessages.expressMiddleware());

slackMessages.action('task_check', (payload) => {
  console.log("clicked task_check");
  console.log(JSON.stringify(payload));

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  let replacement = payload.original_message;
  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  replacement.text =`${payload.user.name}さん、お疲れ様でした`;
  delete replacement.attachments
  // delete replacement.attachments[0].actions;
  return replacement;
});

// Start the express application
const port = process.env.PORT || 3000;
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
