const { Command } = require('discord.js-commando');

module.exports = class SkipCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'skip',
			memberName: 'skip',
			group: 'music',
			description: 'Skip the current playing song',
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
	}
};