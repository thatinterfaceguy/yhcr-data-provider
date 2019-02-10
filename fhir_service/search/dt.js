var moment = require('moment');
var traverse = require('traverse');

var queryTypeHandler = {
        eq: function(query, resource) {
            var queryValueAsDate = moment(query.value);
            var resourceDateValue = moment(traverse(resource).get(query.searchParameter.path.split(".")));
            return moment(queryValueAsDate).isSame(resourceDateValue);
        },
        ne: function(query, resource) {
            var queryValueAsDate = moment(query.value);
            var resourceDateValue = moment(traverse(resource).get(query.searchParameter.path.split(".")));
            return (moment(queryValueAsDate).isSame(resourceDateValue) === false);
        },
        lt: function(query, resource) {
            var queryValueAsDate = moment(query.value);
            var resourceDateValue = moment(traverse(resource).get(query.searchParameter.path.split(".")));
            return moment(resourceDateValue).isBefore(queryValueAsDate);
        },        
        le: function(query, resource) {
            var queryValueAsDate = moment(query.value);
            var resourceDateValue = moment(traverse(resource).get(query.searchParameter.path.split(".")));
            return moment(resourceDateValue).isSameOrBefore(queryValueAsDate);
        },
        gt: function(query, resource) {
            var queryValueAsDate = moment(query.value);
            var resourceDateValue = moment(traverse(resource).get(query.searchParameter.path.split(".")));
            return moment(resourceDateValue).isAfter(queryValueAsDate);
        },        
        ge: function(query, resource) {
            var queryValueAsDate = moment(query.value);
            var resourceDateValue = moment(traverse(resource).get(query.searchParameter.path.split(".")));
            return moment(resourceDateValue).isSameOrAfter(queryValueAsDate);
        },
        select: function(query) {
            var selectors = [];
            selectors.push(
                {
                    path: query.searchParameter.path.split('.')
                }
            );
            return selectors;
        },
        filter: function(query, resource) {
            console.log("Date Time Evaluate: Resource " + JSON.stringify(resource, null, 2) + ", User Value " + query.value);
            var result = false;
            //if query.field contains a modifier then act accordingly
            //Modifier test...
            var modifiers = ["eq","ne","lt","le","gt","ge"];
            var modifier = query.value.substr(0,2);
            if(modifiers.indexOf(modifier) > -1)
            {
                query.value = query.value.substr(2);
                result = this[modifier](query,resource);
            } 
            else
            {
                result = this["eq"](query,resource);
            } 

            return result;
        }
    };

module.exports = {
    queryTypeHandler
};