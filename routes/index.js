// file that contains the routes of the api
'use strict'

const express = require('express')

const userCtrl = require('../controllers/all/user')
const langCtrl = require('../controllers/all/lang')
const patientCtrl = require('../controllers/user/patient')
const deleteAccountCtrl = require('../controllers/user/delete')
const phenotypeCtrl = require('../controllers/user/patient/phenotype')
const superAdmninLangCtrl = require('../controllers/superadmin/lang')
const admninLangCtrl = require('../controllers/admin/lang')
const eoCtrl = require('../controllers/superadmin/eousers')
const f29azureserviceCtrl = require('../services/f29azure')
const f29gatewayCtrl = require('../services/f29gateway')
const supportCtrl = require('../controllers/all/support')
const seizuresCtrl = require('../controllers/user/patient/seizures')
const appointmentsCtrl = require('../controllers/user/patient/appointments')
const groupCtrl = require('../controllers/all/group')
const medicationCtrl = require('../controllers/user/patient/medication')
const feelCtrl = require('../controllers/user/patient/feel')
const promCtrl = require('../controllers/user/patient/prom')
const docsCtrl = require('../controllers/user/patient/documents')
const weightCtrl = require('../controllers/user/patient/weight')
const heightCtrl = require('../controllers/user/patient/height')
const openRaitoCtrl = require('../controllers/all/openraito')
const vcServiceCtrl = require('../services/vc.js')
const verifierServiceCtrl = require('../services/verifier.js')
const resourcesCtrl = require('../controllers/all/resources.js')

const auth = require('../middlewares/auth')
const sharedCtrl = require('../middlewares/shared')
const roles = require('../middlewares/roles')
const api = express.Router()

// user routes, using the controller user, this controller has methods
//routes for login-logout
api.post('/signup', userCtrl.signUp)
api.post('/signin', userCtrl.signIn)

// activarcuenta
api.post('/sendEmail', userCtrl.sendEmail)

api.get('/users/:userId', auth(roles.All), userCtrl.getUser)
api.get('/users/settings/:userId', auth(roles.All), userCtrl.getSettings)
api.put('/users/:userId', auth(roles.AllLessResearcher), userCtrl.updateUser)
api.delete('/users/:userId', auth(roles.AllLessResearcher), userCtrl.deleteUser)//de momento no se usa
api.get('/users/name/:userId', auth(roles.All), userCtrl.getUserName)
api.get('/users/email/:userId', auth(roles.All), userCtrl.getUserEmail)
api.get('/verified/:userId', auth(roles.All), userCtrl.isVerified)
api.post('/verified/:userId', auth(roles.All), userCtrl.setInfoVerified)
api.put('/users/changeiscaregiver/:userId', auth(roles.AllLessResearcher), userCtrl.changeiscaregiver)

//delete account
api.post('/deleteaccount/:userId', auth(roles.All), deleteAccountCtrl.deleteAccount)

// patient routes, using the controller patient, this controller has methods
api.get('/patients-all/:userId', auth(roles.All), patientCtrl.getPatientsUser)
api.get('/patients/:patientId', auth(roles.All), patientCtrl.getPatient)
api.put('/patients/:patientId', auth(roles.UserClinical), patientCtrl.updatePatient)
api.put('/patient/consentgroup/:patientId', auth(roles.All), patientCtrl.consentgroup)
api.get('/patient/consentgroup/:patientId', auth(roles.All), patientCtrl.getConsentGroup)
api.put('/patient/checks/:patientId', auth(roles.All), patientCtrl.setChecks)
api.get('/patient/checks/:patientId', auth(roles.All), patientCtrl.getChecks)
api.put('/patient/birthdate/:patientId', auth(roles.All), patientCtrl.setBirthDate)

// phenotypeinfo routes, using the controller socialinfo, this controller has methods
api.post('/openraito/phenotypes/:patientId', sharedCtrl.shared(), phenotypeCtrl.getPhenotype)
api.post('/openraito/v2/phenotypes/:patientId', sharedCtrl.shared2(), phenotypeCtrl.getPhenotype)
api.post('/openraito/invitation/phenotypes/:patientId', sharedCtrl.sharedInvitation(), phenotypeCtrl.getPhenotype)
api.get('/phenotypes/:patientId',auth(roles.All), phenotypeCtrl.getPhenotype)
api.post('/phenotypes/:patientId', auth(roles.UserClinicalSuperAdmin), phenotypeCtrl.savePhenotype)
api.put('/phenotypes/:phenotypeId', auth(roles.UserClinicalSuperAdmin), phenotypeCtrl.updatePhenotype)
api.delete('/phenotypes/:phenotypeId', auth(roles.UserClinicalSuperAdmin), phenotypeCtrl.deletePhenotype)//de momento no se usa
api.get('/phenotypes/history/:patientId', auth(roles.All), phenotypeCtrl.getPhenotypeHistory)//de momento no se usa
api.delete('/phenotypes/history/:phenotypeId', auth(roles.UserClinicalSuperAdmin), phenotypeCtrl.deletePhenotypeHistoryRecord)//de momento no se usa

