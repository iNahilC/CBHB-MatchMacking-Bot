const { Evento } = require('../../ConfigBot/index.js');
const { sancionarUsuario, registrarWebhook, esActividadSospechosa } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "webhooksUpdate",
  ejecutar: async (client, channel) => {
    if (channel.guild.id !== client.mm.serverId) return;

    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        type: 50,
        limit: 1
      });

      const entry = auditLogs.entries.first();
      if (!entry) return;
      
      const ejecutor = entry.executor;
      if (ejecutor.id === client.user.id) return;

      const miembro = channel.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;

      registrarWebhook(ejecutor.id);

      if (esActividadSospechosa(ejecutor.id)) {
        console.log(`🚨 Actividad sospechosa detectada: ${ejecutor.tag} ha creado múltiples webhooks.`);

        await sancionarUsuario(client, miembro);

            const webhooks = await channel.fetchWebhooks();
        for (const webhook of webhooks.values()) {
          if (webhook.owner.id === ejecutor.id) {
            await webhook.delete("Anti-raid: Creación masiva de webhooks");
            console.log(`✅ Webhook "${webhook.name}" eliminado por actividad sospechosa.`);
          }
        }

        const logsChannel = await channel.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
        if (logsChannel) {
          await logsChannel.send(`❌ **${miembro.user.tag}** ha creado múltiples webhooks y fue sancionado por actividad sospechosa.`);
        } else {
          console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
        }
      }
    } catch (error) {
      console.error("❌ Error en anti-raid (webhookUpdate):", error);
    }
  }
});
