const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js')
const { updateEloTable } = require('../../Utilidades/updateEloTable.js')
const { updateUserRankRole } = require('../../Utilidades/updateUserRankRole.js')
const { randomId } = require("../../Utilidades/randomString.js")
const { sendLogs } = require('../../Utilidades/sendLogs.js')

module.exports = new SlashCommand({
	name: 'remove',
	category: 'Owner',
	description: 'Remueve elo a los jugadores, asegurando que no sea menor a 0.',
	example: '/remove usuarios: <@usuario1><@usuario2> cantidades: 10, 15',
	options: [
		{
			name: 'usuarios',
			description: 'Usuarios a los que deseas restar elo (menciones separadas por espacios o pegadas).',
			type: 3,
			required: true,
		},
		{
			name: 'cantidades',
			description: 'Cantidades correspondientes (separadas por comas).',
			type: 3,
			required: true,
		},
	],
	ejecutar: async (client, interaction) => {
		try{
			await interaction.deferReply()

			if (!client.db.has(`${interaction.guild.id}.season2`)) {
				await client.db.set(`${interaction.guild.id}.season2`, [])
			}
	
			if (!interaction.member.roles.cache.has(client.elo.permissionRol)) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(
						`${client.emojisId.error} **No tienes permisos para usar este comando. Necesitas el rol <@&${client.elo.permissionRol}>.**`,
					)
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } })
			}
	
			const usuariosTexto = interaction.options.getString('usuarios')
			const cantidadesTexto = interaction.options.getString('cantidades')
	
			const usuarios = usuariosTexto.match(/<@!?(\d+)>/g)
			if (!usuarios || usuarios.length === 0) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Menciona **__usuarios__** válidos en el campo **"usuarios"**.`)
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } })
			}
	
			const cantidades = cantidadesTexto.split(',').map((val) => parseInt(val.trim(), 10))
			if (cantidades.some((val) => isNaN(val))) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(
						`${client.emojisId.error} Introduce **solo** números separados por comas en el campo **"cantidades"**.`,
					)
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } })
			}
	
			if (usuarios.length !== cantidades.length) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(
						`${client.emojisId.error} La cantidad de **__usuarios__** debe **coincidir** con las cantidades de **elo** especificadas.`,
					)
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } })
			}
	
			const elo = (await client.db.get(`${interaction.guild.id}.season2`)) || []
			let resultados = []
			let cambiosRoles = []
	
			for (let i = 0; i < usuarios.length; i++) {
				const userId = usuarios[i].replace(/[<@!>]/g, '')
				const cantidadElo = cantidades[i]
	
				if (cantidadElo <= 0) {
					const e = new EmbedBuilder()
						.setColor(client.colors.error)
						.setDescription(
							`${client.emojisId.error} La cantidad de **elo** para el usuario <@${userId}> debe ser mayor a **__0__**.`,
						)
					return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } })
				}
	
				let usuarioElo = elo.find((entry) => entry.user_id === userId)
				const eloPrevio = usuarioElo ? usuarioElo.elo : 0;
	
				if (usuarioElo) {
					usuarioElo.elo -= cantidadElo
					if (usuarioElo.elo < 0) {
						usuarioElo.elo = 0
					}
				} else {
					usuarioElo = { user_id: userId, elo: 0 }
					elo.push(usuarioElo)
				}
	
				const totalElo = usuarioElo.elo
				resultados.push({ userId, totalElo, cantidadElo, eloPrevio })
			}
	
			await client.db.set(`${interaction.guild.id}.season2`, elo)
			await updateEloTable(client, interaction.guild.id)
	
			const genRandomId = randomId(10, 'alphanumeric')
			let logs = resultados.map((result) => ({
				elo: result.cantidadElo,
				targetUser: result.userId,
				eloAdderUser: interaction.user.id,
				componentId: genRandomId,
				eloAnterior: result.eloPrevio
			}));
	
			await sendLogs(client, interaction, 'REMOVE', logs);
	
			for (const resultado of resultados) {
				const userId = resultado.userId
	
				const resultadoRol = await updateUserRankRole(client, interaction.guild.id, userId).catch((error) => {
					console.error(`Error al actualizar el rango del usuario <@${userId}>:`, error)
				})
	
				if (resultadoRol && resultadoRol.nuevoRango && resultadoRol.rangoActual) {
					const { rangoActual, nuevoRango } = resultadoRol
					const tipoCambio =
						rangoActual !== nuevoRango ? (rangoActual < nuevoRango ? 'Bajó al rango' : 'Subió al rango ') : null
	
					if (tipoCambio) {
						cambiosRoles.push({
							usuario: userId,
							tipoCambio,
							rango: `<@&${nuevoRango}>`,
						})
					}
				}
			}
	
	
			let respuestaFinal = resultados
			.map((result) => `✅ Se **__removió__** correctamente **${result.cantidadElo}** de elo a <@${result.userId}>. Elo total: **${result.totalElo}**.`)
			.join('\n');
	
			if (cambiosRoles.length > 0) {
				respuestaFinal += '\n\n**Cambios de Rango:**\n' + cambiosRoles
					.map((cambio) => `🔹 <@${cambio.usuario}> nuevo **rango**: ${cambio.rango}`)
					.join('\n');
			}
	
			const e = new EmbedBuilder().setColor(client.colors.success).setDescription(respuestaFinal)
			return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } })
		} catch (error) {
            console.error('Error en el comando /remover:', error);
            const e = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription(`${client.emojisId.error} Ocurrió un error inesperado. Inténtalo nuevamente más tarde.`);
            return interaction.editReply({ embeds: [e] });
		}
	},
})
