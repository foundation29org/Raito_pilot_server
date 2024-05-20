'use strict'
const fs = require('fs');
const Group = require('../../models/group')
var crypto = require('crypto');

const config = require('../../config')
const storage = require("@azure/storage-blob")
const accountnameGenomics = config.nameBlob;
const keyGenomics = config.keyGenomics;
const sharedKeyCredentialGenomics = new storage.StorageSharedKeyCredential(accountnameGenomics, keyGenomics);
const blobServiceClientGenomics = new storage.BlobServiceClient(
  // When using AnonymousCredential, following url should include a valid SAS or support public access
  `https://${accountnameGenomics}.blob.core.windows.net`,
  sharedKeyCredentialGenomics
);

/**
 * @api {get} https://raito.care/api/resources/questionnaire/:questionnaireId Get questionnaire
 * @apiName getQuestionnaire
 * @apiDescription This method return a questionnaire.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/api/resources/questionnaire/'+"questionnaireId")
 *    .subscribe( (res : any) => {
 *      console.log(res);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiParam {String} questionnaireId The id of a questionnaire.  More info here:  [Get questionnaires](#api-Groups-geQuestionnairesGroup)
 * @apiSuccess {Object} questionnaire A questionnaire associated with the group.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *    "resourceType": "Questionnaire",
 *    "id": "q1dravet",
 *    "createdById":"61bb38fad6e0cb14f08881c0",
 *    "title": "General questions of Dravet syndrome",
 *    "description": "General questions for patients with Dravet Syndrome.",
 *    "created by": "Foundation29",
 *    "items":[
 *        {
 *            "idProm": "1",
 *            "text": "Is the number of seizures the most relevant problem for you?",
 *            "answers": [
 *                {
 *                    "text": "Yes",
 *                    "value": "yes"
 *                },
 *                {
 *                    "text": "No",
 *                    "value": "no"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        },
 *        {
 *            "idProm": "2",
 *            "text": "Does your child have pro…lking or with movement?",
 *            "answers": [
 *                {
 *                    "text": "S/he can't do it",
 *                    "value": "cant do it"
 *                },
 *                {
 *                    "text": "S/he does it with a lot of difficulty",
 *                    "value": "does it with a lot of difficulty"
 *                },
 *                {
 *                    "text": "S/he does it with difficulty",
 *                    "value": "does it with difficulty"
 *                },
 *                {
 *                    "text": "It is usually fine",
 *                    "value": "It is usually fine"
 *                },
 *                {
 *                    "text": "No problems at all",
 *                    "value": "No problems at all"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        },
 *        {
 *            "idProm": "3",
 *            "text": "How does your child's appetite change due to their treatment?",
 *            "answers": [
 *                {
 *                    "text": "S/he does not want to eat",
 *                    "value": "does not want to eat"
 *                },
 *                {
 *                    "text": "S/he eats less than usual",
 *                    "value": "eats less than usual"
 *                },
 *                {
 *                    "text": "No change",
 *                    "value": "No change"
 *                },
 *                {
 *                    "text": "S/he eats more than usual",
 *                    "value": "eats more than usual"
 *                },
 *                {
 *                    "text": "S/he does much more than usual",
 *                    "value": "does much more than usual"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        },
 *        {
 *            "idProm": "4",
 *            "text": "Can your child understand verbal instructions?",
 *            "answers": [
 *                {
 *                    "text": "S/he can't do it",
 *                    "value": "cant do it"
 *                },
 *                {
 *                    "text": "S/he does it with a lot of difficulty",
 *                    "value": "does it with a lot of difficulty"
 *                },
 *                {
 *                    "text": "S/he does it with difficulty",
 *                    "value": "does it with difficulty"
 *                },
 *                {
 *                    "text": "It is usually fine",
 *                    "value": "It is usually fine"
 *                },
 *                {
 *                    "text": "No problems at all",
 *                    "value": "does not want to eat"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        },
 *        {
 *            "idProm": "5",
 *            "text": "Does your child always experience seizures in the same way or do they vary?",
 *            "answers": [
 *                {
 *                    "text": "Yes",
 *                    "value": "Yes"
 *                },
 *                {
 *                    "text": "No",
 *                    "value": "No"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        },
 *        {
 *            "idProm": "6",
 *            "text": "Is there anything you think triggers your child's seizures?",
 *            "answers": [
 *                {
 *                    "text": "Bright or patterned lights",
 *                    "value": "Brightorpatternedlights"
 *                },
 *                {
 *                    "text": "Warm or cold temperatures",
 *                    "value": "Warmorcoldtemperatures"
 *                },
 *                {
 *                    "text": "Physical movement or activity",
 *                    "value": "Physicalmovementoractivity"
 *                },
 *                {
 *                    "text": "Noise",
 *                    "value": "Noise"
 *                },
 *                {
 *                    "text": "Geometric patterns",
 *                    "value": "Geometricpatterns"
 *                },
 *                {
 *                    "text": "Changes in emotional state",
 *                    "value": "Changesinemotionalstate"
 *                },
 *                {
 *                    "text": "Tiredness",
 *                    "value": "Tiredness"
 *                },
 *                {
 *                    "text": "Other",
 *                    "value": "Other"
 *                }
 *            ],
 *            "other": "Other",
 *            "type": "ChoiceSet"
 *        },
 *        {
 *            "idProm": "7",
 *            "text": "Are you or your child able to predict when they will have a seizure?",
 *            "answers": [
 *                {
 *                    "text": "Yes",
 *                    "value": "Yes"
 *                },
 *                {
 *                    "text": "No",
 *                    "value": "No"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        },
 *        {
 *            "idProm": "8",
 *            "text": "If a drug company were to develop a new treatment for Dravet syndrome what would you like to see in terms of improvement for your child?",
 *            "answers": [
 *                {
 *                    "text": "Reduction in seizures",
 *                    "value": "Reduction in seizures"
 *                },
 *                {
 *                    "text": "Less severe seizures",
 *                    "value": "Less severe seizures"
 *                },
 *                {
 *                    "text": "Improvement in other symptoms:",
 *                    "value": "Improvement in other symptoms"
 *                }
 *            ],
 *            "other": "Improvement in other symptoms",
 *            "type": "radioButtons"
 *        }
 *    ]
 *}
 *
 * HTTP/1.1 208 OK
 * {message: 'The questionnaire does not exist'}
 * @apiSuccess (Success 208) {String} message If there is questionnaire, it will return: "The questionnaire does not exist"
 */


