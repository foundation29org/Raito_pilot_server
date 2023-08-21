// functions for each call of the api on user. Use the user model

'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const Support = require('../../models/support')
const serviceAuth = require('../../services/auth')
const serviceEmail = require('../../services/email')
const crypt = require('../../services/crypt')
const f29azureService = require("../../services/f29azure")
const jose = require('jose')

function signWith(req, res) {
	// attempt to authenticate user
	req.body.email = (req.body.email).toLowerCase();
	console.log(req.body)
	User.getAuthenticated(req.body.email, req.body.password, function (err, user, reason) {
		if (err) return res.status(500).send({ message: err })

		// login was successful if we have a user
		if (user) {
			// handle login success
			Patient.findOne({"createdBy": user._id},(err, patient) => {
				if (err){
					insights.error(err)
					return res.status(500).send({
						message: 'Fail login 2'
					})
				}
				if(patient){
					return res.status(200).send({
						message: 'You have successfully logged in',
						token: serviceAuth.createToken(user),
						lang: user.lang
					})
				}else{
					trySavePatient(user, req, res)
				}
			})
			/*return res.status(200).send({
				message: 'You have successfully logged in',
				token: serviceAuth.createToken(user),
				lang: user.lang
			})*/
		} else {
			req.body.email = (req.body.email).toLowerCase();
			let randomstring = Math.random().toString(36).slice(-12);
			const user = new User({
				email: req.body.email,
				password: req.body.password,
				subrole: req.body.subrole,
				userName: req.body.userName,
				lastName: req.body.lastName,
				confirmationCode: randomstring,
				lang: req.body.lang,
				group: req.body.group,
				permissions: req.body.permissions,
				provider: req.body.provider,
				emailVerified: req.body.emailVerified,
				platform: 'Raito'
			})
			
			User.findOne({ 'email': req.body.email }, function (err, user2) {
				if (err){
					insights.error(err);
					return res.status(500).send({ message: `Error creating the user: ${err}` })
				}
				if (!user2) {
					user.save(async (err, userSaved) => {
						if (err){
							insights.error(err);
							return res.status(500).send({ message: `Error creating the user: ${err}` })
						}
						if(userSaved){
							trySavePatient(userSaved, req, res)
						}else{
							return res.status(500).send({ message: `Error creating the user: ${err}` })
						}
						
					})
				} else {
					Patient.findOne({"createdBy": user2._id},(err, patient) => {
						if (err){
							insights.error(err)
							return res.status(500).send({
								message: 'Fail login 2'
							})
						}
						if(patient){
							return res.status(200).send({
								message: 'You have successfully logged in',
								token: serviceAuth.createToken(user2),
								lang: user2.lang
							})
						}else{
							trySavePatient(user2, req, res)
						}
					})
					//RETURN ERROR
					
					/*return res.status(200).send({
								message: 'You have successfully logged in',
								token: serviceAuth.createToken(user2),
								lang: user2.lang
							})*/
				}
			})
		}

	})
}

async function trySavePatient(userSaved, req, res){
	var userId = userSaved._id.toString();
	var data3 = await savePatient(userId, req);
	if(data3){
		return res.status(200).send({
			message: 'You have successfully logged in',
			token: serviceAuth.createToken(userSaved),
			lang: userSaved.lang
		})
	}else{
		trySavePatient(userSaved, req, res)
	}
}

function savePatient(userId, req) {
	return new Promise(async function (resolve, reject) {
		console.log('intentar crear patient')
	let patient = new Patient()
	patient.patientName = ''
	patient.surname = ''
	patient.birthDate = req.body.birthDate
	patient.citybirth = req.body.citybirth
	patient.provincebirth = req.body.provincebirth
	patient.countrybirth = req.body.countrybirth
	patient.street = req.body.street
	patient.postalCode = req.body.postalCode
	patient.city = req.body.city
	patient.province = req.body.province
	patient.country = req.body.country
	patient.phone1 = req.body.phone1
	patient.phone2 = req.body.phone2
	patient.gender = req.body.gender
	patient.siblings = req.body.siblings
	patient.parents = req.body.parents
	patient.relationship = req.body.relationship
	patient.previousDiagnosis = req.body.previousDiagnosis
	patient.avatar = req.body.avatar
	patient.createdBy = userId
	if (req.body.avatar == undefined) {
		if (patient.gender != undefined) {
			if (patient.gender == 'male') {
				patient.avatar = 'boy-0'
			} else if (patient.gender == 'female') {
				patient.avatar = 'girl-0'
			}
		}
	}
	// when you save, returns an id in patientStored to access that patient
	patient.save(async (err, patientStored) => {
		if (err) {
			console.log(err);
			console.log({ message: `Failed to save in the database: ${err} ` })
		}
		if(patientStored){
			var id = patientStored._id.toString();
			var idencrypt = crypt.encrypt(id);
			var patientInfo = { sub: idencrypt, patientName: patient.patientName, surname: patient.surname, birthDate: patient.birthDate, gender: patient.gender, country: patient.country, previousDiagnosis: patient.previousDiagnosis, avatar: patient.avatar, consentgroup: patient.consentgroup };
			let containerName = (idencrypt).substr(1);
			var result = await f29azureService.createContainers(containerName);
			if (result) {
				resolve(true)
				//res.status(200).send({message: 'Patient created', patientInfo})
			} else {
				Patient.findById(patientId, (err, patient) => {
					if (err) return console.log({ message: `Error deleting the patient: ${err}` })
					if (patient) {
						patient.remove(err => {
							resolve(false)
							//savePatient(userId, req)
						})
					} else {
						resolve(false)
						//savePatient(userId, req)
					}
				})
				//deletePatientAndCreateOther(patientStored._id, req, userId);
			}
		}else{
			resolve(false)
		}
		

	})
	});
	
}

