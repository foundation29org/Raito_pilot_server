// Phenotype schema
'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema
const Patient = require('./patient')

const { conndbdata } = require('../db_connect')

const symptomSchema = Schema({
	onset: {type: String, default: null},
	polarity: {type: String, default: '0'},
	importance: {type: String, default: '1'},
	inputType: {type: String, default: ''},
	id: {type: String, default: ''}
})

const PhenotypeSchema = Schema({
	validator_id: {type: String, default: null},
	validated: {type: Boolean, default: false},
	date: {type: Date, default: Date.now},
	data: [symptomSchema],
	discarded: {type: Object, default: []},
	createdBy: { type: Schema.Types.ObjectId, ref: "Patient"}
})

module.exports = conndbdata.model('Phenotype',PhenotypeSchema)
// we need to export the model so that it is accessible in the rest of the app
