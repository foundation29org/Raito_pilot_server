'use strict'

const config = require('../config')
const request = require('request')
const key = config.TA_KEY;
const endpoint = config.TA_ENDPOINT;

function callTextAnalytics (req, res){
  var jsonText = req.body;
  request.post({url:config.dxv2api+'/api/v1/PhenReports/process',json: true,headers: {'Authorization': config.dxv2apiAuth},body:jsonText}, (error, response, body) => {
    if (error) {
      console.error(error)
      res.status(500).send(error)
    }
    if(body=='Missing authentication token.'){
      res.status(401).send(body)
    }else{
      res.status(200).send(body)
    }

  });
}

function callTextAnalyticsFhir (req, res){
  var jsonText = req.body;
  request.post({url:endpoint+'/text/analytics/v3.1-private-preview.5/entities/health/jobs/?structureFHIR=true',json: true,headers: {'Ocp-Apim-Subscription-Key': key},body:jsonText}, (error, response, body) => {
    if (error) {
      console.error(error)
      res.status(500).send(error)
    }
    if(body=='Missing authentication token.'){
      res.status(401).send(body)
    }else{
      console.log(response.headers["operation-location"]);
      console.log(body);
      res.status(200).send(response.headers)
    }

  });
}

module.exports = {
	callTextAnalytics,
  callTextAnalyticsFhir
}
