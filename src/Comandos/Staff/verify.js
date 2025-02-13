const { SlashCommand, EmbedBuilder, PermissionsBitField } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
	name: 'verificar',
	category: 'Role Verifier',
	description: 'Verifica usuarios, les asigna el rol de verificado.',
	example: '/verificar usuarios: <@usuario1> <@usuario2> <@usuario3> nombres: juan, pedro, nicolas',
    options: [
        {
            name: 'usuarios',
            description: 'Usuarios a verificar (menciones).',
            type: 3,
            required: true,
        },
        {
            name: 'nombres',
            description: 'Nombres separados por comas.',
            type: 3,
            required: true,
        },
    ],
	ejecutar: async (client, interaction) => {
		try {
			await interaction.deferReply();

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando.**`);
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } });
			}

			// Obtener los parámetros
			const usuariosTexto = interaction.options.getString('usuarios');
			const nombresTexto = interaction.options.getString('nombres');
			
			// Extraer menciones
			const usuarios = usuariosTexto.match(/<@!?\d+>/g);
			if (!usuarios || usuarios.length === 0) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} Debes **mencionar** a uno o varios **usuarios** válidos en el campo **"usuarios"**.`);
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } });
			}

			// Dividir y limpiar la lista de nombres
			const nombresArray = nombresTexto.split(',')
				.map(nombre => nombre.trim())
				.filter(nombre => nombre.length > 0);

			// Si la cantidad de nombres no coincide con la cantidad de usuarios, se puede informar un error.
			if (nombresArray.length !== usuarios.length) {
				const e = new EmbedBuilder()
					.setColor(client.colors.error)
					.setDescription(`${client.emojisId.error} La cantidad de nombres (${nombresArray.length}) no coincide con la cantidad de usuarios (${usuarios.length}).`);
				return interaction.editReply({ embeds: [e], allowedMentions: { repliedUser: false } });
			}

			const verifyRolId = client.mm.verifyRolId;
			const firstRankRoleId = client.elo.ranks.rango0;

			let resultados = [];

			// Iterar sobre cada usuario mencionado y asignarle el nombre correspondiente.
			for (let i = 0; i < usuarios.length; i++) {
				const usuarioMencion = usuarios[i];
				const userId = usuarioMencion.replace(/[<@!>]/g, '');
				const miembro = interaction.guild.members.cache.get(userId);

				if (!miembro) {
					resultados.push(`⚠️ <@${userId}> no está en este servidor.`);
					continue;
				}

				if (miembro.roles.cache.has(verifyRolId)) {
					resultados.push(`✅ <@${userId}> ya está verificado.`);
					continue;
				}

				try {
					const nuevoNick = `[⓪] ${nombresArray[i]}`;

					await miembro.setNickname(nuevoNick);
					await miembro.roles.set([verifyRolId, firstRankRoleId]);

					resultados.push(`✔️ Se ha verificado y actualizado el nick a \`${nuevoNick}\` a <@${userId}>.`);
				} catch (error) {
					console.error(`Error al asignar el rol o actualizar el nick a <@${userId}>:`, error);
					resultados.push(`❌ No se pudo verificar o actualizar el nick a <@${userId}> debido a un error.`);
				}
			}

			const respuestaFinal = resultados.join('\n');
			const embed = new EmbedBuilder()
				.setColor(client.colors.success)
				.setDescription(respuestaFinal)
				.setFooter({ text: 'Sistema de Verificación', iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			return interaction.editReply({ embeds: [embed], allowedMentions: { repliedUser: false } });
		} catch (error) {
			console.log("comando /verificar", error.message);
			return interaction.editReply("¡Hubo un error interno!");
		}
	},
});
