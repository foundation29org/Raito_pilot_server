// functions for each call of the api on admin. Use the user model

'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')
const f29azureService = require("../../services/f29azure")

const Group = require('../../models/group')
const Medication = require('../../models/medication')
const Feel = require('../../models/feel')
const Phenotype = require('../../models/phenotype')
const Prom = require('../../models/prom')
const Seizures = require('../../models/seizures')
const Weight = require('../../models/weight')
const Height = require('../../models/height')
const Appointments = require('../../models/appointments')
const config = require('../../config')
const fs = require('fs');

/* import moralis */
const Moralis = require("moralis/node");
var https = require('follow-redirects').https;
const request = require("request");

/* Moralis init code */
const serverUrl = config.MORALIS.SERVER_URL;
const appId = config.MORALIS.APP_ID;
const masterKey = config.MORALIS.MARTER_KEY;
Moralis.start({ serverUrl, appId, masterKey });

/**
 * @api {post} https://raito.care/api/eo/onlypatients/:groupId Get only patients
 * @apiName getOnlyPatients
 * @apiDescription This method return the general information of all the patients of an organization.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.post('https://raito.care/eo/onlypatients/'+groupId, {meta: true})
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the general information of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "patientID":"7bc32c840a9dae512ert32f2vs4e34d7717ad9095f70d9d47444c6a5668edca5545c",
 *     "result":{
 *        "resourceType": "Bundle",
 *        "id": "bundle-references",
 *        "type": "collection",
 *        "entry": [...]
 * 		}
 *   },
 *   {
 *     ...
 *   }
 * ]
 *
 */

function getOnlyPatients (req, res){
	let meta = req.body.meta;
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getBasicInfoPatients(patients, meta);
		res.status(200).send(data)
	})
}

async function getBasicInfoPatients(patients, meta) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getAllBacicPatientInfo(patients[index], meta));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				resolve(data)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

async function getNumMedications(patientId) {
	return new Promise(async function (resolve, reject) {
		const medications = await Medication.find({"createdBy": patientId}).sort({date: -1});
		var numMedications = 0;
		var date = null;
		if (medications.length>0) {
			numMedications = medications.length;
			date=medications[0].date
		}
		var info = {"drugs": numMedications, "date": date};
		resolve(info);
	});
}

async function getNumPhenotype(patientId) {
	return new Promise(async function (resolve, reject) {
		const phenotype = await Phenotype.findOne({"createdBy": patientId}).sort({date: -1});
		var numPhenotypes = 0;
		var date = null;
		if (phenotype) {
			if (phenotype.data.length > 0) {
				numPhenotypes = phenotype.data.length;
				date=phenotype.date
			}
		}
		var info = {"phenotypes": numPhenotypes, "date": date};
		resolve(info);
	});
}

async function getNumFeel(patientId) {
	return new Promise(async function (resolve, reject) {
		const feels = await Feel.find({"createdBy": patientId}).sort({date: -1});
		var numFeels = 0;
		var date = null;
		if (feels.length>0) {
			numFeels = feels.length;
			date=feels[0].date
		}
		var info = {"feels": numFeels, "date": date};
		resolve(info);
	});
}

async function getNumProm(patientId) {
	return new Promise(async function (resolve, reject) {
		const proms = await Prom.find({"createdBy": patientId}).sort({date: -1});
		var numProms = 0;
		var date = null;
		if (proms.length>0) {
			numProms = proms.length;
			date=proms[0].date
		}
		var info = {"proms": numProms, "date": date};
		resolve(info);
	});
}

async function getNumSeizure(patientId) {
	return new Promise(async function (resolve, reject) {

		const seizures = await Seizures.find({"createdBy": patientId}).sort({date: -1});
		var numSeizures = 0;
		var date = null;
		if (seizures.length>0) {
			numSeizures = seizures.length;
			date=seizures[0].date
		}
		var info = {"seizures": numSeizures, "date": date};
		resolve(info);
	});
}

async function getNumWeight (patientId){
	return new Promise(async function (resolve, reject) {
		const weights = await Weight.find({"createdBy": patientId}).sort({date: -1});
		var numWeights = 0;
		var date = null;
		if (weights.length>0) {
			numWeights = weights.length;
			date=weights[0].date
		}
		var info = {"weight": numWeights, "date": date};
		resolve(info);	
	});
}

async function getNumHeight (patientId){
	return new Promise(async function (resolve, reject) {
		const heights = await Height.find({"createdBy": patientId}).sort({date: -1});
		var numHeights = 0;
		var date = null;
		if (heights.length>0) {
			numHeights = heights.length;
			date=heights[0].date
		}
		var info = {"height": numHeights, "date": date};
		resolve(info);	
	});

}

