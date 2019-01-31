var history = require('./history');

module.exports = function(args, finished) {
  console.log(JSON.stringify(args, null, 2));
  finished(history.call(this, 'ResourcesVersions', args.resource, args.id, args.vid));
};