//superadmin routes, using the controllers of folder Admin, this controller has methods
api.post('/superadmin/lang/:userId', auth(roles.SuperAdmin), superAdmninLangCtrl.updateLangFile)
///no se usa las 2 siguientes
//api.put('/superadmin/langs/:userId', auth, superAdmninLangCtrl.langsToUpdate)
//api.put('/admin/lang/:userId', auth, superAdmninLangCtrl.addlang)
api.put('/superadmin/lang/:userId', auth(roles.SuperAdmin), function(req, res){
  req.setTimeout(0) // no timeout
  superAdmninLangCtrl.addlang(req, res)
})
api.delete('/superadmin/lang/:userIdAndLang', auth(roles.SuperAdmin), superAdmninLangCtrl.deletelang)

api.post('/admin/lang/:userId', auth(roles.Admin), admninLangCtrl.requestLangFile)
api.put('/admin/lang/:userId', auth(roles.Admin), admninLangCtrl.requestaddlang)

api.post('/eo/onlypatients/:groupId', auth(roles.Admin), eoCtrl.getOnlyPatients)
api.get('/eo/patients/:groupId', auth(roles.Admin), eoCtrl.getPatients)
api.get('/eo/patient/:patientId', auth(roles.All), eoCtrl.getInfoPatient)
api.get('/eo/drugs/:groupId', auth(roles.Admin), eoCtrl.getDrugs)
api.get('/eo/phenotypes/:groupId', auth(roles.Admin), eoCtrl.getPhenotypes)
api.get('/eo/feels/:groupId', auth(roles.Admin), eoCtrl.getFeels)
api.get('/eo/proms/:groupId', auth(roles.Admin), eoCtrl.getProms)
api.get('/eo/seizures/:groupId', auth(roles.Admin), eoCtrl.getSeizures)
api.get('/eo/weights/:groupId', auth(roles.Admin), eoCtrl.getWeights)
api.get('/eo/heights/:groupId', auth(roles.Admin), eoCtrl.getHeights)
api.get('/eo/consent/:patientId', auth(roles.Admin), eoCtrl.haveConsent)

api.post('/eo/backup/:patientId', auth(roles.OnlyUser), eoCtrl.saveBackup)
api.get('/eo/checkipfs/:userId', auth(roles.OnlyUser), eoCtrl.checkIPFS)
api.get('/eo/backupipfs/:userId', auth(roles.OnlyUser), eoCtrl.getIPFS)
api.get('/eo/checkf29/:userId', auth(roles.OnlyUser), eoCtrl.checkF29)
api.get('/eo/backupf29/:userId', auth(roles.OnlyUser), eoCtrl.getF29)

// lang routes, using the controller lang, this controller has methods
api.get('/langs/',  langCtrl.getLangs)

//Support
api.post('/support/', auth(roles.UserClinicalSuperAdmin), supportCtrl.sendMsgSupport)
api.post('/homesupport/', supportCtrl.sendMsgLogoutSupport)
api.get('/support/:userId', auth(roles.UserClinicalSuperAdmin), supportCtrl.getUserMsgs)

//services f29azure
api.get('/getAzureBlobSasTokenWithContainer/:containerName', auth(roles.UserClinicalSuperAdmin), f29azureserviceCtrl.getAzureBlobSasTokenWithContainer)

//gateway
api.post('/gateway/search/disease/', f29gatewayCtrl.searchDiseases)
api.post('/gateway/search/symptoms/', f29gatewayCtrl.searchSymptoms)

// seizuresCtrl routes, using the controller seizures, this controller has methods
api.post('/openraito/seizures/dates/:patientId', sharedCtrl.shared(), seizuresCtrl.getSeizuresDate)
api.post('/openraito/v2/seizures/dates/:patientId', sharedCtrl.shared2(), seizuresCtrl.getSeizuresDate)
api.post('/openraito/invitation/seizures/dates/:patientId', sharedCtrl.sharedInvitation(), seizuresCtrl.getSeizuresDate)
api.post('/seizures/dates/:patientId', auth(roles.All), seizuresCtrl.getSeizuresDate)
api.get('/seizures/:patientId', auth(roles.UserResearcher), seizuresCtrl.getSeizures)
api.post('/seizures/:patientId', auth(roles.OnlyUser), seizuresCtrl.saveSeizure)
api.put('/seizures/:seizureId', auth(roles.OnlyUser), seizuresCtrl.updateSeizure)
api.delete('/seizures/:seizureId', auth(roles.OnlyUser), seizuresCtrl.deleteSeizure)
api.post('/massiveseizures/:patientId', auth(roles.OnlyUser), seizuresCtrl.saveMassiveSeizure)

