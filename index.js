const { CommandoClient } = require('discord.js-commando');
const { Structures } = require('discord.js');

const path = require('path');

const { 
    prefix, 
    token 
} = require('./config');

Structures.extend('Guild', function(Guild) {
	class MusicGuild extends Guild {
	  constructor(client, data) {
		super(client, data);
		this.musicData = {
		  queue: [],
		  isPlaying: false,
		  nowPlaying: null,
		  songDispatcher: null,
		  volume: 1
		};
	  }
	}

	return MusicGuild;
});

const client = new CommandoClient({
	commandPrefix: prefix
});

client.login(token);

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', 'Music Command Group']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity(`${prefix}help`, {
	  type: 'LISTENING',
	  url: 'https://github.com/monjasa/clef-bot'
	});
});