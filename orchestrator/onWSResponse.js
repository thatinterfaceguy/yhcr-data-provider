var util = require('util');

var responseHandlers = {
    get: function(resource, res)
        {
            res.set('Content-Length', resource.length);
            res.status(200)
            res.send(resource);
        },
    post: function(resource, res)
        {
            res.status(201);
            res.set('Content-Length', resource.length);
            res.set('Location','http://localhost:8080/fhir/STU3/'+resource.resourceType+'/'+resource.id)
            //Etag should be version
            res.send(resource);
        },
    put: function(resource, res)
        {
            res.status(204);
            res.send();
        },
    delete: function(resource, res)
        {
            res.status(202);//Non commital (lol)
            res.send();
        }
}

module.exports = function(req, res, next) {
    var msg = res.locals.message || {error: "Internal server error"};
    var code, status;
    if (msg.error) {
        code = 500;
        status = msg.error.status;
        if(status && status.code) code = status.code;
        if(msg.operationOutcome !== undefined)
        {
            msg = msg.operationOutcome;
        } 
        else 
        {
            delete msg.status;
            delete msg.restMessage;
            delete msg.ewd_application;
        }
        res.set('Content-Length', msg.length);
        res.status(code).send(msg);
    } else {
        //Scan request path? Only want to return FHIR resources if request was against FHIR API
        var resource = msg;
        if(resource.token) delete resource.token;
        //Send Response...
        var responseHandler = responseHandlers[req.method.toLowerCase()];
        responseHandler(resource,res);
    }
    next();
  };