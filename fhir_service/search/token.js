var traverse = require('traverse');

var queryTypeHandler = {
         tokenTargetPropertyMap: {
            "identifier":"value",
            "class":"code",
            "meta.tag":"code",
            "default":"code"
        },
        select: function(query) {
            var selectors = [];
            var targetProperty = this.tokenTargetPropertyMap[query.searchParameter.path] === undefined ? this.tokenTargetPropertyMap["default"] : this.tokenTargetPropertyMap[query.searchParameter.path];
           
            //code
            //system|code
            //|code
            //system|

            if(query.value.indexOf("|") > -1)
            {
                var queryValueParts = query.value.split("|");
                if(queryValueParts[0]==='') {
                    //Just Code
                    selectors.push(
                        {
                            path: (query.searchParameter.path + "." + targetProperty + "." + queryValueParts[1]).split(".")
                        }
                    );
                } 
                else if(queryValueParts[1] === '') 
                {
                    //System
                    selectors.push(
                        {
                            path: (query.searchParameter.path + "." + "system").split(".")
                        }
                    );
                    //Push system uri stop it being split on '.' ...
                    selectors[0].path.push(queryValueParts[0]);
                }
                else
                {
                    //Code and System
                    selectors.push(
                        {
                            path: (query.searchParameter.path + "." + "system").split(".")
                        },
                        {
                            path: (query.searchParameter.path + "." + targetProperty + "." + queryValueParts[1]).split(".")
                        }
                    )
                    //Push system uri to stop it being split on '.' ...
                    selectors[0].path.push(queryValueParts[0]);
                }
            }
            else 
            {
                //Just Code
                selectors.push(
                    {
                        path: (query.searchParameter.path + "." + targetProperty + "." + query.value).split(".")
                    }
                );
            }
            
            return selectors;
        },
        filter: function(query, resource) {
            console.log("Token Evaluate: Resource " + JSON.stringify(resource, null, 2) + ", User Value " + query.value);
            var result = false;
            var targetProperty = this.tokenTargetPropertyMap[query.searchParameter.path] === undefined ? this.tokenTargetPropertyMap["default"] : this.tokenTargetPropertyMap[query.searchParameter.path];
            var queryValueParts = query.value.split("|");
            console.log("Token Filter: " + queryValueParts[0]);
                //TODO: Add support for text: and not: modifiers...
                var target = traverse(resource).get(query.searchParameter.path.split("."));
                if(Array.isArray(target)) {
                    target.forEach(function(element, idx) {
                        
                        //No | 
                        if(queryValueParts.length === 1 && queryValueParts[0] !== '')
                        {
                            result = (element[targetProperty] === queryValueParts[0]);
                            if(result) return;
                        }
                        //Match all with the same code, irrespective of system...
                        if(queryValueParts[0] === '')
                        {
                            result = (element[targetProperty] === queryValueParts[1]);
                        }
                        //Match all with the same system, irrespective of code
                        else if (queryValueParts[1] === '')
                        {
                            result = (element["system"] === queryValueParts[0]);
                        }
                        //Match both system and code
                        else if(queryValueParts[0] !== '' && queryValueParts[1] !== '')
                        {
                            result = (element["system"] === queryValueParts[0] && element[targetProperty] === queryValueParts[1]);
                        }
                        if(result) return;
                    });
                } else {
                    //Encapsulate if/elses as a function because this case will need to use the same logic too
                    //function _test(target, queryValueParts)
                    console.log("Element is not an array: " + queryValueParts[0]);
                    result = (target[targetProperty] === query.value);
                }
            return result;
        }
    };

module.exports = {
    queryTypeHandler
};