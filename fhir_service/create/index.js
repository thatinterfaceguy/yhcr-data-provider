var create = require('./create');

module.exports = function(args, finished) {
  finished(create.call(this, 'Resources', args.resource, args.req.body));
};