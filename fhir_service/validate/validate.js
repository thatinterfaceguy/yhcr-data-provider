var Fhir = require('fhir').Fhir;
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
            operationOutcome.issue.push(
                {
                    code:"invalid",
                    severity:"error",
                    diagnostics: "Invalid - see issues for further information"
                });
            
            results.messages.forEach(function(message, idx) {
                var issue = {};
                issue.code = "invalid";
                issue.severity = message.severity;
                issue.diagnostics = message.message;
                issue.location = message.location;
                operationOutcome.issue.push(issue);

            });
        } 
        else 
        {
            operationOutcome.issue.push(
                {
                    code:"informational",
                    severity:"information",
                    details: "OK",
                    diagnostics: "Valid" + (results.messages != undefined && results.messages.length === 0 ? "" : " - see issues for further information")
                }
            );

            if(results.messages != undefined && results.messages.length > 0)
            {
                results.messages.forEach(function(message, idx) {
                    operationOutcome.issue.push(
                            {
                                code:"informational",
                                severity:message.severity,
                                location:message.location,
                                diagnostics: message.message
                            }
                        )
                });
            } 
        }
    }
    catch(ex)
    {
        console.log(JSON.stringify(results));
        operationOutcome.issue.push(
                {
                    severity: "fatal",
                    code: "informational",
                    diagnostics: ex.message,
                }
            );
    }
   
    return operationOutcome;
}