// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Dose = require('../../../models/dose')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')


function getDoses (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	Dose.find({"createdBy": patientId}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	});
}


function saveDose (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	let eventdb = new Dose()
	eventdb.recommendedDose = req.body.recommendedDose;
	eventdb.actualDrugs = req.body.actualDrugs;
	eventdb.units = req.body.units;
	eventdb.name = req.body.name;
	eventdb.createdBy = patientId

	// when you save, returns an id in eventdbStored to access that dose
	eventdb.save((err, eventdbStored) => {
		if (err) {
			return res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		if(eventdbStored){
			res.status(200).send({message: 'Done'})
		}
	})


}

async function saveMassiveDose (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	var promises = [];
	if (req.body.length > 0) {
		for (var i = 0; i<(req.body).length;i++){
			var actualdose = (req.body)[i];
			promises.push(testOneDose(actualdose, patientId, res));
		}
	}else{
		res.status(200).send({message: 'Eventdb created', eventdb: 'epa'})
	}


	await Promise.all(promises)
			.then(async function (data) {
				res.status(200).send({message: 'Eventdb created', eventdb: 'epa'})
			})
			.catch(function (err) {
				console.log('Manejar promesa rechazada (' + err + ') aquí.');
				return null;
			});
	

}

async function testOneDose(actualdose, patientId, res){
	var functionDone = false;
	await Dose.findOne({name: actualdose.name, createdBy: patientId}, (err, eventdb2) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(!eventdb2){
			let eventdb = new Dose()
			eventdb.name = actualdose.name
			eventdb.recommendedDose = actualdose.recommendedDose
			eventdb.actualDrugs = actualdose.actualDrugs;
			eventdb.units = actualdose.units;
			eventdb.createdBy = patientId
			var res1 = saveOneDose(eventdb, res)
			// when you save, returns an id in eventdbStored to access that social-info
			functionDone = true;
		}else{
			//update the Dose
			eventdb2.recommendedDose = actualdose.recommendedDose
			eventdb2.actualDrugs = actualdose.actualDrugs;
			eventdb2.units = actualdose.units;
			var res1 = updateDose(eventdb2, res)
			
			functionDone = true;
		}
	})

	return functionDone
}

async function updateDose (actualdose, res){
	//update DOSE
	Dose.findByIdAndUpdate(actualdose._id, actualdose, { select: '-createdBy', new: true }, (err, doseUpdated) => {
		if (err){
			res.status(500).send({message: `Failed to update in the database: ${err} `})
		}else{
			return(doseUpdated);
		} 
	  })
}

async function saveOneDose(eventdb, res){
	var functionDone2 = false;
	await eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		functionDone2 = true;
	})
	return functionDone2;
}

module.exports = {
	getDoses,
	saveDose,
	saveMassiveDose
}
