'use strict'

const config = require('../config')
const request = require('request')
const msal = require('@azure/msal-node');
var mainApp = require('../app.js');
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
  console.log( `accessToken: ${accessToken}` );
  
}

function generateBodyRequestVC(callbackurl, id, pin){
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
    "issuance": {
       "type": "VerifiedCredentialExpert", 
       "manifest": `https://beta.eu.did.msidentity.com/v1.0/${config.VC.TENANT_ID}/verifiableCredential/contracts/VerifiedCredentialExpert`, 
       "pin": {"value": `${pin}`,"length": 4}, 
       "claims": {"given_name": "Megan","family_name": "Bowen"}
      }
    }
    return body;
}

function generatePin( digits ) {
  var add = 1, max = 12 - add;
  max        = Math.pow(10, digits+add);
  var min    = max/10; // Math.pow(10, n) basically
  var number = Math.floor( Math.random() * (max - min + 1) ) + min;
  return ("" + number).substring(add); 
}

async function requestVC (req, res){
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
    var callbackurl = `${config.client_server}api/issuer/issuanceCallback`;
    if(config.client_server=='http://localhost:4200'){
      callbackurl = "https://32e4-88-11-10-36.eu.ngrok.io:/api/issuer/issuanceCallback"
    }
    var token = await getToken();
    var auth = 'Bearer '+token;
    var pin = generatePin(4);
    var requestConfigFile = generateBodyRequestVC(callbackurl, sessionStored._id, pin);
    var options = {
      'method': 'POST',
      'url': `https://beta.eu.did.msidentity.com/v1.0/${config.VC.TENANT_ID}/verifiablecredentials/request`,
      'headers': {
        'Content-Type': 'Application/json',
        'Authorization': auth
      },
      body: JSON.stringify(requestConfigFile)
    
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      var respJson = JSON.parse(response.body)
        respJson.id = sessionStored._id;
        respJson.pin = pin;
        res.status(200).send(respJson)
    });
  })
  
}

async function issuanceCallback (req, res){
  var test = JSON.stringify(req.body).toString();
  var body = test.replace(/'/g, '"');
    console.log( body );
    if ( req.headers['api-key'] != config.VC.API_KEY ) {
      res.status(401).json({
        'error': 'api-key wrong or missing'
        });  
      return; 
    }
    var issuanceResponse = JSON.parse(body);
    console.log(issuanceResponse);
    var message = null;
    // there are 2 different callbacks. 1 if the QR code is scanned (or deeplink has been followed)
    // Scanning the QR code makes Authenticator download the specific request from the server
    // the request will be deleted from the server immediately.
    // That's why it is so important to capture this callback and relay this to the UI so the UI can hide
    // the QR code to prevent the user from scanning it twice (resulting in an error since the request is already deleted)
    if ( issuanceResponse.code == "request_retrieved" ) {
      message = "QR Code is scanned. Waiting for issuance to complete...";

      var sessionData = {
        "status" : "request_retrieved",
        "message": message
      };
      Session.findByIdAndUpdate(issuanceResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true}, (err,sessionUpdated) => {
        if (err) {
          console.log(err);
          console.log({ message: `Error making the request: ${err} ` })
          res.status(202).send({ message: 'Error QR Code..' })
        }
        res.status(202).send({ message: 'QR Code is scanned. Waiting for issuance to complete..' })
      })
          
    }

    if ( issuanceResponse.code == "issuance_successful" ) {
      message = "Credential successfully issued";
      var sessionData = {
        "status" : "issuance_successful",
        "message": message
      };
      Session.findByIdAndUpdate(issuanceResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true}, (err,sessionUpdated) => {
        if (err) {
          console.log(err);
          console.log({ message: `Error making the request: ${err} ` })
          res.status(202).send({ message: 'Error Credential successfully issued' })
        }
        res.status(202).send({ message: 'Credential successfully issued' })
      })     
    }

    if ( issuanceResponse.code == "issuance_error" ) {
      var sessionData = {
        "status" : "issuance_error",
        "message": issuanceResponse.error.message,
        "payload" :issuanceResponse.error.code
      };
      Session.findByIdAndUpdate(issuanceResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true}, (err,sessionUpdated) => {
        if (err) {
          console.log(err);
          console.log({ message: `Error making the request: ${err} ` })
          res.status(202).send({ message: 'Error issuance_error' })
        }
        res.status(202).send({ message: 'issuance_error' })
      })      
    }
}

async function issuanceResponse (req, res){
  let patientId= crypt.decrypt(req.params.patientId);
  var id = req.query.id;
  Session.findById(id, (err, session) => {
    if (err) {
      console.log(err);
      console.log({ message: `Error getting session: ${err} ` })
      res.status(202).send({ message: 'Error getting session' })
    }
    if(!session){
      res.status(202).send({ message: 'The sessions dont exist' })
    }else{
      res.status(202).send({ data: session.sessionData })
    }
  })
}

module.exports = {
  requestVC,
  issuanceCallback,
  issuanceResponse
}
