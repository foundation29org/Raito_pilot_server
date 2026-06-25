// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Questionnaire = require('../../../models/questionnaire')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

async function getPromsDates(req, res) {
	try {
		let patientId = crypt.decrypt(req.params.patientId);
		var questionnaires = req.body.questionnaires;
		const eventsdb = await Questionnaire.find({ "createdBy": patientId, idQuestionnaire: {$in:questionnaires} }).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function (eventdb, error) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({ message: `Error making the request: ${err}` })
	}
}


async function saveQuestionnaire(req, res) {
	try {
		let patientId = crypt.decrypt(req.params.patientId);
		if(req.body.questionnaireId){
			let update = req.body.values;
			const questionnaireUpdated = await Questionnaire.findByIdAndUpdate(req.body.questionnaireId, {values: update, dateFinish: req.body.dateFinish}, { select: '-createdBy', new: true });
			if (questionnaireUpdated){
				var copyprom = JSON.parse(JSON.stringify(questionnaireUpdated.values));
				delete copyprom.createdBy;
				res.status(200).send({ message: 'The questionnaire has been updated', prom: copyprom })
			}else{
				return res.status(404).send({code: 208, message: `Error updating the questionnaire`})
			}
		}else{
			let eventdb = new Questionnaire()
			eventdb.idQuestionnaire = req.body.idQuestionnaire;
			eventdb.values = req.body.values;
			eventdb.dateFinish = req.body.dateFinish;
			eventdb.createdBy = patientId

			const eventdbStored = await eventdb.save();
			if (eventdbStored) {
				var copyprom = JSON.parse(JSON.stringify(eventdbStored.values));
				delete copyprom.createdBy;
				res.status(200).send({ message: 'Done', prom: copyprom })
			}
		}
	} catch (err) {
		return res.status(500).send({message: `Failed to save in the database: ${err} `})
	}
}

module.exports = {
	getPromsDates,
	saveQuestionnaire
}
