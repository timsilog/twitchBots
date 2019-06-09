import { options } from './floOptions';
import * as tmi from 'tmi.js';
import * as fs from 'fs';
import 'isomorphic-fetch';

const client = new tmi.client(options);
const user = options.channels[0];
const broadcaster = 'floskeee';
const data = JSON.parse(fs.readFileSync(`${__dirname}/../floData.json`));
let queue = [];
let friends = data.fortniteFriends;
let status = true;
let limit = 10;

client.connect();
client.on('connected', onConnectedHandler);
client.on("chat", async (channel, userstate, msg, self) => {
  console.log("channel: ", channel, "\nuserstate: ", userstate, "\nmsg: ", msg, "\nself: ", self);
  if (self) { return; }

  let command = msg.toLowerCase().split(' ');
  console.log(command);
  const joiner = userstate['display-name'].toLowerCase();

  if (command[0] === '!status') {
    if (status) {
      client.say(user, `The queue is open! Party up bois!`)
    } else {
      client.say(user, `The queue is closed. It's just floskeee today!`)
    }
  }

  // MOD ONLY COMMANDS
  if (command[0] === '!open' && !status && (userstate.mod || isBc(userstate))) {
    status = true;
    client.say(user, `The queue is open! Party up bois!`);
  }



  // QUEUE COMMANDS
  if (status) {
    // !join <username>
    if (command[0] === '!join') {
      if (queue.filter(player => player.twitch === joiner).length > 0) { return; }
      if (queue.length === limit) {
        client.say(user, `Sorry ${userstate['display-name']}, the queue is full!`);
        return;
      }
      if (!friends[joiner] && command.length < 2) {
        client.say(user, `${joiner}, Flo needs your username just once! Type '!join <username>', then you can use '!join' every time after that.`);
        return;
      }
      if (command[1]) {
        friends[joiner] = command.slice(1).join(' ');;
        updateData();
        queue.push({ twitch: joiner, game: command[1] });
      } else {
        queue.push({ twitch: joiner, game: friends[joiner] });
      }
    }

    if (command[0] === '!list') {
      if (!queue.length) {
        client.say(user, "There's nobody playing with us right now! Join the party with '!join <inGame_name>'.");
        return;
      }
      let msg = 'Current Line: ';
      msg = queue.reduce((a, c, i) => {
        a += c.twitch === c.game ? c.twitch : `${c.twitch} (${c.game})`;
        if (i < queue.length - 1) {
          a += ', ';
        }
        return a;
      }, msg);
      client.say(user, msg);
    }

    if (command[0] === '!dropme') {
      queue.splice(queue.findIndex(player => player.name === joiner));
    }

    if (command[0] === '!spot') {
      let spot = queue.findIndex(player => player.twitch === joiner);
      if (spot >= 0) {
        client.say(user, `${userstate['display-name']} is number ${spot + 1} in line.`)
      }
    }
    // MOD-ONLY COMMANDS
    if (userstate.mod || isBc(userstate)) {
      if (command[0] === '!close') {
        status = false;
        queue = [];
        client.say(user, `The queue is closed. It's just floskeee time now!`)
      }
      if (command[0] === '!next') {
        if (!queue.length) { return };
        client.say(user, `Hi ${queue[0].twitch}, get yo ass in here. Thanks!`)
        queue.shift();
      }
      // !setlimit <number>
      if (command[0] === '!setlimit' && command.length > 1) {
        if (/^\d+$/.test(command[1])) {
          limit = command[1];
          client.say(user, `Queue limit has been set to ${limit}`);
        }
      }
      if (command[0] === '!clear' && queue.length) {
        queue = [];
        client.say(user, `The queue has been cleared.`);
      }
      if (command[0] === '!skip' && queue.length > 0) {
        client.say(user, `${queue[0].twitch}, to the end of the line you go!`);
        queue.push(queue.shift());
      }
      if (command[0] === '!add' && command.length > 1) {
        if (friends[command[1]]) {
          if (command[2] && /^\d+$/.test(command[2] && command[2] <= limit)) {
            queue.splice(command[2] - 1, 0, { twitch: command[1], game: friends[command[1]] });
            client.say(user, `Added ${command[1]} to position ${command[2] > queue.length ? queue.length : command[2]} in line.`);
            return;
          } else if (command[2]) {
            client.say(user, `${command[2]} isn't a valid place in line.`);
            return;
          } else {
            queue.push({ twitch: command[1], game: friends[command[1]] });
            client.say(user, `Added ${command[1]}`);
          }
        } else {

        }
      }
    }
  }
});


/*        OTHER FUNCTIONS  
4364 san miguel circle pittsburg 94565
2164
*/

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
}

const fetchTwitch = async (url) => {
  const response = await fetch(`https://api.twitch.tv/helix/${url}`, {
    method: "GET",
    headers: {
      'Client-ID': options.client.id,
    }
  });
  return await response.json();
}

const updateData = () => {
  fs.writeFileSync(`${__dirname}/../floData.json`, JSON.stringify({ fortniteFriends: friends }));
}

const isBc = userstate => userstate['user-id'] === options.channelInfo[0].user_id;