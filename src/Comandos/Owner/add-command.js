const { SlashCommand, EmbedBuilder } = require("../../ConfigBot/index.js");

module.exports = new SlashCommand({
  name: "add-slashcommand",
  alias: ["agregar-slashcommand"],
  description: "Este comando te permite agregar un comando a servidor.",
  category: "Owner",
  only_owner: true,
  exemple: "$add-slashcommand",
  options: [
      { name: "owner", description: "Agregar comandos a los servidores de testing.", type: 10, required: true },
        { name: "comando", description: "El comando que deseas agregar.", type: 3, required: true }  
  ],
  ejecutar: async (client, interaction) => {
    if (interaction.options.getBoolean("owner")) {
            try {
                client.add_slashcommand(interaction.options.getString("comando"), true);
                return interaction.reply({
                    content: `${client.emojisId.success} Se ha agregado el comando **${interaction.options.getString("comando")}** a los servidores de testing.`, allowedMentions: { repliedUser: false } });
            } catch (e) {
                return interaction.reply({
                    content: `${client.emojisId.error} No se pudo agregar el comando **${interaction.options.getString("comando")}** a los servidores de testing.`, allowedMentions: { repliedUser: false } });
                }
    }  else {
        try {
            client.add_slashcommand(interaction.options.getString("comando"), false);
            return interaction.reply({
                content: `${client.emojisId.success} Se ha agregado el comando **${interaction.options.getString("comando")}** a los servidores.`, allowedMentions: { repliedUser: false } });
        } catch (e) {
            return interaction.reply({
                content: `${client.emojisId.error} No se pudo agregar el comando **${interaction.options.getString("comando")}** a los servidores.`, allowedMentions: { repliedUser: false } });
            }
        }
    }
});