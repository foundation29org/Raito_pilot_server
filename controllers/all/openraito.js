'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')

function getPatientsUser(req, res) {
    let userId = crypt.decrypt(req.params.userId);


    User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "confirmed": false, "lastLogin": false }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error making the request:' })
        if (!user) return res.status(404).send({ code: 208, message: 'The user does not exist' })

        if (user.role == 'Clinical') {
            Patient.find({}, (err, patients) => {
                if (err) return res.status(500).send({ message: `Error making the request: ${err}` })

                var listpatients = [];

                patients.forEach(function (u) {
                    var id = u._id.toString();
                    var idencrypt = crypt.encrypt(id);
                    listpatients.push({ id: idencrypt, birthDate: u.birthDate, gender: u.gender, group: u.group });
                });

                //res.status(200).send({patient, patient})
                // if the two objects are the same, the previous line can be set as follows
                res.status(200).send({ listpatients })
            })
        } else {
            res.status(401).send({ message: 'without permission' })
        }
    })


}

function getPatient(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    console.log(req.body);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        if (!patient) return res.status(202).send({ message: `The patient does not exist` })

        res.status(200).send({ patient })
    })
}

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
        res.status(200).send({ message: 'custom share changed' })
    })
}

module.exports = {
    getPatientsUser,
    getPatient,
    getGeneralShare,
    setGeneralShare,
    getCustomShare,
    setCustomShare
}