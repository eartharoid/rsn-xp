const {
	CommandInteraction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

const [admin_guild_id, admin_role_id] = process.env.ADMIN_ROLE.split(/\//);

/**
 * @param {CommandInteraction} interaction
 */
module.exports = async interaction => {
	let hasPermission = false;

	try {
		const admin_guild = interaction.client.guilds.cache.get(admin_guild_id);
		if (!admin_guild) interaction.client.log.warn('Client is not in the RSN server');
		const admin_member = await admin_guild?.members.fetch(interaction.user.id);
		hasPermission = admin_member?.roles.cache.has(admin_role_id) ?? false;
	} catch {
		// do nothing,
		// most likely caused by user not being in the server
	}

	if (!hasPermission) return interaction.client.log.warn(`"${interaction.user.tag} attempted to use the "xp" command`);

	switch (interaction.options.getSubcommand()) {
	case 'add': {
		const user = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('amount');
		const row = await interaction.client.prisma.user.upsert({
			create: {
				currentPoints: amount,
				id: user.id,
				totalPoints: amount
			},
			update: {
				currentPoints: { increment: amount },
				totalPoints: { increment: amount }
			},
			where: { id: user.id }
		});
		await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor('#2077FF')
					.setTitle(`✅ Added ${amount} points`)
					.setDescription(`${user.toString()} now has ${row.currentPoints} points`)
			]
		});
		break;
	}
	case 'remove': {
		const user = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('amount');
		const row = await interaction.client.prisma.user.upsert({
			create: {
				currentPoints: 0,
				id: user.id,
				totalPoints: 0
			},
			update: {
				currentPoints: { decrement: amount },
				totalPoints: { decrement: amount }
			},
			where: { id: user.id }
		});
		await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor('#2077FF')
					.setTitle(`✅ Removed ${amount} points`)
					.setDescription(`${user.toString()} now has ${row.currentPoints} points`)
			]
		});
		break;
	}
	case 'reset-all': {
		for (const [, guild] of interaction.client.guilds.cache) await guild.members.fetch();
		const members = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.members.cache.size, 0);
		const rows = await interaction.client.prisma.user.updateMany({
			data: {
				currentMessages: 0,
				currentPoints: 0,
				currentVoiceTime: 0,
				level: 0
			}
		});
		await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor('#2077FF')
					.setTitle(`✅ Reset ${rows.count} records`)
					.setDescription(`Removing level roles from ${members} combined members may take several hours.`)
			]
		});
		for (const [, guild] of interaction.client.guilds.cache) {
			for (const [, member] of guild.members.cache) {
				for (const [, role] of member.roles.cache) {
					try {
						if (role.name.toLowerCase().startsWith('level')) {
							await member.roles.remove(role);
							await new Promise(resolve => setTimeout(resolve, 200));
						}

					} catch (error) {
						this.log.error(`Failed to remove roles from "${member.user.tag}" in "${guild.name}"`, error);
					}
				}
			}
		}
		break;
	}
	}

};