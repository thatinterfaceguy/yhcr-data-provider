module.exports = function(searchParameter) 
{
    /*
    In
    {
        'general-practitioner':''
    }
    Out
    { 
        'generalPractitioner.reference': '',
    }
    */

    var query = {}
    query[searchParameter.expression + '.reference'] = searchParameter.value;
    return query;
}