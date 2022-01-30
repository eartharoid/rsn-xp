const [jiblet_guild_id, jiblet_role_id] = process.env.JIBLET_ROLE.split(/\//);
const [supporter_guild_id, supporter_role_id] = process.env.SUPPORTER_ROLE.split(/\//);

module.exports.isEarlySupporter = async member => {
	try {
		const main_guild = member.client.guilds.cache.get(supporter_guild_id);
		const main_member = await main_guild?.members.fetch(member.user.id);
		if (!main_guild) member.client.log.warn('Client is not in the main server');
		return main_member?.roles.cache.has(supporter_role_id);
	} catch {
		// do nothing,
		// most likely caused by user not being in main server
		return false;
	}
};

module.exports.isJibletOwner = async member => {
	try {
		const jiblet_guild = member.client.guilds.cache.get(jiblet_guild_id);
		const jiblet_member = await jiblet_guild?.members.fetch(member.user.id);
		if (!jiblet_guild) member.client.log.warn('Client is not in the JIBLET server');
		return jiblet_member?.roles.cache.has(jiblet_role_id);
	} catch {
		// do nothing,
		// most likely caused by user not being in JIBLETVERSE server
		return false;
	}
};

module.exports.isBoosting = member => !!member.premiumSinceTimestamp;

module.exports.isPromoting = member => /\.gg\/rsnetwork/i.test(member.presence.activities.find(activity => activity.type === 'CUSTOM')?.state);

module.exports.calcBoost = async member => {
	let boost = 1;

	// early supporter role: +10%
	if (await module.exports.isEarlySupporter(member)) boost += 0.1;

	// jiblet owner: +10%
	if (await module.exports.isJibletOwner(member)) boost += 0.1;

	// server booster: +10%
	if (module.exports.isBoosting(member)) boost += 0.1;

	// advertising: +10%
	if (module.exports.isPromoting(member)) boost += 0.1;

	return Number(boost.toFixed(2));
};

module.exports.calcLevel = points => Math.min(Math.floor(0.1 * Math.sqrt(points)), 10);

module.exports.formatTime = mins => mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;