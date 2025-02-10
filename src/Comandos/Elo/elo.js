const { 
	SlashCommand, 
	EmbedBuilder, 
	ButtonBuilder, 
	ActionRowBuilder, 
	ButtonStyle 
} = require('../../ConfigBot/index.js');
const { updateEloTable } = require('../../Utilidades/updateEloTable.js');
const { updateUserRankRole } = require('../../Utilidades/updateUserRankRole.js');
const { sendLogs } = require('../../Utilidades/sendLogs.js');
const { randomId } = require('../../Utilidades/randomString.js');

module.exports = new SlashCommand({
	name: 'elo',
	category: 'Elo Adder',
	description: 'Agrega y remueve elo a los jugadores en una misma acción.',
	example: '/add match-image: [archivo] usuarios_add: <@usuario1> <@usuario2> puntos_add: 10,15 usuarios_remove: <@usuario3> puntos_remove: 5',
	options: [
		{
			name: 'match-image',
			description: 'Imagen que representa la partida (archivo).',
			type: 11, // Attachment
			required: true,
		},
		{
			name: 'users_win',
			description: 'Usuarios a los que deseas agregar elo (menciones separadas por espacios).',
			type: 3,
			required: true,
		},
		{
			name: 'elo_win',
			description: 'Cantidades de elo a agregar (separadas por comas).',
			type: 3,
			required: true,
		},
		{
			name: 'users_loss',
			description: 'Usuarios a los que deseas remover elo (menciones separadas por espacios).',
			type: 3,
			required: true,
		},
		{
			name: 'elo_loss',
			description: 'Cantidades de elo a remover (separadas por comas).',
			type: 3,
			required: true,
		},
	],
	ejecutar: async (client, interaction) => {
		try {
			await interaction.deferReply();

			if (interaction.channel.id !== client.elo.eloAdderChannel) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} **No puedes utilizar este comando en este canal.**`);
				
				const botonCanal = new ButtonBuilder()
					.setLabel('Ir al Canal Elo Adder')
					.setStyle(ButtonStyle.Link)
					.setURL(`https://discord.com/channels/${interaction.guild.id}/${client.elo.eloAdderChannel}`);
				
				const row = new ActionRowBuilder().addComponents(botonCanal);
				return interaction.editReply({ embeds: [e], components: [row], flags: 64 });
			}

			// Validación de permisos
			if (!interaction.member.roles.cache.has(client.elo.permissionRol)) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando. Necesitas el rol <@&${client.elo.permissionRol}>.**`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			// Obtención de opciones
			const imagen = interaction.options.getAttachment('match-image');
			const usuariosAddTexto = interaction.options.getString('users_win')?.trim();
			const cantidadesAddTexto = interaction.options.getString('elo_win')?.trim();
			const usuariosRemoveTexto = interaction.options.getString('users_loss')?.trim();
			const cantidadesRemoveTexto = interaction.options.getString('elo_loss')?.trim();

			if (!imagen || !usuariosAddTexto || !cantidadesAddTexto || !usuariosRemoveTexto || !cantidadesRemoveTexto) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes proporcionar los campos **"match-image"**, **"users_win"**, **"elo_win"**, **"users_loss"** y **"elo_loss"** correctamente.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			const validImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'];
			if (!validImageTypes.includes(imagen.contentType)) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} **El archivo subido no es una imagen válida.**`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			const usuariosAdd = usuariosAddTexto.match(/<@!?(\d+)>/g)?.map(u => u.replace(/[<@!>]/g, '')) || [];
			const cantidadesAdd = cantidadesAddTexto.split(',').map(val => parseInt(val.trim(), 10));

			const usuariosRemove = usuariosRemoveTexto.match(/<@!?(\d+)>/g)?.map(u => u.replace(/[<@!>]/g, '')) || [];
			const cantidadesRemove = cantidadesRemoveTexto.split(',').map(val => parseInt(val.trim(), 10));

			if (usuariosAdd.length === 0 || cantidadesAdd.length === 0) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes mencionar al menos **un usuario** y una **cantidad de elo** para agregar.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}
			if (usuariosRemove.length === 0 || cantidadesRemove.length === 0) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes mencionar al menos **un usuario** y una **cantidad de elo** para remover.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			if (usuariosAdd.length < 5 || cantidadesAdd.length < 5) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes mencionar al menos **5** **__usuarios__** para agregarles **elo**.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			if (usuariosRemove.length < 5 || cantidadesRemove.length < 5) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes mencionar al menos **5** **__usuarios__** para removerles **elo**.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			if (usuariosAdd.length > 5 || cantidadesAdd.length > 5) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes mencionar máximo **5** **__usuarios__** para agregarles **elo**.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			if (usuariosRemove.length > 5 || cantidadesRemove.length > 5) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes mencionar máximo **5** **__usuarios__** para removerles **elo**.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			if (usuariosAdd.length !== cantidadesAdd.length) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} La cantidad de **users_win** debe **coincidir** con la cantidad de **elo a agregar**.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}
			if (usuariosRemove.length !== cantidadesRemove.length) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} La cantidad de **users_loss** debe **coincidir** con la cantidad de **elo a remover**.`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}
			if (cantidadesAdd.some(elo => isNaN(elo) || elo < 0)) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Introduce valores **numéricos mayores a 0** en "elo_win".`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}
			if (cantidadesRemove.some(elo => isNaN(elo) || elo < 0)) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Introduce valores **numéricos mayores a 0** en "elo_loss".`);
				return interaction.editReply({ embeds: [e], flags: 64 });
			}

			if (!client.db.has(`${interaction.guild.id}.season2`)) {
				await client.db.set(`${interaction.guild.id}.season2`, []);
			}
			const eloData = (await client.db.get(`${interaction.guild.id}.season2`)) || [];
			let resultadosAdd = [];
			let resultadosRemove = [];
			let cambiosRoles = [];
			const genRandomId = randomId(10, 'alphanumeric');

			// Procesar el agregado
			for (let i = 0; i < usuariosAdd.length; i++) {
				const userId = usuariosAdd[i];
				const cantidadElo = cantidadesAdd[i];
				// Obtener el miembro para acceder a displayName
				const member = interaction.guild.members.cache.get(userId);
				const displayName = member ? member.displayName.replace(/\[[^\]]+\]\s*/, '') : 'Desconocido';

				let usuarioElo = eloData.find(entry => entry.user_id === userId);
				const eloPrevio = usuarioElo ? usuarioElo.elo : 0;
				if (usuarioElo) {
					usuarioElo.elo += cantidadElo;
					usuarioElo.displayName = displayName;
				} else {
					usuarioElo = { user_id: userId, elo: cantidadElo, displayName: displayName };
					eloData.push(usuarioElo);
				}
				resultadosAdd.push({ userId, totalElo: usuarioElo.elo, cantidadElo, eloPrevio });
			}

			for (let i = 0; i < usuariosRemove.length; i++) {
				const userId = usuariosRemove[i];
				const cantidadElo = cantidadesRemove[i];
				const member = interaction.guild.members.cache.get(userId);
				const displayName = member ? member.displayName.replace(/\[[^\]]+\]\s*/, '') : 'Desconocido';

				let usuarioElo = eloData.find(entry => entry.user_id === userId);
				const eloPrevio = usuarioElo ? usuarioElo.elo : 0;
				if (usuarioElo) {
					usuarioElo.elo -= cantidadElo;
					if (usuarioElo.elo < 0) usuarioElo.elo = 0;
					usuarioElo.displayName = displayName;
				} else {
					usuarioElo = { user_id: userId, elo: 0, displayName: displayName };
					eloData.push(usuarioElo);
				}
				resultadosRemove.push({ userId, totalElo: usuarioElo.elo, cantidadElo, eloPrevio });
			}

			await client.db.set(`${interaction.guild.id}.season2`, eloData);
			await updateEloTable(client, interaction.guild.id);

			const logsAdd = resultadosAdd.map(result => ({
				elo: result.cantidadElo,
				targetUser: result.userId,
				eloAdderUser: interaction.user.id,
				componentId: genRandomId,
				eloAnterior: result.eloPrevio,
			}));

			const logsRemove = resultadosRemove.map(result => ({
				elo: result.cantidadElo,
				targetUser: result.userId,
				eloAdderUser: interaction.user.id,
				componentId: genRandomId,
				eloAnterior: result.eloPrevio,
			}));

			await sendLogs(client, interaction, 'ADD', logsAdd);
			await sendLogs(client, interaction, 'REMOVE', logsRemove);

			const procesarRoles = async (resultadosArray) => {
				for (const resultado of resultadosArray) {
					try {
						const resultadoRol = await updateUserRankRole(client, interaction.guild.id, resultado.userId);
						if (resultadoRol && resultadoRol.nuevoRango && resultadoRol.rangoActual) {
							const { rangoActual, nuevoRango } = resultadoRol;
							const tipoCambio = rangoActual !== nuevoRango ? (rangoActual < nuevoRango ? 'Bajó al rango' : 'Subió al rango') : null;
							if (tipoCambio) {
								cambiosRoles.push({
									usuario: resultado.userId,
									tipoCambio,
									rango: `<@&${nuevoRango}>`
								});
							}
						}
					} catch (error) {
						console.error(`Error al actualizar el rango del usuario <@${resultado.userId}>:`, error);
					}
				}
			};
			await procesarRoles(resultadosAdd);
			await procesarRoles(resultadosRemove);

			// Construir respuesta final para agregar y remover
			let respuestaAdd = resultadosAdd
				.map(result => `${client.emojisId.sumar} **+${result.cantidadElo}** de elo a <@${result.userId}>. (Total **${result.totalElo}**).`)
				.join('\n');
			let respuestaRemove = resultadosRemove
				.map(result => `${client.emojisId.restar} **-${result.cantidadElo}** de elo a <@${result.userId}>. (Total **${result.totalElo}**).`)
				.join('\n');
			
			let respuestaFinal = `${respuestaAdd}\n\n${respuestaRemove}`;
			if (cambiosRoles.length > 0) {
				respuestaFinal += '\n\n**Cambios de Rango:**\n' + cambiosRoles
					.map(cambio => `🔹 <@${cambio.usuario}> nuevo **rango**: ${cambio.rango}`)
					.join('\n');
			}

			let matchCount = await client.db.get(`${interaction.guild.id}.matchCount`) || 0;
			matchCount++;
			await client.db.set(`${interaction.guild.id}.matchCount`, matchCount);

			const canalImagen = await client.channels.fetch('1335078330126303274');
			const statsRespuesta = `${respuestaAdd}\n\n${respuestaRemove}`;

			let matchStatsButtons = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
				.setLabel(`Elo added by ${interaction.user.displayName}`)
				.setStyle(ButtonStyle.Link)
				.setURL(`https://discord.com/channels/${interaction.guild.id}/${client.elo.eloAdderChannel}`),
			);

			let goToMatchStatsChannel = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
				.setLabel(`Go to match stats channel!`)
				.setStyle(ButtonStyle.Link)
				.setURL(`https://discord.com/channels/${interaction.guild.id}/1335078330126303274`),
			); 

		
			let matchStatsEmbed = new EmbedBuilder()
				.setColor(client.colors.success)
				.setTimestamp()
				.setImage(imagen.url)
				.setTitle("⚔️ Resultados de la Partida | Match #"+matchCount+"")
				.setFooter({ text: `Elo Agregado por ${interaction.user.displayName} | Match #${matchCount}` })
				.setDescription(statsRespuesta);
			await canalImagen.send({ embeds: [matchStatsEmbed], components: [matchStatsButtons] });

			// Responder en el canal de comando
			const embedRespuesta = new EmbedBuilder()
				.setColor(client.colors.success)
				.setDescription(respuestaFinal);
			return interaction.editReply({ embeds: [embedRespuesta], components: [goToMatchStatsChannel] });

		} catch (error) {
			console.error('Error en el comando /add:', error);
			const e = new EmbedBuilder()
				.setColor(client.colors.error)
				.setDescription(`${client.emojisId.error} Ocurrió un error inesperado. Inténtalo nuevamente más tarde.`);
			return interaction.editReply({ embeds: [e] });
		}
	},
});
