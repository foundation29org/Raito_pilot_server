'use strict'
const config = require('../config')
const request = require('request')

function searchSymptoms (req, res){
  let text = req.body.text;
  let lang = req.body.lang;
  let options = {
    'method': 'GET',
    'url': encodeURI(config.dx29Gateway+'/api/v4/PhenotypeSearch/terms?text='+text+'&lang='+lang+'&rows=20'),
    'headers': {
      'Content-Type': 'application/json'
    }
  };
  request(options, function (error, response) {
    if (error) {
      res.status(400).send(error)
    }else{
      res.status(200).send(response.body)
    }
  });
}

function searchDiseases (req, res){
  let text = req.body.text;
  let lang = req.body.lang;
  let options = {
    'method': 'GET',
    'url': encodeURI(config.dx29Gateway+'/api/v4/PhenotypeSearch/diseases?text='+text+'&lang='+lang+'&rows=20'),
    'headers': {
      'Content-Type': 'application/json'
    }
  };
  request(options, function (error, response) {
    if (error) {
      res.status(400).send(error)
    }else{
      res.status(200).send(response.body)
    }
  });
}

module.exports = {
  searchSymptoms,
  searchDiseases
}