async function getAllBacicPatientInfo(patient, meta) {
	return new Promise(async function (resolve, reject) {

		var promises = [];
		if(meta){
			promises.push(getNumMedications(patient.id));
			promises.push(getNumPhenotype(patient.id));
			promises.push(getNumFeel(patient.id));
			promises.push(getNumProm(patient.id));
			promises.push(getNumSeizure(patient.id));
			promises.push(getNumWeight(patient.id));
			promises.push(getNumHeight(patient.id));
		}
		await Promise.all(promises)
			.then(async function (data) {
				let patientId = patient._id;
				let patientIdEnc = crypt.encrypt(patientId.toString());
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": [
					]
				};

				result.entry.push(
					{
					"fullUrl": "Patient/"+patientIdEnc,
      				"resource": {
						"resourceType" : "Patient",
						"id" : patientIdEnc,
						"active" : true, // Whether this patient's record is in active use
						"name" :
						{
							"use": "usual",
							"given": [
								patient.patientName
							]
						},
						"telecom" :[
							{
								"system":"phone",
								"value": patient.phone1
							},
							{
								"system":"phone",
								"value": patient.phone2
							}
						], // A contact detail for the individual

						"gender" : patient.gender, // male | female | other | unknown
						"birthDate" : patient.birthDate, // The date of birth for the individual
						"address" : [{
							"line":patient.street,
							"city":patient.city,
							"state": patient.province,
							"postalCode":patient.postalCode,
							"country":patient.country
						}], // An address for the individual
						"contact" : [{ // A contact party (e.g. guardian, partner, friend) for the patient
						"relationship" : "", // The kind of relationship
						"name" : "", // A name associated with the contact person
						"telecom" : [], // A contact detail for the person
						}]
					}
				}
			);
			var metaInfo = {};
			if(meta){
				metaInfo["drugs"] = {drugs: data[0].drugs, date: data[0].date} ;
				metaInfo["phenotypes"] = {phenotypes: data[1].phenotypes, date: data[1].date};
				metaInfo["feels"] = {feels: data[2].feels, date: data[2].date};
				metaInfo["proms"] = {proms: data[3].proms, date: data[3].date};
				metaInfo["seizures"] = {seizures: data[4].seizures, date: data[4].date};
				metaInfo["weight"] = {weight: data[5].weight, date: data[5].date};
				metaInfo["height"] = {height: data[6].height, date: data[6].date};
			}
			
			resolve({ patientId: patientIdEnc, result: result, metaInfo: metaInfo, country: patient.country });
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});


		
	});
}

/**
 * @api {get} https://raito.care/api/eo/patients/:groupId Get patients
 * @apiName getPatients
 * @apiDescription This method return the information of all the patients of an organization.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/patients/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the information of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "patientID":"7bc32c840a9dae512ert32f2vs4e34d7717ad9095f70d9d47444c6a5668edca5545c",
 *     "result":{
 *        "resourceType": "Bundle",
 *        "id": "bundle-references",
 *        "type": "collection",
 *        "entry": [...]
 * 		}
 *   },
 *   {
 *     ...
 *   }
 * ]
 *
 */

function getPatients (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var infoGroup = await geInfoGroup(req.params.groupId);
		var questionnaires = await getQuestionnairesGroup(req.params.groupId);
		var data = await getInfoPatients(patients, infoGroup, questionnaires);
		res.status(200).send(data)
	})
}

function geInfoGroup(groupId) {
	return new Promise(resolve => {
		Group.findOne({ '_id': groupId }, function (err, group) {
			if (err) resolve({message: `Error making the request: ${err}`})
			if(!group) resolve({code: 208, message: 'The group does not exist'}) 
			if (group) {
				resolve (group)
			}
		});
	});
}

async function getInfoPatients(patients, infoGroup, questionnaires) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getAllPatientInfo(patients[index], infoGroup, questionnaires));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				resolve(data)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