//appointments
api.get('/lastappointments/:patientId', auth(roles.UserResearcher), appointmentsCtrl.getLastAppointments)
api.get('/appointments/:patientId', auth(roles.UserResearcher), appointmentsCtrl.getAppointments)
api.post('/appointments/:patientId', auth(roles.OnlyUser), appointmentsCtrl.saveAppointment)
api.put('/appointments/:appointmentId', auth(roles.OnlyUser), appointmentsCtrl.updateAppointment)
api.delete('/appointments/:appointmentId', auth(roles.OnlyUser), appointmentsCtrl.deleteAppointment)

//groups
api.get('/groupsnames', groupCtrl.getGroupsNames)
api.get('/groups', groupCtrl.getGroups)
api.get('/group/:groupName', auth(roles.All), groupCtrl.getGroup)
api.get('/group/phenotype/:groupName', auth(roles.All), groupCtrl.getPhenotypeGroup)
api.get('/group/medications/:groupId', groupCtrl.getMedicationsGroup)
api.get('/group/questionnaires/:groupId', groupCtrl.getQuestionnairesGroup)
api.put('/group/medications/:userId', auth(roles.SuperAdmin), groupCtrl.updateMedicationsGroup)

//medications
api.post('/openraito/medications/dates/:patientId', sharedCtrl.shared(), medicationCtrl.getMedicationsDate)
api.post('/openraito/v2/medications/dates/:patientId', sharedCtrl.shared2(), medicationCtrl.getMedicationsDate)
api.post('/openraito/invitation/medications/dates/:patientId', sharedCtrl.sharedInvitation(), medicationCtrl.getMedicationsDate)
api.post('/medications/dates/:patientId',auth(roles.All), medicationCtrl.getMedicationsDate)
api.get('/medications/:patientId', auth(roles.UserResearcher), medicationCtrl.getMedications)
api.get('/medication/:medicationId', auth(roles.UserResearcher), medicationCtrl.getMedication)
api.post('/medication/:patientId', auth(roles.OnlyUser), medicationCtrl.saveMedication)
api.put('/medication/:medicationId', auth(roles.OnlyUser), medicationCtrl.updateMedication)
api.delete('/medication/:medicationId', auth(roles.OnlyUser), medicationCtrl.deleteDose)
api.delete('/medications/:drugNameAndPatient', auth(roles.OnlyUser), medicationCtrl.deleteMedication)
api.get('/medications/all/:drugNameAndPatient', auth(roles.UserResearcher), medicationCtrl.getAllMedicationByNameForPatient)

api.delete('/medications/update/:PatientIdAndMedicationId', auth(roles.OnlyUser), medicationCtrl.deleteMedicationByIDAndUpdateStateForThePrevious)
api.put('/medication/newdose/:medicationIdAndPatient', auth(roles.OnlyUser), medicationCtrl.newDose)
api.put('/medication/stoptaking/:medicationId', auth(roles.OnlyUser), medicationCtrl.stoptaking)
api.put('/medication/changenotes/:medicationId', auth(roles.OnlyUser), medicationCtrl.changenotes)
api.put('/medication/sideeffect/:medicationId', auth(roles.OnlyUser), medicationCtrl.sideeffect)
api.post('/massivesdrugs/:patientId', auth(roles.OnlyUser), medicationCtrl.saveMassiveDrugs)

// seizuresCtrl routes, using the controller seizures, this controller has methods
api.post('/openraito/feels/dates/:patientId', sharedCtrl.shared(), feelCtrl.getFeelsDates)
api.post('/openraito/v2/feels/dates/:patientId', sharedCtrl.shared2(), feelCtrl.getFeelsDates)
api.post('/openraito/invitation/feels/dates/:patientId', sharedCtrl.sharedInvitation(), feelCtrl.getFeelsDates)
api.post('/feels/dates/:patientId',auth(roles.All), feelCtrl.getFeelsDates)
api.get('/feels/:patientId', auth(roles.UserResearcher), feelCtrl.getFeels)
api.post('/feel/:patientId', auth(roles.OnlyUser), feelCtrl.saveFeel)
api.delete('/feel/:feelId', auth(roles.OnlyUser), feelCtrl.deleteFeel)

