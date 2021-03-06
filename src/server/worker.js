var SCWorker = require('socketcluster/scworker');
var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');

const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const router = require('./routes/router');

class Worker extends SCWorker {
  run() {
    console.log(process.cwd());
    console.log('   >> Worker PID:', process.pid);
    var environment = this.options.environment;

    var app = express();

    var httpServer = this.httpServer;
    var scServer = this.scServer;

    if (environment == 'dev') {
      // Log every HTTP request. See https://github.com/expressjs/morgan for other
      // available formats.
      app.use(morgan('dev'));
    }

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended:false }));
    app.use('/', router);
    app.use(serveStatic(path.resolve(__dirname, 'public')));
    

    // Add GET /health-check express route
    healthChecker.attach(this, app);

    httpServer.on('request', app);

    // app.get('*', (req, res) => {
    //   res.sendfile(path.join(__dirname, '/public/index.html'));
    // })

    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', function (socket) {

      // Some sample logic to show how to handle client events,
      // replace this with your own logic

      // socket.on('sampleClientEvent', function (data) {
      //   count++;
      //   console.log('Handled sampleClientEvent', data);
      //   scServer.exchange.publish('sample', count);
      // });
      const { attachSocket } = require('./queue');
      
      attachSocket((event, data) => {
        socket.emit(event, data);
      });

      socket.on('test', (data) => {
        console.log(data.mes);
        socket.emit('test', { mes: data.mes });
      });

      console.log('someone');

      var interval = setInterval(function () {
        socket.emit('rand', {
          rand: Math.floor(Math.random() * 5)
        });
      }, 1000);

      socket.on('disconnect', function () {
        clearInterval(interval);
      });
    });
  }
}

module.exports = new Worker();
