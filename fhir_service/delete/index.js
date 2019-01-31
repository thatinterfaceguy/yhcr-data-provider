var del = require('./delete');

module.exports = function(args, finished) {
  finished(del.call(this, 'Resources', args.resource. args.id));
};