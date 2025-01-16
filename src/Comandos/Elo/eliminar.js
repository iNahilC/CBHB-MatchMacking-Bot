const { SlashCommand, EmbedBuilder, PermissionsBitField } = require("../../ConfigBot/index.js");
const { updateUserRankRole } = require("../../Utilidades/updateUserRankRole.js");

module.exports = new SlashCommand({
  name: "rank",
  category: "Usuarios",
  description: "Mira el rango tuyo o de un usuario en específico.",
  example: "/rank | usuario: <@usuario1>",
  options: [
    {
      name: "usuario",
      description: "Menciona al usuario del que deseas ver el rango.",
      type: 6,
      required: false,
    },
  ],
  ejecutar: async (client, interaction) => {
    if (!client.db.has(`${interaction.guild.id}.elo`)) {
      await client.db.set(`${interaction.guild.id}.elo`, []);
    }

    // Determina el usuario para el que se va a mostrar el rango (el invocador si no se menciona a otro usuario)
    const usuario = interaction.options.getUser("usuario") || interaction.user;

    const elo = await client.db.get(`${interaction.guild.id}.elo`) || [];
    const usuarioElo = elo.find((entry) => entry.user_id === usuario.id);

    // Verifica si se encontró el registro de Elo del usuario
    if (!usuarioElo) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(
          `${client.emojisId.error} No se ha encontrado un registro de **elo** para el usuario <@${usuario.id}>.`
        );
      return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    const userElo = usuarioElo.elo;
    let rangoSymbol = "";

    // Determina el rango según el valor de Elo
    for (const rango of client.elo.ranks) {
      if (userElo >= rango.eloMinimo && userElo <= rango.eloMaximo) {
        rangoSymbol = rango.rango;
        break;
      }
    }

    // Responde con el rango y elo del usuario
    const e = new EmbedBuilder()
      .setColor(client.constants.colorSucess)
      .setDescription(
        `El rango de **${usuario.tag}** es **[${rangoSymbol}]** con **${userElo}** de Elo.`
      );
    return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
  },
});
