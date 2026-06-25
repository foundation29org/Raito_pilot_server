// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Prom = require('../../../models/prom')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

async function getPromsDates(req, res) {
	try {
		let patientId = crypt.decrypt(req.params.patientId);
		var questionnaires = req.body.questionnaires;
		const eventsdb = await Prom.find({ "createdBy": patientId, idQuestionnaire: {$in:questionnaires} }).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function (eventdb, error) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({ message: `Error making the request: ${err}` })
	}
}

async function getProms(req, res) {
	try {
		let patientId = crypt.decrypt(req.params.patientId);
		const eventsdb = await Prom.find({ "createdBy": patientId }).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function (eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({ message: `Error making the request: ${err}` })
	}
}


async function saveProm(req, res) {
	try {
		let patientId = crypt.decrypt(req.params.patientId);
		let eventdb = new Prom()
		eventdb.idQuestionnaire = req.body.idQuestionnaire;
		eventdb.idProm = req.body.idProm;
		eventdb.data = req.body.data;
		eventdb.other = req.body.other;
		eventdb.createdBy = patientId

		const eventdbStored = await eventdb.save();
		if (eventdbStored) {
			var copyprom = JSON.parse(JSON.stringify(eventdbStored));
			delete copyprom.createdBy;
			res.status(200).send({ message: 'Done', prom: copyprom })
		}
	} catch (err) {
		res.status(500).send({ message: `Failed to save in the database: ${err} ` })
	}
}

async function savesProm(req, res) {
	let patientId = crypt.decrypt(req.params.patientId);
	let proms = req.body;
	try {
		var data = await saveData(proms, patientId);
		return res.status(200).send({ message: 'Exported data', data: data })
	} catch (e) {
		console.error("Error: ", e);
		return res.status(200).send({ message: 'Error', data: e })
	}
}


async function saveData(proms, patientId) {
	var promises = [];
	if (proms.length > 0) {
		for (var index in proms) {
			if (proms[index].data != null) {
				if (proms[index]._id) {
					promises.push(updateOneProm(proms[index], patientId));
				} else {
					promises.push(saveOneProm(proms[index], patientId));
				}
			}
		}
	} else {
		return 'No data'
	}
	try {
		await Promise.all(promises)
		return 'termina'
	} catch (err) {
		console.log('Manejar promesa rechazada (' + err + ') aquí.');
		return null;
	}
}


async function updateOneProm(prom, patientId) {
	try {
		let promId = prom._id
		let update = prom
		await Prom.findByIdAndUpdate(promId, update, { select: '-createdBy', new: true });
		return 'done'
	} catch (err) {
		return 'fail'
	}
}

async function saveOneProm(prom, patientId) {
	try {
		let eventdb = new Prom()
		eventdb.idQuestionnaire = prom.idQuestionnaire;
		eventdb.idProm = prom.idProm;
		eventdb.data = prom.data;
		eventdb.other = prom.other;
		eventdb.createdBy = patientId
		const eventdbStored = await eventdb.save();
		if (eventdbStored) {
			return 'done'
		}
	} catch (err) {
		return 'fail'
	}
}

async function updateProm(req, res) {
	try {
		let promId = req.params.promId;
		let update = req.body

		const promUpdated = await Prom.findByIdAndUpdate(promId, update, { select: '-createdBy', new: true });
		var copyprom = {};
		if (promUpdated) {
			copyprom = JSON.parse(JSON.stringify(promUpdated));
			delete copyprom.createdBy;
		}
		res.status(200).send({ message: 'prom updated', prom: copyprom })
	} catch (err) {
		return res.status(500).send({ message: `Error making the request: ${err}` })
	}
}

async function deleteProm(req, res) {
	try {
		let promId = req.params.promId
		const promdb = await Prom.findById(promId);
		if (promdb) {
			await promdb.deleteOne();
			res.status(200).send({ message: `The prom has been deleted` })
		} else {
			return res.status(404).send({ code: 208, message: `Error deleting the prom` })
		}
	} catch (err) {
		return res.status(500).send({ message: `Error deleting the prom: ${err}` })
	}
}

module.exports = {
	getPromsDates,
	getProms,
	saveProm,
	savesProm,
	updateProm,
	deleteProm
}
