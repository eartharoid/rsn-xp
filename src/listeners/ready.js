/**
 * @param {import("../")} client
 */
module.exports = client => client.log.success(`Connected to Discord as "${client.user.tag}"`);