var traverse = require('traverse');
var moment = require('moment');
var uuid = require('uuid');

var del = require('../delete/delete.js');
var create = require('../create/create.js');
var version = require('../common/version.js');

function isEmptyObject(obj) {
    for (var prop in obj) {
      return false;
    }
    return true;
  }
  
  function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
  }

module.exports = function(documentName, docSubName, docId, body) {
  
  var resource = body;
  var existingResource;

  if (typeof docSubName === 'undefined' || docSubName === '') {
    var operationOutcome = {
      resourceType: "OperationOutcome",
      id: uuid.v4(),
      issue: [
        {
          code:"processing",
          severity:"fatal",
          diagnostics:"Invalid URL - missing Resource Type"
        }
      ]
    };
    var error = {
      error:"Bad Request",
      status: {code:400}
    }
    return {
      operationOutcome,
      error
    }
  }

  if (typeof docId === 'undefined' || docId === '') {
    var operationOutcome = {
      resourceType: "OperationOutcome",
      id: uuid.v4(),
      issue: [
        {
          code:"processing",
          severity:"fatal",
          diagnostics:"No Resource ID provided"
        }
      ]
    };
    var error = {
      error:"Bad Request",
      status: {code:400}
    }
    return {
      operationOutcome,
      error
    }
  }

  //Does this document already exist? If it has an id then check by querying db...
  //if it doesn't then operation outcome/404 not found
  var existingResource = this.db.use(documentName, docSubName, docId);
  if(!existingResource.exists)
  {
      var operationOutcome = {
        resourceType: "OperationOutcome",
        id: uuid.v4(),
        issue: [
          {
            code:"processing",
            severity:"fatal",
            diagnostics:docSubName + " " + docId + " does not exist"
          }
        ]
      };
      var error = {
        error:"Not Found",
        status: {code:404}
      }
      return {
        operationOutcome,
        error
      }
  } 

  existingResource = existingResource.getDocument(true);
  //Get the doc using resource.id - need to test it exists (should have latest version number) - if not see errors on API
  var newVersionId = parseInt(existingResource.meta.versionId)+1;
  var result;
  //Delete existing doc and indexes with that id
  result = del.call(this, documentName, docSubName, docId);
  console.log("Deleted: " + JSON.stringify(result,null,2));
  if(result.operationOutcome !== undefined) 
  { 
      return result;
  } 
  //Update version number and last update date...
  resource.meta.versionId = newVersionId;
  resource.meta.lastUpdated = moment().utc().format();
  console.log("After deleted: " + JSON.stringify(resource,null,2));
  //Create doc and indexes
  result = create.call(this, documentName, docSubName, resource, false)
  if(result.operationOutcome !== undefined) 
  { 
      return result;
  } 
  //Create version...
  version.call(this, documentName, docSubName, resource);
  console.log("After created: " + JSON.stringify(resource,null,2));
  return {status:"OK"};
}