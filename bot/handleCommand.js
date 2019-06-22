import * as fs from 'fs';
import 'isomorphic-fetch';
import { options } from './floOptions';

const data = JSON.parse(fs.readFileSync(`${__dirname}/../floData.json`));
let queue = [];
let apiQueue = [];
let friends = data.fortniteFriends;
let status = true;
let verbose = true;
let limit = 10;
let reminderInterval = 1200000; // 20 mins
let autoListInterval = 600000; // 10 mins
let reminderId;
let autoListId;
let mode = 'follower';
let counter = 0;
let followLock = false;

export const handleCommand = async (client, channel, userstate, msg, whisperTo) => {
  let command = msg.toLowerCase().split(' ');
  const joiner = userstate['display-name'].toLowerCase();

  if (command[0] === '!status') {
    if (status) {
      client.say(channel, `The queue is open! Party up bois!`)
    } else {
      client.say(channel, `The queue is closed. It's floskeee time!`)
    }
  }
  // !join <username?>
  if (command[0] === '!join' && status) {
    // if already in queue
    if (queue.filter(player => player.twitch === joiner).length > 0) {
      if (command[1]) {
        friends[joiner] = command.slice(1).join(' ');
        updateData();
      }
      if (verbose) {
        let spot = queue.findIndex(player => player.twitch === joiner);
        if (spot >= 0) {
          client.say(channel, `${userstate['display-name']}, you are number ${spot + 1} in line.`)
        }
      }
      return;
    }
    joinParty(client, userstate, channel, command);
  }
  if (command[0] === '!dropme') {
    const i = queue.findIndex(player => player.twitch === joiner);
    if (i > -1) {
      const removed = queue.splice(i, 1);
      if (removed.length && verbose) {
        client.say(channel, `Removed ${userstate['display-name']}`);
      }
    }
  }
  if (command[0] === '!spot') {
    let spot = queue.findIndex(player => player.twitch === joiner);
    if (spot >= 0) {
      client.say(channel, `${userstate['display-name']} is number ${spot + 1} in line.`)
    } else {
      client.say(channel, `${userstate['display-name']}, you're not in the queue. Type !join to enter!`)
    }
  }
  // MOD-ONLY COMMANDS
  if (userstate.mod || isBc(userstate)) {
    // set queue mode
    if (command[0] === '!mode' && command.length > 1) {
      switch (command[1]) {
        case 'public':
          mode = "public";
          if (verbose) {
            client.say(channel, `The queue is now public. Anyone can join!`);
          }
          break;
        case 'follower':
          mode = "follower";
          if (verbose) {
            client.say(channel, `The queue is now followers only.`);
          }
          break;
        case 'sub':
          mode = "sub";
          if (verbose) {
            client.say(channel, `The queue is now subscribers only`);
          }
          break;
      }
    }
    // toggle reminder
    if (command[0] === '!remind') {
      if (command[1] === 'restart') {
        clearTimeout(reminderId);
        reminderId = null;
      } else if (reminderId) {
        clearTimeout(reminderId);
        reminderId = null;
        client.whisper(userstate['display-name'], `Reminders disabled`);
        return;
      }
      client.whisper(userstate['display-name'], `Reminders have been enabled for every ${reminderInterval / 60000} minutes.`)
      reminders(channel, client, true);
    }
    // set remind interval
    if (command[0] === '!remind-interval') {
      if (!command[1]) {
        client.whisper(userstate['display-name'], `Reminders occur every ${reminderInterval / 60000} minutes.`);
        return;
      }
      if (/^\d+$/.test(command[1])) {
        reminderInterval = command[1] * 60000;
        client.whisper(userstate['display-name'], `Reminders will occur every ${command[1]} minutes after the next.`);
      } else {
        client.whisper(userstate['display-name'], `${command[1]} isn't a valid time. Please enter an integer in minutes`)
      }
    }
    // toggle auto !list
    if (command[0] === '!autolist') {
      if (command[1] && /^\d+$/.test(command[1])) {
        autoListInterval = command[1] * 60000;
      }
      if (autoListId) {
        clearTimeout(autoListId);
        autoListId = null;
        client.whisper(userstate['display-name'], `Auto-list has been disabled`);
        return;
      }
      client.say(channel, getList());
      autoList(channel, client);
      client.whisper(userstate['display-name'], `Auto-list has been enabled for every ${autoListInterval / 60000} minutes.`);
    }
    // set autolist interval
    if (command[0] === '!autolist-interval') {
      if (!command[1]) {
        client.whisper(userstate['display-name'], `Auto list interval is set to every ${autoListInterval / 60000} minutes.`);
        return;
      }
      if (command[1] && /^\d+$/.test(command[1])) {
        autoListInterval = command[1] * 60000;
        client.whisper(userstate['display-name'], `Auto list interval set to ${command[1]} minutes. Sets after next execution.`);
      } else {
        client.whisper(userstate['display-name'], `${command[1]} is not a valid number. Please enter a time in minutes.`);
      }
    }
    // print the list
    if (command[0] === '!list') {
      client.whisper(options.channels[0], getList(true));
      client.say(channel, getList(command[1]));
    }
    // toggle verbosity
    if (command[0] === '!verbose') {
      verbose = !verbose;
      client.say(channel, verbose ? `I'll talk more` : `I'll talk less`);
    }
    // open the queue
    if (command[0] === '!open') {
      status = true;
      if (verbose) {
        client.say(channel, `The queue is open! Party up bois!`);
      }
    }
    if (command[0] === '!close') {
      status = false;
      if (verbose) {
        client.say(channel, `The queue is closed. It's just floskeee time now!`)
      }
    }
    if (command[0] === '!current') {
      if (queue.length) {
        client.say(channel, `Hi ${queue[0].twitch} (${queue[0].ign}), it's your turn!`)
      } else if (verbose) {
        client.say(channel, `Queue is empty`);
      }
    }
    if (command[0] === '!next') {
      client.say(channel, `Removed ${queue[0].twitch}`);
      if (!queue.length) { return };
      queue.shift();
    }
    // !setlimit <number>
    if (command[0] === '!setlimit' && command.length > 1) {
      if (/^\d+$/.test(command[1])) {
        limit = command[1];
        client.whisper(userstate['display-name'], `Queue limit has been set to ${limit}`);
      }
    }
    if (command[0] === '!limit') {
      client.say(channel, `Queue limit is ${limit}`);
    }
    if (command[0] === '!clear' && queue.length) {
      queue = [];
      if (verbose) {
        client.say(channel, `Emptied the queue!`);
      }
    }
    if (command[0] === '!skip' && queue.length > 0) {
      if (verbose) {
        client.say(channel, `${queue[0].twitch}, to the end of the line you go!`);
      }
      queue.push(queue.shift());
    }
    // !add <user> <position?>
    if (command[0] === '!add' && command.length > 1) {
      if (queue.filter(player => player.twitch === command[1]).length > 0) { return; }
      if (friends[command[1]]) {
        if (command[2] && /^\d+$/.test(command[2]) && command[2] <= limit) {
          queue.splice(command[2] - 1, 0, { twitch: command[1], ign: friends[command[1]] });
          if (verbose) {
            client.say(channel, `Added ${command[1]} to position ${command[2] > queue.length ? queue.length : command[2]} in line.`);
          }
          return;
        } else if (command[2]) {
          if (verbose) {
            client.say(channel, `${command[2]} isn't a valid place in line`);
          }
          return;
        } else {
          queue.push({ twitch: command[1], ign: friends[command[1]] });
          if (verbose) {
            client.say(channel, `Added ${command[1]} to position ${queue.length}`);
          }
        }
      } else {
        if (verbose) {
          client.say(channel, `Sorry ${userstate['display-name']}, I don't have ${command[1]}'s username. Use '!store' to add them to my database`)
        }
      }
    }
    if (command[0] === '!massadd' && command.length > 1) {
      let succ = [];
      let fail = [];
      command.slice(1).forEach(twitchUser => {
        if (queue.filter(player => player.twitch === twitchUser).length > 0) {
          fail.push(twitchUser)
          return;
        }
        if (friends[twitchUser]) {
          queue.push({ twitch: twitchUser, ign: friends[twitchUser] });
          succ.push(twitchUser);
        } else {
          fail.push(twitchUser);
        }
      });
      if (succ.length) {
        client.whisper(userstate['display-name'], `Added: ${succ.join(' ')}`);
      }
      if (fail.length) {
        client.whisper(userstate['display-name'], `Failed: ${fail.join(' ')}`);
      }
    }
    // !store <user> <username>
    // Adds or edits a user in the database
    if (command[0] === '!store' && command.length > 2) {
      friends[command[1]] = command.slice(2).join(' ');;
      updateData();
      client.whisper(userstate['display-name'], `Added ${command[1]} to the database`);
    }
    // !drop <user>
    if (command[0] === '!drop') {
      if (command[1]) {
        let spot = queue.findIndex(player => player.twitch === command[1]);
        if (spot >= 0) {
          queue.splice(spot, 1);
          if (verbose) {
            client.say(channel, `Dropped ${command[1]}`);
          }
        }
      } else {
        if (!queue.length) { return };
        if (verbose) {
          client.say(channel, `Dropped ${queue[0].twitch}`);
        }
        queue.shift();
      }
    }
  }
};

