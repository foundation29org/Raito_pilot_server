'use strict'

const crypt = require('./crypt')
const config = require('../config')
const request = require('request')
const storage = require("@azure/storage-blob")
const accountnameGenomics = config.nameBlob;
const keyGenomics = config.keyGenomics;
const sharedKeyCredentialGenomics = new storage.StorageSharedKeyCredential(accountnameGenomics, keyGenomics);
const blobServiceClientGenomics = new storage.BlobServiceClient(
  // When using AnonymousCredential, following url should include a valid SAS or support public access
  `https://${accountnameGenomics}.blob.core.windows.net`,
  sharedKeyCredentialGenomics
);

var azure = require('azure-storage');

const User = require('../models/user')
const Patient = require('../models/patient')

var blobService = azure
  .createBlobService(config.nameBlob, keyGenomics);


function getAzureBlobSasTokenWithContainer(req, res) {
  var containerName = req.params.containerName;
  var category = config.translationCategory;
  var translationKey = config.translationKey;

  var startDate = new Date();
  var expiryDate = new Date();
  startDate.setTime(startDate.getTime() - 5 * 60 * 1000);
  expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);

  var containerSAS = storage.generateBlobSASQueryParameters({
    expiresOn: expiryDate,
    permissions: storage.ContainerSASPermissions.parse("rlc"),//rwdlac
    protocol: storage.SASProtocol.Https,
    containerName: containerName,
    startsOn: startDate,
    version: "2017-11-09"

  }, sharedKeyCredentialGenomics).toString();
  res.status(200).send({ containerSAS: containerSAS })
}

async function deleteContainers(containerName) {
  const containerClient = await blobServiceClientGenomics.getContainerClient(containerName);
  containerClient.delete();
}

async function createContainers(containerName) {
  // Create a container
  const containerClient = blobServiceClientGenomics.getContainerClient(containerName);

  const createContainerResponse = await containerClient.createIfNotExists();
  if (createContainerResponse.succeeded) {
    return true;
  } else {
    return false;
  }


}

async function createBlob(containerName, url, data) {
  const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
  const content = data;
  const blockBlobClient = containerClient.getBlockBlobClient(url);
  const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
  return uploadBlobResponse;
}

async function createBlobSimple(containerName, data, fileName) {
  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(
      containerName, 
      fileName,
      JSON.stringify(data),
      function onResponse(error, result) {
        if(error){
          console.log(error);
          resolve(false)
        }
          resolve(true);
      });
  });
  
}

async function deleteBlob(containerName, blobName) {
  return new Promise((resolve, reject) => {
    blobService.deleteBlobIfExists(containerName,blobName,function(error){
      if (error != null) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  });
}

async function downloadBlob(containerName, blobName) {
  const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  // Get blob content from position 0 to the end
  // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  const downloadBlockBlobResponse = await blobClient.download();
  const downloaded = (
    await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
  ).toString();
  return downloaded;
}


async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}



module.exports = {
  getAzureBlobSasTokenWithContainer,
  deleteContainers,
  createContainers,
  createBlob,
  createBlobSimple,
  deleteBlob,
  downloadBlob
}
