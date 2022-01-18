const {
	CommandInteraction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

const { formatTime } = require('../functions');

/**
 * @param {CommandInteraction} interaction
 */
module.exports = async interaction => {
	const user = interaction.options.getUser('user') ?? interaction.user;
	let row = await interaction.client.prisma.user.findUnique({ where: { id: user.id } });
	if (!row) row = await interaction.client.prisma.user.create({ data: { id: user.id } });

	const embed = new MessageEmbed()
		.setColor('#2077FF')
		.setAuthor({
			iconURL: user.displayAvatarURL(),
			name: user.username
		})
		.setTitle('Stats')
		.setDescription('Your level is calculated using the current number of points you have. Points reset monthly.')
		.addField('Current points', row.currentPoints.toLocaleString('en-US'), true)
		.addField('Current messages', row.currentMessages.toLocaleString('en-US'), true)
		.addField('Current voice time', formatTime(row.currentVoiceTime), true)
		.addField('Total points', row.totalPoints.toLocaleString('en-US'), true)
		.addField('Total messages', row.totalMessages.toLocaleString('en-US'), true)
		.addField('Total voice time', formatTime(row.totalVoiceTime), true)
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
};