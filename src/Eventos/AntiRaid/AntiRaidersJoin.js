const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
    nombre: "GuildMemberAdd",
    ejecutar: async (client, member) => {
        if (member.guild.id !== client.mm.serverId) return;
        const blacklistPlayers = await client.db.get(`${member.guild.id}.blacklistPlayers`);

        if (blacklistPlayers.includes(member.id)) {
            try {
                await member.kick('Sistema Anti-raid: Usuario en lista negra.');
                
                const logChannel = member.guild.channels.cache.get(client.mm.raidLogs);
                if (logChannel) {
                    logChannel.send(`El raider **${member.user.tag}** fue **expulsado** automáticamente al intentar unirse al servidor.`);
                } else {
                    console.log('No se encontró el canal de logs con el ID client.mm.raidLogs');
                }
            } catch (error) {
                console.error(`Error al expulsar al usuario ${member.user.tag}:`, error);
            }
        }
    }
});