const { Evento } = require('../../ConfigBot/index');

module.exports = new Evento({
    nombre: 'interactionCreate',
    ejecutar: async (client, interaction) => {
        if (!interaction.isButton()) return;
        const partidas = await client.db.get(`${interaction.guild.id}.matchs`) || [];
        const [queue, accion, hostId ] = await interaction.customId.split("_");
        if (accion !== "cancelar") return;
        console.log("cancelar", { queue, accion, hostId })

        const partida = partidas.find(p => p.hostId === hostId);
        if (interaction.customId === `queue_cancelar_${partida.hostId}`) {
            const partidas = await client.db.get(`${interaction.guild.id}.matchs`) || [];
            const partidaIndex = partidas.findIndex(p => p.hostId === interaction.user.id);
            if (partidaIndex === -1) {
                return interaction.reply({
                    content: '❌ Solo el host puede cancelar esta partida.',
                    flags: 64
                });
            }

            try {
                const [partidaEliminada] = partidas.splice(partidaIndex, 1);
                await client.db.set(`${interaction.guild.id}.matchs`, partidas);

                const channel = await client.channels.fetch('1334627919087272088');
                await channel.messages.delete(partidaEliminada.messageId);

                let matchCancelMessage = await interaction.reply({
                    content: '✅ Partida cancelada correctamente.',
                    flags: 64
                });

                setTimeout(() => matchCancelMessage.delete(), 5000)

                console.log(`[Partida] Cancelada por ${interaction.user.tag}`);

            } catch (error) {
                console.error('Error al cancelar partida:', error);
                await interaction.reply({
                    content: '❌ Ocurrió un error al cancelar la partida.',
                    flags: 64
                });
            }
        }
    },
});