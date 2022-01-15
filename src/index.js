require('dotenv').config();

const Logger = require('leekslazylogger');
const {
	ConsoleTransport,
	FileTransport
} = require('leekslazylogger/dist/transports');
const log = new Logger({
	name: 'RsN / Activity Rewards',
	transports: [
		new ConsoleTransport(),
		new FileTransport({
			format: '[{timestamp}] [{LEVEL}] [{file}:{line}:{column}] {content}',
			level: 'verbose'
		})
	]
});

const fs = require('fs');
const {
	Client: DiscordClient,
	Collection,
	Intents
} = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const loadCommands = client => {
	fs.readdirSync('./src/commands')
		.filter(file => file.endsWith('.js'))
		.forEach(name => client.commands.set(name.split('.')[0], require(`./commands/${name}`)));
};

class Bot extends DiscordClient {
	constructor() {
		super({
			intents: [
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.GUILDS
			],
			presence: { status: 'dnd' }
		});

		this.log = log;

		/** @type {PrismaClient} */
		this.prisma = new PrismaClient();

		this.servers = process.env.SERVERS.replace(/\s/g, '').split(/,/g);

		this.commands = new Collection();
		this.voice_time = new Collection();

		loadCommands(this);

		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.rl.on('line', input => {
			if (input.toLowerCase() === 'reload') {
				loadCommands(this);
				this.log.success('Reloaded commands');
			}
		});



		fs.readdirSync('./src/listeners')
			.filter(file => file.endsWith('.js'))
			.forEach(name => {
				const run = require(`./listeners/${name}`);
				this.on(name.split('.')[0], (...args) => run(this, ...args));
			});

		this.login();
	}
}

new Bot();

process.on('unhandledRejection', error => {
	log.warn('An error was not caught');
	log.error(error);
});

module.exports = Bot;