const {
	CommandInteraction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

const {
	calcBoost,
	isBoosting,
	isEarlySupporter,
	isJibletOwner,
	isPromoting
} = require('../functions');

/**
 * @param {CommandInteraction} interaction
 */
module.exports = async interaction => {
	const user = interaction.options.getUser('user') ?? interaction.user;
	let row = await interaction.client.prisma.user.findUnique({ where: { id: user.id } });
	if (!row) row = await interaction.client.prisma.user.create({ data: { id: user.id } });

	const member = await interaction.guild.members.fetch(user);

	const multiplers = [
		`Early Supporter: \`${await isEarlySupporter(member) ? 'Yes (+10%)' : 'No'}\``,
		`JIBLET: \`${await isJibletOwner(member) ? 'Yes (+10%)' : 'No'}\``,
		`Server boosting: \`${await isBoosting(member) ? 'Yes (+10%)' : 'No'}\``,
		`Invite in status: \`${await isPromoting(member) ? 'Yes (+10%)' : 'No'}\``,
		`\n**Total in ${interaction.guild.name}:** \`x${await calcBoost(member)}\``
	];

	const embed = new MessageEmbed()
		.setColor('#2077FF')
		.setAuthor({
			iconURL: user.displayAvatarURL(),
			name: user.username
		})
		.setTitle('Active multipliers')
		.setDescription(multiplers.join('\n'))
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
};