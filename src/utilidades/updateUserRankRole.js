async function updateUserRankRole(client, guildId, userId) {
    const RANGOS = [
        { eloMinimo: 1800, eloMaximo: 2300, roleId: client.elo.ranks.rango6, rango: "⑥" }, // Rango 6
        { eloMinimo: 1300, eloMaximo: 1799, roleId: client.elo.ranks.rango5, rango: "⑤" }, // Rango 5
        { eloMinimo: 1000, eloMaximo: 1299, roleId: client.elo.ranks.rango4, rango: "④" }, // Rango 4
        { eloMinimo: 500, eloMaximo: 999, roleId: client.elo.ranks.rango3, rango: "③" },   // Rango 3
        { eloMinimo: 300, eloMaximo: 499, roleId: client.elo.ranks.rango2, rango: "②" },   // Rango 2
        { eloMinimo: 50, eloMaximo: 299, roleId: client.elo.ranks.rango1, rango: "①" },    // Rango 1
        { eloMinimo: 0, eloMaximo: 49, roleId: client.elo.ranks.rango0, rango: "⓪" }       // Rango 0
    ];

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;

    const elo = await client.db.get(`${guildId}.elo`);
    const entradaUsuarioElo = elo.find((entry) => entry.user_id === userId);

    if (!entradaUsuarioElo) return null;

    const usuario = await guild.members.fetch(userId).catch(() => null);
    if (!usuario) return null;

    const userElo = entradaUsuarioElo.elo;

    let rangoActual = null;
    let nuevoRango = null;
    let rangoSymbol = "";

    for (const rango of RANGOS) {
        if (usuario.roles.cache.has(rango.roleId)) {
            rangoActual = rango.roleId;
            break;
        }
    }

    for (const rango of RANGOS) {
        if (userElo >= rango.eloMinimo && userElo <= rango.eloMaximo) {
            nuevoRango = rango.roleId;
            rangoSymbol = rango.rango;
            break;
        }
    }

    if (!nuevoRango) return null;

    const rolesAñadidos = [];
    const rolesRemovidos = [];

    for (const rango of RANGOS) {
        if (rango.roleId !== nuevoRango && usuario.roles.cache.has(rango.roleId)) {
            await usuario.roles.remove(rango.roleId).catch(() => null);
            rolesRemovidos.push(rango.roleId);
        }
    }

    if (!usuario.roles.cache.has(nuevoRango)) {
        await usuario.roles.add(nuevoRango).catch(() => null);
        rolesAñadidos.push(nuevoRango);
    }

    try {
        let nuevoNombre = usuario.displayName;
        console.log(nuevoNombre);

        nuevoNombre = nuevoNombre.replace(/\[[^\]]*\]/g, '').trim(); // RegEx bello para remover los prefijos de los y evitar que se repiten.

        // Agregar el nuevo prefijo de rango
        nuevoNombre = `[${rangoSymbol}] ${nuevoNombre}`;

        await usuario.setNickname(nuevoNombre).catch(() => {
            console.log(`No se pudo cambiar el nombre del usuario ${userId}:`);
        });
    } catch (error) {
        console.error(`Error al cambiar el nombre del usuario ${userId}:`, error);
    }

    return {
        cambios: { añadidos: rolesAñadidos || [], removidos: rolesRemovidos || [] },
        rangoActual: rangoActual,
        nuevoRango: nuevoRango
    };
}

async function removeUserRankRole(client, guildId, userId) {
    const RANGOS = [
        client.elo.ranks.rango1,
        client.elo.ranks.rango2,
        client.elo.ranks.rango3,
        client.elo.ranks.rango4,
        client.elo.ranks.rango5,
        client.elo.ranks.rango6,
        client.elo.ranks.rango7,
    ];

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const usuario = await guild.members.fetch(userId).catch(() => null);
    if (!usuario) return;

    const rolesRemovidos = [];

    for (const roleId of RANGOS) {
        if (usuario.roles.cache.has(roleId)) {
            await usuario.roles.remove(roleId).catch(() => null);
            rolesRemovidos.push(roleId);
        }
    }

    return rolesRemovidos;
}

async function getRank(client, guildId, userId) {
    const eloData = (await client.db.get(`${guildId}.elo`)) || [];
    const usuarioElo = eloData.find((entry) => entry.user_id === userId);
  
    if (!usuarioElo) return 0;
  
    const { elo } = usuarioElo;

    if (elo >= 1800) return 6;
    if (elo >= 1300) return 5;
    if (elo >= 1000) return 4;
    if (elo >= 500) return 3;
    if (elo >= 300) return 2;
    if (elo >= 50) return 1;
    return 0;
}


module.exports = { updateUserRankRole, removeUserRankRole, getRank };