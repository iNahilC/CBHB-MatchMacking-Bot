// channelUpdate.js
const { Evento, ChannelType } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "channelUpdate",
  ejecutar: async (client, oldChannel, newChannel) => {
    if (oldChannel.guild.id !== client.mm.serverId) return;
  
    try {
      const auditLogs = await oldChannel.guild.fetchAuditLogs({
        type: 11,
        limit: 10
      });
  
      const entry = auditLogs.entries.find(e =>
        e.target?.id === newChannel.id && (Date.now() - e.createdTimestamp < 10000)
      );
      if (!entry) return;
  
      const ejecutor = entry.executor;
      if (ejecutor.id === client.user.id) return;
  
      const miembro = oldChannel.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;
  
      const canalesSospechosos = await detectarRaid(ejecutor.id, 'CANALES', newChannel);
      if (canalesSospechosos) {
        const canalesARevisar = Array.isArray(canalesSospechosos) ? canalesSospechosos : [canalesSospechosos];

        console.log(`🚨 Sancionando a ${ejecutor.tag} por actividad sospechosa.`);
        await sancionarUsuario(client, miembro);

        for (const canal of canalesARevisar) {
          if (!canal) {
            console.warn("⚠️ Canal sospechoso es null o indefinido. Saltando...");
            continue;
          }

          const restoredData = {};

          if (oldChannel.name && oldChannel.name !== canal.name) {
            restoredData.name = oldChannel.name;
          }

          if (canal.type === ChannelType.GuildText) {
            if (oldChannel.topic !== canal.topic) {
              restoredData.topic = oldChannel.topic;
            }
            if (oldChannel.rateLimitPerUser !== canal.rateLimitPerUser) {
              restoredData.rateLimitPerUser = oldChannel.rateLimitPerUser;
            }
          }

          if (oldChannel.nsfw !== canal.nsfw) {
            restoredData.nsfw = oldChannel.nsfw;
          }

          if (canal.type === ChannelType.GuildVoice || canal.type === ChannelType.GuildStageVoice) {
            if (oldChannel.bitrate !== canal.bitrate) {
              restoredData.bitrate = oldChannel.bitrate;
            }
            if (oldChannel.userLimit !== canal.userLimit) {
              restoredData.userLimit = oldChannel.userLimit;
            }
          }

          if (oldChannel.parentId !== canal.parentId) {
            restoredData.parent = oldChannel.parentId;
          }

          const oldOverwrites = oldChannel.permissionOverwrites.cache;
          restoredData.permissionOverwrites = oldOverwrites.map(po => ({
            id: po.id,
            allow: po.allow.bitfield,
            deny: po.deny.bitfield,
            type: po.type
          }));

          if (Object.keys(restoredData).length > 0) {
            await canal.edit(restoredData, { reason: 'Recuperación anti-raid: Revirtiendo cambios sospechosos' });
          }

          console.log(`✅ Se han revertido los cambios en el canal "${canal.name}".`);
        }

        const logsChannel = await oldChannel.guild.channels.fetch(client.mm.raidLogs);
        if (logsChannel) {
          const canalesRevertidos = canalesARevisar
            .filter(c => c !== null)
            .map(c => `"${c.name}"`)
            .join(", ");

          await logsChannel.send(`✅ Se han revertido los cambios en los canales ${canalesRevertidos} realizados por ${ejecutor.tag || ejecutor.username}.`);
        }
      }
    } catch (error) {
      console.error("Error en channelUpdate anti-raid:", error);
    }
  }
});
