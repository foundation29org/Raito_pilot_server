// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Phenotype = require('../../../models/phenotype')
const PhenotypeHistory = require('../../../models/phenotype-history')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')
const https = require('https');
const request = require("request")
const config = require('../../../config')

/**
 * @api {get} https://raito.care/api/phenotypes/:patientId Get phenotype
 * @apiName getPhenotype
 * @apiDescription This method read Phenotype of a patient
 * @apiGroup Phenotype
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/api/phenotypes/'+patientId)
 *    .subscribe( (res : any) => {
 *      console.log('phenotype: '+ res.phenotype);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {String} patientId Patient unique ID. More info here:  [Get patientId](#api-Patients-getPatientsUser)
 * @apiSuccess {String} _id Phenotype unique ID.
 * @apiSuccess {Object} data Patient's phenotype. For each symptom, you get the <a href="https://en.wikipedia.org/wiki/Human_Phenotype_Ontology" target="_blank">HPO</a> and the name
 * @apiSuccess {Date} date Date on which the diagnosis was saved.
 * @apiSuccess {Boolean} validated If the phenotype is validated by a clinician, it will be true.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {"phenotype":
 *   {
 *     "_id":"5a6f4b83f440d806744f3ef6",
 *     "data":[
 *       {"id":"HP:0100543","name":"Cognitive impairment"},
 *       {"id":"HP:0002376","name":"Developmental regression"}
 *     ],
 *    "date":"2018-02-27T17:55:48.261Z",
 *    "validated":false
 *   }
 * }
 *
 * HTTP/1.1 202 OK
 * {message: 'There are no phenotype'}
 * @apiSuccess (Success 202) {String} message If there is no phenotype for the patient, it will return: "There are no phenotype"
 */

function getPhenotype (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	Phenotype.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, phenotype) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(!phenotype) return res.status(202).send({message: 'There are no phenotype'})
		res.status(200).send({phenotype})
	})
}

function getPhenotypeHistory (req, res){
	let patientId= crypt.decrypt(req.params.patientId);

	PhenotypeHistory.find({createdBy: patientId}).sort({ date : 'asc'}).exec(function(err, phenotypeHistory){

		var listPhenotypeHistory = [];
		phenotypeHistory.forEach(function(phenotype) {
			listPhenotypeHistory.push(phenotype);
		});

		res.status(200).send(listPhenotypeHistory)
	})
}


/**
 * @api {post} https://raito.care/api/phenotypes/:patientId New phenotype
 * @apiName savePhenotype
 * @apiDescription This method create a phenotype of a patient
 * @apiGroup Phenotype
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var phenotype = {data: [{"id":"HP:0100543","name":"Cognitive impairment"},{"id":"HP:0002376","name":"Developmental regression"}]};
 *   this.http.post('https://raito.care/api/phenotypes/'+patientId, phenotype)
 *    .subscribe( (res : any) => {
 *      console.log('phenotype: '+ res.phenotype);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {String} patientId Patient unique ID. More info here:  [Get patientId](#api-Patients-getPatientsUser)
 * @apiParam (body) {Object} data Patient's phenotype. For each symptom, you set the <a href="https://en.wikipedia.org/wiki/Human_Phenotype_Ontology" target="_blank">HPO</a> and the name
 * @apiSuccess {String} _id Phenotype unique ID.
 * @apiSuccess {Object} data Patient's phenotype. For each symptom, you get the <a href="https://en.wikipedia.org/wiki/Human_Phenotype_Ontology" target="_blank">HPO</a> and the name
 * @apiSuccess {Date} date Date on which the diagnosis was saved.
 * @apiSuccess {Boolean} validated If the phenotype is validated by a clinician, it will be true.
 * @apiSuccess {String} message If the phenotype has been created correctly, it returns the message 'Phenotype created'.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {"phenotype":
 *   {
 *     "_id":"5a6f4b83f440d806744f3ef6",
 *     "data":[
 *       {"id":"HP:0100543","name":"Cognitive impairment"},
 *       {"id":"HP:0002376","name":"Developmental regression"}
 *     ],
 *    "date":"2018-02-27T17:55:48.261Z",
 *    "validated":false
 *   },
 * message: "Phenotype created"
 * }
 *
 * HTTP/1.1 202 OK
 * {message: 'There are no phenotype'}
 * @apiSuccess (Success 202) {String} message If there is no phenotype for the patient, it will return: "There are no phenotype"
 */

