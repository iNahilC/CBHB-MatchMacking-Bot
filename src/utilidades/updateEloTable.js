const { EmbedBuilder } = require('discord.js');
const { table } = require('table');

async function updateEloTable(client, guildId) {
	try {
        const eloChannel = client.channels.cache.get(client.elo.channel);
        let eloMessage = await eloChannel.messages.fetch(client.elo.message);
        if (!eloMessage) {
            return eloChannel.send({ content: 'No pude encontrar un mensaje para editar.' });
        }

        let usuariosSeason2 = await client.db.get(`${guildId}.season2`);
        let usuariosSeason1 = await client.db.get(`${guildId}.season1`);
        if (!Array.isArray(usuariosSeason2)) usuariosSeason2 = [];
        if (!Array.isArray(usuariosSeason1)) usuariosSeason1 = [];

        const RANGOS = [
            { eloMinimo: 1800, eloMaximo: Infinity, nombre: '6' },
            { eloMinimo: 1300, eloMaximo: 1799, nombre: '5' },
            { eloMinimo: 1000, eloMaximo: 1299, nombre: '4' },
            { eloMinimo: 500, eloMaximo: 999, nombre: '3' },
            { eloMinimo: 300, eloMaximo: 499, nombre: '2' },
            { eloMinimo: 50, eloMaximo: 299, nombre: '1' },
            { eloMinimo: 0, eloMaximo: 49, nombre: '0' },
        ];

        function obtenerRango(elo) {
            return RANGOS.find(r => elo >= r.eloMinimo && elo <= r.eloMaximo)?.nombre || 'Desconocido';
        }

        usuariosSeason2.sort((a, b) => b.elo - a.elo);
        usuariosSeason1.sort((a, b) => b.elo - a.elo);
        let top30Season2 = usuariosSeason2.slice(0, 30);
        let top5Season2 = usuariosSeason2.slice(0, 5);
        let top5Season1 = usuariosSeason1.slice(0, 5);

        // --- Crear la tabla para Top 30 Season 2 ---
        const dataTop30Season2 = [
            ['#', 'USUARIO', 'ELO', 'RANGO'],
            ...top30Season2.map((user, index) => {
                const username = user.username || user.displayName;
                return [`#${index + 1}`, username, user.elo.toLocaleString(), `#${obtenerRango(user.elo)}`];
            }),
        ];

        // --- Crear la tabla para Top 5 Season 2 ---
        const dataTop5Season2 = [
            ['#', 'USUARIO', 'ELO', 'RANGO'],
            ...top5Season2.map((user, index) => {
                const username = user.username || user.displayName;
                return [`#${index + 1}`, username, user.elo.toLocaleString(), `#${obtenerRango(user.elo)}`];
            }),
        ];

        // --- Crear la tabla para Top 5 Season 1 ---
        const dataTop5Season1 = [
            ['#', 'USUARIO', 'ELO', 'RANGO'],
            ...top5Season1.map((user, index) => {
                const username = user.username || user.displayName;
                return [`#${index + 1}`, username, user.elo.toLocaleString(), `#${obtenerRango(user.elo)}`];
            }),
        ];

        // Crear las tablas con la librería `table`
        const tableTop30Season2 = table(dataTop30Season2, {
            columns: { 0: { alignment: 'center' }, 1: { alignment: 'left' }, 2: { alignment: 'center' }, 3: { alignment: 'center' } },
            drawHorizontalLine: (index) => index === 0 || index === 1 || index === dataTop30Season2.length,
        });

        const tableTop5Season2 = table(dataTop5Season2, {
            columns: { 0: { alignment: 'center' }, 1: { alignment: 'left' }, 2: { alignment: 'center' }, 3: { alignment: 'center' } },
            drawHorizontalLine: (index) => index === 0 || index === 1 || index === dataTop5Season2.length,
        });

        const tableTop5Season1 = table(dataTop5Season1, {
            columns: { 0: { alignment: 'center' }, 1: { alignment: 'left' }, 2: { alignment: 'center' }, 3: { alignment: 'center' } },
            drawHorizontalLine: (index) => index === 0 || index === 1 || index === dataTop5Season1.length,
        });

        // --- Crear el Embed para el Top 30 Season 2 y el Top 5 de ambas temporadas ---
        const topEloEmbed = new EmbedBuilder()
            .setColor(client.colors.success)
            .setTitle('**Top 30 Elo Players | Season 2**')
            .setDescription(`\`\`\`\n${tableTop30Season2}\n\`\`\``)
            .setFooter({ text: 'Sistema de Elo', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const topFiveEmbed = new EmbedBuilder()
            .setColor(client.colors.success)
            .setTitle('**Top 5 Elo Players**')
            .setDescription(`**Season 2:**\n\`\`\`\n${tableTop5Season2}\n\`\`\`\n**Season 1:**\n\`\`\`\n${tableTop5Season1}\n\`\`\``)
            .setFooter({ text: 'Sistema de Elo', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        // Actualizar los mensajes en los canales correspondientes
        const topFiveChannel = client.channels.cache.get(client.elo.topFiveChannel);
        if (topFiveChannel) {
            try {
                const topFiveMessage = await topFiveChannel.messages.fetch(client.elo.topFiveMessage);
                await topFiveMessage.edit({ embeds: [topFiveEmbed] });
            } catch (error) {
                console.error('Error al actualizar el mensaje de Top 5:', error);
                await topFiveChannel.send({ embeds: [topFiveEmbed] });
            }
        }

        if (eloChannel) {
            try {
                const eloMessage = await eloChannel.messages.fetch(client.elo.message);
                await eloMessage.edit({ embeds: [topEloEmbed] });
            } catch (error) {
                console.error('Error al actualizar el mensaje de Top 30 Elo:', error);
            }
        }

    } catch (error) {
        console.error('Error al intentar actualizar la clasificación:', error);
    }
}

module.exports = { updateEloTable };
