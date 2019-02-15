module.exports = function(message, jwt, forward, sendBack) {
    // onRequest logic here
    console.log("onMSResponse: " + JSON.stringify(message,null,2));
    var indexRequest = {
        path: "/roqr/api/services/index",
        method: "POST",
        body: message
    }
    forward(indexRequest, jwt, function(responseObj) {
        console.log("Response from index: " + JSON.stringify(responseObj,null, 2));
    });
    return false; //Tell QEWD to return response from handler
  };