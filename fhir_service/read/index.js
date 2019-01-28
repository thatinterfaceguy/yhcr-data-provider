var read = require('./read');

module.exports = function(args, finished) {
  var msg = {
    path:"/test/message",
    method:"POST",
  }
  console.log("read: " + JSON.stringify(args));
  finished(read.call(this, 'Resources', args.resource, args.id));
};