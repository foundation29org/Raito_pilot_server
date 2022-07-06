// functions for each call of the api on admin. Use the user model

'use strict'

// add the user model
const User = require('../../models/user')
const Lang = require('../../models/lang')
const crypt = require('../../services/crypt')
const fs = require('fs');
const serviceEmail = require('../../services/email')

/**
 * @api {post} https://health29.org/api/admin/lang/ Request new translation file
 * @apiName requestLangFile
 * @apiPrivate
 * @apiDescription This method request by email a new translation. Only admins could make this request.
 * @apiGroup Languages
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var params = <userId>
 *   var body = { lang: <lang_code>, jsonData: <json assets format> }
 *   this.http.post('https://health29.org/api/admin/lang'+params,body)
 *    .subscribe( (res : any) => {
 *      console.log('Request new translation ok');
 *     }, (err) => {
 *      ...
 *     }
 * // -----------------------------------------------------------------------
 * // Example Json assets format
 * {
 *   "menu":{
 *     "Dashboard": "Home"
 *     "Login": "Login",
 *     "Register": "Register",
 *     "Forgot Password": "Forgot password",
 *     "New Password": "New password",
 *   },
 *   "profile":{
 * 	  "Save the changes": "Please, save the changes",
 *   }
 * }
 * 
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} patientId Patient unique ID. More info here:  [Get patientId](#api-Patients-getPatientsUser)
 * @apiParam {Object} userId The user unique id.
 * @apiParam (body) {String} code The language code, i.e "en" or "nl".
 * @apiParam (body) {Object} jsonData A json object like assets/i18n/en.json.
 * @apiSuccess {Object} Result Returns a message with information about the execution
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 *  {
 * 		"message":'Request for new translation sent'
 * 	}
 * 
 * 
 */
function requestLangFile (req, res){
	let userId= crypt.decrypt(req.params.userId);
	let lang = req.body.lang;
	let jsonData = req.body.jsonData;
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, {"_id" : false , "password" : false, "__v" : false, "confirmationCode" : false, "loginAttempts" : false, "confirmed" : false, "lastLogin" : false}, (err, user) => {
		if (err) return res.status(500).send({message: 'Error making the request:'})
		if(!user) return res.status(404).send({code: 208, message: 'The user does not exist'})

		if(user.role == 'Admin'){
			//envaiar file para revisión

			serviceEmail.sendMailRequestNewTranslation(user, lang, JSON.stringify(jsonData))
			.then(response => {
				return res.status(200).send({message: 'Request for new translation sent'})
			})
			.catch(response => {
				//create user, but Failed sending email.
				//res.status(200).send({ token: serviceAuth.createToken(user),  message: 'Fail sending email'})
				res.status(500).send({ message: 'Fail sending email'})
			})
		}else{
			res.status(401).send({message: 'without permission'})
		}

	})
}
/**
 * @api {put} https://health29.org/api/admin/lang/ Request new language for the platform texts
 * @apiName requestaddlang
 * @apiDescription This method request by email a new language for the platform texts. Only admins could make this request.
 * @apiGroup Languages
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var params = userId
 *   var body = { code: <lang_code>, name: <lang_name> }
 *   this.http.put('https://health29.org/api/admin/lang'+params,body)
 *    .subscribe( (res : any) => {
 *      console.log('Request new language ok');
 *     }, (err) => {
 *      ...
 *     }
 * 
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {Object} userId The user unique id.
 * @apiParam (body) {String} code The language code, i.e "en" or "nl".
 * @apiParam (body) {String} name The language name, i.e "English".
 * @apiSuccess {Object} Result Returns a message with information about the execution
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 *  {
 * 		"message":'request for new language sent'
 * 	}
 * 
 * 
 */
function requestaddlang (req, res){
	let userId= crypt.decrypt(req.params.userId);
	//añado  {"_id" : false} para que no devuelva el _id
	User.findById(userId, {"_id" : false , "password" : false, "__v" : false, "confirmationCode" : false, "loginAttempts" : false, "confirmed" : false, "lastLogin" : false}, (err, user) => {
		if (err) return res.status(500).send({message: 'Error making the request:'})
		if(!user) return res.status(404).send({code: 208, message: 'The user does not exist'})

		if(user.role == 'Admin'){

		  let code = req.body.code;

			Lang.findOne({ 'code': code }, function (err, langfound) {
				if (err) res.status(403).send({message: 'fail'})
				if(langfound) res.status(200).send({message: 'already exists'})

				if(!langfound){
					//enviar un email con la nueva solicitud
					let name = req.body.name;
					serviceEmail.sendMailRequestNewLanguage(user, name, code)
					.then(response => {
						return res.status(200).send({message: 'request for new language sent'})
					})
					.catch(response => {
						//create user, but Failed sending email.
						//res.status(200).send({ token: serviceAuth.createToken(user),  message: 'Fail sending email'})
						res.status(500).send({ message: 'Fail sending email'})
					})
				}


			})

		}else{
				res.status(401).send({message: 'without permission'})
			}

	})
}

module.exports = {
	requestLangFile,
	requestaddlang
}
