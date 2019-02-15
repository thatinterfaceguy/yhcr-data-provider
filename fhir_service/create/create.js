var traverse = require('traverse');
var moment = require('moment');
var uuid = require('uuid');
//Index Type Handling...
var registry = require('../common/indexTypes/registry.js').registry;
var name = require('../common/indexTypes/name.js');
var token = require('../common/indexTypes/token.js');
var string = require('../common/indexTypes/string.js');
var datetime = require('../common/indexTypes/datetime.js');
var reference = require('../common/indexTypes/reference.js');
var uri = require('../common/indexTypes/uri.js');
//Maps the resource property path to an index type Handler...
var indexTypeHandlers = {
  "city":string,
  "district":string,
  "postalCode":string,
  "tag": token,
  "gender":string,
  "birthDate":datetime,
  "name":name,
  "id":string,
  "managingOrganization":reference,
  "generalPractitioner":reference,
  "identifier":token,
  "lastUpdated":datetime,
  "criteria":string,
  "status":string,
  "payload":string,
  "type":string,
  "endpoint":uri
}
//Versioning...
var version = require('../common/versions/version.js')

function isEmptyObject(obj) {
  for (var prop in obj) {
    return false;
  }
  return true;
}

function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

module.exports = function (documentName, docSubName, body, checkId) {

  var resource = body;

  if (typeof docSubName === 'undefined' || docSubName === '') {
    var operationOutcome = {
      resourceType: "OperationOutcome",
      id: uuid.v4(),
      issue: [
        {
          code: "processing",
          severity: "fatal",
          diagnostics: "Invalid URL - missing Resource Type"
        }
      ]
    };
    var error = {
      error: "Bad Request",
      status: { code: 400 }
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
          code: "processing",
          severity: "fatal",
          diagnostics: "Resource is empty"
        }
      ]
    };
    var error = {
      error: "Bad Request",
      status: { code: 400 }
    }
    return {
      operationOutcome,
      error
    }
  }

  if (checkId && typeof resource.id !== 'undefined' && resource.id.length > 0) {
    var operationOutcome = {
      resourceType: "OperationOutcome",
      id: uuid.v4(),
      issue: [
        {
          code: "processing",
          severity: "fatal",
          diagnostics: docSubName + ' ' + resource.id + ' exists'
        }
      ]
    };
    var error = {
      error: "Bad Request",
      status: { code: 400 }
    }
    return {
      operationOutcome,
      error
    }
  }

  //Add an id property to the resource before persisting...
  if (typeof resource.id === 'undefined' || resource.id.length === 0) resource.id = uuid.v4();
  //Set meta/version id...
  if (resource.meta === undefined || (resource.meta !== undefined && resource.meta.versionId === undefined)) {
    resource.meta = resource.meta || {};
    resource.meta.versionId = "1";
    resource.meta.lastUpdated = moment().utc().format();
  }
  var doc = this.db.use(docSubName);
  doc.$(resource.id).setDocument(resource);
  //Create indices...
  //Loop over indexType registry and index the resource properties as required...
  var db = this.db;
  var indexTypes = registry[resource.resourceType];
  if (indexTypes !== undefined) { 

    var index;
    var indexTypeHandler;
    var isIndexable = false;

    //Get rid of any extensions from the resource  as these are not searchable and therefore not indexable
    resource = traverse(resource).map(function(node) {
      if(this.key === "extension" ) this.remove();
    });

    traverse(resource).map(function(node) {
      //Index objects, e.g. name, address, tag etc...
      if (!Array.isArray(node)) {
        this.path.forEach(function(path) {
          indexTypes.forEach(function (indexType) {
            isIndexable = indexType.property === path;
            if (isIndexable) {
              indexTypeHandler = indexTypeHandlers[path]
              index = indexTypeHandler({
                resourceType: docSubName,
                propertyName: path,
                indexPropertyName: indexType.indexedProperty || path,
                indexFrom: node,
                index: indexType.index
              });
            }
          });
        });
      //Indexes simple properties that are direct children of the resource, e.g. birthdate, gender
      } /*else if (typeof node !== 'object' && this.path.length === 1) {
        var path = this.path[0];
        indexTypes.forEach(function(indexType) {
          isIndexable = indexType.property === path;
            if (isIndexable) {
              indexTypeHandler = indexTypeHandlers[path]
              index = indexTypeHandler({
                resourceType: docSubName,
                propertyName: path,
                indexPropertyName: indexType.indexedProperty || path,
                indexFrom: node,
                index: indexType.index
              });
            //There will only be one index entry for simple properties
            }
        });
      }*/

      if(index !== undefined && index.entries !== undefined && index.entries.length > 0)
      {
        var entries = index.entries;
        entries.forEach(function (entry) {
          traverse(entry).map(function (node) {
            if (typeof node!=='object' && node !== 'index' && node !== '') {
              var searchTerms = [];
              searchTerms.push(resource.resourceType.toLowerCase());
              this.path.forEach(function(term) {
                if (!isInt(term)) searchTerms.push(term);
              });
              searchTerms.push(node);
              searchTerms.push(resource.id);

              var idx = db.use(index.name);
              idx.$(searchTerms).value = resource.id;
            }
          });
        });
      }

      index = undefined;
      indexTypeHandler = undefined;

    });
  }

  //Create version...
  version.call(this, documentName, docSubName, resource);


  return resource;
};