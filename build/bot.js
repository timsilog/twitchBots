'use strict';

var _options = require('./options');

var _tmi = require('tmi.js');

var tmi = _interopRequireWildcard(_tmi);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

require('isomorphic-fetch');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment-precise-range-plugin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var client = new tmi.client(_options.options);
var user = _options.options.channels[0];
var broadcaster = 'gimmedafruitsnacks';
var counter = 0;
var data = JSON.parse(fs.readFileSync(__dirname + '/../data.json'));
var games = data.games;
var snackFacts = Object.assign({}, data.snackFacts);
var availableSnackFacts = Object.assign({}, data.snackFacts);

client.connect();
client.on('connected', onConnectedHandler);
client.on("chat", async function (channel, userstate, msg, self) {
	console.log("channel: ", channel, "\nuserstate: ", userstate, "\nmsg: ", msg, "\nself: ", self);
	if (self) {
		return;
	}

	var command = msg.toLowerCase().split(' ');
	console.log(command);

	if (command[0] === '!bandorid') {
		client.say(user, "Tim: 1687640 - Gen: 1264987");
	}

	if (command[0] === '!uptime' || isUptimeQuestion(msg.toLowerCase())) {
		var stream = await fetchTwitch('streams?user_login=' + _options.options.channelInfo[0].user_name);
		if (!stream.data.length) {
			client.say(user, "Sorry, we aren't live right now!");
		} else {
			var upTime = getTimeDiff(new Moment(stream.data[0].started_at));
			var game = void 0;
			if (games[stream.data[0].game_id]) {
				game = games[stream.data[0].game_id];
			} else {
				var gameInfo = (await fetchTwitch('games?id=' + stream.data[0].game_id)).data[0];
				game = gameInfo.name;
				games[gameInfo.id] = game;
				updateData();
			}
			var _msg = 'We\'re currently streaming ' + game + ', and we\'ve been live for ' + upTime.hours + ' hours and ' + upTime.minutes + ' mins!';
			client.say(user, _msg);
		}
	}

	if (command[0] === '!subscribe' || msg.toLowerCase().includes("how do i subscribe")) {
		client.say(user, "Can't find the subscribe button? Don't worry, I gotchu. https://www.twitch.tv/subs/gimmedafruitsnacks");
	}

	// DANGEROUS - public version; consider making mod only
	if (command[0] === '!followlength' || command[0] === '!followdate') {
		var followed = void 0;
		if (command[1]) {
			try {
				var userData = await fetchTwitch('users?login=' + command[1]);
				if (userData.data.length) {
					var id = userData.data[0].id;
					followed = await fetchTwitch('users/follows?to_id=' + _options.options.channelInfo[0].user_id + '&from_id=' + id);
				} else {
					throw command[1] + ' doesn\'t exist!';
				}
			} catch (err) {
				console.log(err);
				client.say(user, err);
				return;
			}
		} else {
			followed = await fetchTwitch('users/follows?to_id=' + _options.options.channelInfo[0].user_id + '&from_id=' + userstate['user-id']);
		}
		if (followed.total) {
			var date = new _moment2.default(followed.data[0].followed_at);
			if (command[0] === '!followdate') {
				client.say(user, (command[1] ? command[1] : userstate['display-name']) + ' has been following since ' + (0, _moment2.default)(date).format('MMMM D, YYYY'));
			} else {
				var time = getTimeDiff(date);
				client.say(user, (command[1] ? command[1] : userstate['display-name']) + ' has been following for ' + (time.years ? time.years + ' years, ' : '') + (time.months ? time.months + ' months, ' : '') + (time.days ? time.days + ' days, ' : '') + (time.hours ? time.hours + ' hrs, ' : '') + (time.minutes ? time.minutes + ' mins, ' : '') + (time.seconds ? time.seconds + ' secs' : '') + '.');
			}
		} else {
			client.say(user, command[1] + ' doesn\'t follow us!');
		}
	}

	// !snackfact <num?>
	if (command[0] === '!snackfact') {
		if (command[1] && !(command[1] in snackFacts)) {
			client.say(user, 'There is no SnackFact #' + command[1] + '!');
		} else if (command[1]) {
			client.say(user, 'SnackFact #' + command[1] + ': ' + snackFacts[command[1]]);
		} else {
			var num = Object.keys(availableSnackFacts)[Object.keys(availableSnackFacts).length * Math.random() << 0];
			client.say(user, 'SnackFact #' + num + ': ' + availableSnackFacts[num]);
			delete availableSnackFacts[num];
			if (Object.entries(availableSnackFacts).length === 0) {
				availableSnackFacts = Object.assign({}, snackFacts);
			}
		}
	}

	// !addfact <num> <fact>
	// mod only!
	if (command[0] === '!addfact' && command.length > 2 && (userstate.mod || userstate.username === broadcaster)) {
		if (command[1] in snackFacts) {
			client.say(user, 'SnackFact #' + command[1] + ' already exists! Run !getfact to get an available number.');
		} else if (isNaN(command[1])) {
			client.say(user, command[1] + ' isn\'t a number.. Snack Facts need numbers!');
		} else {
			fact = command.slice(2).join(' ');
			snackFacts[command[1]] = fact;
			availableSnackFacts[command[1]] = fact;
			updateData();
			client.say(user, 'Okay added Snack Fact #' + command[1] + '!');
		}
	}

	// !editfact <num> <newFact>
	// mod only!
	if (command[0] === '!editfact' && command.length > 2 && (userstate.mod || userstate.username === broadcaster)) {
		if (!(command[1] in snackFacts)) {
			client.say(user, 'There is no SnackFact #' + command[1] + '!');
		} else {
			var _fact = command.slice(2).join(' ');
			snackFacts[command[1]] = _fact;
			if (command[1] in availableSnackFacts) {
				availableSnackFacts[command[1]] = _fact;
			}
			updateData();
			client.say(user, 'Okay edited Snack Fact #' + command[1] + '.');
		}
	}

	// // mod only!
	// if (command[0] === '!getfact') {
	// 	// return a random number of an available fact no greater than 30 of the highest fact
	// 	let num;
	// 	client.say(user, `Snack Fact #${num}`);
	// }
});

