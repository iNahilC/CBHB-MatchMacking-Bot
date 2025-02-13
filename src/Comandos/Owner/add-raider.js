const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
  name: 'blacklist',
  category: 'Owner',
  description: 'Agrega, remueve o muestra raiders en la blacklist.',
  only_owner: true,
  options: [
    {
      name: 'accion',
      description: 'Acción a realizar: add, remove o view.',
      type: 3, // string
      required: true,
      choices: [
        { name: 'add', value: 'add' },
        { name: 'remove', value: 'remove' },
        { name: 'view', value: 'view' }
      ]
    },
    {
      name: 'usuario',
      description: 'El usuario a agregar o remover (no requerido para ver).',
      type: 6, // user
      required: false
    }
  ],
  ejecutar: async (client, interaction) => {
    if (interaction.user.id !== "656738884712923166") {
      return interaction.reply({
        content: `${client.emojisId.error} No puedes utilizar este comando!`,
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      
      const action = interaction.options.getString('accion');
      const userOption = interaction.options.getUser('usuario');
      
      const key = `${interaction.guild.id}.blacklistPlayers`;
      let blacklistPlayers = await client.db.get(key) || [];

      if (action === 'add') {
        if (!userOption) {
          return interaction.editReply({ content: `${client.emojisId.error} Debes proporcionar un usuario para agregar.` });
        }

        if (blacklistPlayers.includes(userOption.id)) {
          return interaction.editReply({ content: `${client.emojisId.error} El usuario **${userOption.tag}** ya se encuentra en la blacklist.` });
        }

        blacklistPlayers.push(userOption.id);
        await client.db.set(key, blacklistPlayers);
        return interaction.editReply({ content: `${client.emojisId.success} El raider **${userOption.tag}** fue agregado a la blacklist.` });

      } else if (action === 'remove') {
        if (!userOption) {
          return interaction.editReply({ content: `${client.emojisId.error} Debes proporcionar un usuario para remover.` });
        }

        if (!blacklistPlayers.includes(userOption.id)) {
          return interaction.editReply({ content: `${client.emojisId.error} El usuario **${userOption.tag}** no se encuentra en la blacklist.` });
        }

        blacklistPlayers = blacklistPlayers.filter(id => id !== userOption.id);
        await client.db.set(key, blacklistPlayers);
        return interaction.editReply({ content: `${client.emojisId.success} El raider **${userOption.tag}** fue removido de la blacklist.` });

      } else if (action === 'view') {
        if (!blacklistPlayers.length) {
          return interaction.editReply({ content: `${client.emojisId.info} No hay usuarios en la blacklist.` });
        }

        const list = blacklistPlayers.map(id => `<@${id}>`).join('\n');
        const embed = new EmbedBuilder()
          .setColor(client.colors.info)
          .setTitle('Usuarios en la Blacklist')
          .setDescription(list);
        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.editReply({ content: `${client.emojisId.error} Acción desconocida.` });
      }
    } catch (error) {
      console.error('Error en comando blacklist:', error);
      return interaction.editReply({
        content: `${client.emojisId.error} Ocurrió un error al ejecutar el comando.`,
      });
    }
  }
});
