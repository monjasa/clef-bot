const { Command } = require('discord.js-commando');

module.exports = class StopCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stop',
			aliases: ['skipall'],
			memberName: 'stop',
			group: 'music',
			description: 'Skip all songs in queue',
			guildOnly: true
		});
	}
	
	run(message) {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) return message.reply('You have to be in a voice channel to skip the music!');

		const dispatcher = message.guild.musicData.songDispatcher;

		if (typeof dispatcher == 'undefined' || dispatcher == null)
			return message.reply('There are no songs in the queue!');
		
		dispatcher.end();
		message.guild.musicData.queue = [];
	}
};