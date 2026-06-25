// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Feel = require('../../../models/feel')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

async function getFeelsDates (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		var period = 31;
		if(req.body.rangeDate == 'quarter'){
			period = 90;
		}else if(req.body.rangeDate == 'year'){
			period = 365;
		}
		var actualDate = new Date();
		var actualDateTime = actualDate.getTime();

		var pastDate=new Date(actualDate);
		pastDate.setDate(pastDate.getDate() - period);
		var pastDateDateTime = pastDate.getTime();
		const posts = await Feel.find({"createdBy": patientId}).sort({date: 1});
		var oldProm = {};
		var enc = false;
		if(posts.length>0){
			for (var i = 0; i < posts.length && !enc; i++) {
				if(posts[i].date<pastDateDateTime){
					oldProm = posts[i];
				}else{
					enc = true;
				}
			}
		}

		const eventsdb = await Feel.find({"createdBy": patientId, "date":{"$gte": pastDateDateTime, "$lt": actualDateTime}}).select("-createdBy");
		var listEventsdb = [];
		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send({feels:listEventsdb, old:oldProm})
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}

async function getFeels (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		const eventsdb = await Feel.find({"createdBy": patientId}).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}


async function saveFeel (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		let eventdb = new Feel()
		eventdb.a1 = req.body.a1;
		eventdb.a2 = req.body.a2;
		eventdb.a3 = req.body.a3;
		eventdb.note = req.body.note;
		eventdb.date = req.body.date;
		eventdb.createdBy = patientId

		const eventdbStored = await eventdb.save();
		if(eventdbStored){
			res.status(200).send({message: 'Done'})
		}
	} catch (err) {
		return res.status(500).send({message: `Failed to save in the database: ${err} `})
	}
}

async function deleteFeel (req, res){
	try {
		let feelId=req.params.feelId
		const feeldb = await Feel.findById(feelId);
		if (feeldb){
			await feeldb.deleteOne();
			res.status(200).send({message: `The feel has been deleted`})
		}else{
			return res.status(404).send({code: 208, message: `Error deleting the feel`})
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the feel: ${err}`})
	}
}

module.exports = {
	getFeelsDates,
	getFeels,
	saveFeel,
	deleteFeel
}
