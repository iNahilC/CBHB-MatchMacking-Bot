const { Evento } = require("../../ConfigBot/index");
const { updateEloTable } = require("../../Utilidades/updateEloTable");
const { updateUserRankRole } = require("../../Utilidades/updateUserRankRole");

module.exports = new Evento({
  nombre: "ready",
  ejecutar: async (client) => {
    try {
      let canalElo = client.channels.cache.get(client.elo.channel);
      if (!canalElo) {
        console.error("[BOT] No pude encontrar el canal.");
        return;
      }

      const idServidor = canalElo.guild.id;
      await updateEloTable(client, idServidor);

      const datosElo = await client.db.get(`${idServidor}.elo`) || [];
      let cambios = [];
      for (const jugador of datosElo) {
        const idUsuario = jugador.user_id;

        const resultado = await updateUserRankRole(client, idServidor, idUsuario).catch((error) => {
          console.error(`Error al actualizar el rango para el usuario ${idUsuario}:`, error);
        });

        if (resultado && resultado.cambios) {
          cambios.push({
            usuario: idUsuario,
            removidos: resultado.cambios.removidos,
            agregados: resultado.cambios.añadidos,
          });
        }
      }

      if (cambios.length > 0) {
        console.log("Roles de Elo verificados y actualizados al iniciar el bot. Cambios realizados:");
        for (const cambio of cambios) {
          const rolesAñadidos = cambio.agregados?.join(", ") || "Ninguno";
          const rolesRemovidos = cambio.removidos?.join(", ") || "Ninguno";
          const cambioUsuarioUsername = client.users.cache.get(cambio.usuario)?.username || "Desconocido";
          console.log(
            `Usuario: ${cambioUsuarioUsername} | Roles añadidos: ${rolesAñadidos} | Roles removidos: ${rolesRemovidos}`
          );
        }
      } else {
        console.log("Roles de Elo verificados y actualizados al iniciar el bot. No se realizaron cambios.");
      }
    } catch (error) {
      console.error("Ocurrió un error al procesar el evento 'ready':", error);
    }
  },
});