async function getQuestionnaire(req, res) {
    const questionnaireId = req.params.questionnaireId;
    const url = `questionnaires/${questionnaireId}.json`;

    try {
        const json = await getFileFromBlobStorage(url);
        res.status(200).send(json);
    } catch (error) {
        console.log(`Error fetching ${url}:`, error);
        res.status(208).send({ message: 'The questionnaire does not exist' });
    }
}

/**
 * @api {post} https://raito.care/api/resources/questionnaire/:groupId New questionnaire
 * @apiName saveQuestionnaire
 * @apiDescription This method create a new questionnaire and links it to the group.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var json = {
 *    "resourceType": "Questionnaire",
 *    "createdById":"groupId",
 * 	  "img": "https://foundation29.org/assets/img/logo-f29.webp",
 *    "title": "General questions of Dravet syndrome",
 *    "description": "General questions for patients with Dravet Syndrome.",
 *    "created by": "Foundation29",
 *    "items":[{
 *            "idProm": "7",
 *            "text": "Are you or your child able to predict when they will have a seizure?",
 *            "answers": [
 *                {
 *                    "text": "Yes",
 *                    "value": "Yes"
 *                },
 *                {
 *                    "text": "No",
 *                    "value": "No"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        }] 
 *    };
 *   this.http.post('https://raito.care/api/resources/questionnaire/'+groupId, json)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result An object with the information about the execution.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {message: 'added', questionnaireId: '74301465-29d8-4447-a8ce-00e91327c9bclawchd3g'}
 *
 * 
 * @apiErrorExample {json} Error-Response:
 *	HTTP/1.1 403 Forbidden
 *	{
 *	message: 'not added'
 *	}
 */