function savePhenotype (req, res){
	let patientId= crypt.decrypt(req.params.patientId);

	Phenotype.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, phenotype) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(phenotype){
			res.status(202).send({message: 'There is already a phenotype for the patient', phenotype: phenotype})
		}else if(!phenotype){
			let phenotype = new Phenotype()
			phenotype.data = req.body.data
      if(req.body.discarded!=undefined){
        phenotype.discarded = req.body.discarded
      }
			phenotype.createdBy = patientId
			// when you save, returns an id in phenotypeStored to access that social-info
			phenotype.save((err, phenotypeStored) => {
				if (err) res.status(500).send({message: `Failed to save in the database: ${err} `})

				//save in PhenotypeHistory
				let phenotypeHistory = new PhenotypeHistory()
				phenotypeHistory.data = req.body.data
        if(req.body.discarded!=undefined){
          phenotypeHistory.discarded = req.body.discarded
        }
				phenotypeHistory.createdBy = patientId
				phenotypeHistory.save((err, phenotypeHistoryStored) => {
				})
				//podría devolver socialInfoStored, pero no quiero el field createdBy, asi que hago una busqueda y que no saque ese campo
				Phenotype.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, phenotype2) => {
					if (err) return res.status(500).send({message: `Error making the request: ${err}`})
					if(!phenotype2) return res.status(202).send({message: `There are no phenotype`})
					res.status(200).send({message: 'Phenotype created', phenotype: phenotype2})
				})

			})
		}
	})


}

/**
 * @api {put} https://raito.care/api/phenotypes/:phenotypeId Update phenotype
 * @apiName updatePhenotype
 * @apiDescription This method update the phenotype of a patient
 * @apiGroup Phenotype
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var phenotype = {data: [{"id":"HP:0100543","name":"Cognitive impairment"},{"id":"HP:0002376","name":"Developmental regression"}]};
 *   this.http.put('https://raito.care/api/phenotypes/'+phenotypeId, phenotype)
 *    .subscribe( (res : any) => {
 *      console.log('phenotype: '+ res.phenotype);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {String} phenotypeId Phenotype unique ID. More info here:  [Get phenotypeId](#api-Phenotype-getPhenotype)
 * @apiParam (body) {Object} data Patient's phenotype. For each symptom, you set the <a href="https://en.wikipedia.org/wiki/Human_Phenotype_Ontology" target="_blank">HPO</a> and the name
 * @apiSuccess {String} _id Phenotype unique ID.
 * @apiSuccess {Object} data Patient's phenotype. For each symptom, you get the <a href="https://en.wikipedia.org/wiki/Human_Phenotype_Ontology" target="_blank">HPO</a> and the name
 * @apiSuccess {Date} date Date on which the diagnosis was saved.
 * @apiSuccess {Boolean} validated If the phenotype is validated by a clinician, it will be true.
 * @apiSuccess {String} message If the phenotype has been updated correctly, it returns the message 'Phenotype updated'.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {"phenotype":
 *   {
 *     "_id":"5a6f4b83f440d806744f3ef6",
 *     "data":[
 *       {"id":"HP:0100543","name":"Cognitive impairment"},
 *       {"id":"HP:0002376","name":"Developmental regression"}
 *     ],
 *    "date":"2018-02-27T17:55:48.261Z",
 *    "validated":false
 *   },
 * message: "Phenotype updated"
 * }
 *
 */

function updatePhenotype (req, res){
	let phenotypeId= req.params.phenotypeId;
	let update = req.body
	Phenotype.findByIdAndUpdate(phenotypeId, update, { new: true, select: '-createdBy'}, (err,phenotypeUpdated) => { //Phenotype.findByIdAndUpdate(phenotypeId, update, {select: '-createdBy', new: true}, (err,phenotypeUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if (!phenotypeUpdated) return res.status(500).send({message: 'not found'})
		//save in PhenotypeHistory
		Phenotype.findByIdAndUpdate(phenotypeId, update, {new: true}, (err,phenotypeCreatedBy) => {
			if (err) return res.status(500).send({message: `Error making the request: ${err}`})
			let phenotypeHistory = new PhenotypeHistory()
			phenotypeHistory.data = req.body.data
			phenotypeHistory.createdBy = phenotypeUpdated.createdBy//phenotypeCreatedBy.createdBy
			phenotypeHistory.validated = phenotypeUpdated.validated
			phenotypeHistory.validator_id = phenotypeUpdated.validator_id
			phenotypeHistory.save((err, phenotypeHistoryStored) => {
			})
		})

		res.status(200).send({message: 'Phenotype updated', phenotype: phenotypeUpdated})

	})
}

function deletePhenotype (req, res){
	let phenotypeId=req.params.phenotypeId

	Phenotype.findById(phenotypeId, (err, phenotype) => {
		if (err) return res.status(500).send({message: `Error deleting the phenotype: ${err}`})
		if(phenotype){
			phenotype.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the phenotype: ${err}`})
				res.status(200).send({message: `The phenotype has been eliminated`})
			})
		}else{
			 return res.status(202).send({message: 'The phenotype does not exist'})
		}
	})
}

function deletePhenotypeHistoryRecord (req, res){
	let phenotypeId=req.params.phenotypeId

	PhenotypeHistory.findById(phenotypeId, (err, phenotypeHistory) => {
		if (err) return res.status(500).send({message: `Error deleting the phenotype history record: ${err}`})
		if(phenotypeHistory){
			phenotypeHistory.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the phenotype history record: ${err}`})
				res.status(200).send({message: `The phenotype history record has been eliminated`})
			})
		}else{
			 return res.status(202).send({message: 'The phenotype history record does not exist'})
		}
	})
}

module.exports = {
	getPhenotype,
	getPhenotypeHistory,
	savePhenotype,
	updatePhenotype,
	deletePhenotype,
	deletePhenotypeHistoryRecord
}
