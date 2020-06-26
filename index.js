const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const { 
    prefix, 
    token 
} = require('./config');

const client = new Discord.Client();
client.login(token);