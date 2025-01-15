const { Evento } = require("../../ConfigBot/index");
const { REST, Routes } = require('discord.js');

module.exports = new Evento({
  nombre: "ready",
  ejecutar: async (client) => {
    // Script hecho para registrar los Slash-Commands al iniciar el bot.

    const serverIds = client.guilds.cache.map(guild => guild.id);
    const slashCommands = Array.from(client.slashcommands.values()).map(cmd => ({
        name: cmd.name,
        description: cmd.description || "Sin descripción",
        options: cmd.options || [],
    }));

    const rest = new REST({ version: '10' }).setToken(client.token);
    for (const serverId of serverIds) {
      try {
        
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, serverId),
          { body: slashCommands }
        );
      } catch (error) {
        console.error(`Error al registrar comandos para el servidor ${serverId}:`, error);
      }
    }
  }
});
