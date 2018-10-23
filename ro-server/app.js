// <!-- * Copyright (c) [2018], Forest Schwartz. All rights reserved
// *
// * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author. -->



var request = require('request');
var express = require('express');
var timeout = require('connect-timeout'); //express v4


var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');

var index = require('./routes/index');
var users = require('./routes/users');


var app = express();


// app.use(timeout(10000000));
app.options('*', cors()); // include before other routes


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));



// https.createServer({
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// }, app).listen(3000);

// Websites will deny requests from certain places not specified by the access-control-allow-origin
// therefore this must be included in order to specify where requests can come from
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// Remeber to put routing before any error messages
app.get('/',function(req,res){
  // var ro = new route_optimizer();
  // ro.contact_datastore();
  res.send("got through to get");

  });

app.post('/',function(req,res){
  req.setTimeout(0);
   console.log("Inside Server");
   var computer = require("./optimization-interface/cpp/build/Release/Node_Linker");
   var json_data = computer.compute_link(req.body);
   console.log("finished c++ code");
   res.write(json_data);
   res.end();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(80);
