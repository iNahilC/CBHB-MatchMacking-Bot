const { Evento, PermissionsBitField } = require('../../ConfigBot/index.js');
const { sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "roleUpdate",
  ejecutar: async (client, oldRole, newRole) => {
    if (newRole.guild.id !== client.mm.serverId) return;

    if (newRole.id !== newRole.guild.roles.everyone.id) return;

    try {
      if (!oldRole.permissions.has(PermissionsBitField.Flags.Administrator) && newRole.permissions.has(PermissionsBitField.Flags.Administrator)) {
        console.log('🚨 Se detectó que se otorgó permisos de Administrador al rol @everyone.');

        const auditLogs = await newRole.guild.fetchAuditLogs({
          type: 31, //ROLE_UPDATE
          limit: 1
        });

        const entry = auditLogs.entries.first();
        if (!entry) return;
        
        const ejecutor = entry.executor;
        if (ejecutor.id === client.user.id) return;

        const miembro = newRole.guild.members.cache.get(ejecutor.id);
        if (!miembro) return;

        await newRole.setPermissions(oldRole.permissions, "Anti-raid: Se intentó dar permisos de Administrador a @everyone");
        console.log('✅ Se han revertido los permisos de Administrador en `@everyone`.');

        await sancionarUsuario(client, miembro);

        const logsChannel = await newRole.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
        if (logsChannel) {
          await logsChannel.send(`❌ **${miembro.user.tag}** intentó dar permisos de **Administrador** al rol **@everyone**. Los permisos fueron revertidos automáticamente.`);
        } else {
          console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
        }
      }
    } catch (error) {
      console.error("❌ Error en anti-raid (roleUpdate):", error);
    }
  }
});
