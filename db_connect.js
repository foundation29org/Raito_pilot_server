'use strict'

const mongoose = require ('mongoose')
const config = require('./config')

mongoose.Promise = global.Promise
mongoose.set('bufferCommands', false)

const connectionOptions = {
	useMongoClient: true,
	connectTimeoutMS: 10000,
	socketTimeoutMS: 45000,
	reconnectTries: Number.MAX_VALUE,
	reconnectInterval: 1000,
	poolSize: 10,
	bufferMaxEntries: 0
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

function getDbStatus() {
	return {
		accounts: getConnectionStatus('accounts', conndbaccounts),
		data: getConnectionStatus('data', conndbdata)
	}
}

function requireConnections(names) {
	return function (req, res, next) {
		const dbStatus = getDbStatus()
		const unavailable = names.filter(function (name) {
			return !connections[name] || connections[name].readyState !== 1
		})

		if (unavailable.length > 0) {
			return res.status(503).send({
				message: 'Database connection unavailable',
				unavailable: unavailable,
				databases: dbStatus
			})
		}

		next()
	}
}

module.exports = {
	conndbaccounts,
	conndbdata,
	getDbStatus,
	requireConnections
}
