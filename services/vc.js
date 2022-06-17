'use strict'

const config = require('../config')
const request = require('request')
const msal = require('@azure/msal-node');
var mainApp = require('../app.js');

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
        "api-key": "ade3600d-9fda-4314-aa60-b01663313e2a"
      }
    },
    "authority": "did:ion:EiDE2LtNwb0bllvgy5IaSbJGz21MhtxNrQQGGaa0PCs-Sg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiI3MjFlNjQzOGUzYTQ0YWU2OWI3M2Y0NjZlNjMwZmFjZXZjU2lnbmluZ0tleS0yOTdkYSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmQ1ViMGVvNU13dVZjLS1Ya1huODN0YkdBMDZGNkZkOW9EZHV4T1VJX3E0IiwieSI6IkdROVJrXzc1bDBXYmNBOHQ1Z3hfVG5ySnB2T0c4emQxcmlPVjRocFVyODgifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XSwic2VydmljZXMiOlt7ImlkIjoibGlua2VkZG9tYWlucyIsInNlcnZpY2VFbmRwb2ludCI6eyJvcmlnaW5zIjpbImh0dHBzOi8vZm91bmRhdGlvbjI5Lm9yZy8iXX0sInR5cGUiOiJMaW5rZWREb21haW5zIn0seyJpZCI6Imh1YiIsInNlcnZpY2VFbmRwb2ludCI6eyJpbnN0YW5jZXMiOlsiaHR0cHM6Ly9iZXRhLmh1Yi5tc2lkZW50aXR5LmNvbS92MS4wLzUwYmRiMjI3LTEwMGQtNDgwOC1iNGI5LWFhYzQyNmUyOGM0ZiJdfSwidHlwZSI6IklkZW50aXR5SHViIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlERGdVNUJka3BOZE9LcGpYbF9DWDQ3NVVvTmJuUlBHTGEzSTJqbXRhN05RUSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQjlEZm84ZVJ2SUNjZ19JU1V6bzQwMFZTYjJyUEV5TmZGYWdXZ0xaUW1RSlEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUMyQ3UwZXE2R2hrSWJSQU9vcFhBZFFZQnRmajRCcktxUi00ZXlMYWZqOTJBIn19", 
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
  var id = req.session.id;
  mainApp.sessionStore.get( id, (error, session) => {
    var sessionData = {
      "status" : 0,
      "message": "Waiting for QR code to be scanned"
    };
    if ( session ) {
      session.sessionData = sessionData;
      mainApp.sessionStore.set( id, session);  
    }
  });

  var token = await getToken();
  //console.log(token);
  console.log(req.hostname)
  var callbackurl = `https://${req.hostname}/api/issuer/issuance-request-callback`;
  if(req.hostname=='localhost'){
    callbackurl = "https://32e4-88-11-10-36.eu.ngrok.io:/api/issuer/issuanceCallback"
  }
  var pin = generatePin(4);
  var requestConfigFile = generateBodyRequestVC(callbackurl, id, pin);
  console.log(requestConfigFile)
  var options = {
    'method': 'POST',
    'url': `https://beta.eu.did.msidentity.com/v1.0/${config.VC.TENANT_ID}/verifiablecredentials/request`,
    'headers': {
      'Content-Type': 'Application/json',
      'Authorization': 'Bearer '+token
    },
    body: JSON.stringify(requestConfigFile)
  };
  // body: '{"includeQRCode": true,"callback": {"url": "https://32e4-88-11-10-36.eu.ngrok.io:/api/issuer/issuanceCallback","state": "7bdfb936-2130-4fa3-88c0-736b0a5ce1b5","headers": {"api-key": "ade3600d-9fda-4314-aa60-b01663313e2a"}},"authority": "did:ion:EiDE2LtNwb0bllvgy5IaSbJGz21MhtxNrQQGGaa0PCs-Sg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiI3MjFlNjQzOGUzYTQ0YWU2OWI3M2Y0NjZlNjMwZmFjZXZjU2lnbmluZ0tleS0yOTdkYSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmQ1ViMGVvNU13dVZjLS1Ya1huODN0YkdBMDZGNkZkOW9EZHV4T1VJX3E0IiwieSI6IkdROVJrXzc1bDBXYmNBOHQ1Z3hfVG5ySnB2T0c4emQxcmlPVjRocFVyODgifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XSwic2VydmljZXMiOlt7ImlkIjoibGlua2VkZG9tYWlucyIsInNlcnZpY2VFbmRwb2ludCI6eyJvcmlnaW5zIjpbImh0dHBzOi8vZm91bmRhdGlvbjI5Lm9yZy8iXX0sInR5cGUiOiJMaW5rZWREb21haW5zIn0seyJpZCI6Imh1YiIsInNlcnZpY2VFbmRwb2ludCI6eyJpbnN0YW5jZXMiOlsiaHR0cHM6Ly9iZXRhLmh1Yi5tc2lkZW50aXR5LmNvbS92MS4wLzUwYmRiMjI3LTEwMGQtNDgwOC1iNGI5LWFhYzQyNmUyOGM0ZiJdfSwidHlwZSI6IklkZW50aXR5SHViIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlERGdVNUJka3BOZE9LcGpYbF9DWDQ3NVVvTmJuUlBHTGEzSTJqbXRhN05RUSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQjlEZm84ZVJ2SUNjZ19JU1V6bzQwMFZTYjJyUEV5TmZGYWdXZ0xaUW1RSlEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUMyQ3UwZXE2R2hrSWJSQU9vcFhBZFFZQnRmajRCcktxUi00ZXlMYWZqOTJBIn19", "registration": {"clientName": "Verifiable Credential Expert Sample"},"issuance": { "type": "VerifiedCredentialExpert", "manifest": "https://beta.eu.did.msidentity.com/v1.0/50bdb227-100d-4808-b4b9-aac426e28c4f/verifiableCredential/contracts/VerifiedCredentialExpert", "pin": {   "value": "1313",   "length": 4 }, "claims": {   "given_name": "Megan",   "family_name": "Bowen" }}}'
  try {
    request(options, function (error, response) {
      if (error) throw new Error(error);
      var respJson = JSON.parse(response.body)
      respJson.id = id;
      respJson.pin = pin;
      res.status(200).send(respJson)
    });
  } catch (error) {
    console.log(error);
  }
  

}

module.exports = {
  requestVC
}