//proms
api.post('/prom/dates/:patientId', auth(roles.UserResearcher), promCtrl.getPromsDates)
api.get('/prom/:patientId', auth(roles.UserResearcher), promCtrl.getProms)
api.post('/prom/:patientId', auth(roles.OnlyUser), promCtrl.saveProm)
api.post('/proms/:patientId', auth(roles.OnlyUser), promCtrl.savesProm)
api.put('/prom/:promId', auth(roles.OnlyUser), promCtrl.updateProm)
api.delete('/prom/:promId', auth(roles.OnlyUser), promCtrl.deleteProm)

// seizuresCtrl routes, using the controller seizures, this controller has methods
api.get('/documents/:patientId', auth(roles.UserResearcher), docsCtrl.getDocuments)
api.post('/document/:patientId', auth(roles.OnlyUser), docsCtrl.saveDocument)
api.put('/document/:documentId', auth(roles.OnlyUser), docsCtrl.updateDocument)
api.delete('/document/:documentId', auth(roles.OnlyUser), docsCtrl.deleteDocument)
api.post('/upload', auth(roles.OnlyUser), docsCtrl.uploadFile)
api.post('/deleteBlob', auth(roles.OnlyUser), docsCtrl.deleteBlob)

// weightinfo routes, using the controller socialinfo, this controller has methods
api.get('/weight/:patientId', weightCtrl.getWeight)
api.get('/weights/:patientId', auth(roles.UserResearcher), weightCtrl.getHistoryWeight)
api.post('/weight/:patientId', auth(roles.OnlyUser), weightCtrl.saveWeight)
api.delete('/weight/:weightId', auth(roles.OnlyUser), weightCtrl.deleteWeight)//de momento no se usa

// heighteinfo routes, using the controller socialinfo, this controller has methods
api.get('/height/:patientId', auth(roles.UserResearcher), heightCtrl.getHeight)
api.get('/heights/:patientId', auth(roles.UserResearcher), heightCtrl.getHistoryHeight)
api.post('/height/:patientId', auth(roles.OnlyUser), heightCtrl.saveHeight)
api.delete('/height/:heightId', auth(roles.OnlyUser), heightCtrl.deleteHeight)//de momento no se usa

// openraito
api.get('/openraito/patient/generalshare/:patientId', auth(roles.UserResearcher), openRaitoCtrl.getGeneralShare)
api.post('/openraito/patient/generalshare/:patientId', auth(roles.OnlyUser), openRaitoCtrl.setGeneralShare)
api.get('/openraito/patient/customshare/:patientId', auth(roles.UserResearcher), openRaitoCtrl.getCustomShare)
api.post('/openraito/patient/customshare/:patientId', auth(roles.OnlyUser), openRaitoCtrl.setCustomShare)
api.get('/openraito/patient/individualshare/:patientId', auth(roles.OnlyUser), openRaitoCtrl.getIndividualShare)
api.post('/openraito/patient/individualshare/:patientId', auth(roles.OnlyUser), openRaitoCtrl.setIndividualShare)

//vc
api.get('/createissuer/:patientId',auth(roles.UserResearcher), vcServiceCtrl.requestVC)
api.post('/issuer/issuanceCallback', vcServiceCtrl.issuanceCallback)
api.get('/issuer/issuance-response/:sessionId',auth(roles.UserResearcher), vcServiceCtrl.issuanceResponse)
api.get('/issuer/getAll/:patientId',auth(roles.UserResearcher), vcServiceCtrl.getAllVC)

//verifier
api.get('/verifier/:patientId',auth(roles.UserResearcher), verifierServiceCtrl.presentationRequest)
api.post('/verifier/presentation-request-callback', verifierServiceCtrl.presentationRequestCallback)
api.get('/verifier/presentation-response/:sessionId', verifierServiceCtrl.presentationResponse)
api.post('/verifier/presentation-response-b2c', verifierServiceCtrl.presentationResponseb2c)

//resources
api.get('/resources/questionnaire/:questionnaireId',auth(roles.All), resourcesCtrl.getQuestionnaire)
api.post('/resources/questionnaire/:groupId',auth(roles.All), resourcesCtrl.newQuestionnaire)
api.put('/resources/questionnaire/:groupId',auth(roles.All), resourcesCtrl.updateQuestionnaire)
api.get('/group/configfile/:groupId', resourcesCtrl.getconfigFile)

//ruta privada
api.get('/private', auth(roles.AllLessResearcher), (req, res) => {
	res.status(200).send({ message: 'You have access' })
})

module.exports = api
