// functions for each call of the api on social-info. Use the social-info model

'use strict'

const { forEach } = require('async');
// add the social-info model
const Inmunodeficiencies = require('../../../models/inmunodeficiencies')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')
const mongoose = require('mongoose');


function getInmunodeficiencies (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	Inmunodeficiencies.findOne({"createdBy": patientId}, {"createdBy" : false},(err, eventdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(eventdb){
			return res.status(200).send({eventdb})
		}else{
			return res.status(202).send({message: `There are no eventdb`})
		}
	});
}


function saveInmunodeficiencies (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	let eventdb = new Inmunodeficiencies()

	 // Agregar _id a cada infection y complication antes de guardar
	 if (req.body.data.infections) {
        req.body.data.infections.forEach(infection => {
            infection._id = new mongoose.Types.ObjectId();
            if (infection.treatments) {
                infection.treatments.forEach(treatment => {
                    treatment._id = new mongoose.Types.ObjectId();
                });
            }
        });
    }
	if (req.body.data.complications) {
		req.body.data.complications.forEach(complication => {
			complication._id = new mongoose.Types.ObjectId();
			if (complication.treatments) {
				complication.treatments.forEach(treatment => {
					treatment._id = new mongoose.Types.ObjectId();
				});
			}
		});
	}
	 // Agregar _id a cada usualTreatment
	 if (req.body.data.usualTreatments) {
        req.body.data.usualTreatments.forEach(treatment => {
            treatment._id = new mongoose.Types.ObjectId();
        });
    }

	eventdb.data = req.body.data
	eventdb.date = req.body.date
	eventdb.createdBy = patientId

	// when you save, returns an id in eventdbStored to access that social-info
	eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		if(eventdbStored){
			//podría devolver eventdbStored, pero no quiero el field createdBy, asi que hago una busqueda y que no saque ese campo
			Inmunodeficiencies.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, eventdb2) => {
				if (err) return res.status(500).send({message: `Error making the request: ${err}`})
				if(!eventdb2) return res.status(202).send({message: `There are no eventdb`})
				res.status(200).send({message: 'Eventdb created', eventdb: eventdb2})
			})
		}


	})
}

function updateInmunodeficiencies (req, res){
	let inmunoId= req.params.inmunoId;

	 // Asumiendo que quieres reemplazar completamente las infections
	 if (req.body.data.infections) {
        req.body.data.infections.forEach(infection => {
            infection._id = new mongoose.Types.ObjectId();
            if (infection.treatments) {
                infection.treatments.forEach(treatment => {
                    treatment._id = new mongoose.Types.ObjectId();
                });
            }
        });
    }
	if (req.body.data.complications) {
		req.body.data.complications.forEach(complication => {
			complication._id = new mongoose.Types.ObjectId();
			if (complication.treatments) {
				complication.treatments.forEach(treatment => {
					treatment._id = new mongoose.Types.ObjectId();
				});
			}
		});
	}
	if(req.body.data.usualTreatments){
		req.body.data.usualTreatments.forEach(usualTreatment => {
			usualTreatment._id = new mongoose.Types.ObjectId();
		});
	}

	let update = req.body

	Inmunodeficiencies.findByIdAndUpdate(inmunoId, update, {select: '-createdBy', new: true}, (err,eventdbUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})

		res.status(200).send({message: 'Eventdb updated', eventdb: eventdbUpdated})

	})
}

function getFhirInmunodeficiencies (req, res){
	Patient.find({group: req.params.groupId}, async (err, patients) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var data = await getInmunodeficienciesFhirPatients(patients);
		res.status(200).send(data)
	})
}

