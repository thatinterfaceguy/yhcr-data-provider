var traverse = require('traverse');
var uuid = require('uuid');

function isEmptyObject(obj) {
  for (var prop in obj) {
    return false;
  }
  return true;
}

function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

module.exports = function(documentName, docSubName, body) {

  if (typeof docSubName === 'undefined' || docSubName === '') {
    return {error: 'Document name not defined or empty'};
  }
  if (typeof body === 'undefined' || body === '' || isEmptyObject(body)) {
    return {error: 'Document Content (body) not defined or empty'};
  }
  var doc = this.db.use(documentName, docSubName);
  var id = uuid.v4();//doc.increment();
  //Add an id property to the resource before persisting...
  body.id = id;
  doc.$(id).setDocument(body);
  // create indices
  var docIndex = this.db.use(documentName + 'Index', docSubName);
  traverse(body).map(function(node) {
    if (typeof node !== 'object' && node !== '') {
      var subscripts = [];
      this.path.forEach(function(sub) {
        if (!isInt(sub)) subscripts.push(sub);
      });
      subscripts.push(node);
      subscripts.push(id);
      docIndex.$(subscripts).value = id;
    }
  });
  //Versioning...
  
  return body;
};