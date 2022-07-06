// user schema
'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

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
		default: '',
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
	},
	password: { type: String, select: false, required: true, minlength: [8, 'Password too short'] },
	role: { type: String, required: true, enum: ['User', 'Clinical', 'Admin'], default: 'User' },
	subrole: String,
	group: { type: String, required: true, default: 'None' },
	confirmationCode: String,
	signupDate: { type: Date, default: Date.now },
	lastLogin: { type: Date, default: null },
	moralisId: { type: String, default: '' },
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
	platform: { type: String, default: '' },
	gptPermission: { type: Boolean, default: false },
	numCallsGtp3: { type: Number, default: 0 },
	countryselectedPhoneCode: { type: String, default: '' },
	phone: { type: String, default: '' },
	provider: { type: String, default: '' },
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

UserSchema.pre('save', function (next) {
	let user = this
	if (!user.isModified('password')) return next()

	bcrypt.genSalt(10, (err, salt) => {
		if (err) return next(err)

		bcrypt.hash(user.password, salt, null, (err, hash) => {
			if (err) return next(err)

			user.password = hash
			next()
		})
	})
})

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch)
	});
}

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

UserSchema.statics.getAuthenticated = function (moralisId, password, cb) {
	this.findOne({ moralisId: moralisId}, function (err, user) {
		if (err) return cb(err);

		// make sure the user exists
		if (!user) {
			return cb(null, null, reasons.NOT_FOUND);
		}
		console.log(user.role);
		if (user.role != 'User' && user.role != 'Admin' && user.role != 'SuperAdmin') {
			return cb(null, null, reasons.WRONG_PLATFORM);
		}
		if (user.blockedaccount) {
			return cb(null, null, reasons.BLOCKED);
		}
		// check if the account is currently locked
		if (user.isLocked) {
			// just increment login attempts if account is already locked
			return user.incLoginAttempts(function (err) {
				if (err) return cb(err);
				return cb(null, null, reasons.MAX_ATTEMPTS);
			});
		}

		// test for a matching password
		user.comparePassword(password, function (err, isMatch) {
			if (err) return cb(err);


			// check if the password was a match
			if (isMatch) {
				// if there's no lock or failed attempts, just return the user
				if (!user.loginAttempts && !user.lockUntil) {
					var updates = {
						$set: { lastLogin: Date.now() }
					};
					return user.update(updates, function (err) {
						if (err) return cb(err);
						return cb(null, user);
					});
					return cb(null, user)
				}
				// reset attempts and lock info
				var updates = {
					$set: { loginAttempts: 0, lastLogin: Date.now() },
					$unset: { lockUntil: 1 }
				};
				return user.update(updates, function (err) {
					if (err) return cb(err);
					return cb(null, user);
				});
			}

			// password is incorrect, so increment login attempts before responding
			user.incLoginAttempts(function (err) {
				if (err) return cb(err);
				return cb(null, null, reasons.PASSWORD_INCORRECT);
			});
		});
	}).select('_id email moralisId +password loginAttempts lockUntil lastLogin role subrole userName lang randomCodeRecoverPass dateTimeRecoverPass group blockedaccount permissions platform shared');
};

module.exports = conndbaccounts.model('User', UserSchema)
// we need to export the model so that it is accessible in the rest of the app
