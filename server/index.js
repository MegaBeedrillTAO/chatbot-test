const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://myfirstchatbot-mwbxax.firebaseio.com"
})

const {SessionsClient} = require('dialogflow');

exports.dialogflowGateway = functions.https.onRequest((req, res) => {
  cors(req, res, async() => {
    const {queryInput, sessionId} = req.body;
    const sessionClient = new SessionsClient({credentials: serviceAccount});
    const session = sessionClient.sessionPath('myFirstChatBot', sessionId);
    const responses = await sessionClient.detectIntent({session, queryInput});
    const result = responses[0].queryResult;
    res.status(200).json(result);
  })
})

const {WebhookClient} = require('dialogflow-fulfillment');

exports.dialogflowGateway = functions.https.onRequest(async (req, res) => {
  const agent = new WebhookClient({req, res});
  console.log(JSON.stringify(req.body));
  const result = req.body.queryResult;

  async function userOnBoardHandler(agent){
    const db = admin.firestore();
    const profile = db.collection('users').doc('jakeTest');
    const {stupid} = req.parameters;
    await profile.set({stupid});
    agent.add('Hey there.');
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('UserOnBoarding', userOnBoardHandler);

})