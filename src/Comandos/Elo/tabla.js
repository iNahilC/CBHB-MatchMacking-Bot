const { SlashCommand, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("../../ConfigBot/index.js");
const { updateEloTable } = require("../../Utilidades/updateEloTable.js");
const { table } = require("table");

module.exports = new SlashCommand({
  name: "tabla",
  category: "Usuarios",
  description: "Mira la tabla de Elo de los jugadores.",
  example: "/tabla",
  ejecutar: async (client, interaction) => {
    if (!client.db.has(`${interaction.guild.id}.elo`)) {
      await client.db.set(`${interaction.guild.id}.elo`, []);
    }

    const eloData = await client.db.get(`${interaction.guild.id}.elo`) || [];
    if (!eloData.length) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(`${client.emojisId.error} No hay jugadores con **elo** en este servidor. Contacta con un **administrador**!`);
      return interaction.reply({ embeds: [e], flags: 64 });
    }

    const top25 = eloData
      .filter((entry) => interaction.guild.members.cache.has(entry.user_id))
      .sort((a, b) => b.elo - a.elo)
      .slice(0, 25);

    if (!top25.length) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(`${client.emojisId.error} No hay **jugadores** disponibles para mostrar en la **tabla**.`);
      return interaction.reply({ embeds: [e], flags: 64 });
    }

    await updateEloTable(client, interaction.guild.id);

    const usuariosPorPagina = 5;
    let paginaActual = 0;
    const paginasTotal = Math.ceil(top25.length / usuariosPorPagina);

    const createTable = (pagina) => {
      const start = pagina * usuariosPorPagina;
      const end = start + usuariosPorPagina;
      const usuarios = top25.slice(start, end);

      const data = [
        ["TOP", "USUARIO", "ELO"], // Encabezados de la tabla
        ...usuarios.map((user, index) => {
          const member = interaction.guild.members.cache.get(user.user_id);
          return [`#${start + index + 1}`, member.user.tag, user.elo];
        }),
      ];
    //   , {
    //     columns: { 0: { alignment: "center" }, 1: { alignment: "left" }, 2: { alignment: "center" } },
    //     drawHorizontalLine: (index) => index === 0 || index === 1 || index === data.length,
    //   }
      return table(data);
    };

    const createEmbed = (pagina) => {
      const tabla = createTable(pagina);

      return new EmbedBuilder()
        .setColor(client.constants.colorSucess)
        .setTitle("Tabla de Clasificación - Top 25")
        .setDescription(`\`\`\`\n${tabla}\n\`\`\``)
        .setFooter({ text: `Página ${pagina + 1} de ${paginasTotal}` })
        .setTimestamp();
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev_pagina")
          .setLabel("←")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(paginaActual === 0),
        new ButtonBuilder()
          .setCustomId("next_pagina")
          .setLabel("→")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(paginaActual === paginasTotal - 1)
      );

    const embed = createEmbed(paginaActual);

    const message = await interaction.reply({
      embeds: [embed],
      components: [row()],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "¡No puedes usar estos botones!",
          flags: 64,
        });
      }

      if (i.customId === "prev_pagina" && paginaActual > 0) {
        paginaActual--;
      } else if (i.customId === "next_pagina" && paginaActual < paginasTotal - 1) {
        paginaActual++;
      }

      const updatedEmbed = createEmbed(paginaActual);
      await i.update({ embeds: [updatedEmbed], components: [row()] });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev_pagina")
          .setLabel("←")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next_pagina")
          .setLabel("→")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );

      await interaction.editReply({ components: [disabledRow] });
    });
  },
});
