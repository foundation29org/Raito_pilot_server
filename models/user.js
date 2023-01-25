// user schema
'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')
const crypt = require('../services/crypt')

const { conndbaccounts } = require('../db_connect')

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000

const SiblingSchema = Schema({
	gender: String,
	affected: { type: String, enum: ['yes', 'no'] }
})

const ParentSchema = Schema({
	highEducation: String,
	profession: String
})

const backupIPFSSchema = Schema({
	url: { type: String, default: '' },
	date: { type: Date, default: Date.now },
})

const InfoVerifiedSchema = Schema({
	isVerified: {type: Boolean, default: false},
	status: { type: String, default: 'Not started' },
	url: { type: String, default: null },
	info: {type: Object, default: {}}
})

const UserSchema = Schema({
	email: {
		type: String,
		trim: true,
		lowercase: true,
		default: ''
	},
	role: { type: String, required: true, enum: ['User', 'Clinical', 'Admin'], default: 'User' },
	subrole: String,
	group: { type: String, required: true, default: 'None' },
	confirmationCode: String,
	signupDate: { type: Date, default: Date.now },
	lastLogin: { type: Date, default: null },
	userName: { type: String, default: '' },
	ethAddress: { type: String, default: '' },
	lastName: { type: String, default: '' },
	loginAttempts: { type: Number, required: true, default: 0 },
	lockUntil: { type: Number },
	lang: { type: String, required: true, default: 'en' },
	randomCodeRecoverPass: String,
	dateTimeRecoverPass: Date,
	massunit: { type: String, required: true, default: 'kg' },
	lengthunit: { type: String, required: true, default: 'cm' },
	blockedaccount: { type: Boolean, default: false },
	permissions: { type: Object, default: {} },
	modules: { type: Object, default: ["seizures"] },
	platform: { type: String, default: '' },
	countryselectedPhoneCode: { type: String, default: '' },
	rangeDate: { type: String, default: 'month' },
	iscaregiver: { type: Boolean, default: false },
	phone: { type: String, default: '' },
	provider: { type: String, default: '' },
	backupIPFS: {
		type: backupIPFSSchema, default:{
			url:'',
			date: null
		}
	},
	backupF29: { type: Date, default: null },
	infoVerified:{
		type: InfoVerifiedSchema, default:{
			isVerified:false,
			info: {}
		}
	}
})



UserSchema.virtual('isLocked').get(function () {
	// check for a future lockUntil timestamp
	return !!(this.lockUntil && this.lockUntil > Date.now());
});


UserSchema.methods.incLoginAttempts = function (cb) {
	// if we have a previous lock that has expired, restart at 1
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.update({
			$set: { loginAttempts: 1 },
			$unset: { lockUntil: 1 }
		}, cb);
	}
	// otherwise we're incrementing
	var updates = { $inc: { loginAttempts: 1 } };
	// lock the account if we've reached max attempts and it's not locked already
	if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
		updates.$set = { lockUntil: Date.now() + LOCK_TIME };
	}
	return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference
var reasons = UserSchema.statics.failedLogin = {
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	MAX_ATTEMPTS: 2,
	UNACTIVATED: 3,
	BLOCKED: 4,
	WRONG_PLATFORM: 5
};

UserSchema.statics.getAuthenticated = function (ethAddress, cb) {
	this.findOne({ ethAddress: ethAddress}, function (err, user) {

		if (err) return cb(err);

		// make sure the user exists
		if (!user) {
			return cb(null, null, reasons.NOT_FOUND);
		}
		if (user.role != 'User' && user.role != 'Admin' && user.role != 'SuperAdmin') {
			return cb(null, null, reasons.WRONG_PLATFORM);
		}
		if (user.blockedaccount) {
			return cb(null, null, reasons.BLOCKED);
		}
		if (err) return cb(err);
		return cb(null, user);

	}).select('_id email ethAddress loginAttempts lockUntil lastLogin role subrole userName lang randomCodeRecoverPass dateTimeRecoverPass group blockedaccount permissions modules platform shared');
};

UserSchema.statics.getAuthenticatedUserId = function (userId, ethAddress, cb) {
	let userIdDecrypt = crypt.decrypt(userId);
	this.findOne({ _id: userIdDecrypt, ethAddress: ethAddress}, function (err, user) {
		if (err) return cb(err);

		// make sure the user exists
		if (!user) {
			return cb(null, null, reasons.NOT_FOUND);
		}
		if (user.role != 'User' && user.role != 'Admin' && user.role != 'SuperAdmin') {
			return cb(null, null, reasons.WRONG_PLATFORM);
		}
		if (user.blockedaccount) {
			return cb(null, null, reasons.BLOCKED);
		}
		if (err) return cb(err);
		return cb(null, user);
	}).select('_id email ethAddress loginAttempts lockUntil lastLogin role subrole userName lang randomCodeRecoverPass dateTimeRecoverPass group blockedaccount permissions platform shared');
};

module.exports = conndbaccounts.model('User', UserSchema)
// we need to export the model so that it is accessible in the rest of the app
