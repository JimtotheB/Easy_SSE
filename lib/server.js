var express = require('express');
var http = require('http');
var app = express();


var expressConfig = require('./expressConfig')(app);
var expressRoutes = require('./expressRoutes')(app);
var server = http.createServer(app);

server.listen(8080, function serverStarted(){
  console.log("Started server on 8080")
})
