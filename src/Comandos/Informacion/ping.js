const { SlashCommand } = require("../../ConfigBot/index.js");

module.exports = new SlashCommand({
  name: "ping",
  description: "Muestra el ping actual del bot.",
  category: "Información",
  exemple: "ping",
  ejecutar: async (client, interaction) => {
    return interaction.reply({
      content: `${client.emojisId.success} Mi ping es de **__${client.ws.ping}__ milisegundos**!`,
      allowedMentions: { 
        repliedUser: false 
      }
    });
  }
});