var util = require('util');

module.exports = function(req, res, next) {
    console.log(req.method);
    console.log("Before transform " + res.locals.message);
    var resource = res.locals.message;
    if(util.isArray(resource))
    {
        console.log("Array : " + JSON.stringify(resource));
    } else {
        if(resource.token) {
            delete resource.token;
        }
    }

    res.send(resource);
    next();
  };