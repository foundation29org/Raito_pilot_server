// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Medication = require('../../models/medication')
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')

const Feel = require('../../models/feel')
const Phenotype = require('../../models/phenotype')
const PhenotypeHistory = require('../../models/phenotype-history')
const Seizures = require('../../models/seizures')
const Weight = require('../../models/weight')
const Height = require('../../models/height')
const Questionnaire = require('../../models/questionnaire')
const Appointments = require('../../models/appointments')
const eoCtrl = require('../../controllers/superadmin/eousers')

const f29azureService = require("../../services/f29azure")

function deleteAccount (req, res){
	req.body.email = (req.body.email).toLowerCase();
		User.getAuthenticated(req.body.email, req.body.password, async function (err, user, reason) {
		if (err) return res.status(500).send({ message: err })

		// login was successful if we have a user
		if (user) {
			try {
				let userId= crypt.decrypt(req.params.userId);
				const patients = await Patient.find({"createdBy": userId});
		
				patients.forEach(function(u) {
					var patientId = u._id.toString();
					var patientIdCrypt=crypt.encrypt(u._id.toString());
					var containerName=patientIdCrypt.substr(1).toString();
					deleteMedication(patientId);
					deleteSeizures(patientId);
					deleteWeight(patientId);
					deleteHeight(patientId);
					deleteFeel(patientId);
					deleteAppointment(patientId);
					deletePhenotype(patientId);
					deletePhenotypeHistory(patientId);
					deleteQuestionnaire(patientId);
					deleteBackups(req.params.userId);
					deletePatient(res, patientId, containerName, userId);
				});
				deleteUser(res, userId);
			} catch (err) {
				return res.status(500).send({message: `Error making the request: ${err}`})
			}
		}else{
			res.status(200).send({message: `fail`})
		}
	})
}

async function deleteMedication (patientId){
	try {
		const medications = await Medication.find({ 'createdBy': patientId });
		for (const medication of medications) {
			await medication.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the medications: ${err}`})
	}
}

async function deleteSeizures (patientId){
	try {
		const seizures = await Seizures.find({ 'createdBy': patientId });
		for (const seizure of seizures) {
			await seizure.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the seizures: ${err}`})
	}
}

async function deleteWeight (patientId){
	try {
		const weights = await Weight.find({ 'createdBy': patientId });
		for (const weight of weights) {
			await weight.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the weights: ${err}`})
	}
}

async function deleteHeight (patientId){
	try {
		const heights = await Height.find({ 'createdBy': patientId });
		for (const height of heights) {
			await height.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the heights: ${err}`})
	}
}

async function deleteFeel (patientId){
	try {
		const feels = await Feel.find({ 'createdBy': patientId });
		for (const feel of feels) {
			await feel.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the feels: ${err}`})
	}
}

async function deleteAppointment (patientId){
	try {
		const appointments = await Appointments.find({ 'createdBy': patientId });
		for (const appointment of appointments) {
			await appointment.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the appointments: ${err}`})
	}
}

async function deletePhenotype (patientId){
	try {
		const phenotypes = await Phenotype.find({ 'createdBy': patientId });
		for (const phenotype of phenotypes) {
			await phenotype.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the phenotype: ${err}`})
	}
}

async function deletePhenotypeHistory (patientId){
	try {
		const phenotypeHistories = await PhenotypeHistory.find({ 'createdBy': patientId });
		for (const phenotypeHistory of phenotypeHistories) {
			await phenotypeHistory.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the phenotypeHistory: ${err}`})
	}
}

async function deleteQuestionnaire (patientId){
	try {
		const questionnaires = await Questionnaire.find({ 'createdBy': patientId });
		for (const questionnaire of questionnaires) {
			await questionnaire.deleteOne();
		}
	} catch (err) {
		console.log({message: `Error deleting the questionnaires: ${err}`})
	}
}

async function deleteBackups (userId){
	const fileName = userId+'.json';
	await f29azureService.deleteBlob('backups', fileName);

	let userIdDecrypt = crypt.decrypt(userId);
	try {
		await User.findByIdAndUpdate(userIdDecrypt, { backupF29: null}, {new: true});
	} catch (err) {
		// ignore
	}
}

async function deletePatient (res, patientId, containerName, userId){
	try {
		const patient = await Patient.findById(patientId);
		if(patient){
			await patient.deleteOne();
			f29azureService.deleteContainers(containerName)
		}else{
			f29azureService.deleteContainers(containerName);
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the case: ${err}`})
	}
}

async function deleteUser (res, userId){
	try {
		const user = await User.findById(userId);
		if(user){
			await user.deleteOne();
			res.status(200).send({message: `The case has been eliminated`})
		}else{
			return res.status(202).send({message: 'The case has been eliminated'})
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the case: ${err}`})
	}
}

async function savePatient(userId) {
	try {
		let patient = new Patient()
		patient.createdBy = userId
		const patientStored = await patient.save()
		var id = patientStored._id.toString();
		var idencrypt = crypt.encrypt(id);
		let containerName = (idencrypt).substr(1);
		var result = await f29azureService.createContainers(containerName);
		if (!result) {
			deletePatientAndCreateOther(patientStored._id, userId);
		}
	} catch (err) {
		console.log({ message: `Failed to save in the database: ${err} ` })
	}
}

async function deletePatientAndCreateOther(patientId, userId) {
	try {
		const patient = await Patient.findById(patientId);
		if (patient) {
			await patient.deleteOne();
		}
		savePatient(userId)
	} catch (err) {
		console.log({ message: `Error deleting the patient: ${err}` })
		savePatient(userId)
	}
}

module.exports = {
	deleteAccount
}
