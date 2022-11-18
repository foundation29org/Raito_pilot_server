'use strict'

const config = require('../config')
const request = require('request')
const msal = require('@azure/msal-node');
const Session = require('../models/session')
const crypt = require('./crypt')

const msalConfig = {
  auth: {
    clientId: config.VC.CLIENT_ID,
    authority: `https://login.microsoftonline.com/${config.VC.TENANT_ID}`,
    clientSecret: config.VC.CLIENT_SECRET,
 }
};

const msalClientCredentialRequest = {
  scopes: ["3db474b9-6a0c-4840-96ac-1fceb342124f/.default"],
  skipCache: false, 
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

async function getToken (){
  var accessToken = "";
  try {
    const result = await cca.acquireTokenByClientCredential(msalClientCredentialRequest);
    if ( result ) {
      accessToken = result.accessToken;
      return accessToken;
    }
  } catch {
    console.log( "failed to get access token" );
    res.status(401).json({
        'error': 'Could not acquire credentials to access your Azure Key Vault'
        });  
      return; 
  }  
}

function generateBodyRequestVC(callbackurl, id){
  var body =  
  {
    "includeQRCode": true,
    "callback":{
      "url": `${callbackurl}`,
      "state": id,
      "headers": {
        "api-key": config.VC.API_KEY
      }
    },
    "authority": config.VC.AUTHORITY_DID, 
    "registration": {
      "clientName": "Verifiable Credential Expert Sample"
    },
    "presentation": {
      "includeReceipt": true,
      "requestedCredentials": [
        {
          "type": "VerifiedCredentialExpert",
          "purpose": "the purpose why the verifier asks for a VC",
          "acceptedIssuers": [ config.VC.AUTHORITY_DID ]
        }
      ]
    }
    }
    return body;
}

async function presentationRequest (req, res){
  let patientId= crypt.decrypt(req.params.patientId);
  //save new session
  let session = new Session()
  session.sessionData = {
    "status" : 0,
    "message": "Waiting for QR code to be scanned"
  };
  session.createdBy = patientId;
  session.save(async (err, sessionStored) => {
    if (err) {
			console.log(err);
			console.log({ message: `Failed to save in the database: ${err} ` })
		}
    var callbackurl = `${config.client_server}api/verifier/presentation-request-callback`;
    if(config.client_server=='http://localhost:4200'){
      callbackurl = "https://32e4-88-11-10-36.eu.ngrok.io:/api/verifier/presentation-request-callback"
    }
    var token = await getToken();
    var auth = 'Bearer '+token;
    var requestConfigFile = generateBodyRequestVC(callbackurl, sessionStored._id);
    var options = {
      'method': 'POST',
      'url': `https://verifiedid.did.msidentity.com/v1.0/${config.VC.TENANT_ID}/verifiablecredentials/request`,
      'headers': {
        'Content-Type': 'Application/json',
        'Authorization': auth
      },
      body: JSON.stringify(requestConfigFile)
    
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      var respJson = JSON.parse(response.body)
        //respJson.id = sessionStored._id;

        
        Session.findByIdAndUpdate(sessionStored._id, { data: respJson }, { select: '-createdBy', new: true }, (err, sessionUpdated) => {
          if (err){
            return res.status(500).send({ message: `Error making the request: ${err}` })
          }else{
            res.status(200).send(sessionUpdated)
          } 
        })
    });
  })
  
}

