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
		let options = {json: true};
		request(url, options, (error, res2, body) => {
			if (error) {
				res.status(404).send({message:'file not found'})
			}else if(res2.body=='404: Not Found'){
        res.status(404).send({message:'file not found'})
      }else	if (!error && res2.statusCode == 200) {
        res.status(200).send({body})
			};
		});
}

module.exports = {
	getQuestionnaire,
	getconfigFile
}
