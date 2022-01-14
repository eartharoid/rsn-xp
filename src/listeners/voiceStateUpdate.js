
const [jiblet_guild_id, jiblet_role_id] = process.env.JIBLET_ROLE.split(/\//);

const { calcLevel } = require('../functions');
const PPM = 2;

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
		if (old_vs.selfDeaf) return; // count as afk

		const start = client.voice_time.get(new_vs.id);
		const end = Date.now();
		const diff =end - start;
		const mins = Math.floor(diff / 1000 / 60);

		let boost = 1;

		try {
			const jiblet_guild = client.guilds.cache.get(jiblet_guild_id);
			const jiblet_member = await jiblet_guild?.members.fetch(new_vs.member.user.id);
			const isJibletOwner = jiblet_member?.roles.cache.has(jiblet_role_id);
			if (!jiblet_guild) client.log.warn('Client is not in the JIBLET server');
			if (isJibletOwner) boost += 0.1;
		} catch {
			// do nothing,
			// most likely caused by user not being in JIBLETVERSE server
		}

		if (new_vs.member.premiumSinceTimestamp) boost += 0.1;


		const points = PPM * mins * boost;

		client.log.info(`"${new_vs.member.user.tag}" left the "${old_vs.channel.name}" VC after ${mins} minutes`);
		client.log.verbose(`event:earn_xp:guild=${new_vs.guild.id};channel=${old_vs.channel.id};user=${new_vs.member.user.id};boost=${boost};points=${points}`);

		let row = await client.prisma.user.upsert({
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
		if (level !== row.level) {
			row = await client.prisma.user.update({
				data: { level },
				where: { id: new_vs.id }
			});
			client.log.info(`"${new_vs.member.user.tag}" has reached level ${level}`);
		}

		client.voice_time.delete(new_vs.id);
	}
};