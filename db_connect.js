'use strict'

const mongoose = require('mongoose')
const config = require('./config')

mongoose.set('bufferCommands', false)
mongoose.set('autoIndex', false)
mongoose.set('strictQuery', false)
// Mongoose 8.22.1+: Cosmos DB MongoDB 4.2+ (wire v8). Do not downgrade below 8.16 on Cosmos 4.0.

const connectionOptions = {
	maxPoolSize: 10,
	serverSelectionTimeoutMS: 30000,
	socketTimeoutMS: 45000,
	connectTimeoutMS: 30000,
	retryWrites: false
}

const connectionState = {}

function createConnection(name, url) {
	const connection = mongoose.createConnection(url, connectionOptions)

	connectionState[name] = {
		name: name,
		event: 'created',
		message: null,
		at: new Date().toISOString()
	}

	connection.on('connected', function () {
		updateConnectionState(name, 'connected')
	})

	connection.on('open', function () {
		updateConnectionState(name, 'open')
	})

	connection.on('reconnected', function () {
		updateConnectionState(name, 'reconnected')
	})

	connection.on('disconnected', function () {
		updateConnectionState(name, 'disconnected')
	})

	connection.on('error', function (err) {
		updateConnectionState(name, 'error', err && err.message ? err.message : String(err))
	})

	return connection
}

function updateConnectionState(name, event, message) {
	connectionState[name] = {
		name: name,
		event: event,
		message: message || null,
		at: new Date().toISOString()
	}

	if (message) {
		console.error('[mongo:' + name + '] ' + event + ' - ' + message)
	} else {
		console.log('[mongo:' + name + '] ' + event)
	}
}

function getReadyStateName(readyState) {
	switch (readyState) {
		case 0:
			return 'disconnected'
		case 1:
			return 'connected'
		case 2:
			return 'connecting'
		case 3:
			return 'disconnecting'
		default:
			return 'unknown'
	}
}

function getConnectionStatus(name, connection) {
	return {
		name: name,
		readyState: connection.readyState,
		readyStateName: getReadyStateName(connection.readyState),
		host: connection.host,
		port: connection.port,
		database: connection.name,
		lastEvent: connectionState[name] || null
	}
}

const conndbaccounts = createConnection('accounts', config.dbaccounts)
const conndbdata = createConnection('data', config.dbdata)

const connections = {
	accounts: conndbaccounts,
	data: conndbdata
}

function ensureConnection(name) {
	const connection = connections[name]
	if (!connection || connection.readyState === 1) {
		return Promise.resolve(connection && connection.readyState === 1)
	}

	return connection.asPromise().then(function () {
		return true
	}).catch(function (err) {
		updateConnectionState(name, 'error', err && err.message ? err.message : String(err))
		return false
	})
}

function ensureConnections(names) {
	return Promise.all(names.map(function (name) {
		return ensureConnection(name)
	}))
}

// iisnode can keep a worker alive after a failed boot (e.g. Cosmos upgrade); retry connect.
;[5000, 15000, 30000, 60000].forEach(function (delay) {
	setTimeout(function () {
		ensureConnections(['accounts', 'data'])
	}, delay)
})

setInterval(function () {
	ensureConnections(['accounts', 'data'])
}, 60000)

function getDbStatus() {
	return {
		accounts: getConnectionStatus('accounts', conndbaccounts),
		data: getConnectionStatus('data', conndbdata)
	}
}

function requireConnections(names) {
	return function (req, res, next) {
		const unavailable = names.filter(function (name) {
			return !connections[name] || connections[name].readyState !== 1
		})

		if (unavailable.length === 0) {
			return next()
		}

		ensureConnections(unavailable).then(function () {
			const stillUnavailable = names.filter(function (name) {
				return !connections[name] || connections[name].readyState !== 1
			})

			if (stillUnavailable.length > 0) {
				return res.status(503).send({
					message: 'Database connection unavailable',
					unavailable: stillUnavailable,
					databases: getDbStatus()
				})
			}

			next()
		})
	}
}

module.exports = {
	conndbaccounts,
	conndbdata,
	getDbStatus,
	requireConnections
}
