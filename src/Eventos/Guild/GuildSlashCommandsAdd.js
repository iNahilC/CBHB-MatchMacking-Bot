const { Evento } = require("../../ConfigBot/index");
const { REST, Routes } = require('discord.js');

module.exports = new Evento({
  nombre: "ready",
  ejecutar: async (client) => {
    const rest = new REST({ version: '10' }).setToken(client.token);
    const serverIds = client.guilds.cache.map(guild => guild.id);

    const slashCommands = Array.from(client.slashcommands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description || "Sin descripción",
      options: cmd.options || [],
    }));

    for (const serverId of serverIds) {
      try {
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, serverId),
          { body: slashCommands }
        );
        console.log(`✅ Comandos registrados en el servidor: ${serverId}`);
      } catch (error) {
        console.error(`⚠️ Error al registrar comandos para el servidor ${serverId}:`, error);
      }
    }
  }
});
