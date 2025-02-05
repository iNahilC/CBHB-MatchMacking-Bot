const { SlashCommand } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
  name: 'reload',
  alias: ['r', 'recargar'],
  description: 'Este comando te permite actualizar un slash-command y volver a pushearlo.',
  category: 'Owner',
  only_owner: true,
  exemple: '/reload',
  options: [
    {
      name: 'comando',
      description: 'El slash-command que deseas actualizar.',
      type: 3,
      required: true,
    },
  ],
  ejecutar: async (client, interaction) => {
    // Limitar el uso del comando a un canal específico
    if (interaction.channel.id !== '1324923267005415486') {
      return interaction.reply({
        content: `${client.emojisId.error} No puedes utilizar este comando aquí!`,
        flags: 64,
      });
    }

    const nombreComando = interaction.options.getString('comando').toLowerCase();

    try {
      // Recargar (refrescar) el módulo del slash-command usando la función recargar_slashcommand
      const resultadoRecarga = client.recargar_slashcommand(nombreComando, client);
      if (resultadoRecarga !== true) {
        return interaction.reply({
          content: `${client.emojisId.error} No se pudo recargar el slash-command **${nombreComando}**.`,
          allowedMentions: { repliedUser: false },
        });
      }

      // Obtener el módulo del slash-command actualizado desde el map del cliente
      const updatedCommandModule = client.slashcommands.get(nombreComando);
      if (!updatedCommandModule) {
        return interaction.reply({
          content: `${client.emojisId.error} No se encontró el slash-command **${nombreComando}** después de la recarga.`,
          allowedMentions: { repliedUser: false },
        });
      }

      // Verificar que el módulo actualizado tenga la propiedad "data" y pueda convertirse a JSON
      if (!updatedCommandModule.data || typeof updatedCommandModule.data.toJSON !== 'function') {
        return interaction.reply({
          content: `${client.emojisId.error} El slash-command **${nombreComando}** no posee una propiedad "data" válida.`,
          allowedMentions: { repliedUser: false },
        });
      }

      // Convertir la definición del comando a formato JSON
      const commandData = updatedCommandModule.data.toJSON();

      let guildsUpdated = 0;

      // Iterar sobre cada guild en la caché del bot y actualizar (o crear) el slash-command allí
      for (const guild of client.guilds.cache.values()) {
        try {
          const guildCommands = await guild.commands.fetch();
          const commandToUpdate = guildCommands.find((cmd) => cmd.name === commandData.name);

          if (!commandToUpdate) {
            // Si el comando no existe en la guild, lo creamos
            await guild.commands.create(commandData);
          } else {
            // Si ya existe, lo editamos para actualizar la definición
            await guild.commands.edit(commandToUpdate.id, commandData);
          }
          guildsUpdated++;
        } catch (guildError) {
          console.error(`Error al actualizar el slash-command en la guild ${guild.id}: ${guildError.message}`);
        }
      }

      return interaction.reply({
        content: `${client.emojisId.success} Se ha recargado y actualizado el slash-command **${commandData.name}** en ${guildsUpdated} guild(s).`,
        allowedMentions: { repliedUser: false },
      });
    } catch (e) {
      console.error(e);
      return interaction.reply({
        content: `${client.emojisId.error} No se pudo recargar el slash-command **${nombreComando}**.`,
        allowedMentions: { repliedUser: false },
      });
    }
  },
});
