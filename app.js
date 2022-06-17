/*
* EXPRESS CONFIGURATION FILE
*/
'use strict'

const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const api = require ('./routes')
const path = require('path')
var session = require('express-session')
const config = require('./config')
//CORS middleware


// Set up a simple server side session store.
// The session store will briefly cache issuance requests
// to facilitate QR code scanning.
var sessionStore = new session.MemoryStore();
app.use(session({
  secret: config.sessionsecret,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}))

function setCrossDomain(req, res, next) {
  //instead of * you can define ONLY the sources that we allow.
  res.header('Access-Control-Allow-Origin', '*');
  //http methods allowed for CORS.
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin, Accept, Accept-Language, Origin, User-Agent');
  //res.header('Access-Control-Allow-Headers', '*');
  next();
}

app.use(bodyParser.urlencoded({limit: '50mb', extended: false}))
app.use(bodyParser.json({limit: '50mb'}))
app.use(setCrossDomain);

// use the forward slash with the module api api folder created routes
app.use('/api',api)

app.use('/apidoc',express.static('apidoc', {'index': ['index.html']}))

/*app.use(express.static(path.join(__dirname, 'apidoc')));*/
/*app.get('/doc', function (req, res) {
    res.sendFile('apidoc/index.html', { root: __dirname });
 });*/

//ruta angular, poner carpeta dist publica
app.use(express.static(path.join(__dirname, 'dist')));
// Send all other requests to the Angular app
app.get('*', function (req, res, next) {
    res.sendFile('dist/index.html', { root: __dirname });
 });

module.exports.sessionStore = sessionStore;
module.exports = app
