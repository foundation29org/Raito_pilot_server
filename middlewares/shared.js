'use strict'

const Patient = require('../models/patient')
const Operations = require('../models/operations')
const crypt = require('../services/crypt')

function shared (){

	return async function(req, res, next) {
		try {
			let patientId= crypt.decrypt(req.params.patientId);
			const patient = await Patient.findById(patientId, {"_id" : false , "createdBy" : false });
			if(!patient) return res.status(403).send({message: 'Forbidden'})
			if(patient.generalShare.data.medicalInfo){
				saveRequest('open', patient.generalShare, patientId, req.route.path);
				next()
			}else{
				return res.status(403).send({message: 'Forbidden'})
			}
		} catch (err) {
			return res.status(403).send({message: 'Forbidden'})
		}
  }
}

function shared2 (){
	return async function(req, res, next) {
		try {
			let patientId= crypt.decrypt(req.params.patientId);
			let userId = req.body.userId;
			const patient = await Patient.findById(patientId, {"_id" : false , "createdBy" : false });
			if(!patient) return res.status(403).send({message: 'Forbidden'})
			if(patient.generalShare.data.medicalInfo){
				saveRequest('openReg', patient.generalShare.data, patientId, req.route.path);
				next()
			}else{
				if(patient.individualShare.length>0){
					var found = false;
					let infoFound = {};
					for (var i = 0; i < patient.individualShare.length && !found; i++) {
						if(patient.individualShare[i].status=="Accepted" && patient.individualShare[i].idUser == userId && patient.individualShare[i].data.medicalInfo){
							found = true;
							infoFound =patient.individualShare[i];
						}
					}
					if(found){
						saveRequest('openReg', infoFound, patientId, req.route.path);
						next()
					}else{
						return res.status(403).send({message: 'Forbidden'})
					}
					
				}else{
					return res.status(403).send({message: 'Forbidden'})
				}
			}
		} catch (err) {
			return res.status(403).send({message: 'Forbidden'})
		}
  }
}

function sharedInvitation (){
	return async function(req, res, next) {
		try {
			let patientId= crypt.decrypt(req.params.patientId);
			const patient = await Patient.findById(patientId, {"_id" : false , "createdBy" : false });
			if(!patient) return res.status(403).send({message: 'Forbidden'})
			if(patient.customShare.length>0){
				var found = false;
				let infoFound = {};
				patient.customShare.forEach(function (element) {
					var splittoken = element.token.split('token=');
					if(splittoken[1] == req.body.token){
						if(element.data.medicalInfo){
							found = true;
							infoFound = element;
						}
					}
				  });
				if(found){
					saveRequest('invitation', infoFound, patientId, req.route.path);
					next()
				}else{
					return res.status(403).send({message: 'Forbidden'})
				}
				
			}else{
				return res.status(403).send({message: 'Forbidden'})
			}
		} catch (err) {
			return res.status(403).send({message: 'Forbidden'})
		}
  }
}

async function saveRequest(platform, info, patientId, route){
	try {
		let tempData = JSON.stringify(info)
		let eventdb = new Operations();
		eventdb.platform = platform
		eventdb.route = route
		eventdb.data = tempData
		eventdb.createdBy = patientId
		const eventdbStored = await eventdb.save();
		if(eventdbStored){
			console.log('saved track');
		}
	} catch (error) {
		console.log(2);
		console.log(error);
	}
}

module.exports = {
	shared,
	shared2,
	sharedInvitation
} 
