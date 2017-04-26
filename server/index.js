Server = require('./src/server');

global.server = new Server();
global.server.start();

process.on('exit', function(code) {
  console.info('Exiting with code:', code);
});

process.on('SIGINT', function() {
  console.info('Caught interrupt signal');
  global.server.stop();
  process.exit();
});

process.on('unhandledRejection', function (err) {
  console.error('unhandled rejection', err);
});

process.on('uncaughtException', function (err) {
  console.error('unhandled exception', err);
});