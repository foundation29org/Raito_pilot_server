// Patient schema
'use strict'

const mongoose = require ('mongoose')
const Schema = mongoose.Schema
const User = require('./user')

const { conndbaccounts } = require('../db_connect')

const SiblingSchema = Schema({
	gender: String,
	affected: String //affected: { type: String, enum: ['yes', 'no']} si hacemos validacion de que no pueda ser null, igual poner el enum
})

const ParentSchema = Schema({
	highEducation: String,
	profession: String,
	relationship: String,
	nameCaregiver: String
})

const checksSchema = Schema({
	check1: {type: Boolean, default: false},
	check2: {type: Boolean, default: false},
	check3: {type: Boolean, default: false},
	check4: {type: Boolean, default: false}
})

const generalShareSchema = Schema({
	basicData:{r:{type: Boolean, default: false}, w:{type: Boolean, default: false},d:{type: Boolean, default: false}},
	seizures:{r:{type: Boolean, default: false}, w:{type: Boolean, default: false},d:{type: Boolean, default: false}},
	meds:{r:{type: Boolean, default: false}, w:{type: Boolean, default: false},d:{type: Boolean, default: false}},
	feel:{r:{type: Boolean, default: false}, w:{type: Boolean, default: false},d:{type: Boolean, default: false}},
	docs:{r:{type: Boolean, default: false}, w:{type: Boolean, default: false},d:{type: Boolean, default: false}},
	notes: {type: String, default: ''},
	date: {type: Date, default: Date.now},
	token: {type: String, default: ''},
	operations: {type: Object, default: []}
})

const PatientSchema = Schema({
	patientName: String,
	surname: String,
	birthDate: Date,
	citybirth: String,
	provincebirth: String,
	countrybirth: String,
	street: String,
	postalCode: String,
	city: String,
	province: String,
	country: {type: String, default: null},
	phone1: String,
	phone2: String,
	gender: {type: String, default: null},
	siblings: [SiblingSchema],
	parents: [ParentSchema],
	createdBy: { type: Schema.Types.ObjectId, ref: "User"},
	death: Date,
	notes: {type: String, default: ''},
	isArchived: {type: Boolean, default: false},
	sharing: {type: Object, default: []},
	status: Object,
	relationship: String,
	lastAccess: {type: Date, default: Date.now},
	creationDate: {type: Date, default: Date.now},
	previousDiagnosis: {type: String, default: null},
	avatar: String,
	group: { type: String, default: null},
	consentgroup: {type: Boolean, default: false},
	checks: {type: checksSchema, default: {
		check1: false,
		check2: false,
		check3: false,
		check4: false
	}},
	generalShare:{
		type: generalShareSchema, default:{
			basicData:{r:false, w:false,d:false},
			seizures:{r:false, w:false,d:false},
			meds:{r:false, w:false,d:false},
			feel:{r:false, w:false,d:false},
			docs:{r:false, w:false,d:false},
			notes: '',
			date: {type: Date, default: Date.now},
			token: '',
			operations: {type: Object, default: []}
		}
	},
	customShare: [generalShareSchema]
})

module.exports = conndbaccounts.model('Patient',PatientSchema)
// we need to export the model so that it is accessible in the rest of the app
