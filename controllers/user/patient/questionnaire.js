// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Questionnaire = require('../../../models/questionnaire')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

function getPromsDates(req, res) {

	let patientId = crypt.decrypt(req.params.patientId);
	var questionnaires = req.body.questionnaires;
	var period = req.body.rangeDate;
	var actualDate = new Date();
	var actualDateTime = actualDate.getTime();

	var pastDate = new Date(actualDate);
	pastDate.setDate(pastDate.getDate() - period);
	var pastDateDateTime = pastDate.getTime();
	//Questionnaire.find({createdBy: patientId}).sort({ start : 'desc'}).exec(function(err, eventsdb){
		Questionnaire.find({ "createdBy": patientId, idQuestionnaire: {$in:questionnaires} }, { "createdBy": false }, (err, eventsdb) => {
		//Questionnaire.find({"createdBy": patientId, "date":{"$gte": pastDateDateTime, "$lt": actualDateTime}}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
		var listEventsdb = [];

		eventsdb.forEach(function (eventdb, error) {
			listEventsdb.push(eventdb);
		});
		var respTask = listEventsdb.length;
		//res.status(200).send((respTask).toString());
		res.status(200).send(listEventsdb)
	});
}


function saveQuestionnaire(req, res) {
	let patientId = crypt.decrypt(req.params.patientId);
	if(req.body.questionnaireId){
		let update = req.body.values;
		Questionnaire.findByIdAndUpdate(req.body.questionnaireId, {values: update, dateFinish: req.body.dateFinish}, { select: '-createdBy', new: true }, (err, questionnaireUpdated) => {
			if (err) return res.status(500).send({message: `Error deleting the feel: ${err}`})
			if (questionnaireUpdated){
				var copyprom = JSON.parse(JSON.stringify(questionnaireUpdated.values));
				delete copyprom.createdBy;
				res.status(200).send({ message: 'The questionnaire has been updated', prom: copyprom })
			}else{
				 return res.status(404).send({code: 208, message: `Error updating the questionnaire: ${err}`})
			}
		})
	}else{
		let eventdb = new Questionnaire()
		eventdb.idQuestionnaire = req.body.idQuestionnaire;
		eventdb.values = req.body.values;
		eventdb.dateFinish = req.body.dateFinish;
		eventdb.createdBy = patientId
	
		// when you save, returns an id in eventdbStored to access that Prom
		eventdb.save((err, eventdbStored) => {
			if (err) {
				res.status(500).send({ message: `Failed to save in the database: ${err} ` })
			}
			if (eventdbStored) {
				var copyprom = JSON.parse(JSON.stringify(eventdbStored.values));
				delete copyprom.createdBy;
				res.status(200).send({ message: 'Done', prom: copyprom })
			}
		})
	}
}

module.exports = {
	getPromsDates,
	saveQuestionnaire
}
