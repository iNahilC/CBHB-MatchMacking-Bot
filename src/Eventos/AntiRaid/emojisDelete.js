const { Evento } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "emojisDelete",
  ejecutar: async (client, emoji) => {
    if (emoji.guild.id !== client.mm.serverId) return;
    try {
      const auditLogs = await emoji.guild.fetchAuditLogs({
        type: 62,
        limit: 1
      });
      const entry = auditLogs.entries.first();
      if (!entry) return;
      
      const ejecutor = entry.executor;
      const miembro = emoji.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;
      
      if (detectarRaid(ejecutor.id, 'EMOJIS')) {
          await sancionarUsuario(client, miembro);
        const emojiData = {
          attachment: emoji.url,
          name: emoji.name
        };
        if (emoji.roles && emoji.roles.size > 0) {
          emojiData.roles = Array.from(emoji.roles.keys());
        }
        
        const newEmoji = await emoji.guild.emojis.create({
          attachment: emojiData.attachment,
          name: emojiData.name,
          roles: emojiData.roles || []
        }, "Anti-raid: Emoji eliminado por un raider, restaurado automáticamente");
        
        const logsChannel = await emoji.guild.channels.fetch(client.mm.raidLogs);
        if (logsChannel) {
          await logsChannel.send(`❌ Emoji **${emoji.name}** eliminado por **${miembro.user.tag}** fue creado de nuevo (**${newEmoji.name}**).`);
        } else {
            console.log('No se encontró el canal de logs con el ID client.mm.raidLogs');
        }

        console.log(`✅ Emoji "${emoji.name}" restaurado con éxito.`);
      }
    } catch (error) {
      console.error("Error en anti-raid (emojisDelete):", error);
    }
  }
});
