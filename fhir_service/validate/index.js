var validate = require('./validate.js')

module.exports = function(args, finished) {
   finished(validate.call(this, 'Resources', args.resource, args.req.body));
};