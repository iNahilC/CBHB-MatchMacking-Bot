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
    name: 'empate',
    category: 'Elo Adder',
    description: 'Agrega +15 puntos de elo a todos los jugadores en caso de empate.',
    example: '/empate match-image: [archivo] usuarios_terroristas: @user1 @user2... usuarios_counter: @user6 @user7...',
    options: [
        {
            name: 'match-image',
            description: 'Imagen que representa la partida (archivo).',
            type: 11,
            required: true,
        },
        {
            name: 'users_terrorists',
            description: 'Menciona a los 5 Terroristas (menciones separadas por espacios).',
            type: 3,
            required: true,
        },
        {
            name: 'users_counter',
            description: 'Menciona a los 5 Counter-Terroristas (menciones separadas por espacios).',
            type: 3,
            required: true,
        },
    ],
    ejecutar: async (client, interaction) => {
        try {
            await interaction.deferReply();

            // Validación de canal
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
                    .setDescription(`${client.emojisId.error} **Necesitas el rol <@&${client.elo.permissionRol}>.**`);
                return interaction.editReply({ embeds: [e], flags: 64 });
            }

            // Obtener opciones
            const imagen = interaction.options.getAttachment('match-image');
            const terroristasTexto = interaction.options.getString('users_terrorists').trim();
            const counterTexto = interaction.options.getString('users_counter').trim();

            // Validar campos requeridos
            if (!imagen || !terroristasTexto || !counterTexto) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Debes proporcionar todos los campos requeridos.`);
                return interaction.editReply({ embeds: [e], flags: 64 });
            }

            // Validar tipo de imagen
            const validImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'];
            if (!validImageTypes.includes(imagen.contentType)) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} **El archivo subido no es una imagen válida.**`);
                return interaction.editReply({ embeds: [e], flags: 64 });
            }

            // Procesar menciones
            const terroristas = terroristasTexto.match(/<@!?(\d+)>/g)?.map(u => u.replace(/[<@!>]/g, '')) || [];
            const counter = counterTexto.match(/<@!?(\d+)>/g)?.map(u => u.replace(/[<@!>]/g, '')) || [];
            const allUsers = [...terroristas, ...counter];

            if (terroristas.length !== 5 || counter.length !== 5) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Debes mencionar **exactamente 5 jugadores** para cada equipo.`);
                return interaction.editReply({ embeds: [e], flags: 64 });
            }

            let resultadosAdd = [];
            let cambiosRoles = [];
            const genRandomId = randomId(10, 'alphanumeric');
            
            if (!client.db.has(`${interaction.guild.id}.season2`)) {
                await client.db.set(`${interaction.guild.id}.season2`, []);
            }
            const eloData = await client.db.get(`${interaction.guild.id}.season2`);

            for (const userId of allUsers) {
                const member = interaction.guild.members.cache.get(userId);
                const displayName = member ? member.displayName.replace(/\[[^\]]+\]\s*/, '') : 'Desconocido';
                
                let usuarioElo = eloData.find(entry => entry.user_id === userId);
                const eloPrevio = usuarioElo ? usuarioElo.elo : 0;
                
                if (usuarioElo) {
                    usuarioElo.elo += 15;
                    usuarioElo.displayName = displayName;
                } else {
                    eloData.push({ user_id: userId, elo: 15, displayName });
                }
                
                resultadosAdd.push({ 
                    userId, 
                    totalElo: usuarioElo ? usuarioElo.elo : 15, 
                    cantidadElo: 15, 
                    eloPrevio 
                });
            }

            // Actualizar base de datos
            await client.db.set(`${interaction.guild.id}.season2`, eloData);
            await updateEloTable(client, interaction.guild.id);

            // Enviar logs
            const logs = resultadosAdd.map(result => ({
                elo: 15,
                targetUser: result.userId,
                eloAdderUser: interaction.user.id,
                componentId: genRandomId,
                eloAnterior: result.eloPrevio,
            }));
            await sendLogs(client, interaction, 'ADD', logs);

            // Actualizar roles
            for (const resultado of resultadosAdd) {
                try {
                    const { rangoActual, nuevoRango } = await updateUserRankRole(client, interaction.guild.id, resultado.userId);
                    if (nuevoRango && rangoActual !== nuevoRango) {
                        cambiosRoles.push({
                            usuario: resultado.userId,
                            rango: `<@&${nuevoRango}>`
                        });
                    }
                } catch (error) {
                    console.error(`Error actualizando rol para <@${resultado.userId}>:`, error);
                }
            }

            let respuesta = resultadosAdd
                .map(r => `${client.emojisId.sumar} +15 elo para <@${r.userId}> (Total: **${r.totalElo}**)`)
                .join('\n');

            if (cambiosRoles.length > 0) {
                respuesta += `\n\n**Cambios de rango:**\n${cambiosRoles.map(c => `🛡️ <@${c.usuario}> → ${c.rango}`).join('\n')}`;
            }

            let matchCount = await client.db.get(`${interaction.guild.id}.matchCount`) || 0;
            matchCount++;
            await client.db.set(`${interaction.guild.id}.matchCount`, matchCount);

            const statsChannel = await client.channels.fetch('1335078330126303274');
            const statsEmbed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setTitle(`⚔️ Empate registrado | Match #${matchCount}`)
                .setDescription(`**Terroristas:**\n${terroristas.map(t => `<@${t}>`).join(' ')}\n\n**Counter-Terrorists:**\n${counter.map(c => `<@${c}>`).join(' ')}\n\n${respuesta}`)
                .setImage(imagen.url)
                .setFooter({ text: `Registrado por ${interaction.user.displayName}` });

            await statsChannel.send({ embeds: [statsEmbed] });

            const embedFinal = new EmbedBuilder()
                .setColor(client.colors.success)
                .setDescription(`✅ **Empate registrado correctamente.** **+15** elo para todos los jugadores.`)
                .addFields(
                    { name: 'Terroristas', value: terroristas.map(t => `<@${t}>`).join(' '), inline: true },
                    { name: 'Counter-Terrorists', value: counter.map(c => `<@${c}>`).join(' '), inline: true }
                );

            interaction.editReply({ embeds: [embedFinal] });

        } catch (error) {
            console.error('Error en comando /empate:', error);
            const e = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription(`${client.emojisId.error} Error al procesar el empate.`);
            interaction.editReply({ embeds: [e] });
        }
    },
});