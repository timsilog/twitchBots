'use strict';

var _floOptions = require('./floOptions');

var _handleCommand = require('./handleCommand');

var _tmi = require('tmi.js');

var tmi = _interopRequireWildcard(_tmi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    (0, _handleCommand.handleCommand)(client, _floOptions.options.channels[0], userstate, msg, from);
  }
});
client.on("chat", async function (channel, userstate, msg, self) {
  console.log("userstate: ", userstate, "\nmsg: ", msg);
  if (self) {
    return;
  }
  (0, _handleCommand.handleCommand)(client, channel, userstate, msg);
});

/*        OTHER FUNCTIONS        */

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
  console.log('Connected to ' + addr + ':' + port);
}