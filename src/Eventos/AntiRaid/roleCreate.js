const { Evento } = require('../../ConfigBot/index.js');
const { detectarRaid, sancionarUsuario } = require('../../Utilidades/detectRaid.js');

module.exports = new Evento({
  nombre: "roleCreate",
  ejecutar: async (client, role) => {
    if (role.guild.id !== client.mm.serverId) return;

    try {
      const auditLogs = await role.guild.fetchAuditLogs({
        type: 30, // ROLE_CREATE
        limit: 1
      });

      const entry = auditLogs.entries.first();
      if (!entry) return;

      const ejecutor = entry.executor;
      if (ejecutor.id === client.user.id) return;

      const miembro = role.guild.members.cache.get(ejecutor.id);
      if (!miembro) return;

      // Detectar actividad sospechosa de creación de roles
      const rolesSospechosos = await detectarRaid(ejecutor.id, 'ROLES', role);
      if (!rolesSospechosos) return;

      const listaRoles = Array.isArray(rolesSospechosos) ? rolesSospechosos : [rolesSospechosos];

      console.log(`🚨 Sancionando a ${ejecutor.tag} por creación sospechosa de roles.`);
      await sancionarUsuario(client, miembro);

      for (const rol of listaRoles) {
        if (!rol) {
          console.warn("⚠️ Rol sospechoso es null o indefinido. Saltando...");
          continue;
        }

        if (rol.deletable) {
          await rol.delete("Actividad sospechosa de raideo");
          console.log(`✅ Rol "${rol.name}" eliminado por actividad sospechosa.`);
        } else {
          console.warn(`⚠️ No se pudo eliminar el rol "${rol.name}" (no es eliminable).`);
        }
      }

      // Registro en logs
      const logsChannel = await role.guild.channels.fetch(client.mm.raidLogs).catch(() => null);
      if (logsChannel) {
        const rolesEliminados = listaRoles.filter(r => r !== null).map(r => `"${r.name}"`).join(", ");
        await logsChannel.send(`❌ Roles **${rolesEliminados}** creados por **${miembro.user.tag}** fueron eliminados por actividad sospechosa.`);
      } else {
        console.log('⚠️ No se encontró el canal de logs con el ID client.mm.raidLogs.');
      }

    } catch (error) {
      console.error("❌ Error en anti-raid (roleCreate):", error);
    }
  }
});
