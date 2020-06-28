const fs = require('fs')

const Discord = require('discord.js');
const Client = require('./client/Client');

const { 
    prefix, 
    token 
} = require('./config');

const client = new Client();
client.commands = new Discord.Collection();
client.login(token);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

console.log(client.commands);

client.on('message', async message => {
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);

	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	try {
        command.execute(message);
	} catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command.');
	}
});