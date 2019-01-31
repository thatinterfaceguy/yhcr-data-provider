var update = require('./update');

module.exports = function(args, finished) {
  finished(update.call(this, 'Resources', args.resource, args.id, args.req.body));
};