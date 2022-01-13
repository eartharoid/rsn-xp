module.exports = (client, limit) => {
	client.log.warn('Rate limited', limit);
};