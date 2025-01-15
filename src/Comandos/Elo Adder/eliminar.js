const { SlashCommand, EmbedBuilder, PermissionsBitField } = require("../../ConfigBot/index.js");
const { updateEloTable } = require("../../utilidades/updateEloTable.js");
const { updateUserRankRole } = require("../../utilidades/updateUserRankRole.js");

module.exports = new SlashCommand({
  name: "eliminar",
  category: "Elo Adder",
  description: "Establece el Elo de un jugador a 0 y le asigna el rango correspondiente.",
  example: "/eliminar usuarios: <@usuario1><@usuario2>",
  options: [
    {
      name: "usuarios",
      description: "Usuarios a los que deseas eliminar el Elo y establecer el rango.",
      type: 3,
      required: true,
    },
  ],
  ejecutar: async (client, interaction) => {
    if (!client.db.has(`${interaction.guild.id}.elo`)) {
      await client.db.set(`${interaction.guild.id}.elo`, []);
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      if (!interaction.member.roles.cache.has(client.elo.permissionRol)) {
        const e = new EmbedBuilder()
          .setColor(client.constants.colorError)
          .setDescription(
            `${client.emojisId.error} **No tienes permisos para usar este comando. Necesitas el rol <@&${client.elo.permissionRol}>.**`
          );
        return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }
    }

    const usuariosTexto = interaction.options.getString("usuarios");
    const usuarios = usuariosTexto.match(/<@!?(\d+)>/g);

    if (!usuarios || usuarios.length === 0) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(
          `${client.emojisId.error} Debes mencionar **__usuarios__** válidos en el campo **"usuarios"**.`
        );
      return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    const elo = (await client.db.get(`${interaction.guild.id}.elo`)) || [];
    let resultados = [];
    let errores = [];

    for (let i = 0; i < usuarios.length; i++) {
      const userId = usuarios[i].replace(/[<@!>]/g, "");

      const usuarioElo = elo.find((entry) => entry.user_id === userId);
      if (!usuarioElo) {
        errores.push(`El usuario <@${userId}> **no** se encuentra en la base de datos.`);
        continue;
      }

      usuarioElo.elo = 0;

      try {
        await client.db.set(`${interaction.guild.id}.elo`, elo);
        await updateUserRankRole(client, interaction.guild.id, userId);
        await updateEloTable(client, interaction.guild.id);
  
        resultados.push(`El Elo de **<@${userId}>** fue **__establecido a 0__** y se le asignó el rango correspondiente.`);
      } catch (error) {
        console.error(`Error al actualizar el rango del usuario <@${userId}>:`, error);
        errores.push(`Error al actualizar el rango de <@${userId}>.`);
      }
    }


    let respuestaFinal = "";
    if (resultados.length > 0) {
      respuestaFinal += resultados.join("\n") + "\n";
    }
    if (errores.length > 0) {
      respuestaFinal += `\n${errores.join("\n")}`;
    }

    const e = new EmbedBuilder()
      .setColor(resultados.length > 0 ? client.constants.colorSucess : client.constants.colorError)
      .setDescription(respuestaFinal);
    return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
  },
});
