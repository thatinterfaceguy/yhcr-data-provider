var uuid = require('uuid');

function isEmptyObject(obj) {
    for (var prop in obj) {
      return false;
    }
    return true;
  }
  
  function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
  }

module.exports = function(documentName, docSubName, body) {
    if (typeof docSubName === 'undefined' || docSubName === '') {
        return {error: 'Document name not defined or empty'};
    }
    
    if (typeof body === 'undefined' || body === '' || isEmptyObject(body)) {
    return {error: 'Document Content (body) not defined or empty'};
    }

    var fhir = new Fhir();
    var resource = body;
    var results; 
    var operationOutcome = {};
    operationOutcome.id = uuid.v4();
    operationOutcome.issue = [];

    try
    {
        
        results = fhir.validate(resource, { errorOnUnexpected: true });
        console.log(JSON.stringify(results));
        if(results !== undefined && !results.valid)
        {
            results.messages.forEach(function(message, idx) {
                var issue = {};
                issue.code = "error";
                issue.details = message.message;
                operationOutcome.push(issue);

            });
        } 
        else 
        {
            operationOutcome.push(
                {
                    severity:"information",
                    code:"informational",
                    details: "OK"
                }
            )
        }
    }
    catch(ex)
    {
        console.log(JSON.stringify(results));
        operationOutcome.issue.push(
                {
                    severity: "fatal",
                    code: "informational",
                    details: ex,
                }
            );
    }
   
    return operationOutcome;
}