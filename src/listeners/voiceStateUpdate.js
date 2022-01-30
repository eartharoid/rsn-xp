const {
	calcBoost,
	calcLevel
} = require('../functions');

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
		const boost = await calcBoost(new_vs.member);
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
		if (level !== row.level) client.updateLevel(new_vs.member.user, level); // don't await, too slow

		client.voice_time.delete(new_vs.id);
	}
};