const reminders = async (channel, client, first) => {
  let msg;
  if (first) {
    msg = "ATTENTION: If you have not FOLLOWED yet, PLEASE DO :) Floskeee would be so happy <3 Thank you!";
    client.say(channel, msg);
  }
  reminderId = setTimeout(() => {
    switch (counter) {
      case 0:
        msg = `Talking in the chat will help Flo remember who you are. She likes it when everyone interacts with each other <3`;
        client.say(channel, msg);
        counter++;
        break;
      case 1:
        msg = "ATTENTION: If you have not FOLLOWED yet, PLEASE DO :) Floskeee would be so happy <3 Thank you!";
        client.say(channel, msg);
        counter = 0;
        break;
    }
    reminders(channel, client);
  }, reminderInterval);
}

const fetchTwitch = async (url) => {
  const response = await fetch(`https://api.twitch.tv/helix/${url}`, {
    method: "GET",
    headers: {
      'Client-ID': options.options.clientId,
    }
  });
  return await response.json();
}

const updateData = () => {
  fs.writeFileSync(`${__dirname}/../floData.json`, JSON.stringify({ fortniteFriends: friends }));
}

const isBc = userstate => userstate['user-id'] === options.channelInfo[0].user_id;

const autoList = (channel, client) => {
  autoListId = setTimeout(() => {
    client.say(channel, getList());
    autoList(channel, client);
  }, autoListInterval);
}

