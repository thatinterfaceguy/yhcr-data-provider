module.exports = function(documentName, docSubName, docId, docVid) {
    
    var version;
    var versionId;

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
              diagnostics:"No Resource Id"
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
    
      if (typeof docVid === 'undefined' || docVid === '') {
        var operationOutcome = {
          resourceType: "OperationOutcome",
          id: uuid.v4(),
          issue: [
            {
              code:"processing",
              severity:"fatal",
              diagnostics:"No Resource Version Id"
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

      versionId = docId + '_' + docVid;
      version = this.db.use(documentName, docSubName, versionId);

      if (!version.exists) {
        var operationOutcome = {
          resourceType: "OperationOutcome",
          id: uuid.v4(),
          issue: [
            {
              code:"processing",
              severity:"fatal",
              diagnostics:"Version " + docVid + " for " + docSubName + " " + docId + " does not exist"
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

      return version.getDocument(true);
}