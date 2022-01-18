// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Prom = require('../../../models/prom')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

function getPromsDates (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	var period = 7;
	if(req.body.rangeDate == 'quarter'){
		period = 30;
	}else if(req.body.rangeDate == 'year'){
		period = 60;
	}
	var actualDate = new Date();
	var actualDateTime = actualDate.getTime();

	var pastDate=new Date(actualDate);
    pastDate.setDate(pastDate.getDate() - period);
	var pastDateDateTime = pastDate.getTime();
	//Prom.find({createdBy: patientId}).sort({ start : 'desc'}).exec(function(err, eventsdb){
		Prom.find({"createdBy": patientId, "date":{"$gte": pastDateDateTime, "$lt": actualDateTime}}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb, error) {
			console.log(error);
			listEventsdb.push(eventdb);
		});
		var respTask = listEventsdb.length;
		//res.status(200).send((respTask).toString());
		res.status(200).send(listEventsdb)
	});
}

function getProms (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	//Prom.find({createdBy: patientId}).sort({ start : 'desc'}).exec(function(err, eventsdb){
		Prom.find({"createdBy": patientId}, {"createdBy" : false},(err, eventsdb) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	});
}


function saveProm (req, res){
	let patientId= crypt.decrypt(req.params.patientId);
	let eventdb = new Prom()
	eventdb.idProm = req.body.idProm;
	eventdb.data = req.body.data;
	eventdb.createdBy = patientId

	// when you save, returns an id in eventdbStored to access that Prom
	eventdb.save((err, eventdbStored) => {
		if (err) {
			res.status(500).send({message: `Failed to save in the database: ${err} `})
		}
		if(eventdbStored){
			var copyprom = JSON.parse(JSON.stringify(eventdbStored));
  			delete copyprom.createdBy;
			res.status(200).send({message: 'Done', prom: copyprom})
		}
	})
}

function updateProm (req, res){
	let promId= req.params.promId;
	let update = req.body

	Prom.findByIdAndUpdate(promId, update, {select: '-createdBy', new: true}, (err,promUpdated) => {
		if (err) return res.status(500).send({message: `Error making the request: ${err}`})
    var copyprom = {};
    if(promUpdated){
		copyprom = JSON.parse(JSON.stringify(promUpdated));
  		delete copyprom.createdBy;
    }
		res.status(200).send({message: 'prom updated', prom: copyprom})

	})
}

function deleteProm (req, res){
	let promId=req.params.promId

	Prom.findById(promId, (err, promdb) => {
		if (err) return res.status(500).send({message: `Error deleting the prom: ${err}`})
		if (promdb){
			promdb.remove(err => {
				if(err) return res.status(500).send({message: `Error deleting the prom: ${err}`})
				res.status(200).send({message: `The prom has been deleted`})
			})
		}else{
			 return res.status(404).send({code: 208, message: `Error deleting the prom: ${err}`})
		}

	})
}

module.exports = {
	getPromsDates,
	getProms,
	saveProm,
	updateProm,
	deleteProm
}
