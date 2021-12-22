// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Medication = require('../../../models/medication')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

const Feel = require('../../../models/feel')
const Phenotype = require('../../../models/phenotype')
const Seizures = require('../../../models/seizures')

function getData (req, res){
	let patientId= crypt.decrypt(req.params.patientId);

	var result = {};

	Patient.findById(patientId, {"_id" : false , "createdBy" : false }, (err, patient) => {
		//result.push({patient:patient});

		//medication
		Medication.find({createdBy: patientId}, {"createdBy" : false, "_id" : false },(err, medications)=>{
			if (err) return res.status(500).send({message: `Error making the request: ${err}`})
			var listMedications = [];
			medications.forEach(function(medication) {
				listMedications.push(medication);
			});
			//result.push({medication:listMedications});
			result["medication"]= listMedications;

			//Phenotype
			Phenotype.findOne({"createdBy": patientId}, {"createdBy" : false, "_id" : false }, (err, phenotype) => {
				if(phenotype){
					//result.push({phenotype:phenotype});
					result["phenotype"]=phenotype;
				}
				//Feel
				Feel.find({"createdBy": patientId}, {"createdBy" : false, "_id" : false }, (err, feels) => {
					var listFeels = [];
					feels.forEach(function(feel) {
						listFeels.push(feel);
					});
					//result.push({feels:listFeels});
					result["feel"]=listFeels;

					//Seizures
					Seizures.find({createdBy: patientId}, {"createdBy" : false, "_id" : false },(err, seizures)=>{
						var listSeizures = [];
						seizures.forEach(function(seizure) {
							listSeizures.push(seizure);
						});
						//result.push({seizures:listSeizures});
						result["seizure"]=listSeizures;
						res.status(200).send(result)
					});
				})
			})

		})
	})




	//res.status(200).send(result)
}

module.exports = {
	getData
}
