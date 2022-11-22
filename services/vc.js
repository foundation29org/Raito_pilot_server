'use strict'

const config = require('../config')
const request = require('request')
const msal = require('@azure/msal-node');
var mainApp = require('../app.js');
const Session = require('../models/session')
const crypt = require('./crypt');
const { ConsoleReporter } = require('jasmine');

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

function generateBodyRequestVC(callbackurl, id, pin, info){
  var userId= info.individualShare.idUser;
  var infoPermissions = 'I give access to ';
  if(info.individualShare.data.patientInfo &&info.individualShare.data.patientInfo){
    infoPermissions = infoPermissions + 'personal data of the patient and medical information such as documents, seizures, drugs, symptoms, etc.'
  }else if(!info.individualShare.data.patientInfo && info.individualShare.data.patientInfo){
    infoPermissions = infoPermissions + 'medical information such as documents, seizures, drugs, symptoms, etc.'
  }else if(info.individualShare.data.patientInfo && !info.individualShare.data.patientInfo){
    infoPermissions = infoPermissions + 'personal data of the patient.'
  }
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
    "type": "VerifiedCredentialExpert",
    "manifest": `https://verifiedid.did.msidentity.com/v1.0/tenants/${config.VC.TENANT_ID}/verifiableCredentials/contracts/NTBiZGIyMjctMTAwZC00ODA4LWI0YjktYWFjNDI2ZTI4YzRmdmVyaWZpZWRjbGluaWNpYW5yYWl0bw/manifest`, 
    "pin": {"value": `${pin}`,"length": 4}, 
    "claims": {"given_patient": info.patientId,"given_to": userId, "user_name": info.userInfo.userName, "user_lastName": info.userInfo.lastName, "user_email": info.userInfo.email, "infoPermissions": infoPermissions, "notes": info.individualShare.notes, "id": id.toString()}
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


function createIssuer(info) {
	return new Promise(async function (resolve, reject) {
    let patientId= crypt.decrypt(info.patientId);
    let individualShare = info.individualShare;
    let session = new Session()
    session.sessionData = {
      "status" : 0,
      "message": "Waiting for QR code to be scanned"
    };
    session._idIndividualShare = individualShare._id;
    session.sharedWith = individualShare.idUser;
    session.createdBy = info.patientId;
    session.type = info.type;
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
      var requestConfigFile = generateBodyRequestVC(callbackurl, sessionStored._id, pin, info);
      var options = {
        'method': 'POST',
        'url': `https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createIssuanceRequest`,
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
          respJson.pin = pin;

          
          Session.findByIdAndUpdate(sessionStored._id, { data: respJson }, { select: '-createdBy', new: true }, (err, sessionUpdated) => {
            if (err){
              reject({ message: `Error making the request: ${err}` })
            }else{
              resolve(sessionUpdated);
            } 
          })
      });
    })
	});
}


function createIssuerOrganization(info) {
	return new Promise(async function (resolve, reject) {
    let session = new Session()
    session.sessionData = {
      "status" : 0,
      "message": "Waiting for QR code to be scanned"
    };
    session.sharedWith = info.groupName;
    session.createdBy = info.patientId;
    session.type = info.type;
    session.save(async (err, sessionStored) => {
      if (err) {
        console.log(err);
        console.log({ message: `Failed to save in the database: ${err} ` })
      }
      var callbackurl = `${config.client_server}api/issuer/issuanceCallback`;
      if(config.client_server=='http://localhost:4200'){
        callbackurl = "https://ebd0-88-11-6-116.eu.ngrok.io:/api/issuer/issuanceCallback"
      }
      var token = await getToken();
      var auth = 'Bearer '+token;
      var pin = generatePin(4);
      var requestConfigFile = generateBodyRequestOrganizationVC(callbackurl, sessionStored._id, pin, info);
      var options = {
        'method': 'POST',
        'url': "https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createIssuanceRequest",
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
          respJson.pin = pin;

          
          Session.findByIdAndUpdate(sessionStored._id, { data: respJson }, { select: '-createdBy', new: true }, (err, sessionUpdated) => {
            if (err){
              reject({ message: `Error making the request: ${err}` })
            }else{
              resolve(sessionUpdated);
            } 
          })
      });
    })
	});
}

function generateBodyRequestOrganizationVC(callbackurl, id, pin, info){
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
    "type": "VerifiedCredentialExpert",
    "manifest": `https://verifiedid.did.msidentity.com/v1.0/tenants/${config.VC.TENANT_ID}/verifiableCredentials/contracts/NTBiZGIyMjctMTAwZC00ODA4LWI0YjktYWFjNDI2ZTI4YzRmdmVyaWZpZWRvcmdhbml6YXRpb25yYWl0bw/manifest`, 
    "pin": {"value": `${pin}`,"length": 4}, 
    "claims": {"given_patient": info.patientId,"given_organization": info.groupName, "id": id.toString()}
  }
  return body;
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
      callbackurl = "https://ebd0-88-11-6-116.eu.ngrok.io:/api/issuer/issuanceCallback"
    }
    var token = await getToken();
    var auth = 'Bearer '+token;
    var pin = generatePin(4);
    var requestConfigFile = generateBodyRequestVC(callbackurl, sessionStored._id, pin, null);
    var options = {
      'method': 'POST',
      'url': "https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createIssuanceRequest",
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
        respJson.pin = pin;

        
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

async function issuanceCallback (req, res){
  var test = JSON.stringify(req.body).toString();
  var body = test.replace(/'/g, '"');
    if ( req.headers['api-key'] != config.VC.API_KEY ) {
      res.status(401).json({
        'error': 'api-key wrong or missing'
        });  
      return; 
    }
    var issuanceResponse = JSON.parse(body);
    var message = null;
    // there are 2 different callbacks. 1 if the QR code is scanned (or deeplink has been followed)
    // Scanning the QR code makes Authenticator download the specific request from the server
    // the request will be deleted from the server immediately.
    // That's why it is so important to capture this callback and relay this to the UI so the UI can hide
    // the QR code to prevent the user from scanning it twice (resulting in an error since the request is already deleted)
    if ( issuanceResponse.requestStatus == "request_retrieved" ) {
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
        res.status(202).send({ message: 'request_retrieved' })
      })
          
    }

    if ( issuanceResponse.requestStatus == "issuance_successful" ) {
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
        res.status(202).send({ message: 'issuance_successful' })
      })     
    }

    if ( issuanceResponse.requestStatus == "issuance_error" ) {
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
      res.status(202).send(session.sessionData)
    }
  })
}

async function getAllVC (req, res){
  Session.find({"createdBy": req.params.patientId},(err, sessions) => {
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
  createIssuer,
  createIssuerOrganization,
  requestVC,
  issuanceCallback,
  issuanceResponse,
  getAllVC
}