async function newQuestionnaire(req, res) {
    const bodyReq = req.body;
    const createId = generateRandomId();
    console.log(createId);
    bodyReq.id = createId;
    bodyReq.rate = { avg: 0, ids: [] };

    try {
        const groupId = req.params.groupId;
        const group = await Group.findOne({ '_id': groupId }).exec();
        
        if (!group) {
            return res.status(404).send({ code: 208, message: 'The group does not exist' });
        }

        const questionnaires = group.questionnaires;
        questionnaires.push({ id: createId });

        await Group.findOneAndUpdate({ _id: groupId }, { $set: { questionnaires: questionnaires } }).exec();

        try {
            await uploadFileToBlobStorage(`questionnaires/${createId}.json`, JSON.stringify(bodyReq));
            res.status(200).send({ message: 'added', questionnaireId: createId });
        } catch (err) {
            console.log(err);
            res.status(403).send({ message: 'not added' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Error making the request: ${err}` });
    }
}

async function uploadFileToBlobStorage(filePath, content) {
    const containerName = 'raito-resources'; // Reemplaza con el nombre de tu contenedor
    const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);

    try {
        await blockBlobClient.upload(content, Buffer.byteLength(content));
    } catch (error) {
        throw new Error(`Error uploading file to blob storage: ${error.message}`);
    }
}

function generateRandomId(){
	//var createId = crypt.encrypt(Math.random().toString(36).slice(-12))
	var createId = crypto.randomUUID()+(new Date()).getTime().toString(36);
	console.log(createId);
	return createId;
}

/**
 * @api {put} https://raito.care/api/resources/questionnaire/:groupId Update questionnaire
 * @apiName updateQuestionnaire
 * @apiDescription This method update a questionnaire.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var json = {
 *    "resourceType": "Questionnaire",
 *    "id": "q2dravet",
 *    "title": "General questions of Dravet syndrome",
 *    "description": "General questions for patients with Dravet Syndrome.",
 * 	  "img": "https://foundation29.org/assets/img/logo-f29.webp"
 *    "items":[{
 *            "idProm": "7",
 *            "text": "Are you or your child able to predict when they will have a seizure?",
 *            "answers": [
 *                {
 *                    "text": "Yes",
 *                    "value": "Yes"
 *                },
 *                {
 *                    "text": "No",
 *                    "value": "No"
 *                }
 *            ],
 *            "other": null,
 *            "type": "radioButtons"
 *        }] 
 *    };
 *   this.http.put('https://raito.care/api/resources/questionnaire/'+groupId, json)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiParam (body) {String} id Questionnaire Id
 * @apiParam (body) {String} [title] Title of questionnaire
 * @apiParam (body) {String} [description] Description of questionnaire
 * @apiParam (body) {String} [img] Url of the image for the questionnaire
 * @apiParam (body) {String} items Object with the proms
 * @apiSuccess {Object} Result An object with the information about the execution.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {message: 'updated'}
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 202 OK
 * {message: 'dont exists'}
 *
 * 
 * @apiErrorExample {json} Error-Response:
 *	HTTP/1.1 403 Forbidden
 *	{
 *	message: 'not added'
 *	}
 */

 async function updateQuestionnaire(req, res) {
    const bodyReq = req.body;
    const url = `questionnaires/${req.body.id}.json`;

    try {
        const json = await getFileFromBlobStorage(url);
        const groupId = req.params.groupId;
        bodyReq.rate = json.rate;
        bodyReq.id = json.id;
        bodyReq.createdById = json.createdById;

        if (json.createdById == groupId) {
            try {
                await uploadFileToBlobStorage(url, JSON.stringify(bodyReq));
                res.status(200).send({ message: 'updated' });
            } catch (err) {
                res.status(403).send({ message: 'not added' });
            }
        } else {
            res.status(200).send({ message: 'dont have permissions' });
        }
    } catch (err) {
        res.status(202).send({ message: 'dont exists' });
        console.log(err);
    }
}

/**
 * @api {post} https://raito.care/api/resources/questionnaire/add/:groupId Add link questionnaire
 * @apiName addlinkQuestionnaire
 * @apiDescription This method associates an existing questionnaire with a group of patients.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var json = {
 *    "id": "q2dravet"
 *    };
 *   this.http.post('https://raito.care/api/resources/questionnaire/'+groupId, json)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result An object with the information about the execution.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {message: 'added'}
 *
 * 
 * @apiErrorExample {json} Error-Response:
 *	HTTP/1.1 403 Forbidden
 *	{
 *	message: 'not added'
 *	}
 */

async function addlinkQuestionnaire(req, res) {
	//req.body.id

	const url = `questionnaires/${req.body.id}.json`;
	try {
		const fileExists = await checkFileExistsInBlobStorage(url);
		if (!fileExists) {
			//file exists
			res.status(403).send({ message: 'not added' })
		} else {
			let groupId = req.params.groupId;
			Group.findOne({ '_id': groupId }, function (err, group) {
				if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
				if (!group) return res.status(404).send({ code: 208, message: 'The group does not exist' })

				var questionnaires = group.questionnaires;
				var found = false;
				for (var i = 0; i < questionnaires.length && !found; i++) {
					if (questionnaires[i].id == req.body.id) {
						found = true;
					}
				}
				if (!found) {
					questionnaires.push({ id: req.body.id });
					Group.findOneAndUpdate({ _id: groupId }, { $set: { questionnaires: questionnaires } }, function (err, groupUpdated) {
						if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
						res.status(200).send({ message: 'added' })
					})
				} else {
					res.status(403).send({ message: 'not added' })
				}
			})

		}
	} catch (err) {
		console.error(err)
		res.status(500).send({ message: `Error checking file existence: ${err}` });
	}
}

async function checkFileExistsInBlobStorage(filePath) {
    const containerName = 'raito-resources'; // Reemplaza con el nombre de tu contenedor
    const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(filePath);

    try {
        await blobClient.getProperties();
        return true;
    } catch (error) {
        if (error.statusCode === 404) {
            return false;
        }
        throw new Error(`Error checking file existence in blob storage: ${error.message}`);
    }
}


/**
 * @api {post} https://raito.care/api/resources/questionnaire/remove/:groupId Delete link questionnaire
 * @apiName deletelinkQuestionnaire
 * @apiDescription This method disassociates an existing questionnaire with a group of patients.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var json = {
 *    "id": "q2dravet"
 *    };
 *   this.http.post('https://raito.care/api/resources/questionnaire/'+groupId, json)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result An object with the information about the execution.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {message: 'removed'}
 *
 * 
 * @apiErrorExample {json} Error-Response:
 *	HTTP/1.1 403 Forbidden
 *	{
 *	message: 'not removed'
 *	}
 */

async function deletelinkQuestionnaire(req, res) {
	//req.body.id
	const url = `questionnaires/${req.body.id}.json`;

	try {
		const fileExists = await checkFileExistsInBlobStorage(url);
        if (!fileExists) {
			//file exists
			res.status(403).send({ message: 'not removed' })
		} else {
			let groupId = req.params.groupId;
			Group.findOne({ '_id': groupId }, function (err, group) {
				if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
				if (!group) return res.status(404).send({ code: 208, message: 'The group does not exist' })

				var questionnaires = group.questionnaires;
				var newQuestionnaires = [];
				var found = false;
				for (var i = 0; i < questionnaires.length; i++) {
					if (questionnaires[i].id == req.body.id) {
						found = true;
					} else {
						newQuestionnaires.push({ id: questionnaires[i].id });
					}
				}
				if (found) {
					Group.findOneAndUpdate({ _id: groupId }, { $set: { questionnaires: newQuestionnaires } }, function (err, groupUpdated) {
						if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
						res.status(200).send({ message: 'removed' })
					})
				} else {
					res.status(403).send({ message: 'not removed' })
				}
			})

		}
	} catch (err) {
		console.error(err)
		res.status(500).send({ message: `Error checking file existence: ${err}` });
	}
}


/**
 * @api {get} https://raito.care/api/resources/questionnaires/all Get all questionnaires
 * @apiName getAllQuestionnaires
 * @apiDescription This method return all questionnaires of Raito.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/api/resources/questionnaires/all')
 *    .subscribe( (res : any) => {
 *      console.log(res);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * @apiSuccess {Object} questionnaires Aray of questionnaires of Raito.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * [
 *    {
 *        "id": "q1dravet",
 *        "data": {
 *            "resourceType": "Questionnaire",
 *            "id": "q1dravet",
 *            "createdById": "61bb38fad6e0cb14f08881c0",
 *            "title": "General questions of Dravet syndrome",
 *            "description": "General questions for patients with Dravet Syndrome.",
 *            "createdby": "Foundation29",
 *            "rate": {
 *                "avg": 3.15,
 *                "ids": [
 *                    {
 *                        "id": "dfsdfsdfssd",
 *                        "value": 4
 *                    },
 *                    {
 *                        "id": "dfsdaf3fsdfssd",
 *                        "value": 2
 *                    }
 *                ]
 *            },
 *            "items": [],
 *            "img": "https://foundation29.org/assets/img/logo-f29.webp"
 *        }
 *    },
 *    {
 *        "id": "q1dravet2",
 *        "data": {
 *            "resourceType": "Questionnaire",
 *            "createdById": "61bb38fad6e0c5b14f08881c0",
 *            "id": "q1dravet2",
 *            "title": "afasf",
 *            "description": "General questions for patients with Dravet Syndrome.",
 *            "createdby": "Foundation29",
 *            "rate": {
 *                "avg": 3.3333333333333335,
 *                "ids": [
 *                    {
 *                        "id": "dfsdfsdfssd",
 *                        "value": 3
 *                    },
 *                    {
 *                        "id": "dfsdaf3fsdfssd",
 *                        "value": 2
 *                    },
 *                    {
 *                        "id": "61bb38fad6e0cb14f08881c0",
 *                        "value": 5
 *                    }
 *                ]
 *            },
 *            "items": [],
 *            "img": "https://dravet.eu/wp-content/uploads/2020/04/logo-Dravet-europa-217x230-1.png"
 *        }
 *    }
 *]
 *
 */


async function getAllQuestionnaires(req, res) {
    const containerName = 'raito-resources'; // Reemplaza con el nombre de tu contenedor
    const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
    const prefix = 'questionnaires/';

    try {
        let result = [];
        let iter = containerClient.listBlobsFlat({ prefix });
        for await (const blob of iter) {
            const blobClient = containerClient.getBlobClient(blob.name);
            try {
                const downloadBlockBlobResponse = await blobClient.download(0);
                const downloadedContent = await streamToString(downloadBlockBlobResponse.readableStreamBody);
                const json = JSON.parse(downloadedContent);
                const nameFile = blob.name.split('.json')[0].split('/').pop(); // Extrae el nombre del archivo sin extensión
                result.push({ id: nameFile, data: json });
            } catch (error) {
                const nameFile = blob.name.split('.json')[0].split('/').pop();
                result.push({ id: nameFile, data: [] });
            }
        }
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching questionnaires' });
    }
}



/**
 * @api {post} https://raito.care/api/resources/questionnaire/rate/:groupId Rate questionnaire
 * @apiName rateQuestionnaire
 * @apiDescription This method is used to assess a questionnaire. You can only vote if you are not the creator of the questionnaire, and you have added it to your patient group.
 * @apiGroup Questionnaires
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   var json = {"id":"q1dravet2","value":5};
 *   this.http.post('https://raito.care/api/resources/questionnaire/rate/'+groupId, json)
 *    .subscribe( (res : any) => {
 *      ...
 *     }, (err) => {
 *      ...
 *     }
 *

 * @apiHeader {String} authorization Users unique access-key. For this, go to  [Get token](#api-Access_token-signIn)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k"
 *     }
 * 
 * @apiParam {String} groupId Group unique ID.
 * @apiSuccess {Object} Result An object with the information about the execution.
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {message: 'updated'}
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 202 OK
 * {message: 'dont exists'}
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 208 OK
 * {message: 'dont have permissions'}
 *
 * 
 * @apiErrorExample {json} Error-Response:
 *	HTTP/1.1 403 Forbidden
 *	{
 *	message: 'not added'
 *	}
 *
 * @apiErrorExample {json} Error-Response:
 *	HTTP/1.1 404 Not found
 *	{
 *	message: 'The group does not exist'
 *	}
 */

async function rateQuestionnaire(req, res) {
    const url = `questionnaires/${req.body.id}.json`;

    try {
        const json = await getFileFromBlobStorage(url);
        const groupId = req.params.groupId;

        // Verificar que el grupo existe
        Group.findOne({ '_id': groupId }, async function (err, group) {
            if (err) return res.status(500).send({ message: `Error making the request: ${err}` });
            if (!group) return res.status(404).send({ code: 208, message: 'The group does not exist' });

            if (json.createdById != groupId) {
                // Actualizar el archivo JSON
                let ids = json.rate.ids;
                let found = false;
                let value = 0;
                for (let i = 0; i < ids.length; i++) {
                    if (req.params.groupId == ids[i].id) {
                        found = true;
                        ids[i].value = req.body.value;
                    }
                    value += ids[i].value;
                }

                if (!found) {
                    ids.push({ "id": req.params.groupId, "value": req.body.value });
                    value += req.body.value;
                }

                const newavg = value / ids.length;
                json.rate = { avg: newavg, ids: ids };

                try {
                    await uploadFileToBlobStorage(url, JSON.stringify(json));
                    res.status(200).send({ message: 'updated' });
                } catch (err) {
                    console.log(req.body.id);
                    console.log(JSON.stringify(json));
                    console.log(json);
                    console.log(err);
                    res.status(403).send({ message: 'not added' });
                }
            } else {
                res.status(208).send({ message: 'dont have permissions' });
            }
        });
    } catch (err) {
        res.status(202).send({ message: 'dont exists' });
        console.log(err);
    }
}


/**
 * @api {get} https://raito.care/api/group/configfile/:groupId Get config file
 * @apiName getConfigFile
 * @apiDescription This method return the config file for a group.
 * @apiGroup Organizations
 * @apiVersion 1.0.0
 * @apiExample {js} Example usage:
 *   this.http.get('https://raito.care/api/group/configfile/'+"groupid")
 *    .subscribe( (res : any) => {
 *      console.log(res);
 *     }, (err) => {
 *      ...
 *     }
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data":{
 *       "drugs":{
 *           "daysToUpdate":180
 *       },
 *       "phenotypes":{
 *           "daysToUpdate":180
 *       },
 *       "feels":{
 *           "daysToUpdate":30
 *       },
 *       "seizures":{
 *           "daysToUpdate":30
 *       },
 *       "weight": {
 *           "daysToUpdate":180
 *       },
 *       "height":{
 *           "daysToUpdate":180
 *       }
 *   },    
 *   "meta":{
 *       "id":"G40.4"
 *   }
 * }
 */

async function getconfigFile(req, res) {
    let groupId = req.params.groupId;
    let url = `groups/${groupId}/config.json`;
    let fallbackUrl = 'groups/61bb38fad6e0cb14f08881c0/config.json';

    try {
        const json = await getFileFromBlobStorage(url);
        res.status(200).send(json);
    } catch (error) {
        console.log(`Error fetching ${url}:`, error);
        try {
            const json = await getFileFromBlobStorage(fallbackUrl);
            res.status(200).send(json);
        } catch (fallbackError) {
            console.log(`Error fetching fallback ${fallbackUrl}:`, fallbackError);
            res.status(500).send({ error: 'Could not fetch configuration file.' });
        }
    }
}

async function getFileFromBlobStorage(filePath) {
    const containerName = 'raito-resources'; // Reemplaza con el nombre de tu contenedor
    const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(filePath);

    try {
        const downloadBlockBlobResponse = await blobClient.download(0);
        const downloadedContent = await streamToString(downloadBlockBlobResponse.readableStreamBody);
        return JSON.parse(downloadedContent);
    } catch (error) {
        throw new Error(`Error downloading file from blob storage: ${error.message}`);
    }
}

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data.toString());
        });
        readableStream.on('end', () => {
            resolve(chunks.join(''));
        });
        readableStream.on('error', reject);
    });
}

module.exports = {
	getQuestionnaire,
	newQuestionnaire,
	updateQuestionnaire,
	addlinkQuestionnaire,
	deletelinkQuestionnaire,
	getAllQuestionnaires,
	rateQuestionnaire,
	getconfigFile
}
