var tokenTargetPropertyMap = {
       identifier:"value",
       tag:"code"
   };

module.exports = function(data) {
    //return a collection of index entries for the given indexableData
    //(in) data = {resourceType:,indexFrom:}
    //(out) entries = [{key:(index name),value:(indexed property)}]

    console.log("Token: " + JSON.stringify(data,null,2));
    var index = {};
    index.name = data.index;
    index.entries = [];

    if(typeof data.indexFrom === 'object')
    {
        //1 index, 3 values: system|code, system|, |code
        var tagSystem, tagCode, tagSystemAndCode
        tagSystem = data.indexFrom.system;
        tagCode = data.indexFrom[tokenTargetPropertyMap[data.propertyName]];
        tagSystemAndCode = tagSystem + "|" + tagCode;
        
        var entry = {};
        entry[data.indexPropertyName] = [
            {
                "code": "|" + tagCode,
            },
            {
                "system": tagSystem + "|",
            },
            {
                "text": tagSystemAndCode
            }  
        ]
        index.entries.push(entry); 
    }
   
    return index;
};