// eventsdb schema
'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema
const Patient = require('./patient')

const { conndbdata } = require('../db_connect')

const SeizuresSchema = Schema({
	disparadores: {type: Object, default: []},
	disparadorEnfermo: {type: String, default: ''},
	disparadorOtro: {type: String, default: ''},
	disparadorNotas: {type: String, default: ''},
	descripcion: {type: Object, default: []},
	descripcionRigidez: {type: String, default: ''},
	descripcionContraccion: {type: String, default: ''},
	descripcionOtro: {type: String, default: ''},
	descipcionNotas: {type: String, default: ''},
	postCrisis: {type: Object, default: []},
	postCrisisOtro: {type: String, default: ''},
	postCrisisNotas: {type: String, default: ''},
	estadoAnimo: {type: String, default: ''},
	estadoConsciencia: {type: String, default: ''},
	duracion: {type: Object, default: {hours: 0, minutes: 0, seconds:0}},
	type: {type: String, default: null},
	start: {type: Date, default: null},
	end: {type: Date, default: null},
	GUID: {type: String, default: ''},
	title: {type: String, default: ''},
	color: {type: Object, default: {}},
	actions: {type: Object, default: []},
	createdBy: { type: Schema.Types.ObjectId, ref: "Patient"}
})

module.exports = conndbdata.model('Seizures',SeizuresSchema)
// we need to export the model so that it is accessible in the rest of the app
