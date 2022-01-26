
const [jiblet_guild_id, jiblet_role_id] = process.env.JIBLET_ROLE.split(/\//);
const [supporter_guild_id, supporter_role_id] = process.env.SUPPORTER_ROLE.split(/\//);

const { calcLevel } = require('../functions');

/**
 * @param {import("../")} client
 */
module.exports = async (client, old_vs, new_vs) => {
	if (!old_vs.channelId && new_vs.channelId) { // connected
		if (new_vs.channelId === new_vs.guild.afkChannelId) return; // ignore if they're afk
		client.voice_time.set(new_vs.id, Date.now()); // time of connection
		client.log.info(`"${new_vs.member.user.tag}" joined the "${new_vs.channel.name}" VC`);
	} else if (old_vs.channelId && !new_vs.channelId) { // disconnected
		if (!client.voice_time.has(new_vs.id)) return client.log.warn(`VC for "${new_vs.member.user.tag}" was not tracked`);
		if (old_vs.channelId === new_vs.guild.afkChannelId) return; // ignore if they just left the afk channel
		// if (old_vs.selfDeaf) return; // count as afk

		const start = client.voice_time.get(new_vs.id);
		const end = Date.now();
		const diff =end - start;
		const mins = Math.floor(diff / 1000 / 60);

		let boost = 1;

		try {
			const main_guild = client.guilds.cache.get(supporter_guild_id);
			const main_member = await main_guild?.members.fetch(new_vs.member.user.id);
			const isSupporter = main_member?.roles.cache.has(supporter_role_id);
			if (!main_guild) client.log.warn('Client is not in the main server');
			if (isSupporter) boost += 0.1;
		} catch {
			// do nothing,
			// most likely caused by user not being in main server
		}


		try {
			const jiblet_guild = client.guilds.cache.get(jiblet_guild_id);
			const jiblet_member = await jiblet_guild?.members.fetch(new_vs.member.user.id);
			const is_jiblet_owner = jiblet_member?.roles.cache.has(jiblet_role_id);
			if (!jiblet_guild) client.log.warn('Client is not in the JIBLET server');
			if (is_jiblet_owner) boost += 0.1;
		} catch {
			// do nothing,
			// most likely caused by user not being in JIBLETVERSE server
		}

		if (new_vs.member.premiumSinceTimestamp) boost += 0.1;

		const PPM = old_vs.channelId === process.env.CINEMA_CHANNEL ? 0.5 : 2;
		const points = Math.ceil(PPM * mins * boost);

		client.log.info(`"${new_vs.member.user.tag}" left the "${old_vs.channel.name}" VC after ${mins} minutes`);
		client.log.verbose(`event:earn_xp:guild=${new_vs.guild.id};channel=${old_vs.channel.id};user=${new_vs.member.user.id};boost=${boost};points=${points}`);

		const row = await client.prisma.user.upsert({
			create: {
				currentPoints: points,
				currentVoiceTime: mins,
				id: new_vs.id,
				totalPoints: points,
				totalVoiceTime: mins
			},
			update: {
				currentPoints: { increment: points },
				currentVoiceTime: { increment: mins },
				totalPoints: { increment: points },
				totalVoiceTime: { increment: mins }
			},
			where: { id: new_vs.id }
		});

		const level = calcLevel(row.currentPoints);
		if (level !== row.level) await client.updateLevel(new_vs.member.user, level);

		client.voice_time.delete(new_vs.id);
	}
};