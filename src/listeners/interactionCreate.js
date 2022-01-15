

/**
 * @param {import("../")} client
 */
module.exports = async (client, interaction) => {
	if (interaction.isCommand()) {
		try {
			client.log.verbose(`event:use_command:type=message;guild=${interaction.guild?.id ?? 'null'};channel=${interaction.channel.id};user=${interaction.user.id};command=${interaction.commandName}`);
			await interaction.deferReply();
			client.commands.get(interaction.commandName)?.(interaction);
		} catch (error) {
			client.log.error(error);
		}
	}
};