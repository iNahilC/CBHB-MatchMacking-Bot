const { Evento } = require('../../ConfigBot/index');
const { actualizarMensajePartida } = require('../../Utilidades/updateMatchMessage');
const { StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = new Evento({
    nombre: 'interactionCreate',
    ejecutar: async (client, interaction) => {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
        const partidas = (await client.db.get(`${interaction.guild.id}.matchs`)) || [];

        const [queue, accion, votation, hostId] = interaction.customId.split('_');
        if (accion !== 'start') return;

        const partida = partidas.find((p) => p.hostId === hostId);
        if (!partida) return;

        if (interaction.customId === `queue_start_votation_${partida.hostId}`) {
            if (interaction.user.id !== partida.hostId) {
                return interaction.reply({
                    content: '❌ Solo el host puede iniciar la votación.',
                    flags: 64,
                });
            }

            // Ordenar jugadores por votos existentes
            const candidatos = partida.jugadores
                .filter((id) => id !== partida.hostId)
                .sort((a, b) => {
                    const votosA = partida.votos ? Object.values(partida.votos).filter((v) => v === a).length : 0;
                    const votosB = partida.votos ? Object.values(partida.votos).filter((v) => v === b).length : 0;
                    return votosB - votosA; // Orden descendente
                });

            if (candidatos.length === 0) {
                return interaction.reply({
                    content: '❌ No hay jugadores para votar.',
                    flags: 64,
                });
            }

            // Crear SelectMenu con jugadores ordenados
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`queue_vote_${partida.hostId}`)
                .setPlaceholder('Elige un capitán')
                .addOptions(
                    candidatos.slice(0, 25).map((id) => {
                        const member = interaction.guild.members.cache.get(id);
                        const votos = partida.votos ? Object.values(partida.votos).filter((v) => v === id).length : 0;
                        return {
                            label: `${member?.displayName || 'Usuario desconocido'}${votos > 0 ? ` (${votos} votos)` : ''}`,
                            value: id,
                        };
                    }),
                );

            const embed = new EmbedBuilder()
                .setTitle(`${client.emojisId.vote} Votación de Capitanes`)
                .setDescription(`${client.emojisId.waiting} Tienes **30 segundos** para votar por un capitán.`)
                .setColor(client.colors.success);

            try {
                const votacionMessage = await interaction.channel.send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(selectMenu)],
                });

                partida.votacionMessageId = votacionMessage.id;
                partida.tiempoRestante = 30;
                partida.votacionIniciada = true;
                await client.db.set(`${interaction.guild.id}.matchs`, partidas);

                let remainingTime = 30;
                const updateInterval = 5000; // 5 segundos

                // Función para actualizar el tiempo
                const updateTimer = async () => {
                    try {
                        remainingTime -= 5;
                        partida.tiempoRestante = remainingTime;
                        await client.db.set(`${interaction.guild.id}.matchs`, partidas);

                        // Actualizar solo el texto del embed, sin tocar la lista de votos
                        const newEmbed = new EmbedBuilder()
                            .setTitle(`${client.emojisId.vote} Votación de Capitanes`)
                            .setDescription(`${client.emojisId.waiting} Tienes **${remainingTime} segundos** para votar un capitán.`)
                            .setColor(client.colors.success);

                        await votacionMessage.edit({
                            embeds: [newEmbed],
                            components: votacionMessage.components,
                        });

                        if (remainingTime <= 0) {
                            clearInterval(timerInterval);
                            await finalizarVotacion();
                        }
                    } catch (error) {
                        console.error('Error actualizando tiempo:', error);
                    }
                };

                const timerInterval = setInterval(updateTimer, updateInterval);

                // Función para finalizar la votación
                const finalizarVotacion = async () => {
                    try {
                        clearInterval(timerInterval);
                        partida.votacionIniciada = false;
                        await client.db.set(`${interaction.guild.id}.matchs`, partidas);
                
                        if (!partida.votos || Object.keys(partida.votos).length === 0) {
                            await interaction.channel.send('❌ La votación terminó sin participaciones.');
                            return;
                        }
                
                        const conteoVotos = {};
                        Object.values(partida.votos).forEach(id => {
                            conteoVotos[id] = (conteoVotos[id] || 0) + 1;
                        });
                
                        // Determinar los dos jugadores con más votos
                        const votosOrdenados = Object.entries(conteoVotos)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 2);  // Tomamos los dos primeros
                
                        // Si hay empate entre los dos jugadores con más votos, seleccionamos aleatoriamente uno
                        let segundoCapitanId;
                        if (votosOrdenados.length === 2 && votosOrdenados[0][1] === votosOrdenados[1][1]) {
                            // Si hay empate, seleccionamos aleatoriamente entre los dos primeros
                            segundoCapitanId = Math.random() < 0.5 ? votosOrdenados[0][0] : votosOrdenados[1][0];
                        } else {
                            // Si no hay empate, tomamos el jugador con más votos
                            segundoCapitanId = votosOrdenados[0][0];
                        }
                
                        partida.segundoCapitan = segundoCapitanId;
                        await client.db.set(`${interaction.guild.id}.matchs`, partidas);
                
                        await interaction.channel.send(`🎉 ¡<@${segundoCapitanId}> ha sido elegido como segundo capitán con **${conteoVotos[segundoCapitanId]}** voto(s)!`);
                
                        await votacionMessage.delete().catch(() => null);
                
                        const votacionPrincipal = await interaction.channel.messages.fetch(partida.messageId);
                        await actualizarMensajePartida(client, votacionPrincipal);
                
                    } catch (error) {
                        console.error('Error al finalizar votación:', error);
                    }
                };

                setTimeout(() => {
                    clearInterval(timerInterval);
                    finalizarVotacion();
                }, 30000);

                const reply = await interaction.reply({
                    content: '✅ Votación iniciada correctamente.',
                    flags: 64,
                });
                setTimeout(() => reply.delete(), 5000);

            } catch (error) {
                console.error('Error al iniciar la votación:', error);
                await interaction.reply({
                    content: '❌ Error al iniciar la votación.',
                    flags: 64,
                });
            }
        }
    },
});
