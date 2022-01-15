const {
	CommandInteraction,  // eslint-disable-line no-unused-vars
	MessageAttachment
} = require('discord.js');
const {
	createCanvas,
	loadImage
} = require('canvas');

const BLUE = '#2077FF';
const levels = [0, 100, 400, 900, 1600, 2500, 3600, 4900, 6400, 8100, 10000];

const adjustFont = (canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = 96;
	while (ctx.measureText(text).width > canvas.width - 50) ctx.font = `${fontSize -= 5}px sans-serif`;
	return ctx.font;
};

/**
 * @param {CommandInteraction} interaction
 */
module.exports = async interaction => {
	const user = interaction.options.getUser('user') ?? interaction.user;
	let row = await interaction.client.prisma.user.findUnique({ where: { id: user.id } });
	if (!row) row = await interaction.client.prisma.user.create({ data: { id: user.id } });
	const all = await interaction.client.prisma.user.findMany({
		orderBy: { currentPoints: 'desc' },
		select: { id: true }/* ,
		where: { currentPoints: { gt: 0 } } */
	});

	const rank = all.findIndex(r => r.id === user.id) + 1;

	const canvas = createCanvas(900, 300);
	const ctx = canvas.getContext('2d');
	const background = await loadImage('./assets/rank-card.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	// ctx.font = adjustFont(canvas, user.username);
	ctx.font = '40px Arial Black,sans-serif';
	ctx.fillStyle = BLUE;
	ctx.fillText(user.username, 150, 100, 750);

	ctx.beginPath();
	ctx.arc(87.5, 87.5, 37.5, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	const avatar = await loadImage(user.displayAvatarURL({ format: 'png' }));
	ctx.drawImage(avatar, 50, 50, 75, 75);

	const attachment = new MessageAttachment(canvas.toBuffer());
	await interaction.editReply({ files: [attachment] });
};