var traverse = require('traverse');

var queryTypeHandler = {
        contains:function(query, resource) {
            return resource[query.searchParameter.path].includes(query.value);
        },
        exact:function(query,resource) {
            return resource[query.searchParameter.path] === query.value;
        },
        select: function(query) {
            var selectors = [];
            selectors.push(
                {
                    path: (query.searchParameter.path).split('.')
                }
            );
            return selectors;
        },
        filter: function(query, resource) {
            console.log("String Evaluate: Resource " + JSON.stringify(resource, null, 2) + ", User Value " + query.value);
            var result = false;
            console.log("Path: " + query.searchParameter.path);

            var target = traverse(resource).get(query.searchParameter.path.split("."));
            console.log("Target: " + JSON.stringify(target,null,2));
                if(Array.isArray(target)) {
                    target.forEach(function(element, idx) {
                       console.log("Element: " + element); 
                    });
                }
            //if query.field contains a modifier then act accordingly
            //Modifier test...

            var fields = query.field.split(":");
            if(fields.length === 2 && query.searchParameter.modifiers.indexOf(fields[1]) !== -1) {
                console.log("Modifier " + fields[1]);
                //Which modifier?
                result = this[fields[1]](query,resource)
            } else {
                //Probably redundant as selector effectively does a starts with
                //= means starts with http://hl7.org/fhir/stu3/search.html#string
                console.log(resource[query.searchParameter.path] + " starts with " + query.value);
                result = resource[query.searchParameter.path].startsWith(query.value);
            }
            return result;
        }
    };

module.exports = {
    queryTypeHandler
};