async function getInmunodeficienciesFhirPatients(patients) {
	return new Promise(async function (resolve, reject) {
		var promises = [];
		if (patients.length > 0) {
			for (var index in patients) {
				if(patients[index].consentgroup=='true'){
					promises.push(getInmunodeficienciesFHIR(patients[index]._id));
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

function getInmunodeficienciesFHIR (patientId){
	return new Promise(async function (resolve, reject) {
		Inmunodeficiencies.findOne({"createdBy": patientId}, {"createdBy" : false},(err, eventdb) => {
			if (err) {
				console.log(err);
				resolve(err)
			}
			var listResources = [];
			if(eventdb){
				let patientIdEnc = crypt.encrypt((patientId).toString());

				//infections
				if(eventdb.data.infections.length>0){
					forEach(eventdb.data.infections, function (infection, next) {
						var actualResource = {
							"fullUrl": "Condition/" +infection._id,
							"resource": {
								"resourceType": "Condition",
								"id": infection._id,
								"clinicalStatus": {
									"coding": [
										{
											"system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
											"code": "active"
										}
									]
								},
								"verificationStatus": {
									"coding": [
										{
											"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
											"code": "confirmed"
										}
									]
								},
								"code": {
									"text": infection.name
								},
								"subject": {
									"reference": "Patient/"+patientIdEnc
								},
								"onsetDateTime": infection.start,
								"abatementDateTime": infection.duration
							}
						};
						listResources.push(actualResource);
						forEach(infection.treatments, function (treatment, next) {
							console.log(treatment)
							var actualProcedure = {
								"fullUrl": "Procedure/" +treatment._id,
								"resource": {
									"resourceType": "Procedure",
									"id": "procedure1",
									"subject": { "reference": "Patient/"+patientIdEnc },
									"performedDateTime": infection.start,
									"reasonReference": [
									  { "reference": "Condition/" +infection._id }
									],
									"code": {
									  "text": treatment.treatment
									}
								}
							  }
							  listResources.push(actualProcedure);
							  next();
						}, function (err) {	
							if (err) {
								console.error(err.message);
							}
						});					

						next();
					}	, function (err) {
						if (err) {
							console.error(err.message);
						}
					}
					);
				}

				//complications
				if(eventdb.data.complications.length>0){
					forEach(eventdb.data.complications, function (complication, next) {
						var actualResource = {
							"fullUrl": "Condition/" +complication._id,
							"resource": {
								"resourceType": "Condition",
								"id": complication._id,
								"clinicalStatus": {
									"coding": [
										{
											"system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
											"code": "active"
										}
									]
								},
								"verificationStatus": {
									"coding": [
										{
											"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
											"code": "confirmed"
										}
									]
								},
								"code": {
									"text": complication.name
								},
								"subject": {
									"reference": "Patient/"+patientIdEnc
								},
								"onsetDateTime": complication.start,
								"abatementDateTime": complication.duration
							}
						};
						listResources.push(actualResource);
						
						forEach(complication.treatments, function (treatment, next) {
							var actualProcedure = {
								"fullUrl": "Procedure/" +treatment._id,
								"resource": {
									"resourceType": "Procedure",
									"id": "procedure1",
									"subject": { "reference": "Patient/"+patientIdEnc },
									"performedDateTime": complication.start,
									"reasonReference": [
									  { "reference": "Condition/" +complication._id }
									],
									"code": {
									  "text": treatment.treatment
									}
								}
							  }
							  listResources.push(actualProcedure);
							  next();
						}, function (err) {	
							if (err) {
								console.error(err.message);
							}
						});	

						next();
					}	, function (err) {
						if (err) {
							console.error(err.message);
						}
					}
					);
				}
				
				//Variables Inmunológicas
				forEach(eventdb.data.inmunologicalVariables.serumIgGList, function (serumIgG, next) {
					var actualResource = {
						"fullUrl": "Observation/serumIgG",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "serumIgG"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": serumIgG.date,
							"valueString": serumIgG.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});
				
				forEach(eventdb.data.inmunologicalVariables.serumIgAList, function (serumIgA, next) {
					var actualResource = {
						"fullUrl": "Observation/serumIgA",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "serumIgA"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": serumIgA.date,
							"valueString": serumIgA.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});

				forEach(eventdb.data.inmunologicalVariables.serumIgMList, function (serumIgM, next) {
					var actualResource = {
						"fullUrl": "Observation/serumIgM",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "serumIgM"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": serumIgM.date,
							"valueString": serumIgM.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});

				forEach(eventdb.data.inmunologicalVariables.serumIgEList, function (serumIgE, next) {
					var actualResource = {
						"fullUrl": "Observation/serumIgE",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "serumIgE"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": serumIgE.date,
							"valueString": serumIgE.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});

				forEach(eventdb.data.inmunologicalVariables.hbList, function (hb, next) {
					var actualResource = {
						"fullUrl": "Observation/hb",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "hb"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": hb.date,
							"valueString": hb.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});


				forEach(eventdb.data.inmunologicalVariables.plateletsList, function (platelets, next) {
					var actualResource = {
						"fullUrl": "Observation/platelets",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "platelets"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": platelets.date,
							"valueString": platelets.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});

				forEach(eventdb.data.inmunologicalVariables.lymphocytesList, function (lymphocytes, next) {
					var actualResource = {
						"fullUrl": "Observation/lymphocytes",
						"resource": {
							"resourceType": "Observation",
							"id": "obs1",
							"status": "final",
							"code": {
							  "text": "lymphocytes"
							},
							"subject": { "reference": "Patient/"+patientIdEnc },
							"effectiveDateTime": lymphocytes.date,
							"valueString": lymphocytes.value
						  }
					}
					listResources.push(actualResource);
				}, function (err) {	
					if (err) {
						console.error(err.message);
					}
				});
				

				//usualTreatments
				if(eventdb.data.usualTreatments.length>0){
					forEach(eventdb.data.usualTreatments, function (usualTreatment, next) {
						var actualResource = {
							"fullUrl": "CarePlan/" +usualTreatment._id,
							"resource": {
								"resourceType": "CarePlan",
								"id": "careplan1",
								"status": "active",
								"intent": "plan",
								"subject": { "reference": "Patient/"+patientIdEnc },
								"description": usualTreatment.name,
								"period": {
								  "start": usualTreatment.start
								},
								"activity": [
								  {
									"detail": {
									  "description": "",
									  "status": "in-progress",
									  "scheduledString": usualTreatment.usualFrequency,
									  "doNotPerform": false,
									  "kind": "ServiceRequest",
									  "productCodeableConcept": {
										"text": usualTreatment.usualDose
									  }
									}
								  }
								]
							  }
						};
						listResources.push(actualResource);

						next();
					}	, function (err) {
						if (err) {
							console.error(err.message);
						}
					}
					);
				}

				//emergencyTreatments
				if(eventdb.data.emergencyTreatments.emergencyAntibiotics.length>0){
					forEach(eventdb.data.emergencyTreatments.emergencyAntibiotics, function (emergencyAntibiotic, next) {
						var actualResource = {
							"fullUrl": "Procedure/emergencyAntibiotics",
							"resource": {
								"resourceType": "Procedure",
								"id": "emergencyAntibiotics",
								"subject": { "reference": "Patient/"+patientIdEnc },
								"code": {
								  "text": emergencyAntibiotic.treatment
								}
							  }
						};
						listResources.push(actualResource);
					}	, function (err) {
						if (err) {
							console.error(err.message);
						}
					}
					);
				}
				if(eventdb.data.emergencyTreatments.emergencyCorticosteroids.length>0){
					forEach(eventdb.data.emergencyTreatments.emergencyCorticosteroids, function (emergencyCorticosteroid, next) {
						var actualResource = {
							"fullUrl": "Procedure/emergencyCorticosteroids",
							"resource": {
								"resourceType": "Procedure",
								"id": "emergencyCorticosteroids",
								"subject": { "reference": "Patient/"+patientIdEnc },
								"code": {
								  "text": emergencyCorticosteroid.treatment
								}
							  }
						};
						listResources.push(actualResource);
					}	, function (err) {
						if (err) {
							console.error(err.message);
						}
					}
					);
				}


			}
			resolve(listResources);
		});
	});
	
}

async function getAllInmunodeficiencies(req, res) {
    try {
        const patients = await Patient.find({ group: req.params.groupId }).exec();
        const data = await getInmunodeficienciesPatients(patients);
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send({ message: `Error making the request: ${err}` });
    }
}

async function getInmunodeficienciesPatients(patients) {
    if (patients.length === 0) {
        return 'No data';
    }

    const promises = patients.filter(patient => patient.consentgroup == 'true')
                             .map(patient => getInmunodeficienciesOnePatient(patient._id));
    const data = await Promise.all(promises);
    return data.filter(patientData => Object.keys(patientData).length !== 0);
}

async function getInmunodeficienciesOnePatient(patientId) {
    try {
        const eventdb = await Inmunodeficiencies.findOne({ "createdBy": patientId }, { "createdBy": false }).exec();
        if (!eventdb) {
            return {};
        }
        let copyEventDb = JSON.parse(JSON.stringify(eventdb));
        copyEventDb.idPatient = crypt.encrypt(patientId.toString());
        return copyEventDb;
    } catch (err) {
        console.log(err);
        return {}; // Dependiendo de cómo quieras manejar errores, podrías considerar lanzar el error
    }
}

module.exports = {
	getInmunodeficiencies,
	saveInmunodeficiencies,
	updateInmunodeficiencies,
	getFhirInmunodeficiencies,
	getAllInmunodeficiencies
}
