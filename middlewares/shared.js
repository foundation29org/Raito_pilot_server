'use strict'

const Patient = require('../models/patient')
const crypt = require('../services/crypt')

function shared (){

	return function(req, res, next) {
		//console.log(req);

		let patientId= crypt.decrypt(req.params.patientId);

		Patient.findById(patientId, {"_id" : false , "createdBy" : false }, (err, patient) => {
			if (err) return res.status(403).send({message: 'Forbidden'})
			if(!patient) return res.status(403).send({message: 'Forbidden'})
			if(patient.generalShare.data.medicalInfo){
				//req.user = response
				next()
			}else{
				return res.status(403).send({message: 'Forbidden'})
			}
		})
  }


}

function shared2 (){

	return function(req, res, next) {
		//console.log(req);

		let patientId= crypt.decrypt(req.params.patientId);
		let userId = req.body.userId;
		Patient.findById(patientId, {"_id" : false , "createdBy" : false }, (err, patient) => {
			if (err) return res.status(403).send({message: 'Forbidden'})
			if(!patient) return res.status(403).send({message: 'Forbidden'})
			if(patient.individualShare.length>0){
				var found = false;
				for (var i = 0; i < patient.individualShare.length && !found; i++) {
					if(patient.individualShare[i].status=="Accepted" && patient.individualShare[i].idUser == userId && patient.individualShare[i].data.medicalInfo){
						found = true;
					}
				}
				if(found){
					next()
				}else{
					return res.status(403).send({message: 'Forbidden'})
				}
				
			}else{
				return res.status(403).send({message: 'Forbidden'})
			}
		})
  }


}

module.exports = {
	shared,
	shared2
} 