async function getAllPatientInfo(patient, infoGroup, questionnaires) {
	return new Promise(async function (resolve, reject) {
		let patientId = patient._id;
		var promises3 = [];
		promises3.push(getMedications(patientId, infoGroup, patient));
		promises3.push(getPhenotype(patientId));
		promises3.push(getFeel(patientId));
		promises3.push(getProm(patient, questionnaires));
		promises3.push(getSeizure(patientId));
		promises3.push(getHistoryWeight(patientId));
		promises3.push(getHistoryHeight(patientId));
		promises3.push(getConsent(patient, false));
		promises3.push(getAppointments(patient));

		await Promise.all(promises3)
			.then(async function (data) {
				let patientIdEnc = crypt.encrypt(patientId.toString());
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": [
					]
				};

				result.entry.push(
					{
					"fullUrl": "Patient/"+patientIdEnc,
      				"resource": {
						"resourceType" : "Patient",
						"id" : patientIdEnc,
						"active" : true, // Whether this patient's record is in active use
						"name" :
						{
							"use": "usual",
							"given": [
								patient.patientName
							]
						},
						"telecom" :[
							{
								"system":"phone",
								"value": patient.phone1
							},
							{
								"system":"phone",
								"value": patient.phone2
							}
						], // A contact detail for the individual

						"gender" : patient.gender, // male | female | other | unknown
						"birthDate" : patient.birthDate, // The date of birth for the individual
						"address" : [{
							"line":patient.street,
							"city":patient.city,
							"state": patient.province,
							"postalCode":patient.postalCode,
							"country":patient.country
						}], // An address for the individual
						"contact" : [{ // A contact party (e.g. guardian, partner, friend) for the patient
						"relationship" : "", // The kind of relationship
						"name" : "", // A name associated with the contact person
						"telecom" : [], // A contact detail for the person
						}]
					}
				}
			);

			// add condition
			result.entry.push(
				{
					"fullUrl": "Condition/"+infoGroup._id,
					"resource": {
						"resourceType": "Condition",
						"id": infoGroup._id,
						"meta": {
							"profile": [
								"http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition"
							]
						},
						"verificationStatus": {
							"coding": [
								{
									"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
									"code": "confirmed",
									"display": "Confirmed"
								}
							],
							"text": "Confirmed"
						},
						"category": [
							{
								"coding": [
									{
										"system": "http://terminology.hl7.org/CodeSystem/condition-category",
										"code": "encounter-diagnosis",
										"display": "Encounter Diagnosis"
									}
								],
								"text": "Encounter Diagnosis"
							}
						],
						"code": {
							"coding": [
							],
							"text": infoGroup.name
						},
						"subject": {
							"reference": "Patient/"+patientIdEnc,
							"type": "Patient"
						}
					}
				}
			);

			if (data[0].length > 0) {
				for (var index in data[0]) {
					result.entry.push(data[0][index]);
				}
			}
			if (data[1].length > 0) {
				for (var index in data[1]) {
					result.entry.push(data[1][index]);
				}
			}
			if (data[2].length > 0) {
				for (var index in data[2]) {
					result.entry.push(data[2][index]);
				}
			}
			//proms - questionnaire
			if (data[3].length > 0) {
				for (var index in data[3]) {
					result.entry.push(data[3][index]);
				}
			}
			/*if (data[3]) {
				result.entry.push(data[3]);
			}*/
			if (data[4].length > 0) {
				for (var index in data[4]) {
					result.entry.push(data[4][index]);
				}
			}
			if (data[5].length > 0) {
				for (var index in data[5]) {
					result.entry.push(data[5][index]);
				}
			}
			if (data[6].length > 0) {
				for (var index in data[6]) {
					result.entry.push(data[6][index]);
				}
			}
			if (data[7]) {
				result.entry.push(data[7]);
			}
			if (data[8].length > 0) {
				for (var index in data[8]) {
					result.entry.push(data[8][index]);
				}
			}
			/*result.entry.push(data[0]);
			result.entry.push(data[1]);
			result.entry.push(data[2]);
			result.entry.push(data[3]);
			result.entry.push(data[4]);*/
			resolve({ patientId: patientIdEnc, result: result})
		})
		.catch(function (err) {
			console.log('Manejar promesa rechazada (' + err + ') aquí.');
			return null;
		});
	});
}


async function getMedications(patientId, infoGroup, patient) {
	return new Promise(async function (resolve, reject) {
		await Medication.find({ createdBy: patientId }, { "createdBy": false }).exec(function (err, medications) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var listMedications = [];
			let patientIdEnc = crypt.encrypt((patient._id).toString());
			if (medications) {
				medications.forEach(function (medication) {
					var codeDrug = ''
					var idDrug = ''
					
					for (var i = 0; i < infoGroup.medications.drugs.length; i++) {
						if(medication.drug== infoGroup.medications.drugs[i].name){
							codeDrug = infoGroup.medications.drugs[i].snomed;
							idDrug = infoGroup.medications.drugs[i]._id;
						}
					}
					var status = '';
					if(medication.endDate == null){
						status = 'active';
					}else{
						status = 'stopped';
					}
					var med = {
						"fullUrl": "MedicationStatement/"+medication._id,
      					"resource": {
							"resourceType": "MedicationStatement",
							"id": medication._id,
							"status": status,
							"subject": {
							"reference": "Patient/"+patientIdEnc,
							"display": patient.patientName
							},
							"effectivePeriod":
								{
									"start" : medication.startDate, 
									"end" : medication.endDate
								},
							"dateAsserted": medication.date,
							"note": [
							{
								"text": medication.notes
							}
							],
							"dosage": [
							{
								"sequence": 1,
								"text": medication.dose,
								"asNeededBoolean": false,
								"route": {
								"coding": [
									{
									"system": "http://snomed.info/sct",
									"code": "260548002",
									"display": "Oral"
									}
								]
								},
								"doseAndRate": [
								{
									"type": {
									"coding": [
										{
										"system": "http://terminology.hl7.org/CodeSystem/dose-rate-type",
										"code": "ordered",
										"display": "Ordered"
										}
									]
									},
									"doseQuantity": {
									"value": medication.dose,
									"unit": "mg",
									"system": "http://unitsofmeasure.org",
									"code": "mg"
									}
								}
								],
								"maxDosePerPeriod": {
								"numerator": {
									"value": 1
								},
								"denominator": {
									"value": 1,
									"system": "http://unitsofmeasure.org",
									"code": "d"
								}
								}
							}
							],
							"contained": [
								{
								  "resourceType": "Medication",
								  "id": idDrug,
								  "code": {
									"coding": [
										{
											"system": "http://snomed.info/sct/731000124108",
											"code": codeDrug,
											"display": medication.drug
										}
									]
								  }
								}
							  ],
							  "medicationReference": {
								"reference": "#"+idDrug
							  }
						}
					  
					};

					listMedications.push(med);
				});
			}

			resolve(listMedications);
		})
	});
}