function deletePatientAndCreateOther(patientId, req, userId) {

	Patient.findById(patientId, (err, patient) => {
		if (err) return console.log({ message: `Error deleting the patient: ${err}` })
		if (patient) {
			patient.remove(err => {
				savePatient(userId, req)
			})
		} else {
			savePatient(userId, req)
		}
	})
}

function sendEmail(req, res) {
	req.body.email = (req.body.email).toLowerCase();
	let randomstring = Math.random().toString(36).slice(-12);
	User.findOne({ 'email': req.body.email }, function (err, user) {
		if (err) return res.status(500).send({ message: `Error finding the user: ${err}` })
		if (user) {
			let support = new Support()
				support.type = ''
				support.subject = 'Help with account activation'
				support.description = 'Please, help me with my account activation. I did not receive any confirmation email.'
				support.files = []
				support.createdBy = user.userId
				serviceEmail.sendMailSupport(req.body.email, req.body.lang, null, support)
					.then(response => {
						res.status(200).send({ message: 'Support contacted' })
					})
					.catch(response => {
						res.status(200).send({ message: 'Fail sending email' })
					})



		}
	})
}


function getUser(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		if (!user) return res.status(404).send({ code: 208, message: `The user does not exist` })

		res.status(200).send({ user })
	})
}

function getSettings(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "userName": false, "lang": false, "email": false, "signupDate": false, "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "randomCodeRecoverPass": false, "dateTimeRecoverPass": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		if (!user) return res.status(404).send({ code: 208, message: `The user does not exist` })

		res.status(200).send({ user })
	})
}

function updateUser(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	let update = req.body

	User.findByIdAndUpdate(userId, update, { select: '-_id userName lastName lang email signupDate massunit lengthunit iscaregiver', new: true }, (err, userUpdated) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })

		res.status(200).send({ user: userUpdated })
	})
}

function deleteUser(req, res) {
	let userId = req.params.userId

	User.findById(userId, (err, user) => {
		if (err) return res.status(500).send({ message: `Error deleting the user: ${err}` })
		if (user) {
			user.remove(err => {
				if (err) return res.status(500).send({ message: `Error deleting the user: ${err}` })
				res.status(200).send({ message: `The user has been deleted.` })
			})
		} else {
			return res.status(404).send({ code: 208, message: `Error deleting the user: ${err}` })
		}

	})
}


function getUserName(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		if (user) {
			res.status(200).send({ userName: user.userName, lastName: user.lastName, idUser: req.params.userId, email: user.email, iscaregiver: user.iscaregiver })
		}else{
			res.status(200).send({ userName: '', lastName: '', idUser: req.params.userId, iscaregiver: false})
		}
	})
}

function getUserEmail(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		var result = "Jhon";
		if (user) {
			result = user.email;
		}
		res.status(200).send({ email: result })
	})
}

function isVerified(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		var result = false;
		if (user) {
			result = user.infoVerified;
		}
		res.status(200).send({ infoVerified: result })
	})
}

function setInfoVerified(req, res) {

	let userId = crypt.decrypt(req.params.userId);
	var infoVerified = req.body.infoVerified;
	User.findByIdAndUpdate(userId, { infoVerified: infoVerified }, { new: true }, (err, userUpdated) => {
		if (userUpdated) {
			res.status(200).send({ message: 'Updated' })
		} else {
			console.log(err);
			res.status(200).send({ message: 'error' })
		}
	})
}

function changeiscaregiver (req, res){

	let userId= crypt.decrypt(req.params.userId);//crypt.decrypt(req.params.patientId);

	User.findByIdAndUpdate(userId, { iscaregiver: req.body.iscaregiver }, {select: '-createdBy', new: true}, (err,userUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})

			res.status(200).send({message: 'iscaregiver changed'})

	})
}


function getRangeDate(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		var result = "month";
		if (user) {
			result = user.rangeDate;
		}
		res.status(200).send({ rangeDate: result })
	})
}

function changeRangeDate (req, res){

	let userId= crypt.decrypt(req.params.userId);//crypt.decrypt(req.params.patientId);

	User.findByIdAndUpdate(userId, { rangeDate: req.body.rangeDate }, {select: '-createdBy', new: true}, (err,userUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})

			res.status(200).send({message: 'rangeDate changed'})

	})
}

module.exports = {
	signWith,
	getUser,
	getSettings,
	updateUser,
	deleteUser,
	sendEmail,
	getUserName,
	getUserEmail,
	isVerified,
	setInfoVerified,
	changeiscaregiver,
	getRangeDate,
	changeRangeDate
}
