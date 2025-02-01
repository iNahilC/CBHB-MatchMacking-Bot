// const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

    const logMessages = [];
    const eloData = await client.db.get(`${interaction.guild.id}.elo`);
    const actionUser = interaction.user.globalName;

    for (const userDetails of details) {
        const { targetUser, eloAnterior, elo, componentId } = userDetails;
        const eloEntry = eloData.find((entry) => entry.user_id === targetUser);
        const currentElo = eloEntry ? eloEntry.elo : 0;
        const member = interaction.guild.members.cache.get(targetUser);

        let logMessage = '';

        switch (logTypeKey) {
            case 'agregar':
                logMessage = `✅ **${actionUser}** agregó **${elo}** de **elo** al usuario **${member}**.\n\n**Elo actual:** \`${currentElo}\` | **Elo anterior:** \`${eloAnterior}\``;
                break;

            case 'establecer':
                logMessage = `✅ **${actionUser}** estableció **${elo}** de **elo** al usuario **${member}**.\n\n**Elo actual:** \`${elo}\` | **Elo anterior:** \`${eloAnterior}\``;
                break;

            case 'remover':
                logMessage = `✅ **${actionUser}** removió **${elo}** de **elo** al usuario **${member}**.\n\n**Elo actual:** \`${currentElo}\` | **Elo anterior:** \`${eloAnterior}\``;
                break;

            case 'eliminar':
                logMessage = `✅ **${actionUser}** **eliminó** el **ELO** del usuario **${member}**.\n\n**Elo anterior:** \`${eloAnterior}\``;
                break;

            default:
                logMessage = `**⚠️ Acción Desconocida**\n\n**Usuario:** ${interaction.user.tag}\n**Descripción:** ${userDetails.description || 'No especificada'}`;
                break;
        }

        logMessages.push(logMessage);
        const storedComponentsId = await client.db.get(`${interaction.guild.id}.activeComponents`) || [];
        if (!storedComponentsId.some(entry => entry.id === componentId)) {
            storedComponentsId.push({ id: componentId, type: logTypeKey, targetUser });
            await client.db.set(`${interaction.guild.id}.activeComponents`, storedComponentsId);
        }
    }

    try {
        for (let i = 0; i < logMessages.length; i++) {
            const embed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setDescription(logMessages[i]);

            await logChannel.send({
                embeds: [embed],
            });
        }
    } catch (error) {
        console.error(`Error al enviar los logs al canal (${logTypeKey}): ${error.message}`);
    }
}

module.exports = { sendLogs };
