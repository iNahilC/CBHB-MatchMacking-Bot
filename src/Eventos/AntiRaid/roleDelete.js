const { Evento } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "roleDelete",
  ejecutar: async (client, role) => {
    if (role.guild.id !== client.mm.serverId) return;
    
    try {
      const auditLogs = await role.guild.fetchAuditLogs({
        type: 32, // ROLE_DELETE
        limit: 1
      });

      const entry = auditLogs.entries.first();
      if (!entry) return;

      const ejecutor = entry.executor;
      if (ejecutor.id === client.user.id) return;

      const miembro = role.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;

      const rolesSospechosos = await detectarRaid(ejecutor.id, 'ROLES', role);
      if (!rolesSospechosos) return;

      console.log(`🚨 Sancionando a ${ejecutor.tag} por eliminación sospechosa de roles.`);
      await sancionarUsuario(client, miembro);

      const newRole = await role.guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        permissions: role.permissions,
        mentionable: role.mentionable,
        reason: "Anti-raid: Rol eliminado por un raider, restaurado automáticamente"
      });

      if (newRole) {
        if (typeof role.position === "number") {
          await newRole.setPosition(role.position).catch(console.error);
        }
      }

      for (const member of role.members.values()) {
        try {
          await member.roles.add(newRole, "Restauración automática del rol eliminado por raid");
        } catch (error) {
          console.error(`Error al asignar rol restaurado a ${member.user.tag}:`, error);
        }
      }

      const logsChannel = await role.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
      if (logsChannel) {
        await logsChannel.send(`✅ Rol **${role.name}** eliminado por **${miembro.user.tag}** fue restaurado automáticamente por actividad sospechosa.`);
      } else {
        console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
      }

      console.log(`✅ Rol "${role.name}" restaurado con éxito.`);
    } catch (error) {
      console.error("❌ Error en anti-raid (roleDelete):", error);
    }
  }
});
