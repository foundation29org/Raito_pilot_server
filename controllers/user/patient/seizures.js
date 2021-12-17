// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Seizures = require('../../../models/seizures')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')


function getSeizures (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	//Seizures.find({createdBy: patientId}).sort({ start : 'desc'}).exec(function(err, eventsdb){
	Seizures.find({"createdBy": patientId},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	});
}


function saveSeizure (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	let eventdb = new Seizures()
	eventdb.type = req.body.type
	eventdb.duracion = req.body.duracion
	eventdb.notes = req.body.notes
	eventdb.start = req.body.start
	eventdb.GUID = req.body.GUID
	eventdb.createdBy = patientId

	// when you save, returns an id in eventdbStored to access that social-info
	eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		if(eventdbStored){
			//podría devolver eventdbStored, pero no quiero el field createdBy, asi que hago una busqueda y que no saque ese campo
			Seizures.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, eventdb2) => {
				if (err) return res.status(500).send({message: `Error making the request: ${err}`})
				if(!eventdb2) return res.status(202).send({message: `There are no eventdb`})
				res.status(200).send({message: 'Eventdb created', eventdb: eventdb2})
			})
		}


	})


}

function updateSeizure (req, res){
	let seizureId= req.params.seizureId;
	let update = req.body

	Seizures.findByIdAndUpdate(seizureId, update, {select: '-createdBy', new: true}, (err,eventdbUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})

		res.status(200).send({message: 'Eventdb updated', eventdb: eventdbUpdated})

	})
}


function deleteSeizure (req, res){
	let seizureId=req.params.seizureId

	Seizures.findById(seizureId, (err, eventdb) => {
		if (err) return res.status(500).send({message: `Error deleting the clinicalTrial: ${err}`})
		if (eventdb){
			eventdb.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the eventdb: ${err}`})
				res.status(200).send({message: `The eventdb has been deleted`})
			})
		}else{
			 return res.status(404).send({code: 208, message: `Error deleting the eventdb: ${err}`})
		}

	})
}

function saveMassiveSeizure (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	for (var i = 0; i<(req.body).length;i++){
		var actualseizure = (req.body)[i];
		var res0 = testOneSeizure(actualseizure, patientId);
	}
	res.status(200).send({message: 'Eventdb created', eventdb: 'epa'})

}

async function testOneSeizure(actualseizure, patientId){
	var functionDone = false;
	await Seizures.findOne({'GUID': actualseizure.GUID, 'createdBy': patientId}, (err, eventdb2) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		if(!eventdb2){
			let eventdb = new Seizures()
			eventdb.type = actualseizure.type
			eventdb.duracion = actualseizure.duracion
			eventdb.notes = actualseizure.notes
			eventdb.start = actualseizure.start
			eventdb.GUID = actualseizure.GUID
			eventdb.createdBy = patientId
			var res1 = saveOneSeizure(eventdb)
			// when you save, returns an id in eventdbStored to access that social-info
			functionDone = true;
		}else{
			functionDone = true;
		}
	})

	return functionDone
}

async function saveOneSeizure(eventdb){
	var functionDone2 = false;
	await eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		functionDone2 = true;
	})
	return functionDone2;
}

function saveMassiveSeizure2 (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	var countGuardados = 0;
	for (var i = 0; i<(req.body).length;i++){
		var actualseizure = (req.body)[i];

		Seizures.findOne({'GUID': (req.body[i]).GUID, 'createdBy': patientId}, (err, eventdb2) => {
			if (err) return res.status(500).send({message: `Error making the request: ${err}`})
			if(!eventdb2){
				let eventdb = new Seizures()
				eventdb.type = actualseizure.type
				eventdb.duracion = actualseizure.duracion
				eventdb.notes = actualseizure.notes
				eventdb.start = actualseizure.start
				eventdb.GUID = actualseizure.GUID
				eventdb.createdBy = patientId

				// when you save, returns an id in eventdbStored to access that social-info
				eventdb.save((err, eventdbStored) => {
					if (err) {
						res.status(500).send({message: `Failed to save in the database: ${err} `})
					}
					if(eventdbStored){
						countGuardados++;
					}
				})
				if(countGuardados==(req.body).length){
				}
			}else{
				countGuardados++;
				if(countGuardados==(req.body).length){
				}
			}
		})
	}

	res.status(200).send({message: 'Eventdb created', eventdb: 'epa'})

}

module.exports = {
	getSeizures,
	saveSeizure,
	updateSeizure,
	deleteSeizure,
	saveMassiveSeizure
}
