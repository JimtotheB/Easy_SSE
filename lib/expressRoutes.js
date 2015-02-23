var router = require('express').Router();
var routes = {};
var events = require('events').EventEmitter
var ServerEvents = new events();

var eventData = {};
eventData.triggerCount = 0;
eventData.clientCount = 0;

module.exports = function expressRoutes(app){

  app.get('/', routes.index);
  app.get('/trigger', routes.trigger);
  app.get('/event-stream', routes.events);
  app.use('/', router);

  return router
};

routes.index = function(req, res){
  res.render('index')
};

routes.trigger = function(req, res){
  eventData.triggerCount = eventData.triggerCount += 1
  eventData.memUsage = process.memoryUsage()
  ServerEvents.emit('incoming');
  console.log('Trigger count: ' + eventData.triggerCount)
  res.json({status: "success"});
};

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


  /*
   * Store a reference to out event handler so we can bind and unbind it
   * in the correct context. Otherwise it will fire for every client that has ever connected to
   * this event stream.
   */
  var handleIncoming = function(){
    /* event: allows you to bind to a specific event on the client side.
     * This allows you to handle multiple event streams easily from one endpoint.
     */
    res.write('event: incoming\n');
    res.write('data: ' + JSON.stringify(eventData) + '\n\n');
  };

  /*
   * Bind handleIncoming
   */
  ServerEvents.addListener('incoming', handleIncoming)

  /*
   * Unbind handleIncoming when the client closes the browser window.
   */
  req.on('close', function(){
    eventData.clientCount = eventData.clientCount -= 1;
    ServerEvents.emit('incoming')
    ServerEvents.removeListener('incoming', handleIncoming);
  })

  /*
   * Lets tell everyone we connected, (ourself included)
   */
  ServerEvents.emit('incoming');

};