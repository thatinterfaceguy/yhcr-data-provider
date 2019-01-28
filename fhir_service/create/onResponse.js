//Slide 153 of https://www.slideshare.net/robtweed/ewd-3-training-course-part-45-using-qewds-advanced-microservice-functionality
module.exports = function(args) {
    console.log('*** onResponse called for create ****: ' + JSON.stringify(args));
    for (var name in args)
    {
        console.log(name);
    }
    console.log('*** onResponse called for create this properties ****:');
    for (var name in this) {
      console.log(name);
    }
    console.log('=============');
};