const { Evento } = require('../../ConfigBot/index');
const { actualizarMensajePartida } = require('../../Utilidades/updateMatchMessage');

module.exports = new Evento({
    nombre: 'interactionCreate',
    ejecutar: async (client, interaction) => {
        if (!interaction.isButton()) return;
        const partidas = await client.db.get(`${interaction.guild.id}.matchs`) || [];
        const [queue, accion, hostId ] = await interaction.customId.split("_");
        if (accion !== "leave") return;
        console.log("leave", { queue, accion, hostId })

        const partida = partidas.find(p => p.hostId === hostId);
        if (interaction.customId !== `queue_leave_${partida.hostId}`) return;
        await interaction.deferReply({ flags: 64 });
        try {
            const member = interaction.guild.members.cache.get(interaction.user.id);
            
            if (interaction.user.id === partida.hostId) {
                return interaction.editReply({
                    content: "❌ No puedes abandonar tu propia paritda! Puedes cancelarla."
                })
            }

            if (!member.voice.channelId) {
                return interaction.editReply({
                    content: '❌ No estás participando en esta partida. Unete a <#1326671674057166868>',
                    flags: 64
                });
            }

            await member.voice.disconnect();
            
            const playerIndex = partida.jugadores.indexOf(interaction.user.id);
            if (playerIndex > -1) {
                partida.jugadores.splice(playerIndex, 1);
                await client.db.set(`${interaction.guild.id}.matchs`, partidas);
            }

            const channel = await client.channels.fetch(partida.messageId).catch(() => null);
            if (channel) {
                const message = await channel.messages.fetch(partida.messageId).catch(() => null);
                if (message) await actualizarMensajePartida(client, message);
            }

            await interaction.editReply({
                content: '✅ Has abandonado la partida correctamente.',
                flags: 64
            });

            console.log(`[Partida] ${interaction.user.tag} abandonó la partida`);

        } catch (error) {
            console.error('Error al abandonar partida:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al abandonar la partida.',
                flags: 64
            });
        }
    },
});