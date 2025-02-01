const { SlashCommand, EmbedBuilder, PermissionsBitField } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
	name: 'verificar',
	category: 'Role Verifier',
	description: 'Verifica usuarios y les asigna el rol de verificado.',
	example: '/verificar usuarios: <@usuario1><@usuario2>',
	options: [
		{
			name: 'usuarios',
			description: 'Usuarios a los que deseas verificar (menciones separadas por espacios o pegadas).',
			type: 3,
			required: true,
		},
	],
	ejecutar: async (client, interaction) => {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Admin)) {
			const e = new EmbedBuilder()
				.setColor(client.colors.error)
				.setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando.**`);
			return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
		}

		const usuariosTexto = interaction.options.getString('usuarios');
		const usuarios = usuariosTexto.match(/<@!?\d+>/g);
		const verifyRolId = client.mm.verifyRolId;

		if (!usuarios || usuarios.length === 0) {
			const e = new EmbedBuilder()
				.setColor(client.colors.error)
				.setDescription(
					`${client.emojisId.error} Debes **mencionar** a uno o varios **__usuarios__** válidos en el campo **__"usuarios"__**.`
				);
			return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
		}

		let resultados = [];

		for (const usuarioMencion of usuarios) {
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
				await miembro.roles.add(verifyRolId);
				resultados.push(`✔️ Se ha verificado correctamente a <@${userId}>.`);
			} catch (error) {
				console.error(`Error al asignar el rol a <@${userId}>:`, error);
				resultados.push(`❌ No se pudo verificar a <@${userId}> debido a un error.`);
			}
		}

		const respuestaFinal = resultados.join('\n');
		const embed = new EmbedBuilder()
			.setColor(client.colors.success)
			.setDescription(respuestaFinal)
			.setFooter({ text: 'Sistema de Verificación', iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		return interaction.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
	},
});
