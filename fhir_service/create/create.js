var traverse = require('traverse');
var moment = require('moment');
var uuid = require('uuid');
var version = require('../common/version.js')

function isEmptyObject(obj) {
  for (var prop in obj) {
    return false;
  }
  return true;
}

function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

module.exports = function(documentName, docSubName, body, checkId) {

  var resource = body;

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
  
  if (typeof resource === 'undefined' || resource === '' || isEmptyObject(resource)) {
    var operationOutcome = {
      resourceType: "OperationOutcome",
      id: uuid.v4(),
      issue: [
        {
          code:"processing",
          severity:"fatal",
          diagnostics:"Resource is empty"
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

  if(checkId && typeof resource.id !== 'undefined' && resource.id.length > 0) {
    var operationOutcome = {
      resourceType: "OperationOutcome",
      id: uuid.v4(),
      issue: [
        {
          code:"processing",
          severity:"fatal",
          diagnostics:docSubName + ' ' + resource.id + ' exists'
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

  //Add an id property to the resource before persisting...
  if(typeof resource.id === 'undefined' || resource.id.length === 0) resource.id = uuid.v4();
  //Set meta/version id...
  if(resource.meta === undefined || (resource.meta !== undefined && resource.meta.versionId === undefined)) { 
    resource.meta = resource.meta || {};
    resource.meta.versionId = "1";
    resource.meta.lastUpdated = moment().utc().format();
  }
  var doc = this.db.use(documentName, docSubName);
  doc.$(resource.id).setDocument(resource);
  //Create indices
  //Loop over searchParameter file for indexable properties
  //ResourcesPatientIndexparameterName
  var docIndex = this.db.use(documentName + 'Index', docSubName);
  traverse(resource).map(function(node) {
    if (typeof node !== 'object' && node !== '') {
      var subscripts = [];
      this.path.forEach(function(sub) {
        if (!isInt(sub)) subscripts.push(sub);
      });
      subscripts.push(node);
      subscripts.push(resource.id);
      docIndex.$(subscripts).value = resource.id;
    }
  });
  //Create version...
  version.call(this, documentName, docSubName, resource);

  return resource;
};