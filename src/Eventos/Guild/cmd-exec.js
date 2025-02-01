/* eslint-disable no-prototype-builtins */
const { Evento, MessageActionRow, MessageButton } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "interactionCreate",
  ejecutar: async (client, interaction) => {
    if (!interaction.inGuild()) {
      let row = new MessageActionRow().addComponents(
        new MessageButton().setStyle("LINK").setURL(client.invitacion).setLabel(`Invita a **${client.user.username}** a un servidor donde administres!`), );
      return interaction.reply({
        content: `Hola **${interaction.user.tag}**, **__no__** puedes utilizar mis **__comandos de barra__** afuera de un servidor!`,
        components: [row]
      });
    }
    if (!interaction.isCommand()) return;
    let comando = client.slashcommands.get(interaction.commandName);
    if (client.tiene_slashcommand(comando.name)) {
      let command_info = client.obtener_slashcommand(comando.name)

      if (command_info.hasOwnProperty("only_owner") && command_info.only_owner === true && interaction.user.id !== client.constants.ownerId) return interaction.reply({
        content: `${client.emojisId.warning} El comando **__${comando.name}__** solo lo puede ejecutar mi creador!`,
        allowedMentions: { repliedUser: false }, 
        flags: 64
      });

      client.ejecutar_slashcommand(comando.name, client, interaction);
      if (command_info.hasOwnProperty("only_owner") && command_info.only_owner === true) return;
    }
  }
});