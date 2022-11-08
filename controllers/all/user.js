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

/**
 * @api {post} https://raito.care/api/api/signUp New account
 * @apiName signUp
 * @apiVersion 1.0.0
 * @apiGroup Account
 * @apiDescription This method allows you to create a user account in Raito
 * @apiExample {js} Example usage:
 *  var passwordsha512 = sha512("fjie76?vDh");
 *  var formValue = { email: "example@ex.com", userName: "Peter", password: passwordsha512, lang: "en", group: "None"};
 *   this.http.post('https://raito.care/api/signup',formValue)
 *    .subscribe( (res : any) => {
 *      if(res.message == "Account created"){
 *        console.log("Check the email to activate the account");
 *      }else if(res.message == 'Fail sending email'){
 *        //contact with Raito
 *      }else if(res.message == 'user exists'){
 *       ...
 *      }
 *   }, (err) => {
 *     ...
 *   }
 *
 * @apiParam (body) {String} email User email
 * @apiParam (body) {String} userName User name
 * @apiParam (body) {String} password User password using hash <a href="https://es.wikipedia.org/wiki/SHA-2" target="_blank">sha512</a>
 * @apiParam (body) {String} lang Lang of the User. For this, go to  [Get the available languages](#api-Languages-getLangs).
 * We currently have 5 languages, but we will include more. The current languages are:
 * * English: en
 * * Spanish: es
 * * German: de
 * * Dutch: nl
 * * Portuguese: pt
 * @apiParam (body) {String} [group] Group to which the user belongs, if it does not have a group or do not know the group to which belongs, it will be 'None'. If the group is not set, it will be set to 'None' by default.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "example@ex.com",
 *       "userName": "Peter",
 *       "password": "f74f2603939a53656948480ce71f1ce46457b6654fd22c61c1f2ccd3e2c96d1cd02d162b560c4beaf1ae45f4574571dc5cbc1ce040701c0b5c38457988aa00fe97f",
 *       "group": "None",
 *       "lang": "en"
 *     }
 * @apiSuccess {String} message Information about the request. One of the following answers will be obtained:
 * * Account created (The user should check the email to activate the account)
 * * Fail sending email
 * * user exists
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "message": "Account created"
 * }
 *
 */


function signUp(req, res) {
	let randomstring = Math.random().toString(36).slice(-12);
	const user = new User({
		email: req.body.email,
		appPubKey: req.body.appPubKey,
		ethAddress: req.body.ethAddress,
		subrole: req.body.subrole,
		userName: req.body.userName,
		lastName: req.body.lastName,
		password: req.body.password,
		confirmationCode: randomstring,
		lang: req.body.lang,
		group: req.body.group,
		permissions: req.body.permissions,
		platform: 'Raito'
	})
	User.findOne({ 'appPubKey': req.body.appPubKey }, function (err, user2) {
		if (err) return res.status(500).send({ message: `Error creating the user: ${err}` })
		if (!user2) {
			user.save((err, userSaved) => {
				if (err) return res.status(500).send({ message: `Error creating the user: ${err}` })
				//Create the patient
				var userId = userSaved._id.toString();
				savePatient(userId, req);
				res.status(200).send({
					message: 'You have successfully logged in',
					token: serviceAuth.createToken(userSaved),
					lang: userSaved.lang,
					platform: userSaved.platform,
					isFirstTime:true
				})
			})
		} else {
			res.status(202).send({ message: 'user exists' })
		}
	})
}