async function getPhenotype(patientId) {
	return new Promise(async function (resolve, reject) {
		await Phenotype.findOne({ "createdBy": patientId }, { "createdBy": false }, async (err, phenotype) => {
			var listSeizures = [];
			let patientIdEnc = crypt.encrypt((patientId).toString());
			if (phenotype) {
				if (phenotype.data.length > 0) {
					phenotype.data.forEach(function (symptom) {
						var actualsymptom = {
							"fullUrl": "Observation/" + symptom._id,
							"resource": {
								"resourceType": "Observation",
								"id": symptom._id,
								"status": "final",
								"code": {
									"text": "Phenotype"
								},
								"subject": {
									"reference": "Patient/"+patientIdEnc
								},
								"effectiveDateTime": symptom.onset,
								"valueString": symptom.id
							}
						};
						listSeizures.push(actualsymptom);
					});
				}
			}
			resolve(listSeizures);
		})
	});
}

async function getFeel(patientId) {
	return new Promise(async function (resolve, reject) {
		await Feel.find({ createdBy: patientId }, { "createdBy": false }).exec(function (err, feels) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var listFeels = [];
			let patientIdEnc = crypt.encrypt((patientId).toString());
			if (feels) {
				feels.forEach(function (feel) {
					var value = ((parseInt(feel.a1)+parseInt(feel.a2)+parseInt(feel.a3))/3).toFixed(2);
					var actualfeel = {
						"fullUrl": "Observation/" +feel._id,
						"resource": {
							"resourceType": "Observation",
							"id": feel._id,
							"status": "final",
							"code": {
								"text": "Feel"
							},
							"subject": {
								"reference": "Patient/"+patientIdEnc
							},
							"effectiveDateTime": feel.date,
							"valueQuantity": {
								"value": value,
								"unit": "AVG"
							}
						}
					};
					//"note": feel.note
					listFeels.push(actualfeel);
				});
			}

			resolve(listFeels);
		})
	});
}

async function getProm(patient, questionnaires) {
	return new Promise(async function (resolve, reject) {
		await Prom.find({ createdBy: patient._id }, { "createdBy": false }).exec(function (err, proms) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			const result = proms.reduce(function (r, a) {
				r[a.idQuestionnaire] = r[a.idQuestionnaire] || [];
				r[a.idQuestionnaire].push(a);
				return r;
			}, Object.create(null));
			var listQuestionnaires= [];
			if(Object.keys(result).length>0){
				Object.keys(result).forEach(function(key) {
					var questionnarire = result[key];
					let patientIdEnc = crypt.encrypt((patient._id).toString());
					var questionnaireRes = {
						"fullUrl": "QuestionnaireResponse/"+key,
						"resource": {
							"resourceType": "QuestionnaireResponse",
							"id": key,
							"status": "completed",
							"subject": {
								"reference": "Patient/"+patientIdEnc,
								"display": patient.patientName
							},
							"authored": "2013-06-18T00:00:00+01:00",
							"source": {
								"reference": "Practitioner/"+key
							},
							"item": [
							]
							}
						};
					
					if (questionnarire) {
						questionnarire.forEach(function (prom) {
							questionnaires.forEach(function (questionnaire) {
								if(key == questionnaire.id){
									questionnaire.items.forEach(function (item) {
										var question = '';
										if(prom.idProm==item.idProm){
											question = item.text
											var actualprom = {
												"linkId": prom.idProm,
												"text": question,
												"answer": [
												{
													"valueString": prom.data
												}
												]
											}
											if(prom.other && item.type!='ChoiceSet'){
												actualprom.answer[0].valueString = actualprom.answer[0].valueString + ': '+ prom.other;
											}
											if(item.type=='ChoiceSet'){
												var answers = '';
												Object.keys(prom.data).forEach(function(key2) {
													item.answers.forEach(function (answer){
														if(key2 == answer.value && prom.data[key2]){
															
															if(item.other==key2){
																answers = answers+ answer.text+': '+prom.other+', ';
															}else{
																answers = answers+ answer.text+', ';
															}
														}
													})
												})
												actualprom = {
													"linkId": prom.idProm,
													"text": question,
													"answer": [
													{
														"valueString": answers
													}
													]
												}
											}
											questionnaireRes.resource.item.push(actualprom);
										}	
									});
									
								}
							});
							
						});
					}
					listQuestionnaires.push(questionnaireRes);
				  });
			}
			
			  
			
			resolve(listQuestionnaires);
		})
	});
}

