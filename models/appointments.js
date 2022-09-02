// eventsdb schema
'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema
const Patient = require('./patient')

const { conndbdata } = require('../db_connect')

const AppointmentsSchema = Schema({
	start: {type: Date, default: null},
	end: {type: Date, default: null},
	notes: {type: String, default: ''},
	date: {type: Date, default: Date.now},
	title: {type: String, default: ''},
	color: {type: Object, default: {}},
	actions: {type: Object, default: []},
	createdBy: { type: Schema.Types.ObjectId, ref: "Patient"}
})

module.exports = conndbdata.model('Appointments',AppointmentsSchema)
// we need to export the model so that it is accessible in the rest of the app
