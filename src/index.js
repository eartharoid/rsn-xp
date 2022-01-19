require('dotenv').config();

const Logger = require('leekslazylogger');
const {
	ConsoleTransport,
	FileTransport
} = require('leekslazylogger/dist/transports');
const log = new Logger({
	transports: [
		new ConsoleTransport(),
		new FileTransport({
			format: '[{timestamp}] [{LEVEL}] [{file}:{line}:{column}] {content}',
			level: 'verbose',
			name: 'RsN / Activity Rewards'
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
			]
		});

		this.log = log;

		/** @type {PrismaClient} */
		this.prisma = new PrismaClient();

		this.commands = new Collection();
		this.voice_time = new Collection();

		loadCommands(this);

		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.rl.on('line', input => {
			if (input.toLowerCase() === 'reload') {
				this.commands.forEach((command, name) => delete require.cache[require.resolve(`./commands/${name}`)]);
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

		this.updateLevel = async (user, level) => {
			this.log.info(`"${user.tag}" has reached level ${level}`);
			await this.prisma.user.update({
				data: { level },
				where: { id: user.id }
			});

			for (const [, guild] of this.guilds.cache) {
				let member;
				try {
					member = await guild.members.fetch(user.id);
				} catch {
					// do nothing,
					// most likely caused by user not being in the server
				}
				try {
					if (!member) {
						this.log.info(`"${user.tag}" is not in "${guild.name}"`);
						continue;
					}

					member.roles.cache
						.filter(r => r.name.toLowerCase().startsWith('level'))
						.forEach(r => member.roles.remove(r));

					let role = guild.roles.cache.find(r => r.name.toLowerCase() === `level ${level}`);
					if (!role) role = await guild.roles.create({ name: `Level ${level}` });
					await member.roles.add(role);
				} catch (error) {
					this.log.error(`Failed to update roles for "${user.tag}" in "${guild.name}"`, error);
				}
			}
		};

		this.login();
	}
}

new Bot();

process.on('unhandledRejection', error => {
	log.warn('An error was not caught');
	log.error(error);
});

module.exports = Bot;