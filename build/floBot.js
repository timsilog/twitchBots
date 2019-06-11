'use strict';

var _floOptions = require('./floOptions');

var _tmi = require('tmi.js');

var tmi = _interopRequireWildcard(_tmi);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

require('isomorphic-fetch');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var client = new tmi.client(_floOptions.options);
var broadcaster = 'floskeee';
var data = JSON.parse(fs.readFileSync(__dirname + '/../floData.json'));
var defaultMsgInterval = 1200000; // 20 mins
var queue = [];
var friends = data.fortniteFriends;
var status = true;
var verbose = true;
var limit = 10;

client.connect();
client.on('connected', onConnectedHandler);
client.on("whisper", async function (from, userstate, msg, self) {
  if (self) {
    return;
  };
  client.whisper(from, "hello");
});
client.on("chat", async function (channel, userstate, msg, self) {
  console.log("userstate: ", userstate, "\nmsg: ", msg);
  if (self) {
    return;
  }

  var command = msg.toLowerCase().split(' ');
  var joiner = userstate['display-name'].toLowerCase();

  if (command[0] === '!status') {
    if (status) {
      client.say(channel, 'The queue is open! Party up bois!');
    } else {
      client.say(channel, 'The queue is closed. It\'s just floskeee today!');
    }
  }
  // !join <username?>
  if (command[0] === '!join' && status) {
    if (queue.filter(function (player) {
      return player.twitch === joiner;
    }).length > 0) {
      if (command[1]) {
        friends[joiner] = command.slice(1).join(' ');;
        updateData();
      }
      if (verbose) {
        var spot = queue.findIndex(function (player) {
          return player.twitch === joiner;
        });
        if (spot >= 0) {
          client.say(channel, userstate['display-name'] + ', you are number ' + (spot + 1) + ' in line.');
        }
      }
      return;
    }
    if (queue.length === limit && verbose) {
      client.say(channel, 'Sorry ' + userstate['display-name'] + ', the queue is full!');
      return;
    }
    if (!friends[joiner] && command.length < 2) {
      if (verbose) {
        client.say(channel, joiner + ', Flo needs your username just once! Type \'!join <username>\', then you can use \'!join\' every time after that.');
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
      client.say(channel, userstate['display-name'] + ' joined the party!');
    }
  }
  if (command[0] === '!list') {
    if (!queue.length) {
      client.say(channel, "There's nobody playing with us right now! Join the party with '!join <username>'.");
      return;
    }
    var _msg = 'Current Line: ';
    _msg = queue.reduce(function (a, c, i) {
      a += c.twitch === c.ign ? c.twitch : c.twitch + ' (' + c.ign + ')';
      if (i < queue.length - 1) {
        a += ', ';
      }
      return a;
    }, _msg);
    client.say(channel, _msg);
  }
  if (command[0] === '!dropme') {
    queue.splice(queue.findIndex(function (player) {
      return player.name === joiner;
    }));
    client.say(channel, 'Dropped ' + userstate['display-name']);
  }
  if (command[0] === '!spot') {
    var _spot = queue.findIndex(function (player) {
      return player.twitch === joiner;
    });
    if (_spot >= 0) {
      client.say(channel, userstate['display-name'] + ' is number ' + (_spot + 1) + ' in line.');
    }
  }
  // MOD-ONLY COMMANDS
  if (userstate.mod || isBc(userstate)) {
    // toggle verbosity
    if (command[0] === '!verbose') {
      verbose = !verbose;
      client.say(channel, verbose ? 'I\'ll talk more' : 'I\'ll talk less');
    }
    if (command[0] === '!open' && !status) {
      status = true;
      if (verbose) {
        client.say(channel, 'The queue is open! Party up bois!');
      }
    }
    if (command[0] === '!close') {
      status = false;
      if (verbose) {
        client.say(channel, 'The queue is closed. It\'s just floskeee time now!');
      }
    }
    if (command[0] === '!current') {
      if (queue.length) {
        client.say(channel, 'Hi ' + queue[0].twitch + ' (' + queue[0].ign + '), get yo ass in here. Thanks!');
      } else if (verbose) {
        client.say(channel, 'Queue is empty');
      }
    }
    if (command[0] === '!next') {
      if (!queue.length) {
        return;
      };
      queue.shift();
    }
    // !setlimit <number>
    if (command[0] === '!setlimit' && command.length > 1) {
      if (/^\d+$/.test(command[1])) {
        limit = command[1];
        client.say(channel, 'Queue limit has been set to ' + limit);
      }
    }
    if (command[0] === '!limit') {
      client.say(channel, 'Queue limit is ' + limit);
    }
    if (command[0] === '!clear' && queue.length) {
      queue = [];
      if (verbose) {
        client.say(channel, 'Emptied the queue!');
      }
    }
    if (command[0] === '!skip' && queue.length > 0) {
      if (verbose) {
        client.say(channel, queue[0].twitch + ', to the end of the line you go!');
      }
      queue.push(queue.shift());
    }
    // !add <user> <position?>
    if (command[0] === '!add' && command.length > 1) {
      if (queue.filter(function (player) {
        return player.twitch === command[1];
      }).length > 0) {
        return;
      }
      if (friends[command[1]]) {
        if (command[2] && /^\d+$/.test(command[2]) && command[2] <= limit) {
          queue.splice(command[2] - 1, 0, { twitch: command[1], ign: friends[command[1]] });
          if (verbose) {
            client.say(channel, 'Added ' + command[1] + ' to position ' + (command[2] > queue.length ? queue.length : command[2]) + ' in line.');
          }
          return;
        } else if (command[2]) {
          if (verbose) {
            client.say(channel, command[2] + ' isn\'t a valid place in line');
          }
          return;
        } else {
          queue.push({ twitch: command[1], ign: friends[command[1]] });
          if (verbose) {
            client.say(channel, 'Added ' + command[1] + ' to position ' + queue.length);
          }
        }
      } else {
        if (verbose) {
          client.say(channel, 'Sorry ' + userstate['display-name'] + ', I don\'t have ' + command[1] + '\'s username. Use \'!store\' to add them to my database');
        }
      }
    }
    // !store <user> <username>
    // Adds or edits a user in the database
    if (command[0] === '!store' && command.length > 2) {
      friends[command[1]] = command.slice(2).join(' ');;
      updateData();
    }
    // !drop <user>
    if (command[0] === '!drop' && command.length > 1) {
      var _spot2 = queue.findIndex(function (player) {
        return player.twitch === command[1];
      });
      if (_spot2 >= 0) {
        queue.splice(_spot2);
        if (verbose) {
          client.say(channel, 'Removed ' + command[1]);
        }
      }
    }
  }
});

/*        OTHER FUNCTIONS        */

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
  console.log('Connected to ' + addr + ':' + port);
}

