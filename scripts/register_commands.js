require('dotenv').config();

const commands = [
	{
		defaultPermission: true,
		description: 'View the XP leaderboard',
		name: 'leaderboard',
		options: [],
		type: 'CHAT_MESSAGE'
	},
	{
		defaultPermission: true,
		description: 'View the XP rank and level of yourself or someone else',
		name: 'rank',
		options: [
			{
				description: 'The user to view',
				name: 'user',
				required: false,
				type: 6 // USER
			}
		],
		type: 'CHAT_MESSAGE'
	},
	{
		defaultPermission: true,
		description: 'View the active multipliers of yourself or someone else',
		name: 'multipliers',
		options: [
			{
				description: 'The user to view',
				name: 'user',
				required: false,
				type: 6 // USER
			}
		],
		type: 'CHAT_MESSAGE'
	},
	{
		defaultPermission: true,
		description: 'View the stats of yourself or someone else',
		name: 'stats',
		options: [
			{
				description: 'The user to view',
				name: 'user',
				required: false,
				type: 6 // USER
			}
		],
		type: 'CHAT_MESSAGE'
	},
	{
		defaultPermission: true,
		description: 'Manage XP',
		name: 'xp',
		options: [
			{
				description: 'Give XP points to a user',
				name: 'add',
				options: [
					{
						description: 'The user to give XP to',
						name: 'user',
						required: true,
						type: 6 // USER
					},
					{
						description: 'The amount of XP to give',
						name: 'amount',
						required: true,
						type: 4 // INTEGER
					}
				],
				type: 1 // SUB_COMMAND
			},
			{
				description: 'Take XP points from a user',
				name: 'remove',
				options: [
					{
						description: 'The user to take XP from',
						name: 'user',
						required: true,
						type: 6 // USER
					},
					{
						description: 'The amount of XP to take',
						name: 'amount',
						required: true,
						type: 4 // INTEGER
					}
				],
				type: 1 // SUB_COMMAND
			},
			{
				description: 'Reset everyone\'s XP',
				name: 'reset-all',
				options: [],
				type: 1 // SUB_COMMAND
			}
		],
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
			await this.application.commands.set(commands);
			console.log('Registered commands');
		});

		console.log('Connecting...');
		this.login();
	}
}

new Bot();
