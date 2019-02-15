module.exports = function(data) {
    //return a collection of index entries for the given indexableData
    //(in) data = {resourceType:,indexFrom:}
    //(out) entries = [{key:(index name),value:(indexed property)}]

    console.log("URI: " + JSON.stringify(data,null,2));
    var index = {};
    index.name = data.index;
    index.entries = [];
    var entry = {};
    entry[data.indexPropertyName] = data.indexFrom;
    index.entries.push(entry);

    return index;
};