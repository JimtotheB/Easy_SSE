var path = require('path');
var cwd = process.cwd();
var static = require('express').static;

module.exports = function expressConfig(app){
  app.use(static(path.join(cwd, 'public')))
  app.set('views', path.join(cwd, 'public', 'views'));
  app.set('view engine', 'jade')
}