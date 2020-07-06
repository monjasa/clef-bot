const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const { youtubeAPI } = require('../../config');
const Youtube = require('simple-youtube-api');
const ytdl = require("ytdl-core");

const youtube = new Youtube(youtubeAPI);

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['add'],
      memberName: 'play',
      group: 'music',
      description: 'Play a song in your channel',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      args: [
        {
          key: 'query',
          prompt: 'What song or playlist would you like to listen to?',
          type: 'string',
          validate: function(query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.say('Join a channel and try again');

    const video = await youtube.getVideo(query).catch(function() {
      return message.say('There was a problem getting the video you provided!');
    });
    
    message.guild.musicData.queue.push(
      PlayCommand.constructSong(video, voiceChannel)
    );

    const isMusicPlaying = message.guild.musicData.isPlaying;

    if (typeof isMusicPlaying == 'undefined' || !isMusicPlaying) {
      message.guild.musicData.isPlaying = true;
      return PlayCommand.playSong(message.guild.musicData.queue, message);
    } else if (isMusicPlaying) {
      return message.say(`**${video.title}** added to the queue.`);
    }
  }

  static playSong(queue, message) {
    const thisClass = this;

    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              quality: 'highestaudio'
            })
          )
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(message.guild.musicData.volume);

            const videoMessageEmbed = new MessageEmbed()
              .setThumbnail(queue[0].thumbnail)
              .setColor('#e67f22')
              .addField('Now Playing:', queue[0].title)
              .addField('Duration:', queue[0].duration);
            if (queue[1]) videoMessageEmbed.addField('Next Song:', queue[1].title);

            message.say(videoMessageEmbed);
            message.guild.musicData.nowPlaying = queue[0];
            return queue.shift();
          })
          .on('finish', function() {
            if (queue.length >= 1) {
              return thisClass.playSong(queue, message);
            } else {
              return thisClass.finishPlaying(message);
            }
          })
          .on('error', function(e) {
            message.say('Cannot play song!');
            console.error(e);
            message.guild.musicData.queue.length = 0;
            return thisClass.finishPlaying(message);
          });
      })
      .catch(function(e) {
        console.error(e);
        return message.guild.me.voice.channel.leave();
      });
  }

  static finishPlaying(message) {
    message.guild.musicData.isPlaying = false;
    message.guild.musicData.nowPlaying = null;
    message.guild.musicData.songDispatcher = null;
    
    return message.guild.me.voice.channel.leave();
  }

  static constructSong(video, voiceChannel) {
    let formattedDuration = this.formatDuration(video.duration);
    if (formattedDuration == '00:00') formattedDuration = 'Live Stream';
    return {
      url: video.url,
      title: video.title,
      rawDuration: video.duration,
      duration: formattedDuration,
      thumbnail: video.thumbnails.high.url,
      voiceChannel
    };
  }

  static formatDuration(duration) {
    const formattedDuration = `${duration.hours ? (duration.hours + ':') : ''}${
      duration.minutes ? duration.minutes : '00'
    }:${
      (duration.seconds < 10)
        ? ('0' + duration.seconds)
        : (duration.seconds
        ? duration.seconds
        : '00')
    }`;
    return formattedDuration;
  }
};