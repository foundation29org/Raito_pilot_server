'use strict'
const config = require('../config')
const axios = require('axios')

function searchSymptoms (req, res){
  let text = req.body.text;
  let lang = req.body.lang;
  const url = encodeURI(config.dx29Gateway+'/api/v4/PhenotypeSearch/terms?text='+text+'&lang='+lang+'&rows=20');
  axios.get(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    res.status(200).send(response.data)
  }).catch(function (error) {
    res.status(400).send(error.message || error)
  });
}

function searchDiseases (req, res){
  let text = req.body.text;
  let lang = req.body.lang;
  const url = encodeURI(config.dx29Gateway+'/api/v4/PhenotypeSearch/diseases?text='+text+'&lang='+lang+'&rows=20');
  axios.get(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    res.status(200).send(response.data)
  }).catch(function (error) {
    res.status(400).send(error.message || error)
  });
}

module.exports = {
  searchSymptoms,
  searchDiseases
}
