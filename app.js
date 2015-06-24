var _ = require('lodash');
var express = require('express');
var knox = require('knox');
var logger = require('morgan');

var config = require('./config');

var s3 = knox.createClient(_.pick(config.info(), 'key', 'secret', 'bucket'));

var crashError = new Error('crashing');
crashError.name = 'WrenchInTheWorks';

var app = express();

logger.token('pid', function() { return process.pid; });

app.use(logger('[worker::pid] :method :url :status :response-time ms - :res[content-length]'));

app.get('/_health', function(req, res) {
  res.status(200).send('ok');
});
app.get('/_crash', function(req, res) {
  throw crashError;
});
app.get('*', function(req, res) {
  s3.getFile(req.originalUrl, function(err, stream) {
    if (err) { throw err; }
    res.status(stream.statusCode);
    stream.pipe(res);
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if (err === crashError) {
    res.send('crashing');
    setImmediate(function() { process.exit(1); });
  }
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
