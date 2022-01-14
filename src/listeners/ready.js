const PPM = 2;

const calcLevel = points => Math.floor(0.1 * Math.sqrt(points));

/**
 * @param {import("../")} client
 */
module.exports = client => {
	client.log.success(`Connected to Discord as "${client.user.tag}"`);
	if (client.guilds.cache.size !== client.servers.length) client.log.warn(`Currently in ${this.guilds.cache.size} guilds, but only ${client.servers.length} are registered in the environment`);

	setInterval(async () => {
		for (const [id, time] of client.voice_time) {
			const diff = Date.now() - time;
			if (diff > 360000) {
				client.voice_time.delete(id);
				continue;
			} else {
				let row = await client.prisma.user.upsert({
					create: {
						currentPoints: PPM,
						currentVoiceTime: 5,
						id,
						totalPoints: PPM,
						totalVoiceTime: 5
					},
					update: {
						currentPoints: { increment: PPM },
						currentVoiceTime: { increment: 5 },
						totalPoints: { increment: PPM },
						totalVoiceTime: { increment: 5 }
					},
					where: { id: id }
				});

				const level = calcLevel(row.currentPoints);
				if (level !== row.level) {
					row = await client.prisma.user.update({
						data: { level },
						where: { id }
					});
					client.log.info(`"${client.users.cache.get(id)?.tag}" has reached level ${level}`);
				}
			}
		}

		for (const [, guild] of client.guilds.cache.filter(guild => client.servers.includes(guild.id))) {
			for (const [id, vs] of guild.voiceStates.cache) {
				if (vs.channel.id === guild.afkChannelId) continue; // don't count afk members
				if (vs.selfDeaf) continue; // count as afk
				client.voice_time.set(id, Date.now());
			}
		}
	}, 300000); // every 5 mins
};