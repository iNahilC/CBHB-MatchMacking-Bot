const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { getVoicePlayers } = require("../Utilidades/getVoicePlayers")

async function actualizarMensajePartida(client, message) {
    try {
        const partidas = await client.db.get(`${message.guild.id}.matchs`) || [];
        const partida = partidas.find(p => p.messageId === message.id);
        if (!partida) return;

        const guild = await client.guilds.fetch(partida.guildId);
        const jugadoresEnVoz = getVoicePlayers(guild).map(p => p.id);
        const jugadoresTotales = [...new Set([...jugadoresEnVoz, ...partida.jugadores])];
        const jugadoresActivos = jugadoresTotales.map(id => guild.members.cache.get(id)).filter(Boolean);

        partida.jugadores = jugadoresTotales;
        await client.db.set(`${message.guild.id}.matchs`, partidas);

        // Ordenar jugadores por votos
        const jugadoresOrdenados = jugadoresActivos
            .filter(p => p.id !== partida.hostId)
            .sort((a, b) => {
                const votosA = partida.votos ? Object.values(partida.votos).filter(v => v === a.id).length : 0;
                const votosB = partida.votos ? Object.values(partida.votos).filter(v => v === b.id).length : 0;
                return votosB - votosA;
            });

        let listaJugadores = jugadoresOrdenados
            .map((p, i) => {
                const votos = partida.votos ? Object.values(partida.votos).filter(v => v === p.id).length : 0;
                return `**${i + 1}) ${p.displayName}** (${p}) ${votos > 0 ? `- 🗳️ ${votos} voto(s)` : ''}`;
            })
            .join('\n') || 'No hay jugadores disponibles aún.';

        const embed = new EmbedBuilder()
            .setTitle('🎮 Partida en Organización')
            .setColor(client.colors.success)
            .addFields(
                { 
                    name: `${client.emojisId.crown} Capitanes`,
                    value: partida.segundoCapitan 
                        ? `• Host: <@${partida.hostId}>\n• Capitán: <@${partida.segundoCapitan}>` 
                        : partida.votacionIniciada 
                            ? `${client.emojisId.clock} Votación en progreso...`
                            : 'No iniciada'
                },
                { 
                    name: `${client.emojisId.users} Jugadores [${jugadoresActivos.length}/10]`,
                    value: listaJugadores,
                    inline: true 
                }
            );

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`queue_unirse_${partida.hostId}`)
                .setLabel('Unirse')
                .setStyle(ButtonStyle.Success)
                .setEmoji(client.emojisId.join),
            new ButtonBuilder()
                .setCustomId(`queue_abandonar_${partida.hostId}`)
                .setLabel('Abandonar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji(client.emojisId.leave),
            new ButtonBuilder()
                .setCustomId(`queue_cancelar_${partida.hostId}`)
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(client.emojisId.cancel)
        );

        // Mostrar botón de votación solo si hay mínimo 2 jugadores y no hay capitán
        if (jugadoresActivos.length >= 2 && !partida.segundoCapitan && !partida.votacionIniciada) {
            botones.addComponents(
                new ButtonBuilder()
                    .setCustomId(`queue_start_votation_${partida.hostId}`)
                    .setLabel('Iniciar Votación')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(client.emojisId.vote)
            );
        }

        await message.edit({ 
            embeds: [embed], 
            components: [botones] 
        });

    } catch (error) {
        console.error('Error actualizando partida:', error);
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
