'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')

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
        res.status(200).send({ message: 'custom share changed', customShare: patientUpdated.customShare  })
    })
}

module.exports = {
    getGeneralShare,
    setGeneralShare,
    getCustomShare,
    setCustomShare
}