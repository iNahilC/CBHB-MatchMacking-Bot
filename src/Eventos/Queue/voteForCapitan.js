const { Evento } = require('../../ConfigBot/index');
const { actualizarVotaciónMensaje, actualizarMensajePartida } = require('../../Utilidades/updateMatchMessage');

module.exports = new Evento({
    nombre: 'interactionCreate',
    ejecutar: async (client, interaction) => {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
        const partidas = await client.db.get(`${interaction.guild.id}.matchs`) || [];
        const [queue, accion, hostId ] = await interaction.customId.split("_");
       if (accion !== "vote") return;
        const partida = partidas.find(p => p.hostId === hostId);
        if (interaction.isStringSelectMenu() && interaction.customId === `queue_vote_${partida.hostId}`) {
            if (!partida.votos) partida.votos = {};
        
            // Eliminar voto anterior del usuario si ya había votado
            delete partida.votos[interaction.user.id];
        
            // Registrar nuevo voto
            partida.votos[interaction.user.id] = interaction.values[0];
        
            // Guardar en la base de datos antes de actualizar los mensajes
            await client.db.set(`${interaction.guild.id}.matchs`, partidas);
        
            try {
                const votacionMessage = await interaction.channel.messages.fetch(partida.votacionMessageId);
                const votacionPrincipal = await interaction.channel.messages.fetch(partida.messageId);
        
                // Asegurar que los datos están actualizados antes de llamar a las funciones
        
                await actualizarVotaciónMensaje(client, votacionMessage);
                await actualizarMensajePartida(client, votacionPrincipal);
        
                let userVoted = await interaction.guild.members.cache.get(interaction.user.id).displayName;
                console.log(`Voto de ${userVoted} registrado para ${interaction.values[0]}`);
        
                let voteReply = await interaction.reply({ 
                    content: '✅ Voto registrado correctamente.', 
                    flags: 64 
                });
        
                setTimeout(() => voteReply.delete(), 3000);
            } catch (error) {
                console.error('Error al actualizar el mensaje de votación:', error);
                await interaction.reply({ 
                    content: '❌ Error al registrar tu voto.', 
                    flags: 64 
                });
            }
        }        
    },
});