async function presentationRequestCallback (req, res){
  var test = JSON.stringify(req.body).toString();
  var body = test.replace(/'/g, '"');
    if ( req.headers['api-key'] != config.VC.API_KEY ) {
      res.status(401).json({
        'error': 'api-key wrong or missing'
        });  
      return; 
    }
    var presentationResponse = JSON.parse(body);
    var message = null;
    // there are 2 different callbacks. 1 if the QR code is scanned (or deeplink has been followed)
    // Scanning the QR code makes Authenticator download the specific request from the server
    // the request will be deleted from the server immediately.
    // That's why it is so important to capture this callback and relay this to the UI so the UI can hide
    // the QR code to prevent the user from scanning it twice (resulting in an error since the request is already deleted)
    if ( presentationResponse.code == "request_retrieved" ) {
      message = "QR Code is scanned. Waiting for validation...";

      var sessionData = {
        "status" : presentationResponse.code,
        "message": message
      };
      Session.findByIdAndUpdate(presentationResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true}, (err,sessionUpdated) => {
        if (err) {
          console.log(err);
          console.log({ message: `Error making the request: ${err} ` })
          res.status(202).send({ message: 'Error QR Code..' })
        }
        res.status(202).send({ message: 'QR Code is scanned. Waiting for validation...' })
      })
          
    }

    if ( presentationResponse.code == "presentation_verified" ) {

      var sessionData = {
        "status": presentationResponse.code,
        "message": "Presentation received",
        "payload": presentationResponse.issuers,
        "subject": presentationResponse.subject,
        "firstName": presentationResponse.issuers[0].claims.firstName,
        "lastName": presentationResponse.issuers[0].claims.lastName,
        "presentationResponse": presentationResponse
    };
      Session.findByIdAndUpdate(presentationResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true}, (err,sessionUpdated) => {
        if (err) {
          console.log(err);
          console.log({ message: `Error making the request: ${err} ` })
          res.status(202).send({ message: 'Error Credential successfully issued' })
        }
        res.status(202).send({ message: 'Credential successfully issued' })
      })     
    }
}

async function presentationResponse (req, res){
  var id = req.params.sessionId;
  Session.findById(id, (err, session) => {
    if (err) {
      console.log(err);
      console.log({ message: `Error getting session: ${err} ` })
      res.status(202).send({ message: 'Error getting session' })
    }
    if(!session){
      res.status(202).send({ message: 'The sessions dont exist' })
    }else{
      delete session.sessionData.presentationResponse; // browser don't need this
      res.status(202).send({ data: session.sessionData })
    }
  })
}

async function presentationResponseb2c (req, res){
  var id = req.body.id;
  Session.findById(id, (err, session) => {
    if (err) {
      console.log(err);
      console.log({ message: `Error getting session: ${err} ` })
      res.status(202).send({ message: 'Error getting session' })
    }
    if(!session){
      res.status(409).send({
        'version': '1.0.0', 
        'status': 400,
        'userMessage': 'Verifiable Credentials not presented'
        });
    }else{
      console.log("Has VC. Will return it to B2C");      
      var claims = session.sessionData.presentationResponse.issuers[0].claims;
      var claimsExtra = {
        'vcType': 'VerifiedCredentialExpert',
        'vcIss': session.sessionData.presentationResponse.issuers[0].authority,
        'vcSub': session.sessionData.presentationResponse.subject,
        'vcKey': session.sessionData.presentationResponse.subject.replace("did:ion:", "did.ion.").split(":")[0]
        };        
        var responseBody = { ...claimsExtra, ...claims }; // merge the two structures
        Session.findByIdAndUpdate(id, { sessionData: null }, {select: '-createdBy', new: true}, (err,sessionUpdated) => {
        })
        res.status(200).json( responseBody );
    }
  })
}

async function getAllVC (req, res){
  let patientId= crypt.decrypt(req.params.patientId);
  Session.find({"createdBy": patientId},(err, sessions) => {
    if (err) return res.status(500).send({message: `Error making the request: ${err}`})
    var listsessions = [];
    if(sessions.length>0){
      for (var i = 0; i < sessions.length; i++) {
        listsessions.push(sessions[i]);
      }
      res.status(200).send({listsessions})
    }else{
      res.status(200).send({listsessions})
    }
  
  
  })
}



module.exports = {
  presentationRequest,
  presentationRequestCallback,
  presentationResponse,
  presentationResponseb2c,
  getAllVC
}
