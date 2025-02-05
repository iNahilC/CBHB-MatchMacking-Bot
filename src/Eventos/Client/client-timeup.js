const { Evento } = require('../../ConfigBot/index');

module.exports = new Evento({
    nombre: 'ready',
    ejecutar: async (client) => {

        const targetServerId = '1311782674964418640';
        const guild = client.guilds.cache.get(targetServerId);
        if (!guild) {
            console.log(`❌ Server with ID ${targetServerId} not found.`);
            return;
        }

        const channel = await guild.channels.cache.get("1336583146262495255");
        if (!channel) {
            console.log(`❌ Channel with ID ${targetServerId} not found.`);
            return;
        }

        try {
            let startTime = Date.now();
            try {
                const message = await channel.messages.fetch("1336585088317788223");
                await message.edit(`
# ✅ **[ Bot Active ]**

**The bot has been active since <t:${Math.floor(startTime / 1000)}:R>**
                    `);
            } catch (error) {
                console.error('❌ Error editing the message:', error);
            }
        } catch (error) {
            console.error(`❌ Error updating uptime:`, error);
        }
    },
});
