var search = require('./search');

module.exports = function(args, finished) {
  var showDetail = false;
  if (args.req.query && args.req.query.showDetail && args.req.query.showDetail === 'true') {
    showDetail = true;
    delete args.req.query.showDetail;
  }
  finished(search.call(this, 'Resources', args.resource, args.req.query, showDetail));
};