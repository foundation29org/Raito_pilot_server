'use strict'

const config = require('../config')
const storage = require("@azure/storage-blob")
const accountnameGenomics = config.nameBlob;
const keyGenomics = config.keyGenomics;
const sharedKeyCredentialGenomics = new storage.StorageSharedKeyCredential(accountnameGenomics, keyGenomics);
const blobServiceClientGenomics = new storage.BlobServiceClient(
  `https://${accountnameGenomics}.blob.core.windows.net`,
  sharedKeyCredentialGenomics
);

function getAzureBlobSasTokenWithContainer(req, res) {
  var containerName = req.params.containerName;

  var startDate = new Date();
  var expiryDate = new Date();
  startDate.setTime(startDate.getTime() - 5 * 60 * 1000);
  expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);

  var containerSAS = storage.generateBlobSASQueryParameters({
    expiresOn: expiryDate,
    permissions: storage.ContainerSASPermissions.parse("rlc"),
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
  const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
  const createContainerResponse = await containerClient.createIfNotExists();
  return !!createContainerResponse.succeeded;
}

async function createBlob(containerName, url, data) {
  const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
  const content = data;
  const blockBlobClient = containerClient.getBlockBlobClient(url);
  return blockBlobClient.upload(content, content.length);
}

async function createBlobSimple(containerName, data, fileName) {
  try {
    const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const content = JSON.stringify(data);
    await blockBlobClient.upload(content, Buffer.byteLength(content));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function deleteBlob(containerName, blobName) {
  try {
    const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    return true;
  } catch (error) {
    return false;
  }
}

async function downloadBlob(containerName, blobName) {
  const containerClient = blobServiceClientGenomics.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  const downloadBlockBlobResponse = await blobClient.download();
  return (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString();
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