function savePatient(userId, req) {
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
		var id = patientStored._id.toString();
		var idencrypt = crypt.encrypt(id);
		var patientInfo = { sub: idencrypt, patientName: patient.patientName, surname: patient.surname, birthDate: patient.birthDate, gender: patient.gender, country: patient.country, previousDiagnosis: patient.previousDiagnosis, avatar: patient.avatar, consentgroup: patient.consentgroup };
		let containerName = (idencrypt).substr(1);
		var result = await f29azureService.createContainers(containerName);
		if (result) {
			//res.status(200).send({message: 'Patient created', patientInfo})
		} else {
			deletePatientAndCreateOther(patientStored._id, req, userId);
		}

	})
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
/**
 * @api {post} https://raito.care/api/api/signin Get the token (and the userId)
 * @apiName signIn
 * @apiVersion 1.0.0
 * @apiGroup Access token
 * @apiDescription This method gets the token and the language for the user. This token includes the encrypt id of the user, token expiration date, role, and the group to which it belongs.
 * The token are encoded using <a href="https://en.wikipedia.org/wiki/JSON_Web_Token" target="_blank">jwt</a>
 * @apiExample {js} Example usage:
 *  var passwordsha512 = sha512("fjie76?vDh");
 *  var formValue = { email: "aa@aa.com", password: passwordsha512 };
 *   this.http.post('https://raito.care/api/signin',formValue)
 *    .subscribe( (res : any) => {
 *      if(res.message == "You have successfully logged in"){
 *        console.log(res.lang);
 *        console.log(res.token);
 *      }else{
 *        this.isloggedIn = false;
 *      }
 *   }, (err) => {
 *     this.isloggedIn = false;
 *   }
 *
 * @apiParam (body) {String} email User email
 * @apiParam (body) {String} password User password using hash <a href="https://es.wikipedia.org/wiki/SHA-2" target="_blank">sha512</a>
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "example@ex.com",
 *       "password": "f74f2603939a53656948480ce71f1ce46457b6654fd22c61c1f2ccd3e2c96d1cd02d162b560c4beaf1ae45f4574571dc5cbc1ce040701c0b5c38457988aa00fe97f"
 *     }
 * @apiSuccess {String} message If all goes well, the system should return 'You have successfully logged in'
 * @apiSuccess {String} token You will need this <strong>token</strong> in the header of almost all requests to the API. Whenever the user wants to access a protected route or resource, the user agent should send the JWT, in the Authorization header using the Bearer schema.
 * <p>The data contained in the token are: encrypted <strong>userId</strong>, expiration token, group, and role.
 * To decode them, you you must use some jwt decoder <a href="https://en.wikipedia.org/wiki/JSON_Web_Token" target="_blank">jwt</a>. There are multiple options to do it, for example for javascript: <a href="https://github.com/hokaccha/node-jwt-simple" target="_blank">Option 1</a> <a href="https://github.com/auth0/jwt-decode" target="_blank">Option 2</a>
 * When you decode, you will see that it has several values, these are:</p>
 * <p>
 * <ul>
 *  <li>sub: the encrypted userId. This value will also be used in many API queries. It is recommended to store only the token, and each time the userId is required, decode the token.</li>
 *  <li>exp: The expiration time claim identifies the expiration time on or after which the JWT must not be accepted for processing.</li>
 *  <li>group: Group to which the user belongs, if it does not have a group, it will be 'None'. </li>
 *  <li>role: Role of the user. Normally it will be 'User'.</li>
 * </ul>
 * </p>
 *

 * @apiSuccess {String} lang Lang of the User.
 * @apiSuccess (Success 202) {String} message Information about the request. The credentials are incorrect or something has gone wrong. One of the following answers will be obtained:
 * * Not found
 * * Login failed
 * * Account is temporarily locked
 * * Account is unactivated
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "message": "You have successfully logged in",
 *  "token": "eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k",
 *  "lang": "en"
 * }
 *
 */
function signIn(req, res) {
	// attempt to authenticate user
	User.getAuthenticated(req.body.appPubKey, req.body.password, function (err, user, reason) {
		if (err) return res.status(500).send({ message: err })

		// login was successful if we have a user
		if (user) {
			// handle login success
			return res.status(200).send({
				message: 'You have successfully logged in',
				token: serviceAuth.createToken(user),
				lang: user.lang,
				platform: user.platform
			})
		} else {
			// otherwise we can determine why we failed
			var reasons = User.failedLogin;
			switch (reason) {
				case reasons.NOT_FOUND:
					//create de new user
					if(req.body.appPubKey && req.body.password && req.body.ethAddress){
						signUp(req, res)
						break;
					}else{
						return res.status(202).send({
							message: 'Not found'
						})
					}
					
				case reasons.PASSWORD_INCORRECT:
					// note: these cases are usually treated the same - don't tell
					// the user *why* the login failed, only that it did
					return res.status(202).send({
						message: 'Login failed'
					})
					break;
				case reasons.MAX_ATTEMPTS:
					// send email or otherwise notify user that account is
					// temporarily locked
					return res.status(202).send({
						message: 'Account is temporarily locked'
					})
					break;
				case reasons.UNACTIVATED:
					return res.status(202).send({
						message: 'Account is unactivated'
					})
					break;
				case reasons.BLOCKED:
					return res.status(202).send({
						message: 'Account is blocked'
					})
					break;
				case reasons.WRONG_PLATFORM:
					return res.status(202).send({
						message: 'This is not your platform'
					})
					break;
			}
		}

	})
}



