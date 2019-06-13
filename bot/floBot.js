import { options } from './floOptions';
import { handleCommand } from './handleCommand';
import * as tmi from 'tmi.js';

const client = new tmi.client(options);
client.connect();
client.on('connected', onConnectedHandler);
client.on("whisper", async (from, userstate, msg, self) => {
  if (self) { return };
  console.log("from: ", from, "\nuserstate: ", userstate, "\nmsg: ", msg);
  if (options.channelInfo[0].mods.includes(from.substr(1).toLowerCase())) {
    userstate.mod = true;
    handleCommand(client, options.channels[0], userstate, msg, from)
  }
})
client.on("chat", async (channel, userstate, msg, self) => {
  console.log("userstate: ", userstate, "\nmsg: ", msg);
  if (self) { return; }
  handleCommand(client, channel, userstate, msg);
})

/*        OTHER FUNCTIONS        */

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}