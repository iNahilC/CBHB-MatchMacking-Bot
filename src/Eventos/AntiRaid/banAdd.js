const { Evento } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');
const { ChannelType } = require('discord.js');

module.exports = new Evento({
  nombre: "guildBanAdd",
  ejecutar: async (client, ban) => {
    if (ban.guild.id !== client.mm.serverId) return;

    try {
      const auditLogs = await ban.guild.fetchAuditLogs({
        type: 22, // GUILD_BAN_ADD
        limit: 1
      });

      const entry = auditLogs.entries.first();
      if (!entry) return;

      const ejecutor = entry.executor;
      if (!ejecutor || ejecutor.id === client.user.id) return;

      const miembro = ban.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;

      const baneoSospechoso = await detectarRaid(ejecutor.id, 'BANEOS', ban);
      if (!baneoSospechoso) return;

      console.log(`🚨 Sancionando a ${ejecutor.tag} por baneo sospechoso.`);
      await sancionarUsuario(client, miembro);

      const bannedUser = ban.user;
      try {
        await ban.guild.members.unban(bannedUser.id, "Anti-raid: Usuario baneado revertido automáticamente");
        console.log(`✅ Usuario ${bannedUser.tag} desbaneado automáticamente.`);

        const logsChannel = await ban.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
        if (logsChannel) {
          await logsChannel.send(`✅ Usuario **${bannedUser.tag}** desbaneado automáticamente. Razón: Baneado por raider.`);
        } else {
          console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
        }
      } catch (error) {
        console.error(`❌ Error al desbanear a ${bannedUser.tag}:`, error);
      }

      const textChannel = ban.guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildText &&
        ch.permissionsFor(ban.guild.members.me).has('CREATE_INSTANT_INVITE')
      );

      let inviteLink = "No se pudo generar la invitación.";
      if (textChannel) {
        try {
          const invite = await textChannel.createInvite({
            maxAge: 0,
            maxUses: 0,
            unique: true,
            reason: "Anti-raid: Creación de invitación para usuario desbaneado"
          });
          inviteLink = invite.url;
        } catch (error) {
          console.error("❌ Error al crear la invitación:", error);
        }
      }

      try {
        await bannedUser.send(
`Nuestro servidor (**${ban.guild.name}**) sufrió un ataque de raideo. Fuiste baneado durante el incidente, pero ya hemos revertido la acción y te hemos desbaneado. Aquí tienes una invitación para volver a unirte: ${inviteLink}\n\n*Founder, iNahilC.*`
        );
      } catch (error) {
        console.error(`❌ No se pudo enviar un DM a ${bannedUser.tag}:`, error);
      }

    } catch (error) {
      console.error("❌ Error en anti-raid (guildBanAdd):", error);
    }
  }
});
