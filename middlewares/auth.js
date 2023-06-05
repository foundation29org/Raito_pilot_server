'use strict'

const serviceAuth = require('../services/auth')
const jwt = require('jwt-simple')
const config = require('../config')
const Operations = require('../models/operations')
function isAuth (roles){

	return function(req, res, next) {

		if (!req.headers.authorization){
			return res.status(403).send({ message: 'It does not have authorization'})
		}

		const token = req.headers.authorization.split(" ")[1] //convertir en array con los separados en blando
		serviceAuth.decodeToken(token, roles)
			.then(response => {
				req.user = response
				var infoFound = {method:req.method, body: req.body, query: req.query, url: req.url}
				//saveRequest('raito', infoFound, response, req.route.path);
				next()
			})
			.catch(response => {
				//res.status(response.status)
				return res.status(response.status).send({message: response.message})
			})
  }


}

function saveRequest(platform, info, patientId, route){
	try {
		let tempData = JSON.stringify(info)
		let eventdb = new Operations();
		eventdb.platform = platform
		eventdb.route = route
		eventdb.data = tempData
		eventdb.createdBy = patientId
		eventdb.save((err, eventdbStored) => {
			if (err) {
				console.log(1);
				console.log(err);
			}
			if(eventdbStored){
				console.log('saved track');
			}
		})
	} catch (error) {
		console.log(2);
		console.log(error);
	}
}

module.exports = isAuth
