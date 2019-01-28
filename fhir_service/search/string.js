module.exports = function(searchParameter) 
{
    /*
    //String search = means starts with http://hl7.org/fhir/stu3/search.html#string
    In (examples)
    {
        'family:'test'
    }
    Out
    { 
        'name.family': 'test*',
    }
    */

    var query = {}
    query[searchParameter.expression] = searchParameter.value + "*";
    return query;
}