'use strict'
const fs = require('fs');

function getQuestionnaire (req, res){
	var url = './raito_resources/questionnaires/'+req.params.questionnaireId+'.json'
	
	var json = JSON.parse(fs.readFileSync(url, 'utf8'));
	res.status(200).send(json)
}

async function getconfigFile(req, res) {
    let groupId= req.params.groupId;
	let url = './raito_resources/groups/'+groupId+'/config.json';
	var json = JSON.parse(fs.readFileSync(url, 'utf8'));
	res.status(200).send(json)
}

module.exports = {
	getQuestionnaire,
	getconfigFile
}
