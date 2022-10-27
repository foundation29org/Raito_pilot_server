// functions for each call of the api on user. Use the user model

'use strict'

// add the user model
const User = require('../../models/user')
const Support = require('../../models/support')
const serviceEmail = require('../../services/email')
const crypt = require('../../services/crypt')


function sendMsgSupport(req, res){
	let userId= crypt.decrypt(req.body.userId);

	User.findOne({ '_id': userId }, function (err, user) {
	  if (err) return res.status(500).send({ message: 'Error searching the user'})
		if (user){

			let support = new Support()
			support.platform = 'Raito'
			support.type = req.body.type
			support.subject = req.body.subject
			support.description = req.body.description
			support.files = req.body.files
			support.createdBy = userId

			//guardamos los valores en BD y enviamos Email
			support.save((err, supportStored) => {
				if (err) return res.status(500).send({ message: 'Error saving the msg'})

				serviceEmail.sendMailSupport(user.email, user.lang, user.role, supportStored)
					.then(response => {
						return res.status(200).send({ message: 'Email sent'})
					})
					.catch(response => {
						//create user, but Failed sending email.
						//res.status(200).send({ token: serviceAuth.createToken(user),  message: 'Fail sending email'})
						res.status(500).send({ message: 'Fail sending email'})
					})
				//return res.status(200).send({ token: serviceAuth.createToken(user)})
			})
		}else{
			return res.status(500).send({ message: 'user not exists'})
		}
	})
}

function sendMsgLogoutSupport(req, res){
			let support = new Support()
			//support.type = 'Home form'
			support.subject = 'Raito support'
			support.platform = 'Raito'
			support.description = 'Name: '+req.body.userName+', Email: '+ req.body.email+ ', Description: ' +req.body.description
			support.createdBy = "5c77d0492f45d6006c142ab3";
			support.files = []
			//guardamos los valores en BD y enviamos Email
			support.save((err, supportStored) => {
				if (err) {
					return res.status(500).send({ message: 'Error saving the msg'})
				}
				serviceEmail.sendMailSupport(req.body.email,'en','User', supportStored)
					.then(response => {
						return res.status(200).send({ message: 'Email sent'})
					})
					.catch(response => {
						//create user, but Failed sending email.
						//res.status(200).send({ token: serviceAuth.createToken(user),  message: 'Fail sending email'})
						res.status(500).send({ message: 'Fail sending email'})
					})
				//return res.status(200).send({ token: serviceAuth.createToken(user)})
			})
}

function getUserMsgs(req, res){
	let userId= crypt.decrypt(req.params.userId);
	Support.find({"createdBy": userId},(err, msgs) => {

			if (err) return res.status(500).send({message: `Error making the request: ${err}`})

			var listmsgs = [];

			msgs.forEach(function(u) {
				if(u.platform == 'Raito' || u.platform == undefined){
					listmsgs.push({subject:u.subject, description: u.description, date: u.date, status: u.status, type: u.type});
				}
			});

			//res.status(200).send({patient, patient})
			// if the two objects are the same, the previous line can be set as follows
			res.status(200).send({listmsgs})
	})
}


module.exports = {
	sendMsgSupport,
	sendMsgLogoutSupport,
	getUserMsgs
}
