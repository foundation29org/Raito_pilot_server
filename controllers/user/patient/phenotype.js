// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Phenotype = require('../../../models/phenotype')
const PhenotypeHistory = require('../../../models/phenotype-history')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')
const https = require('https');
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

async function getPhenotype (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		const phenotype = await Phenotype.findOne({"createdBy": patientId}).select("-createdBy");
		if(!phenotype) return res.status(202).send({message: 'There are no phenotype'})
		res.status(200).send({phenotype})
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}

async function getPhenotypeHistory (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);

		const phenotypeHistory = await PhenotypeHistory.find({createdBy: patientId}).sort({ date : 'asc'});

		var listPhenotypeHistory = [];
		phenotypeHistory.forEach(function(phenotype) {
			listPhenotypeHistory.push(phenotype);
		});

		res.status(200).send(listPhenotypeHistory)
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
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

async function savePhenotype (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);

		const phenotype = await Phenotype.findOne({"createdBy": patientId}).select("-createdBy");
		if(phenotype){
			return res.status(202).send({message: 'There is already a phenotype for the patient', phenotype: phenotype})
		}
		let newPhenotype = new Phenotype()
		newPhenotype.data = req.body.data
		if(req.body.discarded!=undefined){
			newPhenotype.discarded = req.body.discarded
		}
		newPhenotype.createdBy = patientId
		await newPhenotype.save()

		let phenotypeHistory = new PhenotypeHistory()
		phenotypeHistory.data = req.body.data
		if(req.body.discarded!=undefined){
			phenotypeHistory.discarded = req.body.discarded
		}
		phenotypeHistory.createdBy = patientId
		await phenotypeHistory.save()

		const phenotype2 = await Phenotype.findOne({"createdBy": patientId}).select("-createdBy");
		if(!phenotype2) return res.status(202).send({message: `There are no phenotype`})
		res.status(200).send({message: 'Phenotype created', phenotype: phenotype2})
	} catch (err) {
		return res.status(500).send({message: `Failed to save in the database: ${err} `})
	}
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

async function updatePhenotype (req, res){
	try {
		let phenotypeId= req.params.phenotypeId;
		let update = req.body
		const phenotypeUpdated = await Phenotype.findByIdAndUpdate(phenotypeId, update, { new: true, select: '-createdBy'});
		if (!phenotypeUpdated) return res.status(500).send({message: 'not found'})

		const phenotypeCreatedBy = await Phenotype.findByIdAndUpdate(phenotypeId, update, {new: true});
		let phenotypeHistory = new PhenotypeHistory()
		phenotypeHistory.data = req.body.data
		phenotypeHistory.createdBy = phenotypeUpdated.createdBy
		phenotypeHistory.validated = phenotypeUpdated.validated
		phenotypeHistory.validator_id = phenotypeUpdated.validator_id
		await phenotypeHistory.save()

		res.status(200).send({message: 'Phenotype updated', phenotype: phenotypeUpdated})
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}

async function deletePhenotype (req, res){
	try {
		let phenotypeId=req.params.phenotypeId

		const phenotype = await Phenotype.findById(phenotypeId);
		if(phenotype){
			await phenotype.deleteOne();
			res.status(200).send({message: `The phenotype has been eliminated`})
		}else{
			return res.status(202).send({message: 'The phenotype does not exist'})
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the phenotype: ${err}`})
	}
}

async function deletePhenotypeHistoryRecord (req, res){
	try {
		let phenotypeId=req.params.phenotypeId

		const phenotypeHistory = await PhenotypeHistory.findById(phenotypeId);
		if(phenotypeHistory){
			await phenotypeHistory.deleteOne();
			res.status(200).send({message: `The phenotype history record has been eliminated`})
		}else{
			return res.status(202).send({message: 'The phenotype history record does not exist'})
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the phenotype history record: ${err}`})
	}
}

module.exports = {
	getPhenotype,
	getPhenotypeHistory,
	savePhenotype,
	updatePhenotype,
	deletePhenotype,
	deletePhenotypeHistoryRecord
}
