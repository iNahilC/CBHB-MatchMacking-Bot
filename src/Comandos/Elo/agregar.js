const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');
const { updateEloTable } = require('../../Utilidades/updateEloTable.js');
const { updateUserRankRole } = require('../../Utilidades/updateUserRankRole.js');
const { sendLogs } = require('../../Utilidades/sendLogs.js');
const { randomId } = require('../../Utilidades/randomString.js');

module.exports = new SlashCommand({
    name: 'add',
    category: 'Elo Adder',
    description: 'Agrega elo a los jugadores.',
    example: '/add usuarios: <@usuario1><@usuario2> cantidades: 10, 15',
    options: [
        {
            name: 'usuarios',
            description: 'Usuarios a los que deseas agregar elo (menciones separadas por espacios o pegadas).',
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
        try {
            await interaction.deferReply();

            if (!interaction.member.roles.cache.has(client.elo.permissionRol)) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando. Necesitas el rol <@&${client.elo.permissionRol}>.**`);
                return interaction.editReply({ embeds: [e] });
            }

            const usuariosTexto = interaction.options.getString('usuarios')?.trim();
            const cantidadesTexto = interaction.options.getString('cantidades')?.trim();

            if (!usuariosTexto || !cantidadesTexto) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Debes proporcionar los campos **"usuarios"** y **"cantidades"** correctamente.`);
                return interaction.editReply({ embeds: [e] });
            }

            const usuarios = usuariosTexto.match(/<@!?(\d+)>/g)?.map((u) => u.replace(/[<@!>]/g, '')) || [];
            const cantidades = cantidadesTexto.split(',').map((val) => parseInt(val.trim(), 10));

            if (usuarios.length === 0 || cantidades.length === 0) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Debes mencionar al menos **un usuario** y una **cantidad de elo**.`);
                return interaction.editReply({ embeds: [e] });
            }

            if (usuarios.length !== cantidades.length) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} La cantidad de **usuarios** debe **coincidir** con la cantidad de **elo** especificada.`);
                return interaction.editReply({ embeds: [e] });
            }

            if (cantidades.some((elo) => isNaN(elo) || elo <= 0)) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Introduce valores **numéricos mayores a 0** en "cantidades".`);
                return interaction.editReply({ embeds: [e] });
            }

            if (!client.db.has(`${interaction.guild.id}.elo`)) {
                await client.db.set(`${interaction.guild.id}.elo`, []);
            }

            const eloData = (await client.db.get(`${interaction.guild.id}.elo`)) || [];
            let resultados = [];
            let cambiosRoles = [];
            const genRandomId = randomId(10, 'alphanumeric');

            for (let i = 0; i < usuarios.length; i++) {
                const userId = usuarios[i];
                const cantidadElo = cantidades[i];

                let usuarioElo = eloData.find((entry) => entry.user_id === userId);
                const eloPrevio = usuarioElo ? usuarioElo.elo : 0;
                if (usuarioElo) {
                    usuarioElo.elo += cantidadElo;
                } else {
                    usuarioElo = { user_id: userId, elo: cantidadElo };
                    eloData.push(usuarioElo);
                }

                resultados.push({ userId, totalElo: usuarioElo.elo, cantidadElo, eloPrevio });
            }

            await client.db.set(`${interaction.guild.id}.elo`, eloData);
            await updateEloTable(client, interaction.guild.id);

            const logs = resultados.map((result) => ({
                elo: result.cantidadElo,
                targetUser: result.userId,
                eloAdderUser: interaction.user.id,
                componentId: genRandomId,
                eloAnterior: result.eloPrevio,
            }));
            await sendLogs(client, interaction, 'ADD', logs);

            for (const resultado of resultados) {
                try {
                    const resultadoRol = await updateUserRankRole(client, interaction.guild.id, resultado.userId);
                    if (resultadoRol && resultadoRol.nuevoRango && resultadoRol.rangoActual) {
                        const { rangoActual, nuevoRango } = resultadoRol;
                        const tipoCambio = rangoActual !== nuevoRango ? 
                            (rangoActual < nuevoRango ? 'Bajó al rango' : 'Subió al rango') : null;
                        if (tipoCambio) {
                            cambiosRoles.push({
                                usuario: resultado.userId,
                                tipoCambio,
                                rango: `<@&${nuevoRango}>`,
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error al actualizar el rango del usuario <@${resultado.userId}>:`, error);
                }
            }

            let respuestaFinal = resultados
                .map((result) => `✅ Se **__agregó__** correctamente **${result.cantidadElo}** de elo a <@${result.userId}>. Elo total: **${result.totalElo}**.`)
                .join('\n');

            if (cambiosRoles.length > 0) {
                respuestaFinal += '\n\n**Cambios de Rango:**\n' + cambiosRoles
                    .map((cambio) => `🔹 <@${cambio.usuario}> nuevo **rango**: ${cambio.rango}`)
                    .join('\n');
            }

            const e = new EmbedBuilder().setColor(client.colors.success).setDescription(respuestaFinal);
            return interaction.editReply({ embeds: [e] });

        } catch (error) {
            console.error('Error en el comando /agregar:', error);
            const e = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription(`${client.emojisId.error} Ocurrió un error inesperado. Inténtalo nuevamente más tarde.`);
            return interaction.editReply({ embeds: [e] });
        }
    },
});