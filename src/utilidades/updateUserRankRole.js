async function updateUserRankRole(client, guildId, userId, eloData) {
    const RANGOS = [
        { eloMinimo: 3300, eloMaximo: Infinity, roleId: client.elo.ranks.rango10, rango: '⑩' },
        { eloMinimo: 2500, eloMaximo: 3299, roleId: client.elo.ranks.rango9, rango: '⑨' },
        { eloMinimo: 1900, eloMaximo: 2499, roleId: client.elo.ranks.rango8, rango: '⑧' },
        { eloMinimo: 1400, eloMaximo: 1899, roleId: client.elo.ranks.rango7, rango: '⑦' },
        { eloMinimo: 1000, eloMaximo: 1399, roleId: client.elo.ranks.rango6, rango: '⑥' },
        { eloMinimo: 700, eloMaximo: 999, roleId: client.elo.ranks.rango5, rango: '⑤' },
        { eloMinimo: 450, eloMaximo: 699, roleId: client.elo.ranks.rango4, rango: '④' },
        { eloMinimo: 250, eloMaximo: 449, roleId: client.elo.ranks.rango3, rango: '③' },
        { eloMinimo: 100, eloMaximo: 249, roleId: client.elo.ranks.rango2, rango: '②' },
        { eloMinimo: 0, eloMaximo: 99, roleId: client.elo.ranks.rango1, rango: '①' },
    ];

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return null;

    const entradaUsuarioElo = eloData 
        ? eloData.find(entry => entry.user_id === userId)
        : (await client.db.get(`${guildId}.season2`) || []).find(entry => entry.user_id === userId);

    if (!entradaUsuarioElo) return null;

    const usuario = await guild.members.fetch(userId).catch(() => null);
    if (!usuario) return null;

    const userElo = entradaUsuarioElo.elo;

    const rangoActual = RANGOS.find(r => usuario.roles.cache.has(r.roleId))?.roleId;

    const nuevoRangoObj = RANGOS.find(r => userElo >= r.eloMinimo && userElo <= r.eloMaximo);
    
    if (!nuevoRangoObj) return null;

    const { roleId: nuevoRango, rango: rangoSymbol } = nuevoRangoObj;

    const rolesParaRemover = RANGOS
        .filter(r => r.roleId !== nuevoRango)
        .map(r => r.roleId);

    const cambios = {
        añadidos: [],
        removidos: []
    };

    for (const roleId of rolesParaRemover) {
        if (usuario.roles.cache.has(roleId)) {
            await usuario.roles.remove(roleId).catch(() => null);
            cambios.removidos.push(roleId);
        }
    }

    if (!usuario.roles.cache.has(nuevoRango)) {
        await usuario.roles.add(nuevoRango).catch(() => null);
        cambios.añadidos.push(nuevoRango);
    }

    try {
        const nuevoNombre = `[${rangoSymbol}] ${usuario.displayName.replace(/\[.*?\]\s*/g, '')}`;
        await usuario.setNickname(nuevoNombre);
    } catch (error) {
        console.error(`Error actualizando apodo de ${usuario.user.tag}`, error.message);
    }

    return {
        cambios: cambios.añadidos.length > 0 || cambios.removidos.length > 0 ? cambios : null,
        rangoActual,
        nuevoRango
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
        client.elo.ranks.rango8,
        client.elo.ranks.rango9,
        client.elo.ranks.rango10,
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
    const eloData = (await client.db.get(`${guildId}.season2`)) || [];
    const usuarioElo = eloData.find((entry) => entry.user_id === userId);

    if (!usuarioElo) return 0;

    const { elo } = usuarioElo;

    if (elo >= 3300) return 10;
    if (elo >= 2500) return 9;
    if (elo >= 1900) return 8;
    if (elo >= 1400) return 7;
    if (elo >= 1000) return 6;
    if (elo >= 700) return 5;
    if (elo >= 450) return 4;
    if (elo >= 250) return 3;
    if (elo >= 100) return 2;
    return 1;
}

module.exports = { updateUserRankRole, removeUserRankRole, getRank };