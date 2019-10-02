'use strict';

var _floOptions = require('./floOptions');

var _handleCommand = require('./handleCommand');

var _tmi = require('tmi.js');

var tmi = _interopRequireWildcard(_tmi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var webSocketServerPort = 8000;
var webSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer();
server.listen(webSocketServerPort);
var wsServer = new webSocketServer({
  httpServer: server
});

var wsClients = {};
var getUniqueID = function getUniqueID() {
  var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  return s4() + s4() + '-' + s4();
};

wsServer.on('request', function (request) {
  // console.log("*** REQUEST: ***");
  // console.log(request);
  var userID = getUniqueID();
  console.log(new Date() + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  var connection = request.accept(null, request.origin);
  wsClients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(wsClients));
  connection.on('close', function (connection) {
    console.log(new Date() + " Peer " + userID + " disconnected.");
    delete wsClients[userID];
  });
});

var client = new tmi.client(_floOptions.options);
client.connect();
client.on('connected', onConnectedHandler);
client.on("whisper", async function (from, userstate, msg, self) {
  if (self) {
    return;
  };
  console.log("from: ", from, "\nuserstate: ", userstate, "\nmsg: ", msg);
  if (_floOptions.options.channelInfo[0].mods.includes(from.substr(1).toLowerCase())) {
    userstate.mod = true;
    (0, _handleCommand.handleCommand)(client, _floOptions.options.channels[0], userstate, msg, wsClients, from);
  }
});
client.on("chat", async function (channel, userstate, msg, self) {
  console.log("userstate: ", userstate, "\nmsg: ", msg);
  if (self) {
    return;
  }

  (0, _handleCommand.handleCommand)(client, channel, userstate, msg, wsClients);
});

/*        OTHER FUNCTIONS        */

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
  console.log('Connected to ' + addr + ':' + port);
}