async function getSeizure(patientId) {
	return new Promise(async function (resolve, reject) {
		await Seizures.find({ createdBy: patientId }, { "createdBy": false }).exec(function (err, seizures) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var listSeizures = [];
			let patientIdEnc = crypt.encrypt((patientId).toString());
			if (seizures) {
				seizures.forEach(function (seizure) {
					var actualseizure = {
						"fullUrl": "Observation/" +seizure._id,
						"resource": {
							"resourceType": "Observation",
							"id": seizure._id,
							"status": "final",
							"code": {
								"text": "Seizure - "+ seizure.type
							},
							"subject": {
								"reference": "Patient/"+patientIdEnc
							},
							"effectiveDateTime": seizure.start,
							"valueQuantity": {
								"value": seizure.duracion,
								"unit": "Seconds"
							}
						}
					};

					/*var actualseizure = {
						"fullUrl": "Observation/" +seizure._id,
						"resource": {
							"resourceType": "Observation",
							"id": seizure._id,
							"status": "final",
							"code": {
								"text": "Seizure - "+ seizure.type
							},
							"subject": {
								"reference": "Patient/"+patientIdEnc
							},
							"effectiveDateTime": seizure.start,
							"valueQuantity": {
								"value": seizure.duracion,
								"unit": "Seconds"
							},
							"note": seizure.notes
						}
					};*/
					listSeizures.push(actualseizure);
				});
			}

			resolve(listSeizures);
		})
	});
}

async function getHistoryWeight (patientId){
	return new Promise(async function (resolve, reject) {
		await Weight.find({createdBy: patientId}).sort({ date : 'asc'}).exec(function(err, weights){
			if (err) {
				console.log(err);
				resolve(err)
			}
	
			var listWeights = [];
			let patientIdEnc = crypt.encrypt((patientId).toString());
			if(weights){
				weights.forEach(function(weight) {
					var actualweight = {
						"fullUrl": "Observation/" +weight._id,
						"resource": {
							"resourceType": "Observation",
							"id": weight._id,
							"status": "final",
							"category": [
							  {
								"coding": [
								  {
									"system": "http://terminology.hl7.org/CodeSystem/observation-category",
									"code": "vital-signs",
									"display": "Vital Signs"
								  }
								]
							  }
							],
							"code": {
							  "coding": [
								{
								  "system": "http://loinc.org",
								  "code": "29463-7",
								  "display": "Body Weight"
								},
								{
								  "system": "http://loinc.org",
								  "code": "3141-9",
								  "display": "Body weight Measured"
								},
								{
								  "system": "http://snomed.info/sct",
								  "code": "27113001",
								  "display": "Body weight"
								},
								{
								  "system": "http://acme.org/devices/clinical-codes",
								  "code": "body-weight",
								  "display": "Body Weight"
								}
							  ],
							  "text": "Weight"
							},
							"subject": {
								"reference": "Patient/"+patientIdEnc
							},
							"effectiveDateTime": weight.date,
							"valueQuantity": {
							  "value": weight.value,
							  "unit": "kg"
							}
						  }
					};
					listWeights.push(actualweight);
				});
			}
			
			resolve(listWeights);
		});
	
	});

}

async function getHistoryHeight (patientId){
	return new Promise(async function (resolve, reject) {
		await Height.find({createdBy: patientId}).sort({ date : 'asc'}).exec(function(err, heights){
			if (err) {
				console.log(err);
				resolve(err)
			}
	
			var listHeights = [];
			let patientIdEnc = crypt.encrypt((patientId).toString());
			if(heights){
				heights.forEach(function(height) {
					var actualheight = {
						"fullUrl": "Observation/" +height._id,
						"resource": {
							"resourceType": "Observation",
							"id": height._id,
							"status": "final",
							"category": [
							  {
								"coding": [
								  {
									"system": "http://terminology.hl7.org/CodeSystem/observation-category",
									"code": "vital-signs",
									"display": "Vital Signs"
								  }
								]
							  }
							],
							"code": {
								"coding": [
								  {
									"system": "http://loinc.org",
									"code": "8302-2",
									"display": "Body height"
								  }
								],
								"text": "Body height"
							},
							"subject": {
								"reference": "Patient/"+patientIdEnc
							},
							"effectiveDateTime": height.date,
							"valueQuantity": {
							  "value": height.value,
							  "unit": "cm"
							}
						  }
					};
					listHeights.push(actualheight);
				});
			}
			
			resolve(listHeights);
		});
	
	});

}


