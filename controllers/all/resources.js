'use strict'
const fs = require('fs');
const Group = require('../../models/group')

function getQuestionnaire (req, res){
	var url = './raito_resources/questionnaires/'+req.params.questionnaireId+'.json'
	
	var json = JSON.parse(fs.readFileSync(url, 'utf8'));
	res.status(200).send(json)
}

function newQuestionnaire (req, res){
	var bodyReq = req.body;
	console.log(bodyReq)

	var url = './raito_resources/questionnaires/'+req.body.id+'.json'
	try{
		var json = JSON.parse(fs.readFileSync(url, 'utf8'));
		res.status(200).send({message: 'already exists'})
		console.log(json);
	}catch (err){
		console.log(err);
		//subir file
		fs.writeFile('./raito_resources/questionnaires/'+req.body.id+'.json', JSON.stringify(bodyReq), (err) => {
			if (err) {
				res.status(403).send({message: 'not added'})
			}

			let groupId= req.params.groupId;
			Group.findOne({ '_id': groupId }, function (err, group) {
					if (err) return res.status(500).send({message: `Error making the request: ${err}`})
					if(!group) return res.status(404).send({code: 208, message: 'The group does not exist'})

				var questionnaires = group.questionnaires;
				questionnaires.push({id:req.body.id});
				Group.findOneAndUpdate({_id: groupId}, {$set:{questionnaires:questionnaires}}, function(err, groupUpdated){
				if (err) return res.status(500).send({message: `Error making the request: ${err}`})
				res.status(200).send({message: 'added'})
				})

				})
			//res.status(200).send({message: 'added'})
		});
	}	
}

function updateQuestionnaire (req, res){
	var bodyReq = req.body;
	console.log(bodyReq)

	var url = './raito_resources/questionnaires/'+req.body.id+'.json'
	try{
		var json = JSON.parse(fs.readFileSync(url, 'utf8'));
		console.log(json);
		let groupId= req.params.groupId;
		if(json.createdById==groupId){
			//subir file
			fs.writeFile('./raito_resources/questionnaires/'+req.body.id+'.json', JSON.stringify(bodyReq), (err) => {
				if (err) {
					res.status(403).send({message: 'not added'})
				}

				res.status(200).send({message: 'updated'})
			});
		}else{
			res.status(200).send({message: 'dont have permissions'})
		}
		

	}catch (err){
		res.status(200).send({message: 'dont exists'})
		console.log(err);
	}
	

	
}


async function getconfigFile(req, res) {
    let groupId= req.params.groupId;
	let url = './raito_resources/groups/'+groupId+'/config.json';
	var json = JSON.parse(fs.readFileSync(url, 'utf8'));
	res.status(200).send(json)
}

module.exports = {
	getQuestionnaire,
	newQuestionnaire,
	updateQuestionnaire,
	getconfigFile
}
