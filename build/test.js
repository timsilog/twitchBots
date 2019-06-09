'use strict';

var _options = require('./options');

var _twitchJs = require('twitch-js');

var _twitchJs2 = _interopRequireDefault(_twitchJs);

require('isomorphic-fetch');

var _fetch = require('twitch-js/lib/utils/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const client = new tmi.client(options);
var id = '168964708';
// import {friends} from './friends';
// import * as tmi from 'tmi.js';

var user = _options.options.identity.username;
var channel = _options.options.channels[0];
// let token = options.token.access;
var token = 'temp';
var Twitch = new _twitchJs2.default({ token: token, user: user, onAuthenticationFailure: onAuthenticationFailure });
// const chat = Twitch.chat;

var onAuthenticationFailure = function onAuthenticationFailure() {
    (0, _fetch2.default)('https://id.twitch.tv/oauth2/token', {
        method: 'post',
        search: {
            grant_type: 'refresh_token',
            refresh_token: _options.options.token.refresh,
            client_id: _options.options.client.id,
            client_secret: _options.options.client.secret
        }
    }).then(function (response) {
        return response.access_token;
    });
};

var getNewAuthToken = async function getNewAuthToken() {
    var token = await (0, _fetch2.default)('https://id.twitch.tv/oauth2/token', {
        method: 'post',
        search: {
            grant_type: 'refresh_token',
            refresh_token: _options.options.token.refresh,
            client_id: _options.options.client.id,
            client_secret: _options.options.client.secret
        }
    });
    Twitch.updateOptions({ token: token.accessToken });
    // Twitch.chat.reconnect();
};

var main = async function main() {

    var globalUserState = await Twitch.chat.connect();
    // console.log(globalUserState);
    console.log(Twitch.chat);
    Twitch.chat.join(channel, function (channelState) {
        console.log(channelState);
    });
    Twitch.chat.on('*', async function (msg) {
        console.log(msg);
        Twitch.chat.say(channel, 'hello world').catch(function (err) {
            return getNewAuthToken();
        });
    });
};

main();
// client.connect();

// client.on('connected', onConnectedHandler);

// client.on("chat", (channel, userstate, msg, self) => {
//     console.log("channel: ", channel, "\nuserstate: ", userstate, "\nmsg: ", msg, "\nself: ", self);
//     if (self) { return; }

//     let command = msg.split(' ');
//     console.log(command);
//     if (command[0] === '!join') {
//         if (queue.includes(userstate['display-name'])) { return; }
//         if (command[1]) {
//             friends[command[1]] = command[2];
//             queue.push(userstate['display-name']);
//         } else {
//             if (friends[userstate['display-name']]) {
//                 queue.push(userstate['display-name']);
//             }
//         }
//     }

//     if (command[0] === '!bandorid') {
//         client.say(user, "Tim: 1687640 - Gen: 1264987");
//     }

//     if (command[0] === '!party') {
//         if (!queue.length) {
//             client.say(user, "There's nobody playing with us right now! Join the party with '!join'.");
//         }
//         msg = 'Current Bandori Party: ';
//         for (let i = 0; i < 3; i++) {
//             if (queue[i]) {
//                 msg += queue[i] + ' ';
//             }
//         }
//         client.say(user, msg);
//     }

//     if (command[0] === '!list') {
//         msg = 'Current Bandori Party: ';
//         for (let user in queue) {
//             msg += user + ' ';
//         }
//         client.say(user, msg);
//     }

//     // MOD-ONLY COMMANDS
//     if (command[0] === '!next' && (userstate.mod || userstate['user-id'] === id)) {
//         queue.shift();
//     }

//     if (command[0] === '!nextround' && (userstate.mod || userstate['user-id'] === id)) {
//         queue.shift();
//         queue.shift();
//         queue.shift();
//     }

// });

// setInterval(() => {
//     let msg;

//     switch (counter) {
//         case 0:
//             const url = `https://api.twitch.tv/helix/users/follows?to_id=${id}`;

//             fetch(url, {
//                 method: "GET",
//                 headers: {
//                     'Client-ID': '2i6lmcowdx4v4xd45t21q2h3zcheqf',
//                 }
//             }).then(response => {
//                 response.json().then(data => {
//                     // console.log('RESPONSE:', data);
//                     msg = `Hey guys! Huge thanks to everyone who helped us get to affiliate! Don't forget to follow if you haven't done so yet :)`;
//                     client.say(user, msg);
//                 })
//             });
//             counter++;
//             break;
//         case 1:
//             msg = "Don't by shy to drop a message here and chat with us! We love to engage with all of our viewers <3";
//             client.say(user, msg);
//             counter++;
//             break;
//         case 2:
//             msg = "Catch us every Sunday & Monday at 1:00pm PST! Don't forget every stream ends with rhythm games!";
//             client.say(user, msg);
//             counter = 0;
//             break;
//         default:
//             console.log("blah");
//     }
// }, 900000);