/**
 * @api {get} https://raito.care/api/eo/patient/:patientId Get patient
 * @apiName getInfoPatient
 * @apiDescription This method return the information of a patient.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/patient/'+patientId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} patientId Patient unique ID.
 * @apiSuccess {Object} Result Returns the information of a patient in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "patientID":"7bc32c840a9dae512ert32f2vs4e34d7717ad9095f70d9d47444c6a5668edca5545c",
 *   "result":{
 *      "resourceType": "Bundle",
 *      "id": "bundle-references",
 *      "type": "collection",
 *      "entry": [...]
 *    }
 * }
 *
 */

function getInfoPatient (req, res){
	let patientId = crypt.decrypt(req.params.patientId);
	Patient.findById(patientId, async (err, patient) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(patient){
			var infoGroup = await geInfoGroup(patient.group);
			var questionnaires = await getQuestionnairesGroup(patient.group);
			var data = await getAllPatientInfo(patient, infoGroup, questionnaires);
			res.status(200).send(data)
		}else{
			res.status(404).send({message: 'The patient does not exist'})
		}
	})
}

/**
 * @api {get} https://raito.care/api/eo/drugs/:groupId Get drugs
 * @apiName getDrugs
 * @apiDescription This method return the drugs of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/drugs/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the drugs of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

function getDrugs (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var infoGroup = await geInfoGroup(req.params.groupId);
		var data = await getDrugsPatients(patients, infoGroup);
		res.status(200).send(data)
	})
}

async function getDrugsPatients(patients, infoGroup) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getMedications(patients[index]._id, infoGroup, patients[index]));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

/**
 * @api {get} https://raito.care/api/eo/phenotypes/:groupId Get phenotypes
 * @apiName getPhenotypes
 * @apiDescription This method return the phenotypes of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/phenotypes/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the phenotypes of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

function getPhenotypes (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getPhenotypesPatients(patients);
		res.status(200).send(data)
	})
}

async function getPhenotypesPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getPhenotype(patients[index]._id));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

/**
 * @api {get} https://raito.care/api/eo/feels/:groupId Get feels
 * @apiName getFeels
 * @apiDescription This method return the feels of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/feels/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the feels of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

function getFeels (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getFeelsPatients(patients);
		res.status(200).send(data)
	})
}

async function getFeelsPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getFeel(patients[index]._id));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}


/**
 * @api {get} https://raito.care/api/eo/proms/:groupId Get proms
 * @apiName getProms
 * @apiDescription This method return the proms of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/proms/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the proms of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

function getProms (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var questionnaires = await getQuestionnairesGroup(req.params.groupId);
		var data = await getPromsPatients(patients, questionnaires);
		res.status(200).send(data)
	})
}

function getQuestionnairesGroup(groupId) {
	return new Promise(resolve => {
		Group.findOne({ '_id': groupId }, async function (err, group) {
			if (err) resolve({message: `Error making the request: ${err}`})
			if(!group.questionnaires) resolve({code: 208, message: 'The group does not exist'}) 
			if (group) {
				var promises = [];
				if (group.questionnaires.length > 0) {
					for (var index in group.questionnaires) {
						console.log(group.questionnaires);
						promises.push(getQuestionnaire(group.questionnaires[index].id));
					}
				}else {
					resolve('No data')
				}

				await Promise.all(promises)
				.then(async function (data) {
					resolve(data)
				})
				.catch(function (err) {
					console.log('Manejar promesa rechazada (' + err + ') aquí.');
					return null;
				});
			}
		});
	});
}

async function getQuestionnaire(questionnaireId) {
	return new Promise(async function (resolve, reject) {
		console.log(questionnaireId);
		var url = './raito_resources/questionnaires/'+questionnaireId+'.json'
		try {
			var json = JSON.parse(fs.readFileSync(url, 'utf8'));
			resolve (json)
		} catch (error) {
			console.log(error);
			resolve ([])
		}
		
	});
}


async function getPromsPatients(patients, questionnaires) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getProm(patients[index], questionnaires));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
					
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

/**
 * @api {get} https://raito.care/api/eo/seizures/:groupId Get seizures
 * @apiName getSeizures
 * @apiDescription This method return the seizures of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/seizures/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the seizures of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */


function getSeizures (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getSeizuresPatients(patients);
		res.status(200).send(data)
	})
}

async function getSeizuresPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getSeizure(patients[index]._id));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

