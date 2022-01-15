const { CommandInteraction } = require('discord.js'); // eslint-disable-line no-unused-vars

const [admin_guild_id, admin_role_id] = process.env.ADMIN_ROLE.split(/\//);

/**
 * @param {CommandInteraction} interaction
 */
module.exports = async interaction => {
	let hasPermission = false;

	try {
		const admin_guild = interaction.client.guilds.cache.get(admin_guild_id);
		const jiblet_member = await admin_guild?.members.fetch(interaction.user.id);
		hasPermission = jiblet_member?.roles.cache.has(admin_role_id);
		if (!admin_guild) interaction.client.log.warn('Client is not in the RSN server');
	} catch {
		// do nothing,
		// most likely caused by user not being in the server
	}

	if (!hasPermission) return interaction.client.log.warn(`"${interaction.user.tag} attempted to use the "xp" command`);

};