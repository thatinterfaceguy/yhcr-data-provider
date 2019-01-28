module.exports = function(documentName, docSubName, id) {
    if (typeof docSubName === 'undefined' || docSubName === '') {
      return {error: 'Document name not defined or empty'};
    }
    if (typeof id === 'undefined' || id === '') {
      return {error: 'Id not defined or empty'};
    }
    var doc = this.db.use(documentName, docSubName, id);
    if (!doc.exists) {
      return {error: 'No Document exists for that Id (' + id + ')'};
    }
    return doc.getDocument(true);
  };