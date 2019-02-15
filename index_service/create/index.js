module.exports = function(args,finished) {
    //args.resource
    //args.resourceType
    console.log(JSON.stringify(args,null,2));
    //Create the indicies...
    finished({result:"OK"});
}