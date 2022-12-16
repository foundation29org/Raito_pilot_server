// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Medication = require('../../models/medication')
const crypt = require('../../services/crypt')

const Feel = require('../../models/feel')
const Phenotype = require('../../models/phenotype')
const Seizures = require('../../models/seizures')
const Weight = require('../../models/weight')
const Height = require('../../models/height')
const Prom = require('../../models/prom')
const Appointments = require('../../models/appointments')
const medicationCtrl = require('./patient/medication')

async function saveMassiveResources (req, res){

	let patientId= crypt.decrypt(req.params.patientId);
	var promises = [];
	if (req.body.length > 0) {
		for (var i = 0; i<(req.body).length;i++){
			var actualResource = (req.body)[i];
			if(actualResource.resource.resourceType=='MedicationStatement'){
				promises.push(addDrug(actualResource, patientId));
			}
			/*if(actualResource.resource.resourceType=='Consent'){
				promises.push(updateConsent(actualResource, patientId));
			}
			if(actualResource.resource.resourceType=='Condition'){
				promises.push(updateConsent(actualResource, patientId));
			}*/
			if(actualResource.resource.resourceType=='QuestionnaireResponse'){
				promises.push(addProms(actualResource, patientId));
			}
			if(actualResource.resource.resourceType=='Observation'){
				if(actualResource.resource.code.text=='Phenotype'){
					promises.push(addPhenotype(actualResource, patientId));
				}
				if(actualResource.resource.code.text.indexOf('Seizure - ')!=-1){
					promises.push(addSeizure(actualResource, patientId));
				}
				if(actualResource.resource.code.text=='Feel'){
					promises.push(addFeel(actualResource, patientId));
				}
				if(actualResource.resource.code.text=='Weight'){
					promises.push(addWeight(actualResource, patientId));
				}
				if(actualResource.resource.code.text=='Body height'){
					promises.push(addHeight(actualResource, patientId));
				}
			}
			if(actualResource.resource.resourceType=='Appointment'){
				promises.push(addAppointments(actualResource, patientId));
			}
		}
	}else{
		res.status(200).send({message: 'Eventdb created', eventdb: []})
	}


	await Promise.all(promises)
	.then(async function (data) {
		res.status(200).send({message: 'Eventdb created', eventdb: data})
	})
	.catch(function (err) {
		console.log('Manejar promesa rechazada (' + err + ') aquí.');
		return null;
	});
	
}

async function addDrug (actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			let medication = new Medication()
			medication.drug = actualResource.resource.contained[0].code.coding[0].display
			medication.dose = actualResource.resource.dosage[0].doseAndRate[0].doseQuantity.value
			medication.startDate = actualResource.resource.effectivePeriod.start
			medication.endDate = actualResource.resource.effectivePeriod.end
			medication.schedule = actualResource.resource.schedule
			medication.notes = actualResource.resource.note[0].text
			medication.date = actualResource.resource.dateAsserted
			medication.createdBy = patientId
			
			var infoMsgMeds = await medicationCtrl.getMeds(patientId, medication);
			if(infoMsgMeds!='imposible'){
				var res1 = medicationCtrl.saveOneDrug(medication)
				resolve ({added:true,medication:medication});
			}else{
				resolve ({added:false,medication:medication});
			}
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});

}


function addSeizure (actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			let eventdb = new Seizures()
			let type = actualResource.resource.code.text.split('Seizure - ');
			eventdb.type = type[1];
			eventdb.duracion = actualResource.resource.valueQuantity.value
			eventdb.start = actualResource.resource.effectiveDateTime
			eventdb.createdBy = patientId
		
			// when you save, returns an id in eventdbStored to access that social-info
			eventdb.save((err, eventdbStored) => {
				if (err) {
					resolve ({added:false,eventdb:eventdb});
				}
				if(eventdbStored){
					resolve ({added:true,eventdb:eventdb});
				}
			})
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});
	
}

function addFeel (actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			let eventdb = new Feel()
			eventdb.a1 = actualResource.resource.valueQuantity.value;
			eventdb.a2 = actualResource.resource.valueQuantity.value;
			eventdb.a3 = actualResource.resource.valueQuantity.value;
			eventdb.date = actualResource.resource.effectiveDateTime;
			eventdb.createdBy = patientId
		
			// when you save, returns an id in eventdbStored to access that social-info
			eventdb.save((err, eventdbStored) => {
				if (err) {
					resolve ({added:false,eventdb:eventdb});
				}
				if(eventdbStored){
					resolve ({added:true,eventdb:eventdb});
				}
			})
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});
	
}

