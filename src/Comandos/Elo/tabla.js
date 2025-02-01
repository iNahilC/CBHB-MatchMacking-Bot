const { SlashCommand, EmbedBuilder, ComponentType } = require('../../ConfigBot/index.js')
const { table } = require('table')
const { createPaginationButtons } = require('../../Utilidades/createPaginationButtons.js')

module.exports = new SlashCommand({
	name: 'table',
	category: 'Usuarios',
	description: 'Mira la tabla de Elo de los jugadores.',
	example: '/tabla',
	options: [
		{
			name: 'pagina',
			description: 'Página de la tabla que deseas ver',
			type: 4,
			required: false,
		},
	],
	ejecutar: async (client, interaction) => {
		try {
			await interaction.deferReply()
			if (!client.db.has(`${interaction.guild.id}.elo`)) {
				await client.db.set(`${interaction.guild.id}.elo`, [])
			}
	
			const eloData = (await client.db.get(`${interaction.guild.id}.elo`)) || []
			if (!eloData.length) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(
						`${client.emojisId.error} No hay jugadores con **elo** en este servidor. Contacta con un **administrador**!`,
					)
				return interaction.editReply({ embeds: [e], flags: 64 })
			}
	
			const top25 = eloData
				.filter(
					(entry) =>
						interaction.guild.members.cache.has(entry.user_id) && // Obtener solamente a los usuarios que están en el servidor.
						entry.elo > 0, // Filtrar jugadores con Elo mayor a 0
				)
				.sort((a, b) => b.elo - a.elo)
			const totalElo = top25.reduce((sum, user) => sum + user.elo, 0)
	
			if (!top25.length) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(
						`${client.emojisId.error} No hay **jugadores** con Elo mayor a 0 disponibles para mostrar en la **tabla**.`,
					)
				return interaction.editReply({ embeds: [e], flags: 64 })
			}
	
			const usuariosPorPagina = 15
			const paginasTotal = Math.ceil(top25.length / usuariosPorPagina)
	
			let paginaActual = interaction.options.getInteger('pagina') || 1
			paginaActual = Math.max(1, Math.min(paginaActual, paginasTotal)) - 1 // Asegurar que la página especificada esté dentro del rango
	
			const createTable = (pagina) => {
				const start = pagina * usuariosPorPagina
				const end = start + usuariosPorPagina
				const usuarios = top25.slice(start, end)
	
				const data = [
					['TOP', 'USUARIO', 'ELO'],
					...usuarios.map((user, index) => {
						const username = user.username
						return [`#${start + index + 1}`, username, user.elo.toLocaleString()]
					}),
				]
	
				return table(data, {
					columns: { 0: { alignment: 'center' }, 1: { alignment: 'left' }, 2: { alignment: 'center' } },
					drawHorizontalLine: (index) => index === 0 || index === 1 || index === data.length,
				})
			}
	
			const createEmbed = (pagina) => {
				const tabla = createTable(pagina)
	
				return new EmbedBuilder()
					.setColor(client.colors.success)
					.setDescription(`
Mostrando **${top25.length}** jugadores con un total de **${totalElo.toLocaleString()}** de **elo**!

\`\`\`
${tabla}
\`\`\`
`)
					.setFooter({ text: `Página ${pagina + 1} de ${paginasTotal}` })
					.setTimestamp()
			}
	
			const embed = createEmbed(paginaActual)
			const botones = createPaginationButtons(paginaActual, paginasTotal)
	
			const message = await interaction.editReply({
				embeds: [embed],
				components: [botones],
			})
	
			const collector = await message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 60_000,
			})
	
			collector.on('collect', async (i) => {
				if (i.user.id !== interaction.user.id) return
	
				if (i.customId === 'prev_pagina' && paginaActual > 0) {
					paginaActual--
				} else if (i.customId === 'next_pagina' && paginaActual < paginasTotal - 1) {
					paginaActual++
				}
	
				const updatedEmbed = createEmbed(paginaActual)
				const updatedButtons = createPaginationButtons(paginaActual, paginasTotal)
	
				await i.update({ embeds: [updatedEmbed], components: [updatedButtons] })
			})
	
			collector.on('end', async () => {
				await interaction.editReply({ components: [] })
			})
		} catch (error) {
            console.error('Error en el comando /tabla:', error);
            const e = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription(`${client.emojisId.error} Ocurrió un error inesperado. Inténtalo nuevamente más tarde.`);
            return interaction.editReply({ embeds: [e] });
		}
	},
})
