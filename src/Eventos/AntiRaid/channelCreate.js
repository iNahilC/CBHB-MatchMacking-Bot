const { Evento } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require("../../Utilidades/detectRaid.js");

module.exports = new Evento({
  nombre: "channelCreate",
  ejecutar: async (client, channel) => {
    if (channel.guild.id !== client.mm.serverId) return;

    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        type: 10, // CHANNEL_CREATE
        limit: 1
      });

      const entry = auditLogs.entries.first();
      if (!entry) return;

      const ejecutor = entry.executor;
      if (!ejecutor || ejecutor.id === client.user.id) return;

      const miembro = channel.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;

      const canalesSospechosos = await detectarRaid(ejecutor.id, 'CANALES', channel);
      if (!canalesSospechosos) return;

      const listaCanales = Array.isArray(canalesSospechosos) ? canalesSospechosos : [canalesSospechosos];

      console.log(`🚨 Sancionando a ${ejecutor.tag} por creación sospechosa de canales.`);
      await sancionarUsuario(client, miembro);

      for (const canal of listaCanales) {
        if (!canal) {
          console.warn("⚠️ Canal sospechoso es null o indefinido. Saltando...");
          continue;
        }

        if (channel.deletable && canal.deletable && channel.id === canal.id) {
          await channel.delete("Actividad sospechosa de raideo");
          console.log(`✅ Canal "${canal.name}" eliminado por actividad sospechosa.`);
        } else {
          console.warn(`⚠️ No se pudo eliminar el canal "${canal.name}" (no es eliminable).`);
        }
      }

      const logsChannel = await channel.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
      if (logsChannel) {
        const canalesEliminados = listaCanales.filter(c => c !== null).map(c => `"${c.name}"`).join(", ");
        await logsChannel.send(`❌ Canales **${canalesEliminados}** creados por **${miembro.user.tag}** fueron eliminados por actividad sospechosa.`);
      } else {
        console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
      }

    } catch (error) {
      console.error("❌ Error en anti-raid (channelCreate):", error);
    }
  }
});