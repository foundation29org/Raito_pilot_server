'use strict'

const config = require('../config')
const axios = require('axios')
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
  let session = new Session()
  session.sessionData = {
    "status" : 0,
    "message": "Waiting for QR code to be scanned"
  };
  session.createdBy = patientId;
  try {
    const sessionStored = await session.save();
    var callbackurl = `${config.client_server}api/verifier/presentation-request-callback`;
    if(config.client_server=='http://localhost:4200'){
      callbackurl = "https://32e4-88-11-10-36.eu.ngrok.io:/api/verifier/presentation-request-callback"
    }
    var token = await getToken();
    var auth = 'Bearer '+token;
    var requestConfigFile = generateBodyRequestVC(callbackurl, sessionStored._id);
    try {
      const response = await axios.post(
        `https://verifiedid.did.msidentity.com/v1.0/${config.VC.TENANT_ID}/verifiablecredentials/request`,
        requestConfigFile,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          }
        }
      );
      var respJson = response.data;

      const sessionUpdated = await Session.findByIdAndUpdate(sessionStored._id, { data: respJson }, { select: '-createdBy', new: true });
      res.status(200).send(sessionUpdated)
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: `Error making the request: ${error}` })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: `Failed to save in the database: ${err} ` })
  }
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
    if ( presentationResponse.code == "request_retrieved" ) {
      message = "QR Code is scanned. Waiting for validation...";

      var sessionData = {
        "status" : presentationResponse.code,
        "message": message
      };
      try {
        await Session.findByIdAndUpdate(presentationResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true});
        res.status(202).send({ message: 'QR Code is scanned. Waiting for validation...' })
      } catch (err) {
        console.log(err);
        res.status(202).send({ message: 'Error QR Code..' })
      }
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
      try {
        await Session.findByIdAndUpdate(presentationResponse.state, { sessionData: sessionData }, {select: '-createdBy', new: true});
        res.status(202).send({ message: 'Credential successfully issued' })
      } catch (err) {
        console.log(err);
        res.status(202).send({ message: 'Error Credential successfully issued' })
      }
    }
}

async function presentationResponse (req, res){
  try {
    var id = req.params.sessionId;
    const session = await Session.findById(id);
    if(!session){
      res.status(202).send({ message: 'The sessions dont exist' })
    }else{
      delete session.sessionData.presentationResponse;
      res.status(202).send({ data: session.sessionData })
    }
  } catch (err) {
    console.log(err);
    res.status(202).send({ message: 'Error getting session' })
  }
}

async function presentationResponseb2c (req, res){
  try {
    var id = req.body.id;
    const session = await Session.findById(id);
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
        var responseBody = { ...claimsExtra, ...claims };
        await Session.findByIdAndUpdate(id, { sessionData: null }, {select: '-createdBy', new: true});
        res.status(200).json( responseBody );
    }
  } catch (err) {
    console.log(err);
    res.status(202).send({ message: 'Error getting session' })
  }
}

async function getAllVC (req, res){
  try {
    let patientId= crypt.decrypt(req.params.patientId);
    const sessions = await Session.find({"createdBy": patientId});
    var listsessions = [];
    for (var i = 0; i < sessions.length; i++) {
      listsessions.push(sessions[i]);
    }
    res.status(200).send({listsessions})
  } catch (err) {
    return res.status(500).send({message: `Error making the request: ${err}`})
  }
}



module.exports = {
  presentationRequest,
  presentationRequestCallback,
  presentationResponse,
  presentationResponseb2c,
  getAllVC
}
