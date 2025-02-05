const { EmbedBuilder } = require('../ConfigBot');

async function sendLogs(client, interaction, type, details = []) {
    if (!Array.isArray(details)) {
        console.error('El parámetro "details" debe ser un array.');
        return;
    }

    if (details.length === 0) {
        console.error('El array "details" está vacío.');
        return;
    }

    const LOGS_TYPE = {
        ADD: 'agregar',
        REMOVE: 'remover',
        SET: 'establecer',
        DELETE: 'eliminar',
        RANKS: 'rangos',
    };

    const logTypeKey = LOGS_TYPE[type.toUpperCase()];
    if (!logTypeKey) {
        console.error(`Tipo de log no válido: ${type}`);
        return;
    }

    const channelId = client.elo.logs[logTypeKey];
    const logChannel = client.channels.cache.get(channelId);

    if (!logChannel) {
        console.error(`El canal de logs para el tipo "${logTypeKey}" con ID ${channelId} no se encontró.`);
        return;
    }

    // Recuperamos la data actual de elo de la base de datos
    const eloData = await client.db.get(`${interaction.guild.id}.season2`);
    const actionUser = interaction.user.globalName;

    // En lugar de almacenar solo strings, almacenaremos un objeto con el mensaje y los datos del footer.
    const logEntries = [];

    for (const userDetails of details) {
        const { targetUser, eloAnterior, elo, componentId } = userDetails;
        const eloEntry = eloData.find((entry) => entry.user_id === targetUser);
        const currentElo = eloEntry ? eloEntry.elo : 0;
        const member = interaction.guild.members.cache.get(targetUser);

        let logMessage = '';

        switch (logTypeKey) {
            case 'agregar':
                logMessage = `✅ **${actionUser}** agregó **+${elo}** de **elo** al usuario **${member}**.`;
                break;
            case 'establecer':
                logMessage = `✅ **${actionUser}** estableció **=${elo}** de **elo** al usuario **${member}**.`;
                break;
            case 'remover':
                logMessage = `✅ **${actionUser}** removió **-${elo}** de **elo** al usuario **${member}**.`;
                break;
            case 'eliminar':
                logMessage = `✅ **${actionUser}** eliminó el **ELO** del usuario **${member}**.`;
                break;
            default:
                logMessage = `**⚠️ Acción Desconocida**\n\n**Usuario:** ${interaction.user.tag}\n**Descripción:** ${userDetails.description || 'No especificada'}`;
                break;
        }

        // Agregamos la información necesaria para el footer junto con el mensaje.
        logEntries.push({
            message: `${logMessage}`,
            currentElo,
            eloAnterior,
            componentId,
        });

        // Registrar el componente (si no existe ya)
        const storedComponentsId = await client.db.get(`${interaction.guild.id}.activeComponents`) || [];
        if (!storedComponentsId.some(entry => entry.id === componentId)) {
            storedComponentsId.push({ id: componentId, type: logTypeKey, targetUser });
            await client.db.set(`${interaction.guild.id}.activeComponents`, storedComponentsId);
        }
    }

    try {
        // Enviar un embed por cada entrada en logEntries
        for (const entry of logEntries) {
            const embed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setDescription(entry.message)
                .setFooter({ text: `Elo Actual: ${entry.currentElo} | Elo Anterior: ${entry.eloAnterior}` });

            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(`Error al enviar los logs al canal (${logTypeKey}): ${error.message}`);
    }
}

module.exports = { sendLogs };
