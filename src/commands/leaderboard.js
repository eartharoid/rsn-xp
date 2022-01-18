const {
	CommandInteraction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

/**
 * @param {CommandInteraction} interaction
 */
module.exports = async interaction => {

	const leaderboard = await interaction.client.prisma.user.findMany({
		orderBy: { currentPoints: 'desc' },
		select: {
			currentPoints: true,
			id: true,
			level: true
		},
		take: 10/* ,
		where: { currentPoints: { gt: 0 } } */
	});

	const embed = new MessageEmbed()
		.setColor('#2077FF')
		.setTitle('Leaderboard')
		.setDescription(
			leaderboard
				.map((row, index) => `**${index + 1}.** <@${row.id}>: ${row.currentPoints} points (level ${row.level})`)
				.join('\n')
		)
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
};