/**
 * @api {get} https://raito.care/api/eo/weights/:groupId Get weights
 * @apiName getWeights
 * @apiDescription This method return the weights of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/weights/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the weights of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

function getWeights (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getWeightsPatients(patients);
		res.status(200).send(data)
	})
}

async function getWeightsPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getHistoryWeight(patients[index]._id));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}


/**
 * @api {get} https://raito.care/api/eo/heights/:groupId Get heights
 * @apiName getHeights
 * @apiDescription This method return the heights of all the patients of an organization in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/heights/'+groupId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result Returns the heights of all the patients of an organization in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

 function getHeights (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getHeightsPatients(patients);
		res.status(200).send(data)
	})
}

async function getHeightsPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getHistoryHeight(patients[index]._id));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					if(onePatient.length>0){
						onePatient.forEach(function (dataPatient) {
							res.push(dataPatient);
						});
					}
				});
				var result = {
					"resourceType": "Bundle",
					"id": "bundle-references",
					"type": "collection",
					"entry": res
				};
				resolve(result)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

/**
 * @api {get} https://raito.care/api/eo/consent/:patientId Have consent
 * @apiName haveConsent
 * @apiDescription This method return the consent of the patient in FHIR.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/eo/consent/'+patientId)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} patientId Patient unique ID.
 * @apiSuccess {Object} Result Returns the consent of the patient in FHIR.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Bundle",
 *    "id": "bundle-references",
 *    "type": "collection",
 *    "entry": [...]
 * }
 *
 */

function haveConsent (req, res){
	let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, async (err, patient) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = {};
		if(patient.consentgroup=='true'){
			data = await getConsent(patient, true);
		}
		res.status(200).send(data)
	})
}

async function getConsent (patient, isBundle){
	return new Promise(async function (resolve, reject) {
		let patientIdEnc = crypt.encrypt((patient._id).toString());
		var actualConsent = {
			"fullUrl": "Consent/" +patient._id,
			"resource": {
				"resourceType": "Consent",
				"id": patient._id,
				"status": "active",
				"scope": {
					"coding": [
					  {
						"system": "http://terminology.hl7.org/CodeSystem/consentscope",
						"code": "patient-privacy"
					  }
					]
				  },
				  "category": [
					{
					  "coding": [
						{
						  "system": "http://loinc.org",
						  "code": "59284-0"
						}
					  ]
					}
				  ],
				"patient": {
					"reference": "Patient/"+patientIdEnc,
					"display": patient.patientName
				},
				"dateTime": patient.lastAccess,
				"organization": [
					{
					  "reference": "Organization/"+patient.group
					}
				  ],
				  "sourceAttachment": {
					"title": "The terms of the consent in lawyer speak."
				  },
				  "policyRule": {
					"coding": [
					  {
						"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
						"code": "OPTIN"
					  }
					]
				  },
				  "provision": {
					"period": {
					  "start": "1964-01-01",
					  "end": "2016-01-01"
					}
				  }
			  }
		};
		var result = {
			"resourceType": "Bundle",
			"id": "bundle-references",
			"type": "collection",
			"entry": [actualConsent]
		};
		if(isBundle){
			resolve(result);
		}else{
			resolve(actualConsent);
		}
		
	
	});

}

async function getAppointments(patient) {
	return new Promise(async function (resolve, reject) {
		await Appointments.find({ createdBy: patient._id }, { "createdBy": false }).exec(function (err, appointments) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			let listAppointments = [];
			let patientIdEnc = crypt.encrypt((patient._id).toString());
			if (appointments) {
				appointments.forEach(function (appointment) {
					let actualappointment = {
						"fullUrl": "Observation/" +appointment._id,
						"resource": {
							"resourceType": "Appointment",
							"id": appointment._id,
							"status": "proposed",
							"description": appointment.title,
							"start": appointment.start,
							"end": appointment.end,
							"created": appointment.date,
							"comment": appointment.notes,
							"participant": [
								{
								  "actor": {
									"reference": "Patient/"+patientIdEnc,
									"display": patient.patientName
								  },
								  "required": "required",
								  "status": "accepted"
								}
							]
						}
					};
					listAppointments.push(actualappointment);
				});
			}

			resolve(listAppointments);
		})
	});
}

function saveBackup (req, res){
	let patientId = crypt.decrypt(req.params.patientId);
	let location = req.body.location;
	Patient.findById(patientId, async (err, patient) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(patient){
			var infoGroup = await geInfoGroup(patient.group);
			var questionnaires = await getQuestionnairesGroup(patient.group);
			var data = await getAllPatientInfo(patient, infoGroup, questionnaires);
			var userId = crypt.encrypt((patient.createdBy).toString());
			if(location=='IPFS'){
				var data2 = await saveIPFS(data, userId);
				if(data2){
					res.status(200).send({message: "Done"})
				}else{
					res.status(500).send({message: `Error: ${err}`})
				}
			}else if(location=='F29'){
				var data2 = await saveF29(data.result, userId);
				if(data2){
					res.status(200).send({message: "Done"})
				}else{
					res.status(500).send({message: `Error: ${err}`})
				}
				
			}
			
		}else{
			res.status(404).send({message: 'The patient does not exist'})
		}
	})
}

