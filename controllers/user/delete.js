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
const Prom = require('../../models/prom')
const Appointments = require('../../models/appointments')
const eoCtrl = require('../../controllers/superadmin/eousers')

const f29azureService = require("../../services/f29azure")

function deleteAccount (req, res){
	User.getAuthenticatedUserId(req.params.userId, req.body.password, function (err, user, reason) {
		if (err) return res.status(500).send({ message: err })

		// login was successful if we have a user
		if (user) {
			let userId= crypt.decrypt(req.params.userId);
			Patient.find({"createdBy": userId},(err, patients) => {
				if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		
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
					deleteProms(patientId);
					deleteBackups(req.params.userId);
					deletePatient(res, patientId, containerName, userId);
				});
				deleteUser(res, userId);
			})
		}else{
			res.status(200).send({message: `fail`})
		}
	})
	

	/*User.findById(userId, (err, user) => {
	})*/
}

function deleteMedication (patientId){
	Medication.find({ 'createdBy': patientId }, (err, medications) => {
		if (err) console.log({message: `Error deleting the medications: ${err}`})
		medications.forEach(function(medication) {
			medication.remove(err => {
				if(err) console.log({message: `Error deleting the medications: ${err}`})
			})
		});
	})
}

function deleteSeizures (patientId){
	Seizures.find({ 'createdBy': patientId }, (err, seizures) => {
		if (err) console.log({message: `Error deleting the seizures: ${err}`})
		seizures.forEach(function(seizure) {
			seizure.remove(err => {
				if(err) console.log({message: `Error deleting the seizures: ${err}`})
			})
		});
	})
}

function deleteWeight (patientId){
	Weight.find({ 'createdBy': patientId }, (err, weights) => {
		if (err) console.log({message: `Error deleting the weights: ${err}`})
		weights.forEach(function(weight) {
			weight.remove(err => {
				if(err) console.log({message: `Error deleting the weights: ${err}`})
			})
		});
	})
}

function deleteHeight (patientId){
	Height.find({ 'createdBy': patientId }, (err, heights) => {
		if (err) console.log({message: `Error deleting the heights: ${err}`})
		heights.forEach(function(height) {
			height.remove(err => {
				if(err) console.log({message: `Error deleting the heights: ${err}`})
			})
		});
	})
}

function deleteFeel (patientId){
	Feel.find({ 'createdBy': patientId }, (err, feels) => {
		if (err) console.log({message: `Error deleting the feels: ${err}`})
		feels.forEach(function(feel) {
			feel.remove(err => {
				if(err) console.log({message: `Error deleting the feels: ${err}`})
			})
		});
	})
}

function deleteAppointment (patientId){
	Appointments.find({ 'createdBy': patientId }, (err, appointments) => {
		if (err) console.log({message: `Error deleting the appointments: ${err}`})
		appointments.forEach(function(appointment) {
			appointment.remove(err => {
				if(err) console.log({message: `Error deleting the appointments: ${err}`})
			})
		});
	})
}

function deletePhenotype (patientId){
	Phenotype.find({ 'createdBy': patientId }, (err, phenotypes) => {
		if (err) console.log({message: `Error deleting the phenotype: ${err}`})
		phenotypes.forEach(function(phenotype) {
			phenotype.remove(err => {
				if(err) console.log({message: `Error deleting the phenotype: ${err}`})
				
			})
		});
	})
}

function deletePhenotypeHistory (patientId){
	PhenotypeHistory.find({ 'createdBy': patientId }, (err, phenotypeHistories) => {
		if (err) console.log({message: `Error deleting the phenotypeHistory: ${err}`})
			phenotypeHistories.forEach(function(phenotypeHistory) {
				phenotypeHistory.remove(err => {
					if(err) console.log({message: `Error deleting the phenotypeHistory: ${err}`})
				})
			});
	})
}

function deleteProms (patientId){
	Prom.find({ 'createdBy': patientId }, (err, proms) => {
		if (err) console.log({message: `Error deleting the proms: ${err}`})
		proms.forEach(function(prom) {
			prom.remove(err => {
				if(err) console.log({message: `Error deleting the proms: ${err}`})
			})
		});
	})
}

async function deleteBackups (userId){
	const fileName = userId+'.json';
	var result = await f29azureService.deleteBlob('backups', fileName);

	let userIdDecrypt = crypt.decrypt(userId);
	var dataToSave = {url:'', date: null} ;
	User.findByIdAndUpdate(userIdDecrypt, { backupIPFS: dataToSave, backupF29: null}, {new: true}, (err,userUpdated) => {
		
	})
}

function deletePatient (res, patientId, containerName, userId){
	Patient.findById(patientId, (err, patient) => {
		if (err) return res.status(500).send({message: `Error deleting the case: ${err}`})
		if(patient){
			patient.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the case: ${err}`})
				f29azureService.deleteContainers(containerName)
			})
		}else{
				f29azureService.deleteContainers(containerName);
		}
	})
}

function deleteUser (res, userId){
	User.findById(userId, (err, user) => {
		if (err) return res.status(500).send({message: `Error deleting the case: ${err}`})
		if(user){
			/*if(user.moralisId!=''){
				eoCtrl.deleteMoralis(user.moralisId)
			}*/
			user.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the case: ${err}`})
				//savePatient(userId);
				res.status(200).send({message: `The case has been eliminated`})
			})
		}else{
			//savePatient(userId);
			 return res.status(202).send({message: 'The case has been eliminated'})
		}
	})
}

function savePatient(userId) {
	let patient = new Patient()
	patient.createdBy = userId
	// when you save, returns an id in patientStored to access that patient
	patient.save(async (err, patientStored) => {
		if (err) console.log({ message: `Failed to save in the database: ${err} ` })
		var id = patientStored._id.toString();
		var idencrypt = crypt.encrypt(id);
		var patientInfo = { sub: idencrypt, patientName: patient.patientName, surname: patient.surname, birthDate: patient.birthDate, gender: patient.gender, country: patient.country, previousDiagnosis: patient.previousDiagnosis, avatar: patient.avatar, consentgroup: patient.consentgroup };
		let containerName = (idencrypt).substr(1);
		var result = await f29azureService.createContainers(containerName);
		if (result) {
			//res.status(200).send({message: 'Patient created', patientInfo})
		} else {
			deletePatientAndCreateOther(patientStored._id, userId);
		}

	})
}

function deletePatientAndCreateOther(patientId, userId) {

	Patient.findById(patientId, (err, patient) => {
		if (err) return console.log({ message: `Error deleting the patient: ${err}` })
		if (patient) {
			patient.remove(err => {
				savePatient(userId)
			})
		} else {
			savePatient(userId)
		}
	})
}

module.exports = {
	deleteAccount
}
