'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')
const vcServiceCtrl = require('../../services/vc.js')
const Session = require('../../models/session')

function getGeneralShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        res.status(200).send({ generalShare: patient.generalShare })
    })
}

function setGeneralShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findByIdAndUpdate(patientId, { generalShare: req.body }, { select: '-createdBy', new: true }, (err, patientUpdated) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        res.status(200).send({ message: 'general share changed' })
    })
}

function getCustomShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        res.status(200).send({ customShare: patient.customShare })
    })
}

function setCustomShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findByIdAndUpdate(patientId, { customShare: req.body }, { select: '-createdBy', new: true }, (err, patientUpdated) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        res.status(200).send({ message: 'custom share changed', customShare: patientUpdated.customShare })
    })
}

function getIndividualShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, async (err, patient) => {
        if(patient.individualShare.length>0){
            var data = await getInfoUsers(patient.individualShare);
            return res.status(200).send({ individualShare: data })
        }else{
            res.status(200).send({ individualShare: patient.individualShare })
        }
        
    })
}

async function getInfoUsers(individualShares) {
	return new Promise(async function (resolve, reject) {

                var promises = [];
                for (var i = 0; i < individualShares.length; i++) {
                    promises.push(getUserName(individualShares[i]));
                }
                await Promise.all(promises)
                    .then(async function (data) {
                        resolve(data)
                    })
                    .catch(function (err) {
                        console.log('Manejar promesa rechazada (' + err + ') aquí.');
                        reject('Manejar promesa rechazada (' + err + ') aquí.');
                    });

		

	});
}

function getUserName(individualShare) {
    return new Promise(async function (resolve, reject) {
        if(individualShare.idUser!=null){
            let idUser = crypt.decrypt(individualShare.idUser);
            //añado  {"_id" : false} para que no devuelva el _id
            User.findById(idUser, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, (err, user) => {
                if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
                if (user) {
                    var res = JSON.parse(JSON.stringify(individualShare))
                    res.userInfo = { userName: user.userName, lastName: user.lastName, email: user.email }
                    resolve(res)
                }else{
                    var res = JSON.parse(JSON.stringify(individualShare))
                    res.userInfo = { userName: '', lastName: '', email: '' }
                    resolve(res)
                }
            })
        }else{
            var res = JSON.parse(JSON.stringify(individualShare))
            res.userInfo = { userName: '', lastName: '', email: '' }
            resolve(res)
        }
        
    });
	
}

function setIndividualShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    var info = {patientId: req.params.patientId, individualShare: req.body.individualShare[req.body.indexUpdated], type: 'Clinician'}
    Patient.findByIdAndUpdate(patientId, { individualShare: req.body.individualShare }, { new: true }, (err, patientUpdated) => {
        if (err) {
            console.log(err);
        }
        if (patientUpdated) {
            if( req.body.updateStatus){
                Session.find({"createdBy": req.params.patientId, "type": 'Clinician'},async (err, sessions) => {
                    if (err) return res.status(500).send({message: `Error making the request: ${err}`})
                    if(sessions.length>0){
                        var foundSession = false;
                        var infoSession = {};
                      for (var i = 0; i < sessions.length; i++) {
                        if(sessions[i].sharedWith==info.individualShare.idUser){
                            foundSession = true;
                            infoSession == sessions[i];
                        }
                      }
                      if(!foundSession){
                        try {
                            var data = await generateQR(info);
                            return res.status(200).send({ message: 'qrgenerated', data: data })
                        } catch (e) {
                            console.error("Error: ", e);
                            return res.status(200).send({ message: 'Error', data: e })
                        }
                      }else{
                        //delete and create new one
                        sessions.forEach(function(session) {
                            session.remove(err => {
                                if(err) console.log({message: `Error deleting the feels: ${err}`})
                            })
                        });
                        var data = await generateQR(info);
                        return res.status(200).send({ message: 'qrgenerated', data: data })
                        /*if(infoSession.sessionData.message!='Credential successfully issued'){
                            res.status(200).send({infoSession})
                        }else{
                            res.status(200).send({ message: 'individuals share updated' })
                        }*/
                      }
                    }else{
                        try {
                            var data = await generateQR(info);
                            return res.status(200).send({ message: 'qrgenerated', data: data })
                        } catch (e) {
                            console.error("Error: ", e);
                            return res.status(200).send({ message: 'Error', data: e })
                        }
                    }
                  
                  })
            }else{
                res.status(200).send({ message: 'individuals share updated' })
            }
            
        }
    })
}

async function generateQR(info) {
	return new Promise(async function (resolve, reject) {

        let userId = crypt.decrypt(info.individualShare.idUser);
        //añado  {"_id" : false} para que no devuelva el _id
        User.findById(userId, { "_id": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "role": false, "lastLogin": false }, async (err, user) => {
            if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
            if (user) {
                info.userInfo= { userName: user.userName, lastName: user.lastName, email: user.email };
                var promises = [];
                promises.push(vcServiceCtrl.createIssuer(info));
                await Promise.all(promises)
                    .then(async function (data) {
                        resolve(data)
                    })
                    .catch(function (err) {
                        console.log('Manejar promesa rechazada (' + err + ') aquí.');
                        reject('Manejar promesa rechazada (' + err + ') aquí.');
                    });
            }else{
                reject("not user found");
            }
        })

		

	});
}

module.exports = {
    getGeneralShare,
    setGeneralShare,
    getCustomShare,
    setCustomShare,
    getIndividualShare,
    setIndividualShare
}