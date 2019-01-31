var search = require('./search');

module.exports = function(args, finished) {
  finished(search.call(this, 'Resources', args.resource, args.req.query));
};