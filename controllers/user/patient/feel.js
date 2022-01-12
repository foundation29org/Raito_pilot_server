// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Feel = require('../../../models/feel')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')


function getFeels (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	//Feel.find({createdBy: patientId}).sort({ start : 'desc'}).exec(function(err, eventsdb){
		Feel.find({"createdBy": patientId}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	});
}


function saveFeel (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	let eventdb = new Feel()
	eventdb.answers = req.body.answers;
	eventdb.note = req.body.note;
	eventdb.createdBy = patientId

	// when you save, returns an id in eventdbStored to access that feel
	eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		if(eventdbStored){
			res.status(200).send({message: 'Done'})
		}
	})


}

function deleteFeel (req, res){
	let feelId=req.params.feelId

	Feel.findById(feelId, (err, feeldb) => {
		if (err) return res.status(500).send({message: `Error deleting the feel: ${err}`})
		if (feeldb){
			feeldb.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the feel: ${err}`})
				res.status(200).send({message: `The feel has been deleted`})
			})
		}else{
			 return res.status(404).send({code: 208, message: `Error deleting the feel: ${err}`})
		}

	})
}

module.exports = {
	getFeels,
	saveFeel,
	deleteFeel
}
