import { options } from './floOptions';
import { handleCommand } from './handleCommand';
import * as tmi from 'tmi.js';

const webSocketServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
const server = http.createServer();
server.listen(webSocketServerPort);
const wsServer = new webSocketServer({
  httpServer: server
})

const wsClients = {};
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

wsServer.on('request', function (request) {
  // console.log("*** REQUEST: ***");
  // console.log(request);
  var userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  wsClients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(wsClients))
  connection.on('close', function (connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    delete wsClients[userID];
  });
});

const client = new tmi.client(options);
client.connect();
client.on('connected', onConnectedHandler);
client.on("whisper", async (from, userstate, msg, self) => {
  if (self) { return };
  console.log("from: ", from, "\nuserstate: ", userstate, "\nmsg: ", msg);
  if (options.channelInfo[0].mods.includes(from.substr(1).toLowerCase())) {
    userstate.mod = true;
    handleCommand(client, options.channels[0], userstate, msg, wsClients, from)
  }
})
client.on("chat", async (channel, userstate, msg, self) => {
  console.log("userstate: ", userstate, "\nmsg: ", msg);
  if (self) { return; }

  handleCommand(client, channel, userstate, msg, wsClients);
})

/*        OTHER FUNCTIONS        */

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}
