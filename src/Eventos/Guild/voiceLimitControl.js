const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "voiceStateUpdate",
  ejecutar: async (client, oldState, newState) => {
    // CODIGO PARA LO PUTOS BR'S QUE SE CONECTAN EN LOS CANALES DE DUO Y TRIO, VAMOS A EVITAR ESA MIERDA.
    const voiceChannels = {
      // Duos (2 jugadores máximo)
      '1318320678490869862': 2,
      '1311846538607333378': 2,
      '1311846567359152218': 2,
      // Trios (3 jugadores máximo)
      '1311846597965123665': 3,
      '1311846616923373640': 3,
      '1330991669935476787': 3
    };

    try {
      const newChannel = newState.channel;
      if (!newChannel || !voiceChannels[newChannel.id]) return;

      const maxUsers = voiceChannels[newChannel.id];
      
      await new Promise(resolve => setTimeout(resolve, 1000)); //un segundo de latencia para desconectarlos hdp para evitar el spam y bugear el bot

      if (newChannel.members.size > maxUsers) {
        const user = newState.member;
   
        await user.voice.disconnect('Límite de capacidad excedido');
      }
    } catch (error) {
      console.error('Error en el sistema de control de canales:', error);
    }
  }
});