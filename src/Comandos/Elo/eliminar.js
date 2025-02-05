const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');
const { updateEloTable } = require('../../Utilidades/updateEloTable.js');
const { updateUserRankRole } = require('../../Utilidades/updateUserRankRole.js');
const { randomId } = require('../../Utilidades/randomString.js');
const { sendLogs } = require('../../Utilidades/sendLogs.js');

module.exports = new SlashCommand({
    name: 'delete',
    category: 'Elo Adder',
    description: 'Establece el Elo de un jugador a 0 y le asigna el rango correspondiente.',
    example: '/delete usuarios: <@usuario1><@usuario2>',
    options: [
        {
            name: 'usuarios',
            description: 'Usuarios a los que deseas eliminar el Elo y establecer el rango.',
            type: 3,
            required: true,
        },
    ],
    ejecutar: async (client, interaction) => {
        try {
            await interaction.deferReply();

            if (!interaction.member.roles.cache.has(client.elo.permissionRol)) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando. Necesitas el rol <@&${client.elo.permissionRol}>.**`);
                return interaction.editReply({ embeds: [e] });
            }

            const usuariosTexto = interaction.options.getString('usuarios');
            const usuarios = usuariosTexto?.match(/<@!?(\d+)>/g);

            if (!usuarios || usuarios.length === 0) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Debes mencionar **__usuarios__** válidos en el campo **"usuarios"**.`);
                return interaction.editReply({ embeds: [e] });
            }

            if (!client.db.has(`${interaction.guild.id}.season2`)) {
                await client.db.set(`${interaction.guild.id}.season2`, []);
            }

            const elo = (await client.db.get(`${interaction.guild.id}.season2`)) || [];
            const resultados = [];
            const errores = [];
            const logs = [];
            const genRandomId = randomId(10, 'alphanumeric'); // ID único para todos los logs

			for (const mencion of usuarios) {
				const userId = mencion.replace(/[<@!>]/g, '');
				const usuarioElo = elo.find((entry) => entry.user_id === userId);
			
				if (!usuarioElo) {
					errores.push(`El usuario <@${userId}> **no** se encuentra en la base de datos.`);
					continue;
				}
			
				const oldElo = usuarioElo.elo;
				usuarioElo.elo = 0;
			
				logs.push({ 
					elo: 0,
					targetUser: userId,
					eloAdderUser: interaction.user.id,
					componentId: genRandomId,
					eloAnterior: oldElo,
				});
			
				try {
					await updateUserRankRole(client, interaction.guild.id, userId, elo);
					resultados.push(`El Elo de **<@${userId}>** fue **__establecido a 0__** y se le asignó el rango correspondiente.`);
				} catch (error) {
					console.error(`Error al actualizar el rango de <@${userId}>:`, error);
					errores.push(`Error al actualizar el rango de <@${userId}>.`);
				}
			}

            await client.db.set(`${interaction.guild.id}.season2`, elo);
            await updateEloTable(client, interaction.guild.id);

            await sendLogs(client, interaction, 'DELETE', logs);

            let respuestaFinal = '';
            if (resultados.length > 0) respuestaFinal += resultados.join('\n');
            if (errores.length > 0) respuestaFinal += `\n\n${errores.join('\n')}`;

            const e = new EmbedBuilder()
                .setColor(resultados.length > 0 ? client.colors.success : client.colors.error)
                .setDescription(respuestaFinal || 'No se realizaron cambios.');

            return interaction.editReply({ embeds: [e] });

        } catch (error) {
            console.error('Error en /eliminar:', error);
            const e = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription(`${client.emojisId.error} Ocurrió un error inesperado.`);
            return interaction.editReply({ embeds: [e] });
        }
    },
});