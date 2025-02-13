const { Evento, ChannelType } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "channelDelete",
  ejecutar: async (client, channel) => {
    if (channel.guild.id !== client.mm.serverId) return;

    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        type: 12, // CHANNEL_DELETE
        limit: 1
      });
      const entry = auditLogs.entries.first();
      if (!entry) return;

      const ejecutor = entry.executor;
      if (!ejecutor || ejecutor.id === client.user.id) return;

      const miembro = channel.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;

      const esRaid = await detectarRaid(ejecutor.id, 'CANALES');
      if (esRaid) {
        console.log(`🚨 Sancionando a ${ejecutor.tag} por eliminación sospechosa de canales.`);
        await sancionarUsuario(client, miembro);

        const newChannelConfig = {
          name: channel.name,
          type: channel.type,
          permissionOverwrites: channel.permissionOverwrites.cache.map((overwrite) => ({
            id: overwrite.id,
            allow: overwrite.allow.bitfield,
            deny: overwrite.deny.bitfield,
            type: overwrite.type,
          })),
          nsfw: channel.nsfw,
          reason: "Anti-raid: Canal eliminado por un raider, restaurado automáticamente"
        };

        if (channel.type === ChannelType.GuildText) {
          newChannelConfig.topic = channel.topic || null;
          newChannelConfig.rateLimitPerUser = channel.rateLimitPerUser || 0;
        }

        if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
          newChannelConfig.bitrate = channel.bitrate;
          newChannelConfig.userLimit = channel.userLimit;
        }

        if (channel.parentId) {
          newChannelConfig.parent = channel.parentId;
        }

        const newChannel = await channel.guild.channels.create(newChannelConfig).catch(console.error);
        if (newChannel && typeof channel.position === "number") {
          await newChannel.setPosition(channel.position).catch(console.error);
        }

        console.log(`✅ Canal "${channel.name}" restaurado en la posición ${channel.position}`);

        const logsChannel = await channel.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
        if (logsChannel) {
          await logsChannel.send(`✅ Canal **"${channel.name}"** eliminado por **${miembro.user.tag}** fue restaurado automáticamente.`);
        } else {
          console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
        }
      }
    } catch (error) {
      console.error("❌ Error en anti-raid (channelDelete):", error);
    }
  }
});