var defaultMsgs = async function defaultMsgs() {
  var msg = void 0;
  switch (counter) {
    case 0:
      var _data = await fetchTwitch('users/follows?to_id=' + _floOptions.options.channelInfo[0].user_id);
      // console.log(data);
      msg = 'Talking in the chat will help Flo remember who you are. She likes it when everyone interacts with each other.';
      client.say(user, msg);
      counter++;
      break;
    case 1:
      msg = "ATTENTION: If you have not FOLLOWED yet, PLEASE DO :) Floskeee would be so happy <333 Thank you!";
      client.say(user, msg);
      counter = 0;
      break;
    default:
      console.log("shouldn't ever get here");
  }
};

setTimeout(defaultMsgs, verbose ? defaultMsgInterval : defaultMsgInterval * 2);

var fetchTwitch = async function fetchTwitch(url) {
  var response = await fetch('https://api.twitch.tv/helix/' + url, {
    method: "GET",
    headers: {
      'Client-ID': _floOptions.options.client.id
    }
  });
  return await response.json();
};

var updateData = function updateData() {
  fs.writeFileSync(__dirname + '/../floData.json', JSON.stringify({ fortniteFriends: friends }));
};

var isBc = function isBc(userstate) {
  return userstate['user-id'] === _floOptions.options.channelInfo[0].user_id;
};