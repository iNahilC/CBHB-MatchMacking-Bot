async function updateEloTable(client, guildId) {
  let eloChannel = client.channels.cache.get(client.elo.channel);
  try {
    let eloMessage = await eloChannel.messages.fetch(client.elo.message);

    if (!eloMessage) {
      return eloChannel.send({ content: "No pude encontrar un mensaje para editar." });
    }

    let usuarios = await client.db.get(`${guildId}.elo`);
    if (!Array.isArray(usuarios)) {
      usuarios = [];
    }

    usuarios = usuarios.filter(async (user) => {
      let usuario = eloMessage.guild.members.cache.get(user.user_id);
      if (!usuario) {
        await client.db.delete(`${guildId}.elo.${user.user_id}`);
        return false;
      }
      return true;
    });

    usuarios.sort((a, b) => b.elo - a.elo);

    let top25 = usuarios.slice(0, 25);

    if (top25.length === 0) {
      let mensaje = `**Top 25 de Elo**\n\nAún no hay jugadores para mostrar.`;
      return await eloMessage.edit({ content: mensaje });
    }

    let ranking = top25
      .map((user, index) => {
        let usuario = eloMessage.guild.members.cache.get(user.user_id);
        let username = usuario ? usuario.user.tag : "Usuario no encontrado";
        return `**${index + 1})** ${username} (<@${user.user_id}>): **\`${user.elo}\` Puntos.**`;
      })
      .join("\n");

    let mensaje = `**Ranking de los TOP 25 jugadores con más Elo.**\n\n${ranking}`;
    await eloMessage.edit({ content: mensaje });

  } catch (error) {
    console.error("Error al intentar acceder al mensaje o actualizar la clasificación:", error);
    eloChannel.send({ content: "Hubo un error al intentar obtener o editar el mensaje de clasificación." });
  }
}

module.exports = { updateEloTable };
