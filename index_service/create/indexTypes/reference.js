module.exports = function(data) {
    //return a collection of index entries for the given indexableData
    //(in) data = {resourceType:,indexFrom:}
    //(out) entries = [{key:(index name),value:(indexed property)}]

    console.log("Reference: " + JSON.stringify(data,null,2));
    var index = {};
    index.name = data.index;
    index.entries = [];

    //Only do this if data.indexFrom is a reference object...
    if(typeof data.indexFrom === 'object')
    {
        var reference = data.indexFrom.reference;
        if(reference.startsWith("http")) {
            //URL
            var urlEntry = {}
            urlEntry[data.indexPropertyName] = reference;
            index.entries.push(urlEntry);
        }
        var referenceComponents = reference.split("/");
        //Type and logical Id length-2 + Logical Id = length-1;
        //Logical Id = length-1
        var typeAndLogicalId = referenceComponents[referenceComponents.length-2] + "/" + referenceComponents[referenceComponents.length-1];
        var typeAndLogicalIdEntry  = {};
        typeAndLogicalIdEntry[data.indexPropertyName] = typeAndLogicalId;
        index.entries.push(typeAndLogicalIdEntry);
    
        var logicalId = referenceComponents[referenceComponents.length-1];
        var logicalIdEntry = {};
        logicalIdEntry[data.indexPropertyName] = logicalId;
        index.entries.push(logicalIdEntry);
    }

    return index;
};