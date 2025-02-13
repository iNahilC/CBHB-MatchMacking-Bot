const raidTracker = new Map();

const LIMITES = {
  BANEOS: 2, // Si hace 2 baneos en <=1.5s se considera raid
  CANALES: 2, // Si hace 2 cambios en los canales en <=1.5s se considera raid
  ROLES: 2, // Si hace 2 cambios en los roles en <=1.5s se considera raid
  EMOJIS: 3, // Si hace 3 cambios en los emojis en <=1.5s se considera raid
  NOMBRES_CANALES: 2, // Si hace 2 cambios en el nombre de canales en <=1.5s se considera raid
  INTERVALO: 1500 // 1.5 segundos
};

const mapaWebhooks = new Map();
const limiteWebhooks = 3; // Número máximo de webhooks permitidos en el periodo de tiempo
const tiempoReset = 60 * 1000; // 1 minuto en milisegundos

function registrarWebhook(usuarioId) {
  if (!mapaWebhooks.has(usuarioId)) {
    mapaWebhooks.set(usuarioId, { cantidad: 1, tiempo: Date.now() });
  } else {
    const datos = mapaWebhooks.get(usuarioId);
    datos.cantidad++;
    mapaWebhooks.set(usuarioId, datos);
  }
}

function esActividadSospechosa(usuarioId) {
  const datos = mapaWebhooks.get(usuarioId);
  if (!datos) return false;

  const tiempoActual = Date.now();
  if (tiempoActual - datos.tiempo > tiempoReset) {
    mapaWebhooks.delete(usuarioId);
    return false;
  }

  if (datos.cantidad > limiteWebhooks) {
    mapaWebhooks.delete(usuarioId);
    return true;
  }

  return false;
}

/**
 * Función para sancionar a un usuario por actividad sospechosa.
 * @param {Client} client - El cliente del bot.
 * @param {GuildMember} miembro - El miembro a sancionar.
 */
async function sancionarUsuario(client, miembro) {
  try {
    let blacklistPlayers = await client.db.get(`${miembro.guild.id}.blacklistPlayers`) || [];
    
    if (miembro.kickable) {
      await miembro.kick("Has sido expulsado por el sistema anti-raid.");
    }
    await blacklistPlayers.push(miembro.id);
    await client.db.set(`${miembro.guild.id}.blacklistPlayers`, blacklistPlayers);

    console.log(`✅ Usuario ${miembro.user.tag} sancionado por raid`);
  } catch (error) {
    console.error('Error al sancionar usuario:', error);
  }
}

/**
 * Función para detectar actividad raids en Discord usando un enfoque tipo "flood" de bans, canales, roles, emojis, cambios en los canales, en poco tiempo.
 * @param {string} userId - El ID del usuario a verificar.
 * @param {string} tipoAccion - El tipo de acción a rastrear (BANEOS, CANALES, ROLES, EMOJIS, NOMBRES_CANALES).
 * @param {object} afectado - Objeto afectado por la acción (por ejemplo, el canal creado o modificado).
 * @returns {Array|boolean} - Retorna un array con los objetos afectados si se detecta raid, `false` en caso contrario.
 */
async function detectarRaid(userId, tipoAccion, afectado) {
  const ahora = Date.now();
  const registro = raidTracker.get(userId) || { counts: {}, firstTimestamp: {}, primerAfectado: {} };

  if (!registro.firstTimestamp[tipoAccion]) {
    registro.firstTimestamp[tipoAccion] = ahora;
    registro.primerAfectado[tipoAccion] = afectado; // Guardar el primer caso creado
  }

  registro.counts[tipoAccion] = (registro.counts[tipoAccion] || 0) + 1;

  const tiempoTranscurrido = ahora - registro.firstTimestamp[tipoAccion];

  console.log(`[DEBUG] ${userId} - ${tipoAccion}: ${registro.counts[tipoAccion]} en ${tiempoTranscurrido}ms`);

  if (tiempoTranscurrido <= LIMITES.INTERVALO * 1000) {
    if (registro.counts[tipoAccion] >= LIMITES[tipoAccion]) {
      const primerAfectado = registro.primerAfectado[tipoAccion];
      registro.counts[tipoAccion] = 0;
      registro.firstTimestamp[tipoAccion] = ahora;
      registro.primerAfectado[tipoAccion] = null;
      raidTracker.set(userId, registro);
      return [primerAfectado, afectado]; // Devolver los dos objetos afectados
    }
  } else {
    registro.counts[tipoAccion] = 1;
    registro.firstTimestamp[tipoAccion] = ahora;
    registro.primerAfectado[tipoAccion] = afectado;
  }

  raidTracker.set(userId, registro);
  return false; // No hay raid
}

module.exports = { detectarRaid, sancionarUsuario, registrarWebhook, esActividadSospechosa };
