const { Message } = require('discord.js'); // eslint-disable-line no-unused-vars
const { calcLevel } = require('../functions');

const [jiblet_guild_id, jiblet_role_id] = process.env.JIBLET_ROLE.split(/\//);

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
	if (message.system || message.author.bot) return; // ignore bots

	let boost = 1;

	try {
		const jiblet_guild = client.guilds.cache.get(jiblet_guild_id);
		const jiblet_member = await jiblet_guild?.members.fetch(message.author.id);
		const isJibletOwner = jiblet_member?.roles.cache.has(jiblet_role_id);
		if (!jiblet_guild) client.log.warn('Client is not in the JIBLET server');
		if (isJibletOwner) boost += 0.1;
	} catch {
		// do nothing,
		// most likely caused by user not being in JIBLETVERSE server
	}

	if (message.member.premiumSinceTimestamp) boost += 0.1;

	const points = calcPoints(message.content, boost);
	client.log.verbose(`guild=${message.guild.id};channel=${message.channel.id};author=${message.author.id};boost=${boost};points=${points}`);

	let row = await client.prisma.user.upsert({
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
		row = await client.prisma.user.update({
			data: { level },
			where: { id: message.author.id }
		});
		client.log.info(`"${message.author.tag}" has reached level ${level}`);
		try {
			message.reply(`Congratulations, you are now **level ${level}**!`);
		} catch (error) {
			client.log.error(error);
		}
	}

};