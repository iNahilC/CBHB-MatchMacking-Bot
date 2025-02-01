const { EmbedBuilder } = require('discord.js');
const { table } = require('table');

async function updateEloTable(client, guildId) {
	let eloChannel = client.channels.cache.get(client.elo.channel);

	try {
		let eloMessage = await eloChannel.messages.fetch(client.elo.message);

		if (!eloMessage) {
			return eloChannel.send({ content: 'No pude encontrar un mensaje para editar.' });
		}

		let usuarios = await client.db.get(`${guildId}.elo`);
		if (!Array.isArray(usuarios)) {
			usuarios = [];
		}

		usuarios = usuarios.filter(async (user) => {
			let usuario = eloMessage.guild.members.cache.get(user.user_id);
			if (!usuario) {
				await client.db.delete(`${guildId}.elo.${user.user_id}`);
				return false;
			}
			return true;
		});

		usuarios.sort((a, b) => b.elo - a.elo);

		let top30 = usuarios.slice(0, 30);

		if (top30.length === 0) {
			const emptyEmbed = new EmbedBuilder()
				.setColor(client.colors.error)
				.setTitle('**Top 30 de Elo**')
				.setDescription('Aún no hay jugadores para mostrar.')
				.setFooter({ text: 'Sistema de Elo', iconURL: client.user.displayAvatarURL() });

			return await eloMessage.edit({ embeds: [emptyEmbed] });
		}

		// Calcular la suma total del Elo de los 30 jugadores
		const totalElo = top30.reduce((sum, user) => sum + user.elo, 0);

		const data = [
			['TOP', 'USUARIO', 'ELO'],
			...top30.map((user, index) => {
				return [`#${index + 1}`, user.username, user.elo.toLocaleString()];
			}),
		];

		const tableOutput = table(data, {
			columns: { 0: { alignment: 'center' }, 1: { alignment: 'left' }, 2: { alignment: 'center' } },
			drawHorizontalLine: (index) => index === 0 || index === 1 || index === data.length,
		});

		const embed = new EmbedBuilder()
			.setColor(client.colors.success)
			.setTitle(`**Top 30 Elo Players | (Total Elo: ${totalElo.toLocaleString()})**`)
			.setDescription(`
\`\`\`
${tableOutput}
\`\`\`
`)
			.setFooter({ text: 'Sistema de Elo', iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		await eloMessage.edit({ embeds: [embed] });
	} catch (error) {
		console.error('Error al intentar acceder al mensaje o actualizar la clasificación:', error);

		const errorEmbed = new EmbedBuilder()
			.setColor(client.colors.error)
			.setTitle('Error al actualizar la tabla')
			.setDescription('Hubo un problema al intentar obtener o editar el mensaje de clasificación.')
			.setFooter({ text: 'Sistema de Elo', iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		eloChannel.send({ embeds: [errorEmbed] });
	}
}

module.exports = { updateEloTable };
