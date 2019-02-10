var uuid = require('uuid');
var moment = require('moment');
//Resouce Search Parameters
var resources = require('./searchParameters').resources;
//Search Parameter Type Handlers (attempt at strategy pattern)
var string = require('./string').queryTypeHandler;
var token = require('./token').queryTypeHandler;
var dt = require('./dt').queryTypeHandler;
//Maps the Search Parameter Type to a Query Type Handler...
var queryTypeHandlers = {
  "string":string,
  "token":token,
  "dt":dt
}

module.exports = function(documentName, docSubName, query) {
  if (typeof docSubName === 'undefined' || docSubName === '') {
    return {error: 'Document name not defined or empty'};
  }

  var docIndex = this.db.use(documentName + 'Index', docSubName);
  if (!docIndex.exists) {
    return {error: 'No ' + docSubName + ' Documents exist in ' + documentName};
  }

  //Try Catch this...
  var searchParameters = resources[docSubName].searchParameters;
  var queries = [];
  for (var name in query) {
      //Only continue this loop if this name does NOT resolve to a searchResultParameter
      //Check if param is valid..
      var searchParameter;
      searchParameters.forEach(function(param, idx) {
        if(param.name === name) {
          searchParameter = param;
          return;
        }

        var fields = name.split(":");
        if(fields.length == 2 && param.modifiers.indexOf(fields[1]) !== -1)
        {
            searchParameter = param;
            return;
        }
      });

      if(!searchParameter) {
        //Handling == Strict - this needs to be returned as part of the bundle (I think???)
        var operationOutcome = {
          resourceType: "OperationOutcome",
          id: uuid.v4(),
          issue: [
            {
              code:"processing",
              severity:"fatal",
              diagnostics:"Invalid Search Parameter for " + docSubName + " resource: " + name
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
      } else {
        //Create query object...
        var q = {
          searchParameter: searchParameter,
          field: name,
          value: query[name]
        }
        console.log("Query: " + JSON.stringify(q,null,2));
        queries.push(q);
      }
  }

  var id;
  var matches;
  var children;
  var passNo = 0;
  var path;
  var resource;

  doc = this.db.use(documentName, docSubName);

  queries.forEach(function(query, idx)
  {
    passNo++;
    children = {};
    //Select should return a collection of IDs - will need to pass in Doc
    //That way this can be specialised for each search parameter type
    selectors = queryTypeHandlers[query.searchParameter.type].select(query);
    console.log("Path: " + JSON.stringify(selectors,null,2))
    selectors.forEach(function(selector, idx) {
      if(query.searchParameter.type.toLowerCase() === "token")
      {        
        docIndex.$(selector.path).forEachChild(function(id) 
        {
          console.log("Doc Id: " + id);
          resource = doc.$(id).getDocument(true);
          if(queryTypeHandlers[query.searchParameter.type].filter(query, resource) === true)
          {
              children[id] = true;
          }
        });
      }
      else if(query.searchParameter.type.toLowerCase() === "dt")
      {
        console.log(selector.path);
        console.log(query.value);
        docIndex.$(selector.path).forEachChild(function(subs, node) {
          console.log("subs: " + subs)
          console.log("node: " + JSON.stringify(node, null, 2));
          node.forEachChild(function(id) {
            resource = doc.$(id).getDocument(true);
            console.log("Doc Id: " + id);
            if(queryTypeHandlers[query.searchParameter.type].filter(query, resource) === true)
            {
                children[id] = true;
            }
          });
        });
      }
      else
      {
        console.log(selector.path);
        console.log(query.value);
        docIndex.$(selector.path).forEachChild({prefix: query.value}, function(subs, node) {
          node.forEachChild(function(id) {
            resource = doc.$(id).getDocument(true);
            console.log("Doc Id: " + id);
            if(queryTypeHandlers[query.searchParameter.type].filter(query, resource) === true)
            {
                children[id] = true;
            }
          });
        });
      }
      if (passNo === 1) {
        matches = children;
      }
      else {
        for (id in matches) { 
          if (!children[id]) delete matches[id];
        }
      }
    });
  });
  //Return bundle
  var bundle = {
    resourceType:"Bundle",
    id: uuid.v4(),
    meta:{
      lastUpdated: moment().utc().format()
    },
    type:"searchset",
    total:0,
    entry:[]
  };

  for(id in matches)
  {
    var searchResult = doc.$(id).getDocument(true);
    var entry = {
      fullUrl:'http://localhost:8080/fhir/STU3/'+resource.resourceType+'/'+resource.id,
      resource: searchResult
    };
    bundle.entry.push(entry); 
    bundle.total += 1;
  }
  return bundle;
};