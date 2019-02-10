var queryTypeHandler = {
    select: function(query) {
        var selectors = [];
        selectors.push(
            {
                path: (query.searchParameter.path + ".reference").split('.')
            }
        );
        return selectors;
    },
    filter: function(query, resource) {
        return resource[query.searchParameter.path] === query.value;
    }
};

module.exports = {
    queryTypeHandler
};