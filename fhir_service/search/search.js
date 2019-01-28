var token = require("./token");
var reference = require("./reference");
var string = require("./string");
var id = require("./id");


var searchParameters = 
  {
    "_id":{"expression":"id","type":"id","value":""},
    "_tag":{"expression":"meta.tag","type":"token","value":""},
    "identifier": {"expression":"identifier","type":"token", "value":""},
    "general-practitioner": {"expression":"generalPractitioner","type":"reference","value":""},
    "organization": {"expression":"managingOrganization","type":"reference","value":""},
    "family":{"expression":"name.family","type":"string","value":""},
    "given":{"expression":"name.given","type":"string","value":""},
    "class":{"expression":"class","type":"token","value":""},
    "status":{"expression":"status","type":"string","value":""},
    "criteria":{"expression":"criteria","type":"string","value":""}
  }

var searchParameterTypeHandlers = 
  {
    "id":id,
    "token":token,
    "reference":reference,
    "string":string
  }

module.exports = function(documentName, docSubName, query, showDetail) {
  if (typeof docSubName === 'undefined' || docSubName === '') {
    return {error: 'Document name not defined or empty'};
  }
  var docIndex = this.db.use(documentName + 'Index', docSubName);
  if (!docIndex.exists) {
    return {error: 'No ' + docSubName + ' Documents exist in ' + documentName};
  }

  var q = {};
  for (var name in query) {
      //Check if param is valid..
      var searchParameter = searchParameters[name]
      if(!searchParameter)
      {
          return {error: 'Invalid Search Parameter for Patient resource: ' + name, status: {code:400}};
      }
      //Extract the value of the query param...
      searchParameter.value = query[name];
      //Fetch the mapping handler for this search parameter
      var handler = searchParameterTypeHandlers[searchParameter.type];
      //Execute the handler to convert the fhir query into a qewdjs query...
      var mapped = handler(searchParameter);
      for(var key in mapped)
      {
          q[key] = mapped[key];
      }
  }
 
  var id;
  var matches;
  var children;
  var passNo = 0;
  var path;
  var value;
  var pieces;
  var prefix;
  for (var name in q) {
    passNo++;
    children = {};
    path = name.split('.');
    value = q[name];
    if (value !== '') {
      if (value.indexOf('*') === -1) {
        path.push(value);
        console.log("search path: " + path);
        //console.log("value: " + value);
        docIndex.$(path).forEachChild(function(id) {
          console.log(id);
          children[id] = true;
        });
      }
      else if (value[value.length -1] === '*') { //Support for starts with (Tes*)
        prefix = value.slice(0, -1); // remove * from end
        console.log("Starts with...");
        docIndex.$(path).forEachChild({prefix: prefix}, function(subs, node) {
          node.forEachChild(function(id) {
            children[id] = true;
          });
        });
      }
    }
    if (passNo === 1) {
      matches = children;
    }
    else {
      for (id in matches) { //reduce like behaviour - populate matches with first set of results then remove those which do not match the results from the next query
        if (!children[id]) delete matches[id];
      }
    }
  }
  var results = [];
  var doc = this.db.use(documentName, docSubName);
  
  for (id in matches) {
    results.push(doc.$(id).getDocument(true));
  }
  return results;
};