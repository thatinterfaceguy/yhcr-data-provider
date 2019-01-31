function isEmptyObject(obj) {
  for (var prop in obj) {
    return false;
  }
  return true;
}

function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

module.exports = function(documentName, docSubName, docId) {
    var resource;
   
    if (typeof docSubName === 'undefined' || docSubName === '') {
        return {error: 'Resource name not defined or empty', status:{code:400}};
    }

    if (typeof docId === 'undefined' || docId === '') {
    return {error: 'Resource Id not defined or empty',status:{code:400}};
    }

    var resource = this.db.use(documentName, docSubName, docId);
    if (!resource.exists) 
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
        return 
        {
            operationOutcome,
            error
        }
    }
    //Delete indicies
    var docIndex = this.db.use(documentName + 'Index', docSubName);
    resource.forEachLeafNode(function(data, leafNode) {
        if (data !== '') {
            var subscripts = leafNode._node.subscripts;
            subscripts.splice(0, 2);  // remove 1st 2 subscripts
            var subs = [];
            subscripts.forEach(function(sub) {
                if (!isInt(sub)) subs.push(sub);
            });
            subs.push(data);
            subs.push(docId);
            docIndex.$(subs).delete();
        }
  });
  //Delete the document
  resource.delete();
  //Delete the version history??
  
  return {status:"OK"};
}