const btoa = (text) => {
    return Buffer.from(text, 'binary').toString('base64');
};

async function saveIPFS (data, userId){
	return new Promise(async function (resolve, reject) {
		const converted = toBinary(JSON.stringify(data.result));
		// Save file input to IPFS
		const fileName = userId+'.json';
		const file = new Moralis.File(fileName, {
		base64: btoa(converted),
		});
		try {
			await file.saveIPFS({useMasterKey:true});

			// Save file reference to DDBB
			let userIdDecrypt = crypt.decrypt(userId);
			var dataToSave = {url:file.hash(), date: Date.now()} ;
			User.findByIdAndUpdate(userIdDecrypt, { backupIPFS: dataToSave}, {new: true}, (err,userUpdated) => {
				
			})
			resolve(true);
		} catch (error) {
			console.log(error);
			resolve(false);
		}
		
	});
}

function toBinary(string) {
	const codeUnits = Uint16Array.from(
	  { length: string.length },
	  (element, index) => string.charCodeAt(index)
	);
	const charCodes = new Uint8Array(codeUnits.buffer);
  
	let result = "";
	charCodes.forEach((char) => {
	  result += String.fromCharCode(char);
	});
	return result;
  }

  function fromBinary(binary) {
	const bytes = Uint8Array.from({ length: binary.length }, (element, index) =>
	  binary.charCodeAt(index)
	);
	const charCodes = new Uint16Array(bytes.buffer);
  
	let result = "";
	charCodes.forEach((char) => {
	  result += String.fromCharCode(char);
	});
	return result;
  }

async function getIPFS(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	User.findById(userId, async (err, user) => {
		if(user.backupIPFS.url!=''){
			var options = {
				'method': 'GET',
				'hostname': 'gateway.moralisipfs.com',
				'path': `/ipfs/${user.backupIPFS.url}`,
				'headers': {
					'Content-Type': 'application/json'
				},
				'maxRedirects': 20
			  };
			  
			  var req = https.request(options, function (res1) {
				var chunks = [];
			  
				res1.on("data", function (chunk) {
				  chunks.push(chunk);
				});
			  
				res1.on("end", function (chunk) {
				  var body = Buffer.concat(chunks);
				  const original = fromBinary(body.toString());
				  return res.status(200).send({result: JSON.parse(original)})
				});
			  
				res1.on("error", function (error) {
				  console.error(error);
				  res.status(500).send({message: error})
				});
			  });
			  
			  req.end();
			/*const url = `https://gateway.moralisipfs.com/ipfs/${user.backupIPFS}`;
			const response = await fetch(url);
			return await response.json();*/
		}else{
			return res.status(200).send({message: 'Not available'})
		}
		
	})
	
  }

  async function checkIPFS(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	User.findById(userId, async (err, user) => {
		if(user.backupIPFS.url!=''){
			return res.status(200).send({message: 'Available', date: user.backupIPFS.date})
		}else{
			return res.status(200).send({message: 'Not available', date: null})
		}
		
	})
	
  }


  async function saveF29 (data, userId){
	return new Promise(async function (resolve, reject) {
		// Save file to Blob
		const fileName = userId+'.json';
		var result = await f29azureService.createBlobSimple('backups', data, fileName);
		if (result) {
			let userIdDecrypt = crypt.decrypt(userId);
			var dataToSave = Date.now() ;
			User.findByIdAndUpdate(userIdDecrypt, { backupF29: dataToSave}, {new: true}, (err,userUpdated) => {
				resolve(true);
			})
		}else{
			resolve(false);
		}
	});
}

  async function getF29(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	User.findById(userId, async (err, user) => {
		if(user.backupF29!=null){
			const fileName = req.params.userId+'.json';
			var result = await f29azureService.downloadBlob('backups', fileName);

			return res.status(200).send({result: JSON.parse(result.toString())})
		}else{
			return res.status(200).send({message: 'Not available'})
		}
		
	})
	
  }

async function checkF29(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	User.findById(userId, async (err, user) => {
		if(user.backupF29!=null){
			return res.status(200).send({message: 'Available', date: user.backupF29})
		}else{
			return res.status(200).send({message: 'Not available', date: null})
		}
		
	})
	
  }

module.exports = {
	getOnlyPatients,
	getPatients,
	getInfoPatient,
	getDrugs,
	getPhenotypes,
	getFeels,
	getProms,
	getSeizures,
	getWeights,
	getHeights,
	haveConsent,
	saveBackup,
	checkIPFS,
	getIPFS,
	checkF29,
	getF29
}
