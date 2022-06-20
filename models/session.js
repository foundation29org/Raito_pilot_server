// Medication schema
'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema
const Patient = require('./patient')

const { conndbaccounts } = require('../db_connect')

const SessionSchema = Schema({
	sessionData: {type: Schema.Types.Mixed},
	date: {type: Date, default: Date.now},
	createdBy: { type: Schema.Types.ObjectId, ref: "Patient"}
})

module.exports = conndbaccounts.model('Session',SessionSchema)
// we need to export the model so that it is accessible in the rest of the app
