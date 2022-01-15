/**
 * @param {import("../")} client
 */
module.exports = client => {
	client.log.success(`Connected to Discord as "${client.user.tag}"`);
	if (client.guilds.cache.size !== client.servers.length) client.log.warn(`Currently in ${this.guilds.cache.size} guilds, but only ${client.servers.length} are registered in the environment`);
};