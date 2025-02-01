const { Evento } = require('../../ConfigBot/index');
const { getVoicePlayers } = require("../../Utilidades/getVoicePlayers");
const { actualizarMensajePartida, actualizarVotaciónMensaje } = require("../../Utilidades/updateMatchMessage");

const CANALES_PERMITIDOS = [
    '1326671674057166868', // Waiting Room
    '1318320678490869862', // Duo 1
    '1311846538607333378', // Duo 2
    '1311846567359152218', // Duo 3
    '1311846597965123665', // Trio 1
    '1311846616923373640', // Trio 2
    '1330991669935476787',  // Trio 3
    '1318927968281694260', //LOBBY
    '1325326260171440190' // Match 1
];
module.exports = new Evento({
    nombre: 'voiceStateUpdate',
    ejecutar: async (client, oldState, newState) => {

        const canalAnterior = oldState.channelId;
        const canalNuevo = newState.channelId;
        if (!CANALES_PERMITIDOS.includes(canalAnterior) && !CANALES_PERMITIDOS.includes(canalNuevo)) {
            return;
        }

        try {
            // Obtener partidas del servidor específico
            const partidas = await client.db.get(`${newState.guild.id}.matchs`) || [];
            if (!Array.isArray(partidas)) {
                console.error('Error: la estructura de datos de partidas no es un array.');
                return;
            }

            // Obtener canal antes de iterar
            const channel = await client.channels.fetch('1334627919087272088').catch(() => null);
            if (!channel) {
                console.error('Error: No se pudo obtener el canal de partidas.');
                return;
            }

            // Actualizar cada partida
            for (const partida of partidas) {
                try {
                    if (!partida || !partida.messageId) continue;

                    const messageId = partida.messageId;
                    const message = await channel.messages.fetch(messageId).catch(() => null);

                    if (!message) {
                        console.warn(`Advertencia: No se encontró el mensaje con ID ${messageId}. Eliminando partida...`);
                        const index = partidas.findIndex(p => p.messageId === messageId);
                        if (index > -1) partidas.splice(index, 1);
                        await client.db.set(`${newState.guild.id}.matchs`, partidas);
                        continue;
                    }

                    // Obtener jugadores actuales en los canales de voz
                    const jugadores = getVoicePlayers(newState.guild);
                    const jugadoresIds = jugadores.map(p => p.id);

                    // Actualizar la lista de jugadores en la partida
                    partida.jugadores = jugadoresIds;
                    await client.db.set(`${newState.guild.id}.matchs`, partidas);

                    // Actualizar el mensaje de la partida
                    await actualizarMensajePartida(client, message);
                    if (partida?.votacionMessageId) {
                        console.log(partida.votacionMessageId)
                        let voteMessageId = await channel.messages.fetch(partida.votacionMessageId).catch(() => null);
                        if (voteMessageId === null) return;
                        await actualizarVotaciónMensaje(client, voteMessageId)
                    }

                } catch (error) {
                    console.error(`Error al actualizar la partida con messageId ${partida?.messageId}:`, error);
                    if (error.code === 10008) { // Mensaje no encontrado
                        const index = partidas.findIndex(p => p.messageId === partida.messageId);
                        if (index > -1) partidas.splice(index, 1);
                        await client.db.set(`${newState.guild.id}.matchs`, partidas);
                    }
                }
            }
        } catch (error) {
            console.error('Error general en voiceStateUpdate:', error);
        }
    },
});
