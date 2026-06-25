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
	if (!req.body.length) {
		return res.status(200).send({message: 'Eventdb created', eventdb: 'epa'})
	}

	try {
		await Promise.all(req.body.map((actualdose) => testOneDose(actualdose, patientId, res)))
		res.status(200).send({message: 'Eventdb created', eventdb: 'epa'})
	} catch (err) {
		console.log('Manejar promesa rechazada (' + err + ') aquí.');
		if (!res.headersSent) {
			res.status(500).send({message: `Error making the request: ${err}`})
		}
	}
}

async function testOneDose(actualdose, patientId, res){
	const eventdb2 = await Dose.findOne({name: actualdose.name, createdBy: patientId})
	if(!eventdb2){
		let eventdb = new Dose()
		eventdb.name = actualdose.name
		eventdb.recommendedDose = actualdose.recommendedDose
		eventdb.actualDrugs = actualdose.actualDrugs;
		eventdb.units = actualdose.units;
		eventdb.createdBy = patientId
		await saveOneDose(eventdb, res)
		return
	}

	eventdb2.recommendedDose = actualdose.recommendedDose
	eventdb2.actualDrugs = actualdose.actualDrugs;
	eventdb2.units = actualdose.units;
	await updateDose(eventdb2, res)
}

async function updateDose (actualdose, res){
	try {
		return await Dose.findByIdAndUpdate(actualdose._id, actualdose, { select: '-createdBy', new: true })
	} catch (err) {
		if (!res.headersSent) {
			res.status(500).send({message: `Failed to update in the database: ${err} `})
		}
		throw err
	}
}

async function saveOneDose(eventdb, res){
	try {
		await eventdb.save()
	} catch (err) {
		if (!res.headersSent) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		throw err
	}
}

module.exports = {
	getDoses,
	saveDose,
	saveMassiveDose
}
