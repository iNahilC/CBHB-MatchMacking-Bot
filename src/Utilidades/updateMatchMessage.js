const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

async function actualizarMensajePartida(client, mensaje) {
    if (!mensaje) return;
    
    const partidas = await client.db.get(`${mensaje.guild.id}.matchs`) || [];
    const partida = partidas.find(p => p.messageId === mensaje.id);
    if (!partida) return;

    let estadoPartida = '';
    if (partida.enCurso) {
        estadoPartida = `${client.emojisId.game} **Partida en progreso**`;
    } else if (partida.votacionIniciada) {
        estadoPartida = `${client.emojisId.vote} **Votación de capitanes en curso**`;
    } else {
        estadoPartida = `${client.emojisId.waiting} **Esperando jugadores...**`;
    }

    // Obtener los jugadores para la sección "Jugadores Disponibles"
    const jugadoresDisponibles = partida.jugadores.map((id, i) => {
        const miembro = mensaje.guild.members.cache.get(id);
        return `**${i + 1}) ${miembro.displayName}** (${miembro})`;
    }).join('\n') || 'No hay jugadores disponibles aún.';

    const embed = new EmbedBuilder()
        .setTitle('🎮 Partida en Organización')
        .setColor(client.colors.success)
        .addFields(
            { name: '🛡️ Host', value: `<@${partida.hostId}>`, inline: true },
            { name: '👥 Jugadores', value: `${partida.jugadores.length}/10`, inline: true },
            { name: '🏆 Jugadores Disponibles', value: jugadoresDisponibles }
        )
        .setDescription(`${estadoPartida}`)
        .setFooter({ text: 'Estado de la partida' });

    // Crear fila de botones
    const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`queue_leave_${partida.hostId}`)
            .setLabel('Salir')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`queue_start_votation_${partida.hostId}`)
            .setLabel('Iniciar Votación de Capitanes')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(partida.jugadores.length <= 9)
    );

    try {
        await mensaje.edit({ embeds: [embed], components: [botones] });
    } catch (error) {
        console.error('Error al actualizar el mensaje de la partida:', error);
    }
}

async function actualizarVotaciónMensaje(client, message) {
    try {
        const partidas = await client.db.get(`${message.guild.id}.matchs`) || [];
        const partida = partidas.find(p => p.votacionMessageId === message.id);
        if (!partida) return;

        const guild = await client.guilds.fetch(partida.guildId);
        const jugadoresActivos = partida.jugadores.map(id => guild.members.cache.get(id)).filter(Boolean);

        // Ordenar jugadores por votos en tiempo real
        const jugadoresOrdenados = jugadoresActivos
            .filter(p => p.id !== partida.hostId)
            .sort((a, b) => {
                const votosA = partida.votos ? Object.values(partida.votos).filter(v => v === a.id).length : 0;
                const votosB = partida.votos ? Object.values(partida.votos).filter(v => v === b.id).length : 0;
                return votosB - votosA;
            });

        // Crear embed actualizado para mostrar jugadores y votos
        const embed = new EmbedBuilder()
            .setTitle(`${client.emojisId.vote} Votación de Capitanes`)
            .setColor(client.colors.success)
            .setDescription(`${client.emojisId.waiting} Tienes **${partida.tiempoRestante || 30}** segundos para votar un capitán`)
            .addFields(
                { name: 'Jugadores Disponibles', value: jugadoresOrdenados.map((jugador, i) => `${i + 1}) ${jugador.displayName} - 🗳️ ${partida.votos ? Object.values(partida.votos).filter(v => v === jugador.id).length : 0} votos`).join('\n') || 'No hay votos registrados aún.' }
            );

        // Crear SelectMenu con votos actualizados
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`queue_vote_${partida.hostId}`)
            .setPlaceholder('Selecciona un capitán')
            .addOptions(
                jugadoresOrdenados.slice(0, 25).map(jugador => ({
                    label: `${jugador.displayName} (${partida.votos ? Object.values(partida.votos).filter(v => v === jugador.id).length : 0} votos)`,
                    value: jugador.id,
                    emoji: '🗳️'
                }))
            );

        // Editar mensaje con componentes actualizados
        await message.edit({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectMenu)]
        });

    } catch (error) {
        console.error('Error actualizando votación:', error);
    }
}

module.exports = { actualizarMensajePartida, actualizarVotaciónMensaje };
