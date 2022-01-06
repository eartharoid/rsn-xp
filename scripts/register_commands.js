require('dotenv').config();

const commands = [
	{
		defaultPermission: true,
		description: 'this.description',
		name: 'this.name',
		options: null,
		type: 'CHAT_MESSAGE'
	}
];

const {
	Client: DiscordClient,
	Intents
} = require('discord.js');

class Bot extends DiscordClient {
	constructor() {
		super({
			intents: [Intents.FLAGS.GUILDS],
			presence: { status: 'dnd' }
		});

		this.once('ready', async () => {
			console.log('Connected');
			await this.client.application.commands.set(commands);
			console.log('Registered commands');
		});

		console.log('Connecting...');
		this.login();
	}
}

new Bot();