const getList = showAll => {
  if (!queue.length) {
    return "There's nobody playing with us right now! Join the party with '!join username'.";
  }
  let msg = 'Current Line: ';
  msg = queue.reduce((a, c, i) => {
    if (showAll) {
      a += c.twitch === c.ign ? c.twitch : `${c.twitch} (${c.ign})`;
    } else {
      a += c.twitch;
    }
    if (i < queue.length - 1) {
      a += ', ';
    }
    return a;
  }, msg);
  return msg;
}

const joinParty = async (client, userstate, channel, command) => {
  if (followLock) {
    console.log("waiting");
    setTimeout(() => {
      joinParty(client, userstate, channel, command);
    }, 100);
    return;
  }
  if (mode === 'follower') {
    followLock = true;
    let followed = await fetchTwitch(`users/follows?to_id=${options.channelInfo[0].user_id}&from_id=${userstate['user-id']}`);
    setTimeout(() => { followLock = false; }, 1000);
    if (!followed.total) {
      if (verbose) {
        client.say(channel, `Sorry ${userstate['display-name']}, you must be a follower to join the queue!`);
      }
      return;
    }
  } else if (mode === 'sub') {
    if (!userstate.subscriber) {
      if (verbose) {
        client.say(channel, `Sorry ${userstate['display-name']}, you must be a subscriber to join the queue!`);
      }
      return;
    }
  }
  const joiner = userstate['display-name'].toLowerCase();
  if (queue.length === limit) {
    if (verbose) {
      client.say(channel, `Sorry ${userstate['display-name']}, the queue is full!`);
    }
    return;
  }
  if (!friends[joiner] && command.length < 2) {
    if (verbose) {
      client.say(channel, `${joiner}, Flo needs your username just once! Type '!join username', then you can use '!join' every time after that.`);
    }
    return;
  }
  if (command[1]) {
    friends[joiner] = command.slice(1).join(' ');;
    updateData();
    queue.push({ twitch: joiner, ign: command[1] });
  } else {
    queue.push({ twitch: joiner, ign: friends[joiner] });
  }
  if (verbose) {
    client.say(channel, `${userstate['display-name']} joined the party! You are number ${queue.length} in line.`);
  }
}