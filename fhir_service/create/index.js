var create = require('./create');

module.exports = function(args, finished) {
  finished(create.call(this, 'resources', args.resource.toLowerCase(), args.req.body, true));
};