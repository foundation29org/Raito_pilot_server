// Medication schema
'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema
const Patient = require('./patient')
const User = require('./user')

const { conndbaccounts } = require('../db_connect')

const SessionSchema = Schema({
	sessionData: {type: Schema.Types.Mixed},
	date: {type: Date, default: Date.now},
	data: {type: Schema.Types.Mixed},
	type: {type: String, default: 'Clinician'},
	_idIndividualShare: {type: String, default: ''},
	sharedWith: {type: String, default: ''},
	createdBy: {type: String, default: ''}
})

module.exports = conndbaccounts.model('Session',SessionSchema)
// we need to export the model so that it is accessible in the rest of the app
