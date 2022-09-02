// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Appointments = require('../../../models/appointments')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

function getLastAppointments (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	var period = 7;
	var actualDate = new Date();
	actualDate.setDate(actualDate.getDate() -1);
	var actualDateTime = actualDate.getTime();

	var futureDate=new Date(actualDate);
    futureDate.setDate(futureDate.getDate() + period);
	var futureDateDateTime = futureDate.getTime();
	//Appointments.find({"createdBy": patientId, "start":{"$gte": actualDateTime, "$lt": futureDateDateTime}, "end":{"$gte": actualDateTime, "$lt": futureDateDateTime}}, {"createdBy" : false},(err, eventsdb) => {
	Appointments.find({"createdBy": patientId, "start":{"$gte": actualDateTime}}, {"createdBy" : false},(err, eventsdb) => {
	//Appointments.find({"createdBy": patientId}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	});
}

function getAppointments (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	//Seizures.find({createdBy: patientId}).sort({ start : 'desc'}).exec(function(err, eventsdb){
	Appointments.find({"createdBy": patientId}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	});
}


function saveAppointment (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	let eventdb = new Appointments()
	eventdb.start = req.body.start
	eventdb.end = req.body.end
	eventdb.notes = req.body.notes
	eventdb.title = req.body.title
	eventdb.color = req.body.color
	eventdb.actions = req.body.actions
	eventdb.createdBy = patientId

	// when you save, returns an id in eventdbStored to access that social-info
	eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		if(eventdbStored){
			//podría devolver eventdbStored, pero no quiero el field createdBy, asi que hago una busqueda y que no saque ese campo
			Appointments.findOne({"createdBy": patientId}, {"createdBy" : false }, (err, eventdb2) => {
				if (err) return res.status(500).send({message: `Error making the request: ${err}`})
				if(!eventdb2) return res.status(202).send({message: `There are no eventdb`})
				res.status(200).send({message: 'Eventdb created', eventdb: eventdb2})
			})
		}


	})


}

function updateAppointment (req, res){
	let appointmentId= req.params.appointmentId;
	let update = req.body
	update.date = Date.now();
	Appointments.findByIdAndUpdate(appointmentId, update, {select: '-createdBy', new: true}, (err,eventdbUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})

		res.status(200).send({message: 'Eventdb updated', eventdb: eventdbUpdated})

	})
}


function deleteAppointment (req, res){
	let appointmentId= req.params.appointmentId;

	Appointments.findById(appointmentId, (err, eventdb) => {
		if (err) return res.status(500).send({message: `Error deleting the appointmentId: ${err}`})
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

module.exports = {
	getLastAppointments,
	getAppointments,
	saveAppointment,
	updateAppointment,
	deleteAppointment
}