/*        OTHER FUNCTIONS         */

// needs to be declared function for listener for some reason
async function onConnectedHandler(addr, port) {
	console.log('Connected to ' + addr + ':' + port);
	// const data = await fetchTwitch(`users/follows?to_id=${options.channelInfo[0].user_id}&from_id=`);
	// const data = await fetchTwitch(`users/follows?from_name=floskeee`);
}

var defaultMsgs = async function defaultMsgs() {
	var msg = void 0;
	switch (counter) {
		case 0:
			var _data = await fetchTwitch('users/follows?to_id=' + _options.options.channelInfo[0].user_id);
			// console.log(data);
			msg = 'Hey guys! Huge thanks to everyone who helped us get to affiliate! Don\'t forget to follow if you haven\'t done so yet :)';
			client.say(user, msg);
			counter++;
			break;
		case 1:
			msg = "Don't by shy to drop a message here and chat with us! We love to engage with all of our viewers <3";
			client.say(user, msg);
			counter++;
			break;
		case 2:
			msg = "If you see something funny or exciting, please clip it! We watch all of our clips and highlight them all the time :)";
			client.say(user, msg);
			counter++;
			break;
		case 3:
			msg = "If you'd like to see more of us through social media, scroll down below to see them all!";
			client.say(user, msg);
			counter = 0;
			break;
	}
};

var fetchTwitch = async function fetchTwitch(url) {
	var response = await fetch('https://api.twitch.tv/helix/' + url, {
		method: "GET",
		headers: {
			'Client-ID': _options.options.options.clientId
		}
	});
	return await response.json();
};

var getTimeDiff = function getTimeDiff(start) {
	var current = new _moment2.default();
	return _moment2.default.preciseDiff(start, current, true);
};

var updateData = function updateData() {
	fs.writeFileSync(__dirname + '/../data.json', JSON.stringify({ games: games, snackFacts: snackFacts }));
};

var isUptimeQuestion = function isUptimeQuestion(question) {
	if ((question.startsWith("how long") || question.startsWith("when did")) && (question.includes("stream") || question.includes("live"))) {
		return true;
	}
	return false;
};

setInterval(defaultMsgs, 900000);