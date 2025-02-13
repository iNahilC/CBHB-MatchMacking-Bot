const { Evento } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "emojiCreate",
  ejecutar: async (client, emoji) => {
    if (emoji.guild.id !== client.mm.serverId) return;
    try {
      const auditLogs = await emoji.guild.fetchAuditLogs({
        type: 60,
        limit: 1
      });
      const entry = auditLogs.entries.first();
      if (!entry) return;
      
      const ejecutor = entry.executor;
      const miembro = emoji.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;
      
      if (detectarRaid(ejecutor.id, 'EMOJIS')) {
        await sancionarUsuario(client, miembro);
        await emoji.delete("Anti-raid: Emoji creado por un raider");
        
        const logsChannel = await emoji.guild.channels.fetch(client.mm.raidLogs);
        if (logsChannel) {
          await logsChannel.send(`❌ Emoji **${emoji.name}** creado por **${miembro.user.tag}** fue eliminado por actividad sospechosa.`);
        } else {
            console.log('No se encontró el canal de logs con el ID client.mm.raidLogs');
        }

        console.log(`✅ Emoji "${emoji.name}" eliminado por actividad sospechosa.`);
      }
    } catch (error) {
      console.error("Error en anti-raid (emojiCreate):", error);
    }
  }
});
