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
const Questionnaire = require('../../models/questionnaire')
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
			if(actualResource.resource.resourceType=='QuestionnaireResponse'){
				promises.push(addQuestionnaires(actualResource, patientId));
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
			medicationCtrl.saveOneDrug(medication)
			return {added:true,medication:medication};
		}else{
			return {added:false,medication:medication};
		}
	} catch (error) {
		return {added:false,medication:actualResource.resource};
	}
}


async function addSeizure (actualResource, patientId){
	try {
		let eventdb = new Seizures()
		let type = actualResource.resource.code.text.split('Seizure - ');
		eventdb.type = type[1];
		eventdb.duracion = actualResource.resource.valueQuantity.value
		eventdb.start = actualResource.resource.effectiveDateTime
		eventdb.createdBy = patientId
	
		const eventdbStored = await eventdb.save()
		if(eventdbStored){
			return {added:true,eventdb:eventdb};
		}
		return {added:false,eventdb:eventdb};
	} catch (error) {
		return {added:false,medication:actualResource.resource};
	}
}

async function addFeel (actualResource, patientId){
	try {
		let eventdb = new Feel()
		eventdb.a1 = actualResource.resource.valueQuantity.value;
		eventdb.a2 = actualResource.resource.valueQuantity.value;
		eventdb.a3 = actualResource.resource.valueQuantity.value;
		eventdb.date = actualResource.resource.effectiveDateTime;
		eventdb.createdBy = patientId
	
		const eventdbStored = await eventdb.save()
		if(eventdbStored){
			return {added:true,eventdb:eventdb};
		}
		return {added:false,eventdb:eventdb};
	} catch (error) {
		return {added:false,medication:actualResource.resource};
	}
}

async function addPhenotype (actualResource, patientId){
	try {
		const phenotype = await Phenotype.findOne({"createdBy": patientId}).select("-createdBy");
		if(phenotype){
			let phenotypeId= phenotype._id;
			let update = phenotype.data
			update.push({id:actualResource.resource.valueString, onset:actualResource.resource.effectiveDateTime})
			const phenotypeUpdated = await Phenotype.findByIdAndUpdate(phenotypeId, update, { new: true, select: '-createdBy'});
			return {added:true,phenotypeUpdated:phenotypeUpdated};
		}else{
			let newPhenotype = new Phenotype()
			let data=[{id:actualResource.resource.valueString, onset:actualResource.resource.effectiveDateTime}];
			newPhenotype.data = data
			newPhenotype.createdBy = patientId
			await newPhenotype.save()
			return {added:true,phenotype:newPhenotype};
		}
	} catch (error) {
		return {added:false,medication:actualResource.resource};
	}
}

async function addWeight (actualResource, patientId){
	try {
		let weight = new Weight()
		weight.date = actualResource.resource.effectiveDateTime
		weight.value = actualResource.resource.valueQuantity.value
		weight.createdBy = patientId

		const weightStored = await weight.save()
		if(weightStored){
			return {added:true,weight:weight};
		}
		return {added:false,weight:weight};
	} catch (error) {
		return {added:false,medication:actualResource.resource};
	}
}

async function addHeight (actualResource, patientId){
	try {
		let height = new Height()
		height.date = actualResource.resource.effectiveDateTime
		height.value = actualResource.resource.valueQuantity.value
		height.createdBy = patientId

		const heightStored = await height.save()
		if(heightStored){
			return {added:true,height:height};
		}
		return {added:false,height:height};
	} catch (error) {
		return {added:false,medication:actualResource.resource};
	}
}

async function addQuestionnaires(actualResource, patientId) {
	if (actualResource.resource.item.length > 0) {
		let values = [];
		for (let index in actualResource.resource.item) {
			let haveOther = actualResource.resource.item[index].answer[0].valueString.indexOf(':');
			let valueString = actualResource.resource.item[index].answer[0].valueString;
			let other = '';
			if(haveOther!=-1){
				let dataparse = actualResource.resource.item[index].answer[0].valueString.split(':');
				valueString = dataparse[0];
				other = dataparse[1];
			}
			values.push({idProm: actualResource.resource.resource.item[index].linkId, data: valueString, other: other});
		}

		let eventdb = new Questionnaire()
		eventdb.idQuestionnaire = actualResource.resource.id;
		eventdb.values = values;
		eventdb.dateFinish = actualResource.resource.authored;
		eventdb.createdBy = patientId
		try {
			const haveeventsdb = await Questionnaire.findOne({ "idQuestionnaire": eventdb.idQuestionnaire, "dateFinish": eventdb.dateFinish, "createdBy": eventdb.createdBy});
			if(!haveeventsdb){
				const eventdbStored = await eventdb.save()
				if (eventdbStored) {
					return 'done'
				}
				return 'fail'
			}else{
				return 'done'
			}
		} catch (err) {
			return 'fail'
		}
	} else {
		return 'No data'
	}
}

async function addAppointments(actualResource, patientId){
	try {
		let eventdb = new Appointments()
		eventdb.start = actualResource.resource.start
		eventdb.end = actualResource.resource.end
		eventdb.date = actualResource.resource.created
		eventdb.title = actualResource.resource.description
		eventdb.notes = actualResource.resource.comment
		eventdb.createdBy = patientId

		const eventdbStored = await eventdb.save()
		if(eventdbStored){
			return {added:true,eventdb:eventdb};
		}
		return {added:false,eventdb:eventdb};
	} catch (error) {
		return {added:false,appointment:actualResource.resource};
	}
}

module.exports = {
	saveMassiveResources
}
