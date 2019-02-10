var queryTypeHandler = {
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
        console.log("Id Evaluate: Resource " + JSON.stringify(resource, null, 2) + ", User Value " + query.value);
        return (resource[query.path] === query.value);
    }
};

module.exports = {
queryTypeHandler
};