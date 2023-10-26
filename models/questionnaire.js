// Medication schema
'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema

const { conndbdata } = require('../db_connect')

const promSchema = Schema({
	idProm: String,
	data: {type: Schema.Types.Mixed},
	other: {type: Schema.Types.Mixed},
	date: {type: Date, default: Date.now},
})

const QuestionnaireSchema = Schema({
	idQuestionnaire: String,
	values: [promSchema],
	dateFinish: Date,
	createdBy: { type: Schema.Types.ObjectId, ref: "Patient"}
})

module.exports = conndbdata.model('Questionnaire',QuestionnaireSchema)
// we need to export the model so that it is accessible in the rest of the app
