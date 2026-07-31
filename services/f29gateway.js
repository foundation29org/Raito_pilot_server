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

function parseDocument (req, res) {
  const timeout = Number.parseInt(req.query.timeout, 10);
  const language = typeof req.query.language === 'string' ? req.query.language : 'en';
  const strategy = typeof req.query.strategy === 'string' ? req.query.strategy : 'OcrOnly';
  const query = new URLSearchParams({
    timeout: String(Number.isFinite(timeout) && timeout > 0 ? timeout : 1200),
    language: language,
    strategy: strategy
  });
  const url = `${config.dx29Gateway}/api/Document/Parse?${query.toString()}`;

  axios.put(url, req, {
    headers: {
      'Content-Type': req.get('content-type') || 'application/octet-stream'
    },
    maxBodyLength: 64000000,
    maxContentLength: 64000000,
    responseType: 'json',
    timeout: 5 * 60 * 1000,
    validateStatus: function () {
      return true;
    }
  }).then(function (response) {
    res.status(response.status).send(response.data);
  }).catch(function (error) {
    console.error('Document parse proxy failed:', error.message);
    res.status(502).send({ message: 'Document parser unavailable' });
  });
}

module.exports = {
  searchSymptoms,
  searchDiseases,
  parseDocument
}
