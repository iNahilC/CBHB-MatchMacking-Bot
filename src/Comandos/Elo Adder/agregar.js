const { SlashCommand, EmbedBuilder, PermissionsBitField } = require("../../ConfigBot/index.js");
const { updateEloTable } = require("../../utilidades/updateEloTable.js");
const { updateUserRankRole, getRank } = require("../../utilidades/updateUserRankRole.js");

module.exports = new SlashCommand({
  name: "agregar",
  category: "Elo Adder",
  description: "Agrega elo a los jugadores.",
  example: "/agregar usuarios: <@usuario1><@usuario2> cantidades: 10, 15",
  options: [
    {
      name: "usuarios",
      description: "Usuarios a los que deseas agregar elo (menciones separadas por espacios o pegadas).",
      type: 3,
      required: true,
    },
    {
      name: "cantidades",
      description: "Cantidades correspondientes (separadas por comas).",
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
    const cantidadesTexto = interaction.options.getString("cantidades");

    const usuarios = usuariosTexto.match(/<@!?\d+>/g);
    if (!usuarios || usuarios.length === 0) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(
          `${client.emojisId.error} Debes **mencionar** a uno o varios **__usuarios__** válidos en el campo **__"usuarios"__**.`
        );
      return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    const cantidades = cantidadesTexto.split(",").map((val) => parseInt(val.trim(), 10));
    if (cantidades.some((val) => isNaN(val))) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(
          `${client.emojisId.error} Introduce **solo** números separados por comas en el campo **__"cantidades"__**.`
        );
      return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    if (usuarios.length !== cantidades.length) {
      const e = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(
          `${client.emojisId.error} La cantidad de **__usuarios__** debe **coincidir** con las cantidades de **elo** especificadas.`
        );
      return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    const elo = await client.db.get(`${interaction.guild.id}.elo`) || [];
    let resultados = [];
    let cambiosRoles = [];

    for (let i = 0; i < usuarios.length; i++) {
      const userId = usuarios[i].replace(/[<@!>]/g, "");
      const cantidadElo = cantidades[i];

      if (cantidadElo <= 0) {
        const e = new EmbedBuilder()
          .setColor(client.constants.colorError)
          .setDescription(
            `${client.emojisId.error} La cantidad de **elo** para el usuario <@${userId}> debe ser mayor a **__0__**.`
          );
        return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }

      let usuarioElo = elo.find((entry) => entry.user_id === userId);
      if (usuarioElo) {
        usuarioElo.elo = Math.min(usuarioElo.elo + cantidadElo, 2300); // Limitar a 2300 de ELO
      } else {
        usuarioElo = { user_id: userId, elo: Math.min(cantidadElo, 2300) }; // Limitar a 2300 de ELO
        elo.push(usuarioElo);
      }

      const totalElo = usuarioElo.elo;
      resultados.push({ userId, totalElo, cantidadElo });
    }

    await client.db.set(`${interaction.guild.id}.elo`, elo);

    await updateEloTable(client, interaction.guild.id);

    for (const resultado of resultados) {
      const userId = resultado.userId;

      const resultadoRol = await updateUserRankRole(client, interaction.guild.id, userId).catch((error) => {
        console.error(`Error al actualizar el rango del usuario <@${userId}>:`, error);
      });

      if (resultadoRol && resultadoRol.nuevoRango && resultadoRol.rangoActual) {
        const { rangoActual, nuevoRango } = resultadoRol;
        const tipoCambio =
          rangoActual !== nuevoRango
            ? rangoActual < nuevoRango
              ? "Subió al rango"
              : "Bajó al rango"
            : null;

        if (tipoCambio) {
          cambiosRoles.push({
            usuario: userId,
            tipoCambio,
            rango: `<@&${nuevoRango}>`,
          });
        }
      }
    }

    let respuestaFinal = "";
    resultados.forEach((result) => {
      console.log(result)
      respuestaFinal += `\nSe **__agregó__** correctamente **${Math.min(result.cantidadElo, 2300)}** de elo a <@${result.userId}>. Elo total: **${result.totalElo}**. `;
    });

    respuestaFinal += "\n";
    if (cambiosRoles.length > 0) {
      cambiosRoles.forEach((cambio) => {
        respuestaFinal += `\n<@${cambio.usuario}> ${cambio.tipoCambio}: ${cambio.rango}`;
      });
    }

    const e = new EmbedBuilder().setColor(client.constants.colorSucess).setDescription(respuestaFinal);
    return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
  },
});