function addPhenotype (actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			Phenotype.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, phenotype) => {
				if (err) resolve ({added:false,err:err});
				if(phenotype){
					let phenotypeId= phenotype._id;
					let update = phenotype.data
					update.push({id:actualResource.resource.valueString, onset:actualResource.resource.effectiveDateTime})
					Phenotype.findByIdAndUpdate(phenotypeId, update, { new: true, select: '-createdBy'}, (err,phenotypeUpdated) => { //Phenotype.findByIdAndUpdate(phenotypeId, update, {select: '-createdBy', new: true}, (err,phenotypeUpdated) => {
						resolve ({added:true,phenotypeUpdated:phenotypeUpdated});
					})
				}else if(!phenotype){
					let phenotype = new Phenotype()
					let data=[{id:actualResource.resource.valueString, onset:actualResource.resource.effectiveDateTime}];
					phenotype.data = data
					phenotype.createdBy = patientId
					// when you save, returns an id in phenotypeStored to access that social-info
					phenotype.save((err, phenotypeStored) => {
						resolve ({added:true,phenotype:phenotype});
		
					})
				}
			})
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});
	
}

function addWeight (actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			let weight = new Weight()
			weight.date = actualResource.resource.effectiveDateTime
			weight.value = actualResource.resource.valueQuantity.value
			weight.createdBy = patientId

			weight.save({"createdBy" : false }, (err, weightStored) => {
				if (err) {
					resolve ({added:false,weight:weight});
				}
				if(weightStored){
					resolve ({added:true,weight:weight});
				}
			})
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});
	
}

function addHeight (actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			let height = new Height()
			height.date = actualResource.resource.effectiveDateTime
			height.value = actualResource.resource.valueQuantity.value
			height.createdBy = patientId

			height.save({"createdBy" : false }, (err, heightStored) => {
				if (err) {
					resolve ({added:false,height:height});
				}
				if(heightStored){
					resolve ({added:true,height:height});
				}
			})
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});
	
}

async function addProms(actualResource, patientId) {
	return new Promise(async function (resolve, reject) {
		let promises = [];
		if (actualResource.resource.item.length > 0) {
			for (let index in actualResource.resource.item) {
				promises.push(saveOneProm(actualResource.resource, index, patientId));
			}
		} else {
			resolve('No data')
		}
		await Promise.all(promises)
			.then(async function (data) {
				resolve ({added:true,actualResource:actualResource.resource});
			})
			.catch(function (err) {
				resolve ({added:false,actualResource:actualResource.resource});
			});

	});
}

async function saveOneProm(actualResource, index, patientId) {
	return new Promise(async function (resolve, reject) {
		try {
			let eventdb = new Prom()
			eventdb.idQuestionnaire = actualResource.id;
			eventdb.idProm = actualResource.item[index].linkId;
			let haveOther = actualResource.item[index].answer[0].valueString.indexOf(':');
			let valueString = actualResource.item[index].answer[0].valueString;
			let other = '';
			if(haveOther!=-1){
				let dataparse = actualResource.item[index].answer[0].valueString.split(':');
				valueString = dataparse[0];
				other = dataparse[1];
			}
			eventdb.data = valueString;
			eventdb.other = other;
			eventdb.createdBy = patientId
			console.log(eventdb.idQuestionnaire, eventdb.idProm, eventdb.createdBy);
			// when you save, returns an id in eventdbStored to access that Prom
			Prom.findOne({ "idQuestionnaire": eventdb.idQuestionnaire, "idProm": eventdb.idProm, "createdBy": eventdb.createdBy}, (err, haveeventsdb) => {
				if(haveeventsdb){
					haveeventsdb.data = eventdb.data;
					haveeventsdb.other = eventdb.other;
					Prom.findByIdAndUpdate(haveeventsdb._id, haveeventsdb, { select: '-createdBy', new: true }, (err, promUpdated) => {
						if (err) {
							console.log(err);
							resolve('fail')
						}
						if (promUpdated) {
							resolve('done')
						}
			
					})
				}else{
					eventdb.save((err, eventdbStored) => {
						if (err) {
							resolve('fail')
						}
						if (eventdbStored) {
							var copyprom = JSON.parse(JSON.stringify(eventdbStored));
							delete copyprom.createdBy;
							resolve('done')
						}
					})
				}
			});
			
			
		} catch (error) {
			resolve ({added:false,medication:actualResource.resource});
		}
		
	});
}

function addAppointments(actualResource, patientId){
	return new Promise(async function (resolve, reject) {
		try {
			let eventdb = new Appointments()
			eventdb.start = actualResource.resource.start
			eventdb.end = actualResource.resource.end
			eventdb.date = actualResource.resource.created
			eventdb.title = actualResource.resource.description
			eventdb.notes = actualResource.resource.comment
			eventdb.createdBy = patientId

			eventdb.save((err, eventdbStored) => {
				if (err) {
					resolve ({added:false,eventdb:eventdb});
				}
				if(eventdbStored){
					resolve ({added:true,eventdb:eventdb});
				}
			})
		} catch (error) {
			resolve ({added:false,appointment:actualResource.resource});
		}
		
	});
	
}

module.exports = {
	saveMassiveResources
}
