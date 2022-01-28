const { GuildMember } = require('discord.js'); // eslint-disable-line no-unused-vars

/**
 * @param {import("../")} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
	client.log.info(`"${member.user.tag}" joined "${member.guild.name}"`);
	let row = await client.prisma.user.findUnique({ where: { id: member.user.id } });
	if (!row) row = await client.prisma.user.create({ data: { id: member.user.id } });
	if (row.level >= 1) {
		let role = member.guild.roles.cache.find(r => r.name.toLowerCase() === `level ${row.level}`);
		if (!role) role = await member.guild.roles.create({ name: `Level ${row.level}` });
		await member.roles.add(role);
	}
};