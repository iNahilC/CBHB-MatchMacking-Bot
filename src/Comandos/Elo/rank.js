const { SlashCommand, EmbedBuilder, PermissionsBitField } = require("../../ConfigBot/index.js");
const { getRank } = require("../../Utilidades/updateUserRankRole.js");

module.exports = new SlashCommand({
  name: "rank",
  category: "Usuarios",
  description: "Mira el rango tuyo o de un usuario en específico.",
  example: "/rank | usuario: <@usuario>",
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

    const usuario = interaction.options.getUser("usuario") || interaction.user;

    const elo = await client.db.get(`${interaction.guild.id}.elo`) || [];
    const usuarioElo = elo.find((entry) => entry.user_id === usuario.id);

    if (!usuarioElo) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(
          `${client.emojisId.error} No se ha encontrado un registro de **elo** para el usuario <@${usuario.id}>.`
        );
      return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    const userElo = usuarioElo.elo;
    const rango = await getRank(client, interaction.guild.id, usuario.id);

    const rangoId = client.elo.ranks[`rango${rango}`] || "Rango no encontrado"; // Sacamos la ID del rango

    const mensajeRango = usuario === interaction.user ? `Tu **elo** es de **__${userElo}__** y tienes el rango **<@&${rangoId}>**.` : 
      `El usuario **${usuario}** tiene **__${userElo}__** de **elo** y su rango es **<@&${rangoId}>**.`;

    const e = new EmbedBuilder()
      .setColor(client.constants.colorSucess)
      .setDescription(mensajeRango);
    return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
  },
});
