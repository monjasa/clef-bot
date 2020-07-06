const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const thumbnailURL = 'https://clef-bot.s3.eu-central-1.amazonaws.com/thumbnails/volume.png';

module.exports = class VolumeCommand extends Command {
    constructor(client) {
		super(client, {
			name: 'volume',
			memberName: 'volume',
			group: 'music',
			description: 'Change the music volume',
            guildOnly: true,
            args: [
                {
                  key: 'query',
                  prompt: 'What volume would you like to set? Choose a value from 1 to 500 (inclusively).',
                  type: 'integer',
                  validate: function(wantedVolume) {
                    return wantedVolume >= 1 && wantedVolume <= 500;
                  }
                }
            ]
		});
    }
    
    run(message, { query }) {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) return message.reply('You have to be in a voice channel to change the music volume!');

		const dispatcher = message.guild.musicData.songDispatcher;

		if (typeof dispatcher == 'undefined' || dispatcher == null)
            return message.reply('There are no songs in the queue!');
        
        message.guild.musicData.volume = query / 100;
        dispatcher.setVolume(query / 100);

        const volumeMessageEmbed = new MessageEmbed()
              .setColor('#e67f22')
              .setTitle('Volume has been successfully changed!')
              .setThumbnail(thumbnailURL)
              .addField('Current volume:', query + '%');
        
        message.say(volumeMessageEmbed);
	}
};