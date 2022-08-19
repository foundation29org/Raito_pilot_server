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
const config = require('../../config')

/* import moralis */
const Moralis = require("moralis/node");
var https = require('follow-redirects').https;
var fs = require('fs');

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
	console.log(meta);
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
				/*var dataRes = [];
				data.forEach(function (dataPatientsUser) {
					dataPatientsUser.forEach(function (dataPatient) {
						dataRes.push(dataPatient);
					});
				});
				console.log('termina')*/
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
		await Medication.find({ createdBy: patientId }, { "createdBy": false }).exec(function (err, medications) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var numMedications = 0;
			if (medications) {
				numMedications = medications.length;
			}
			var info = {"drugs": numMedications};
			resolve(info);
		})
	});
}

async function getNumPhenotype(patientId) {
	return new Promise(async function (resolve, reject) {
		await Phenotype.findOne({ "createdBy": patientId }, { "createdBy": false }, async (err, phenotype) => {
			//console.log('Phenotype done.');
			var numSeizures = 0;
			if (phenotype) {
				if (phenotype.data.length > 0) {
					numSeizures = phenotype.data.length;
				}
			}
			var info = {"seizures": numSeizures};
			resolve(info);
		})
	});
}

async function getNumFeel(patientId) {
	return new Promise(async function (resolve, reject) {
		await Feel.find({ createdBy: patientId }, { "createdBy": false }).exec(function (err, feels) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			//console.log('Feel done.');
			var numFeels = 0;
			if (feels) {
				numFeels = feels.length;
			}

			var info = {"feels": numFeels};
			resolve(info);
		})
	});
}

async function getNumProm(patient) {
	return new Promise(async function (resolve, reject) {
		await Prom.find({ createdBy: patient._id }, { "createdBy": false }).exec(function (err, proms) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var numProms = 0;
			if (proms) {
				numProms = proms.length;
			}
			var info = {"proms": numProms};
			resolve(info);
		})
	});
}

async function getNumSeizure(patientId) {
	return new Promise(async function (resolve, reject) {
		await Seizures.find({ createdBy: patientId }, { "createdBy": false }).exec(function (err, seizures) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var numSeizures = 0;
			if (seizures) {
				numSeizures = seizures.length;
			}
			var info = {"seizures": numSeizures};
			resolve(info);
		})
	});
}

async function getNumWeight (patientId){
	return new Promise(async function (resolve, reject) {
		await Weight.find({createdBy: patientId}).sort({ date : 'asc'}).exec(function(err, weights){
			if (err) {
				console.log(err);
				resolve(err)
			}
	
			var numWeights = 0;
			if(weights){
				numWeights = weights.length;
			}
			var info = {"weight": numWeights};
			resolve(info);
		});
	
	});
}

async function getNumHeight (patientId){
	return new Promise(async function (resolve, reject) {
		await Height.find({createdBy: patientId}).sort({ date : 'asc'}).exec(function(err, heights){
			if (err) {
				console.log(err);
				resolve(err)
			}
	
			var numHeights = 0;
			if(heights){
				numHeights = heights.length;
			}
			var info = {"height": numHeights};
			resolve(info);
		});
	
	});

}

async function getAllBacicPatientInfo(patient, meta) {
	return new Promise(async function (resolve, reject) {

		var promises = [];
		if(meta){
			console.log('entra');
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

			resolve({ patientId: patientIdEnc, result: result, metaInfo: data });
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
		var data = await getInfoPatients(patients, infoGroup);
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

async function getInfoPatients(patients, infoGroup) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getAllPatientInfo(patients[index], infoGroup));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				/*var dataRes = [];
				data.forEach(function (dataPatientsUser) {
					dataPatientsUser.forEach(function (dataPatient) {
						dataRes.push(dataPatient);
					});
				});
				console.log('termina')*/
				resolve(data)
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});

	});
}

async function getAllPatientInfo(patient, infoGroup) {
	return new Promise(async function (resolve, reject) {
		let patientId = patient._id;
		var promises3 = [];
		promises3.push(getMedications(patientId, infoGroup, patient));
		promises3.push(getPhenotype(patientId));
		promises3.push(getFeel(patientId));
		promises3.push(getProm(patient));
		promises3.push(getSeizure(patientId));
		promises3.push(getHistoryWeight(patientId));
		promises3.push(getHistoryHeight(patientId));
		promises3.push(getConsent(patient, false));

		await Promise.all(promises3)
			.then(async function (data) {
				/* var resPatientData = [];
				 resPatientData.push({data:patient, name:"patient"});
				 resPatientData.push({info:data})*/
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
			if (data[3]) {
				result.entry.push(data[3]);
			}
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
			//console.log('Medication done.');
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
							//"effectiveDateTime": medication.startDate,
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
			//console.log('Phenotype done.');
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
			//console.log('Feel done.');
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
							},
							"note": feel.note
						}
					};
					listFeels.push(actualfeel);
				});
			}

			resolve(listFeels);
		})
	});
}

