module.exports = function(searchParameter) 
{
    /*
    //String search = means starts with http://hl7.org/fhir/stu3/search.html#string
    In (examples)
    {
        '_id':'123123123123'
    }
    Out
    { 
        'id':'123123123123',
    }
    */

    var query = {}
    query[searchParameter.expression] = searchParameter.value;
    return query;
}