// functions for each call of the api on user. Use the user model

'use strict'

// add the user model
const User = require('../../models/user')
const Support = require('../../models/support')
const serviceEmail = require('../../services/email')
const crypt = require('../../services/crypt')


async function sendMsgSupport(req, res){
	try {
		let userId= crypt.decrypt(req.body.userId);
		const user = await User.findOne({ '_id': userId });
		if (!user) return res.status(500).send({ message: 'user not exists'})

		let support = new Support()
		support.platform = 'Raito'
		support.type = req.body.type
		support.subject = req.body.subject
		support.description = req.body.description
		support.files = req.body.files
		support.createdBy = userId

		const supportStored = await support.save();
		try {
			await serviceEmail.sendMailSupport(user.email, user.lang, user.role, supportStored)
			return res.status(200).send({ message: 'Email sent'})
		} catch (response) {
			res.status(500).send({ message: 'Fail sending email'})
		}
	} catch (err) {
		return res.status(500).send({ message: 'Error searching the user'})
	}
}

async function sendMsgLogoutSupport(req, res){
	try {
		let support = new Support()
		support.subject = 'Raito support'
		support.platform = 'Raito'
		support.description = 'Name: '+req.body.userName+', Email: '+ req.body.email+ ', Description: ' +req.body.description
		support.createdBy = "5c77d0492f45d6006c142ab3";
		support.files = []

		const supportStored = await support.save();
		try {
			await serviceEmail.sendMailSupport(req.body.email,'en','User', supportStored)
			return res.status(200).send({ message: 'Email sent'})
		} catch (response) {
			res.status(500).send({ message: 'Fail sending email'})
		}
	} catch (err) {
		return res.status(500).send({ message: 'Error saving the msg'})
	}
}

async function getUserMsgs(req, res){
	try {
		let userId= crypt.decrypt(req.params.userId);
		const msgs = await Support.find({"createdBy": userId});

		var listmsgs = [];

		msgs.forEach(function(u) {
			if(u.platform == 'Raito' || u.platform == undefined){
				listmsgs.push({subject:u.subject, description: u.description, date: u.date, status: u.status, type: u.type});
			}
		});

		res.status(200).send({listmsgs})
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}


module.exports = {
	sendMsgSupport,
	sendMsgLogoutSupport,
	getUserMsgs
}
