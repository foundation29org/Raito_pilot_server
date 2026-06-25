// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Appointments = require('../../../models/appointments')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

async function getLastAppointments (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		var period = 7;
		var actualDate = new Date();
		actualDate.setDate(actualDate.getDate() -1);
		var actualDateTime = actualDate.getTime();

		const eventsdb = await Appointments.find({"createdBy": patientId, "start":{"$gte": actualDateTime}}).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}

async function getAppointments (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		const eventsdb = await Appointments.find({"createdBy": patientId}).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}


async function saveAppointment (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		let eventdb = new Appointments()
		eventdb.start = req.body.start
		eventdb.end = req.body.end
		eventdb.notes = req.body.notes
		eventdb.title = req.body.title
		eventdb.color = req.body.color
		eventdb.actions = req.body.actions
		eventdb.createdBy = patientId

		const eventdbStored = await eventdb.save();
		if(eventdbStored){
			const eventdb2 = await Appointments.findOne({"createdBy": patientId}).select("-createdBy");
			if(!eventdb2) return res.status(202).send({message: `There are no eventdb`})
			res.status(200).send({message: 'Eventdb created', eventdb: eventdb2})
		}
	} catch (err) {
		res.status(500).send({message: `Failed to save in the database: ${err} `})
	}
}

async function updateAppointment (req, res){
	try {
		let appointmentId= req.params.appointmentId;
		let update = req.body
		update.date = Date.now();
		const eventdbUpdated = await Appointments.findByIdAndUpdate(appointmentId, update, {select: '-createdBy', new: true});
		res.status(200).send({message: 'Eventdb updated', eventdb: eventdbUpdated})
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}


async function deleteAppointment (req, res){
	try {
		let appointmentId= req.params.appointmentId;
		const eventdb = await Appointments.findById(appointmentId);
		if (eventdb){
			await eventdb.deleteOne();
			res.status(200).send({message: `The eventdb has been deleted`})
		}else{
			return res.status(404).send({code: 208, message: `Error deleting the eventdb`})
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the appointmentId: ${err}`})
	}
}

module.exports = {
	getLastAppointments,
	getAppointments,
	saveAppointment,
	updateAppointment,
	deleteAppointment
}
