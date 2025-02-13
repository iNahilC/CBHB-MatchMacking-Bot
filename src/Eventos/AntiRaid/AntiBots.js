const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
    nombre: "GuildMemberAdd",
    ejecutar: async (client, member) => {
        if (member.guild.id !== client.mm.serverId) return;
        if (member.user.bot) {
          try {
              const logChannel = member.guild.channels.cache.get(client.mm.raidLogs);

              if (member.kickable) {
                await member.kick('Sistema Anti-bots: Bots no permitidos en el servidor.');
              }

              if (logChannel) {
                logChannel.send(`El bot **${member.user.tag}** fue expulsado automáticamente al intentar unirse al servidor.`);
              } else {
                console.log('No se encontró el canal de logs con el ID client.mm.raidLogs');
              }
            } catch (error) {
              console.error(`Error al expulsar al bot ${member.user.tag}:`, error);
            }
          }
    }
});