async function verifyweb3auth(req, res) {
	const idToken = req.headers.authorization?.split(' ')[1];
	// passed from the frontend in the request body
	const app_pub_key = req.body.appPubKey;

	// Get the JWK set used to sign the JWT issued by Web3Auth
	const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));

	// Verify the JWT using Web3Auth's JWKS
	const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
	console.log(JSON.stringify(jwtDecoded));
	// Checking `app_pub_key` against the decoded JWT wallet's public_key
	if ((jwtDecoded.payload).wallets[0].public_key === app_pub_key) {
	// Verified
	return res.status(200).json({name: 'Verification Successful'})
	} else {
	return res.status(400).json({name: 'Verification Failed'})
	}
}

async function verifyweb3auth2(req, res) {
	// passed from the frontend in the request body
	const idToken = req.body.idToken;
	const app_pub_key = req.body.appPubKey;
	const ethAddress = req.body.ethAddress;
	const password = req.body.password;

	// Get the JWK set used to sign the JWT issued by Web3Auth
	const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));

	// Verify the JWT using Web3Auth's JWKS
	const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ["ES256"] });
	console.log(JSON.stringify(jwtDecoded));
	// Checking `app_pub_key` against the decoded JWT wallet's public_key
	if ((jwtDecoded.payload).wallets[0].public_key === app_pub_key) {
	// Verified
	signIn(req, res)
	//return res.status(200).json({name: 'Verification Successful'})

	} else {
	return res.status(400).json({name: 'Verification Failed'})
	}
}


/**
 * @api {get} https://raito.care/api/users/:id Get user
 * @apiName getUser
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiDescription This methods read data of a User
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/api/users/'+userId)
 *    .subscribe( (res : any) => {
 *      console.log(res.userName);
 *   }, (err) => {
 *     ...
 *   }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {String} userId User unique ID. More info here:  [Get token and userId](#api-Access_token-signIn)
 * @apiSuccess {String} email Email of the User.
 * @apiSuccess {String} userName UserName of the User.
 * @apiSuccess {String} lang lang of the User.
 * @apiSuccess {String} group Group of the User.
 * @apiSuccess {Date} signupDate Signup date of the User.
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {"user":
 *  {
 *   "email": "John@example.com",
 *   "userName": "Doe",
 *   "lang": "en",
 *   "group": "nameGroup",
 *   "signupDate": "2018-01-26T13:25:31.077Z"
 *  }
 * }
 *
 */

function getUser(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		if (!user) return res.status(404).send({ code: 208, message: `The user does not exist` })

		res.status(200).send({ user })
	})
}

function getSettings(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, { "userName": false, "lang": false, "email": false, "signupDate": false, "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "randomCodeRecoverPass": false, "dateTimeRecoverPass": false, "role": false, "lastLogin": false }, (err, user) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		if (!user) return res.status(404).send({ code: 208, message: `The user does not exist` })

		res.status(200).send({ user })
	})
}


/**
 * @api {put} https://raito.care/api/users/:id Update user
 * @apiName updateUser
 * @apiVersion 1.0.0
 * @apiDescription This method allows to change the user's data
 * @apiGroup Users
 * @apiExample {js} Example usage:
 *   this.http.put('https://raito.care/api/users/'+userId, this.user)
 *    .subscribe( (res : any) => {
 *      console.log('User update: '+ res.user);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {String} userId User unique ID. More info here:  [Get token and userId](#api-Access_token-signIn)
 * @apiParam (body) {String} [userName] UserName of the User.
 * @apiParam (body) {String} [lang] lang of the User.
 * @apiSuccess {String} email Email of the User.
 * @apiSuccess {String} userName UserName of the User.
 * @apiSuccess {String} lang lang of the User.
 * @apiSuccess {String} group Group of the User.
 * @apiSuccess {Date} signupDate Signup date of the User.
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {"user":
 *  {
 *   "email": "John@example.com",
 *   "userName": "Doe",
 *   "lang": "en",
 *   "group": "nameGroup",
 *   "signupDate": "2018-01-26T13:25:31.077Z"
 *  }
 * }
 *
 */

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
	User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
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
	User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
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
	User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
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
	User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
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
	signUp,
	signIn,
	verifyweb3auth,
	verifyweb3auth2,
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
