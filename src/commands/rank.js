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

const adjustFont = (max, margin, font, canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = max;
	do ctx.font = `${fontSize -= 5}px ${font}'`;
	while (ctx.measureText(text).width > canvas.width - margin) ;
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

	const canvas = createCanvas(900, 450);
	const ctx = canvas.getContext('2d');
	const background = await loadImage('./assets/rank-card.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.font = adjustFont(48, 200, 'Arial, sans-serif', canvas, user.tag);
	ctx.fillStyle = BLUE;
	ctx.fillText(user.tag, (canvas.width - ctx.measureText(user.tag).width) / 2, 200, 750);

	// ctx.font = '44px Arial Black, sans-serif';
	// ctx.fillStyle = 'white';
	// const rank_text = `RANK #${rank}`;
	// ctx.fillText(rank_text, (canvas.width - ctx.measureText(rank_text).width) - 50, 100, 300);

	ctx.fillStyle = 'white';
	const rank_font = adjustFont(64, 750, 'Arial Black, sans-serif', canvas, `#${rank}`);
	ctx.font = rank_font;
	const rank_width = ctx.measureText(`#${rank}`).width;
	ctx.font = '32px Arial Black, sans-serif';
	ctx.fillText('RANK', (canvas.width - 100 - rank_width) - 75, 100, 300);
	ctx.font = rank_font;
	ctx.fillText(`#${rank}`, (canvas.width - ctx.measureText(`#${rank}`).width) - 50, 100, 300);

	ctx.beginPath();
	ctx.arc(450, 100, 50, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	const avatar = await loadImage(user.displayAvatarURL({ format: 'png' }));
	ctx.drawImage(avatar, 400, 50, 100, 100);

	const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'rank.png');
	await interaction.editReply({ files: [attachment] });
};