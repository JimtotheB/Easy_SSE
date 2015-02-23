var router = require('express').Router();
var routes = {};
var _ = require('lodash');
var request = require('request');
var events = require('events').EventEmitter;
var ServerEvents = new events();

// Set maximum event listeners to unlimited.
ServerEvents.setMaxListeners(0)

var eventData = {};
eventData.triggerCount = 0;
eventData.clientCount = 0;

var redUrls = [
  'https://www.reddit.com/r/node.json',
  'https://www.reddit.com/r/javascript.json',
  'https://www.reddit.com/r/webdev.json'
];

// Using Express Router here.

module.exports = function expressRoutes(app){

  app.get('/', routes.index);
  app.get('/trigger', routes.trigger);
  app.get('/complex', routes.complex)
  app.get('/event-stream', routes.events);
  app.use('/', router);

  return router
};

// Render our main page.

routes.index = function(req, res){
  res.render('index')
};

// Our simple stat gatehering event.

routes.trigger = function(req, res){
  eventData.triggerCount = eventData.triggerCount += 1
  ServerEvents.emit('incoming');
  console.log('Trigger count: ' + eventData.triggerCount)
  res.json({status: "success"});
};

//
// Fetch data from reddit and emit the 'complex' event with the returned json.
//

routes.complex = function(req, res){
  var thisReq = redUrls.pop()
  redUrls.unshift(thisReq)
  request(thisReq, function(err, resp, body){
    var posts = JSON.parse(body);
    var data = JSON.stringify({url: thisReq, posts: posts})
    ServerEvents.emit('complex', data)
    res.json({status: "success"})
  })

};

//
// Event streamer, maintains a persistent connection with the browser.
// Content-Type is 'text/event-stream'
//
// Note: depending on the browser, you will only be able to open a limited number of
// Persistent connections to your server on the same domain. In chrome, I found that I could open
// 5 instances of the page before things went haywire, while the limit is technically 6, on the 6th page
// the browser no longer has any available connections to load page resources with.
//

routes.events = function(req, res){
  eventData.clientCount = eventData.clientCount += 1
  console.log('Client Count: ' + eventData.clientCount)
  req.socket.setTimeout(60 * 60 * 1000);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n')

  // Store a reference to out event handler so we can bind and unbind it
  // in the correct context. Otherwise it will fire for every client that has ever connected to
  // this event stream.
  var handleComplex = function(data){
    res.write('event: complex\n');
    res.write('data: ' + data + '\n\n');
  };

  var handleIncoming = function(){
    eventData.memUsage = process.memoryUsage()
    // event: allows you to bind to a specific event on the client side.
    // This allows you to handle multiple event streams easily from one endpoint.
    res.write('event: incoming\n');
    res.write('data: ' + JSON.stringify(eventData) + '\n\n');
  };

  //
  // Bind our event handlers. Note that it is possible to listen for many different events
  // here, within reason. I dont think stuffing 25 different events into a single endpoint
  // Is appropriate.
  //

  ServerEvents.addListener('incoming', handleIncoming)
  ServerEvents.addListener('complex', handleComplex)

  //
  // Unbind handlers when the client closes the browser window.
  // Obviously we dont want events firing into the void for clients
  // that are no longer connected.
  //

  req.on('close', function(){
    eventData.clientCount = eventData.clientCount -= 1;
    ServerEvents.emit('incoming')
    ServerEvents.removeListener('incoming', handleIncoming);
    ServerEvents.removeListener('complex', handleComplex)
  })

  // Lets tell everyone we connected, (ourself included)

  ServerEvents.emit('incoming');

};