module.exports = function(data) {
    //return a collection of index entries for the given indexableData
    //(in) data = {resourceType:,indexFrom:}
    //(out) entries = [{key:(index name),value:(indexed property)}]

    console.log("Name: " + JSON.stringify(data,null,2));
    var index = {};
    index.name = data.index;
    index.entries = [];
    //Only do this if indexFrom is a name object...
    if(typeof data.indexFrom === 'object')
    {
        //Given is an array... for every given name, create an index entry
        data.indexFrom.given.forEach(function(givenName) {
            index.entries.push(
                {
                    "family": data.indexFrom.family
                },        
                {
                    "given": givenName
                },
                {
                    "name": givenName + " " + data.indexFrom.family
                }
            )
        });
    }

    return index;
};