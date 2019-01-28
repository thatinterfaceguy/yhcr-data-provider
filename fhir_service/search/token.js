//class?

module.exports = function(searchParameter) 
{
    /*
    In
    {
        'identifier':'https://fhir.nhs.uk/Id/nhs-number|9933157213'
    }
    Out
    { 
        'identifier.system': 'https://fhir.nhs.uk/Id/nhs-number',
        'identifier.value': '9933157213'
    }
    */

    //if query == system|value then return identifier.system = query[0] && identifier.value = query[1]
    //if query == value then return identifier.value
    //if query == |value then return identifier.system = "" && identifier.value = query[0]
    //if query == system| then return ??

    var tokenTargetPropertyMap = {
        "identifier":"value",
        "class":"code",
        "meta.tag":"code"
    }

    var query = {}
    var parts = searchParameter.value.split("|");
    if(parts === undefined || parts.length === 0)
    {
        query[searchParameter.expression + "." + tokenTargetPropertyMap[searchParameter.expression]] = searchParameter.value;
    } 
    else if(parts.length == 1) 
    {
        query[searchParameter.expression + "." + tokenTargetPropertyMap[searchParameter.expression]]= parts[0];
    } 
    else if(parts.length == 2) 
    {
        query[searchParameter.expression+ '.system'] = parts[0];
        query[searchParameter.expression + "." + tokenTargetPropertyMap[searchParameter.expression]] = parts[1];

        console.log(JSON.stringify(query));
    } 
    return query;
}