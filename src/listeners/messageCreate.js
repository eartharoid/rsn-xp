const { Message } = require('discord.js'); // eslint-disable-line no-unused-vars
const {
	calcBoost,
	calcLevel
} = require('../functions');

const calcPoints = (content, boost) => {
	content = content.replace(/\s\s/g, '');
	const words = content.split(/\s/g).length;
	const cpw = content.length / words;
	if (cpw > 15) return 0; // probably spam
	const wm = words >= 20
		? 1.3 : words >= 10
			? 1.2 : words >= 5
				? 1.1 : words <= 2
					? 0.5 : 1.0;
	// console.log(`cpw=${cpw};wm=${wm};c/cpw=${words / cpw}`)
	let points = wm * cpw + (words / cpw / 100);
	if (points > 10) points = 10;
	return Math.ceil(Math.ceil(points) * boost);
};


/**
 * @param {import('../')} client
 * @param {Message} message
 * @returns
 */
module.exports = async (client, message) => {
	if (message.system || message.author.bot || !message.guild) return; // ignore bots

	const boost = await calcBoost(message.member);
	const points = calcPoints(message.content, boost);
	client.log.verbose(`event:earn_xp:type=message;guild=${message.guild.id};channel=${message.channel.id};user=${message.author.id};boost=${boost};points=${points}`);

	const row = await client.prisma.user.upsert({
		create: {
			currentMessages: 1,
			currentPoints: points,
			id: message.author.id,
			totalMessages: 1,
			totalPoints: points
		},
		update: {
			currentMessages: { increment: 1 },
			currentPoints: { increment: points },
			totalMessages: { increment: 1 },
			totalPoints: { increment: points }
		},
		where: { id: message.author.id }
	});

	const level = calcLevel(row.currentPoints);
	if (level !== row.level) {
		try {
			client.updateLevel(message.author, level); // don't await, too slow
			message.reply({ content: `https://static.eartharoid.me/rsn/xp/level-up-${level}.png` });
		} catch (error) {
			client.log.error(error);
		}
	}

};