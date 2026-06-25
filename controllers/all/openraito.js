'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')
const vcServiceCtrl = require('../../services/vc.js')
const Session = require('../../models/session')

async function getGeneralShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId).select('-_id -createdBy');
        res.status(200).send({ generalShare: patient.generalShare })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function setGeneralShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        await Patient.findByIdAndUpdate(patientId, { generalShare: req.body }, { select: '-createdBy', new: true });
        res.status(200).send({ message: 'general share changed' })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getCustomShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId).select('-_id -createdBy');
        res.status(200).send({ customShare: patient.customShare })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function setCustomShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patientUpdated = await Patient.findByIdAndUpdate(patientId, { customShare: req.body }, { select: '-createdBy', new: true });
        res.status(200).send({ message: 'custom share changed', customShare: patientUpdated.customShare })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getIndividualShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId).select('-_id -createdBy');
        if(patient.individualShare.length>0){
            var data = await getInfoUsers(patient.individualShare);
            return res.status(200).send({ individualShare: data })
        }else{
            res.status(200).send({ individualShare: patient.individualShare })
        }
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
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

async function getUserName(individualShare) {
    if(individualShare.idUser!=null){
        let idUser = crypt.decrypt(individualShare.idUser);
        try {
            const user = await User.findById(idUser).select('-_id -__v -confirmationCode -loginAttempts -role -lastLogin');
            if (user) {
                var res = JSON.parse(JSON.stringify(individualShare))
                res.userInfo = { userName: user.userName, lastName: user.lastName, email: user.email }
                return res
            }else{
                var res = JSON.parse(JSON.stringify(individualShare))
                res.userInfo = { userName: '', lastName: '', email: '' }
                return res
            }
        } catch (err) {
            throw err
        }
    }else{
        var res = JSON.parse(JSON.stringify(individualShare))
        res.userInfo = { userName: '', lastName: '', email: '' }
        return res
    }
}

async function setIndividualShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        var info = {patientId: req.params.patientId, individualShare: req.body.individualShare[req.body.indexUpdated], type: 'Clinician'}
        const patientUpdated = await Patient.findByIdAndUpdate(patientId, { individualShare: req.body.individualShare }, { new: true });
        if (patientUpdated) {
            res.status(200).send({ message: 'individuals share updated' })
            /*if( req.body.updateStatus){
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
                            session.deleteOne(err => {
                                if(err) console.log({message: `Error deleting the feels: ${err}`})
                            })
                        });
                        var data = await generateQR(info);
                        return res.status(200).send({ message: 'qrgenerated', data: data })
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
            }*/
            
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function generateQR(info) {
        let userId = crypt.decrypt(info.individualShare.idUser);
        const user = await User.findById(userId).select('-_id -__v -confirmationCode -loginAttempts -role -lastLogin');
        if (user) {
            info.userInfo= { userName: user.userName, lastName: user.lastName, email: user.email };
            var promises = [];
            promises.push(vcServiceCtrl.createIssuer(info));
            const data = await Promise.all(promises);
            return data;
        }else{
            throw new Error("not user found");
        }
}

module.exports = {
    getGeneralShare,
    setGeneralShare,
    getCustomShare,
    setCustomShare,
    getIndividualShare,
    setIndividualShare
}