async function getProm(patient) {
	return new Promise(async function (resolve, reject) {
		await Prom.find({ createdBy: patient._id }, { "createdBy": false }).exec(function (err, proms) {
			if (err) {
				console.log(err);
				resolve(err)
			}
			//console.log('Proms done.');
			let patientIdEnc = crypt.encrypt((patient._id).toString());
			var questionnaire = {
				"fullUrl": "QuestionnaireResponse/q1dravet",
				"resource": {
					"resourceType": "QuestionnaireResponse",
					"id": "q1dravet",
					"status": "completed",
					"subject": {
						"reference": "Patient/"+patientIdEnc,
						"display": patient.patientName
					},
					"authored": "2013-06-18T00:00:00+01:00",
					"source": {
						"reference": "Practitioner/q1dravet"
					},
					"item": [
					]
					}
				};
			
			if (proms) {
				proms.forEach(function (prom) {
					
					var question = '';
					if(prom.idProm=='1'){
						question = 'Is the number of seizures the most relevant problem for you?'
					}else if(prom.idProm=='2'){
						question = 'Does your child have problems walking or with movement?'
					}else if(prom.idProm=='3'){
						question = 'How does your childs appetite change due to their treatment?'
					}else if(prom.idProm=='4'){
						question = 'Can your child understand verbal instructions?'
					}else if(prom.idProm=='5'){
						question = 'Does your child always experience seizures in the same way or do they vary?'
					}else if(prom.idProm=='6'){
						question = 'Is there anything you think triggers your childs seizures?'
					}else if(prom.idProm=='7'){
						question = 'Are you or your child able to predict when they will have a seizure?'
					}else if(prom.idProm=='8'){
						question = 'If a drug company were to develop a new treatment for Dravet syndrome what would you like to see in terms of improvement for your child?'
					}


					var actualprom = {
						"linkId": prom.idProm,
						"text": question,
						"answer": [
						  {
							"valueString": prom.data
						  }
						]
					  }

					  if(prom.idProm=='6'){
						var answers = '';
						if(prom.data.Brightorpatternedlights){
							answers = answers+'Bright or patterned lights, ';
						}
						if(prom.data.Warmorcoldtemperatures){
							answers = answers+'Warm or cold temperatures, ';
						}
						if(prom.data.Physicalmovementoractivity){
							answers = answers+'Physical movement or activity, ';
						}
						if(prom.data.Noise){
							answers = answers+'Noise, ';
						}
						if(prom.data.Geometricpatterns){
							answers = answers+'Geometric patterns, ';
						}
						if(prom.data.Changesinemotionalstate){
							answers = answers+'Changes in emotional state, ';
						}
						if(prom.data.Tiredness){
							answers = answers+'Tiredness, ';
						}
						if(prom.data.Other){
							answers = answers+'Other, ';
						}
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

					questionnaire.resource.item.push(actualprom);

					/*var actualprom = {
						"fullUrl": "Observation/" +prom._id,
						"resource": {
							"resourceType": "Observation",
							"id": prom._id,
							"status": "final",
							"code": {
								"text": "Prom"
							},
							"subject": {
								"reference": "Patient/"+patientIdEnc
							},
							"effectiveDateTime": prom.date,
							"valueQuantity": {
								"value": prom.idProm+':'+JSON.stringify(prom.data),
								"unit": ""
							}
						}
					};
					listProms.push(actualprom);*/
				});
			}
			resolve(questionnaire);
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
			//console.log('Seizures done.');
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
							},
							"note": seizure.notes
						}
					};
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
			var data = await getAllPatientInfo(patient, infoGroup);
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
		var data = await getPromsPatients(patients);
		res.status(200).send(data)
	})
}

async function getPromsPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getProm(patients[index]));
				}
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				var res = [];
				data.forEach(function(onePatient) {
					res.push(onePatient);
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

function saveBackup (req, res){
	let patientId = crypt.decrypt(req.params.patientId);
	let location = req.body.location;
	Patient.findById(patientId, async (err, patient) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(patient){
			var infoGroup = await geInfoGroup(patient.group);
			var data = await getAllPatientInfo(patient, infoGroup);
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
		

		// Save file input to IPFS
		const fileName = userId+'.json';
		const file = new Moralis.File(fileName, {
		base64: btoa(JSON.stringify(data.result)),
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

async function getIPFS(req, res) {
	let userId = crypt.decrypt(req.params.userId);
	User.findById(userId, async (err, user) => {
		if(user.backupIPFS.url!=''){
			var options = {
				'method': 'GET',
				'hostname': 'gateway.moralisipfs.com',
				'path': `/ipfs/${user.backupIPFS.url}`,
				'headers': {
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
				  return res.status(200).send({result: JSON.parse(body.toString())})
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

  async function deleteMoralis (moralisId){
	return new Promise(async function (resolve, reject) {
		const query = new Moralis.Query('_EthAddress')
		console.log(moralisId);
		query.equalTo('user', moralisId)
		const object = await query.first({useMasterKey:true}) // just get 1 item, not array of items
		if (object) {
			console.log(object);
			resolve (object);
			/*object.destroy().then(() => {
			console.log('The object was deleted from ItemsForSale.');
			}, (error) => {
			console.log(error);
			});*/
		}
		
	});

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
	getF29, 
	deleteMoralis
}
