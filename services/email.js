'use strict'

const { TRANSPORTER_OPTIONS, client_server } = require('../config')
const nodemailer = require('nodemailer')
var hbs = require('nodemailer-express-handlebars')

var options = {
     viewEngine: {
         extname: '.hbs',
         partialsDir: 'views/email',
         layoutsDir: 'views/email/',
         defaultLayout : 'template'
     },
     viewPath: 'views/email/',
     extName: '.hbs'
 };

 var transporter = nodemailer.createTransport(TRANSPORTER_OPTIONS);
 transporter.use('compile', hbs(options));



function sendMailRequestNewLanguage (user, name, code){

  var maillistbcc = [
    TRANSPORTER_OPTIONS.auth.user
  ];

  const decoded = new Promise((resolve, reject) => {
    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: 'Request for new language',
      template: 'request_new_lang/_en',
      context: {
        user : user,
        name : name,
        code : code
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function sendMailRequestNewTranslation (user, lang, jsonData){

  var maillistbcc = [
    TRANSPORTER_OPTIONS.auth.user
  ];

  const decoded = new Promise((resolve, reject) => {
    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: 'Request for new translation',
      template: 'request_new_translation/_en',
      context: {
        user : user,
        lang : lang,
        jsonData : jsonData
      },
      attachments: [
      {   // utf-8 string as an attachment
          filename: lang+'.json',
          content: jsonData
      }]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

function sendMailSupport (email, lang, role, supportStored){
  const decoded = new Promise((resolve, reject) => {
    var urlImg = 'https://raito.care/assets/img/logo.png';
    var maillistbcc = [
      TRANSPORTER_OPTIONS.auth.user
    ];

    var mailOptions = {
      to: TRANSPORTER_OPTIONS.auth.user,
      from: TRANSPORTER_OPTIONS.auth.user,
      bcc: maillistbcc,
      subject: 'Mensaje para soporte de Raito',
      template: 'mail_support/_es',
      context: {
        email : email,
        lang : lang,
        subject: supportStored.subject,
        description: supportStored.description,
        files: supportStored.files,
        date: supportStored.date
      }
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject({
          status: 401,
          message: 'Fail sending email'
        })
      } else {
        resolve("ok")
      }
    });

  });
  return decoded
}

module.exports = {
  sendMailRequestNewLanguage,
  sendMailRequestNewTranslation,
  sendMailSupport
}
