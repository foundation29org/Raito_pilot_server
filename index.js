'use strict'

const app = require('./app')
const config = require('./config')
const dbConnect = require('./db_connect')

dbConnect.ensureConnections(['accounts', 'data']).finally(function () {
	app.listen(config.port, function () {
		console.log('API REST corriendo en http://localhost:' + config.port)
		console.log('DB status', JSON.stringify(dbConnect.getDbStatus()))
	})
})
