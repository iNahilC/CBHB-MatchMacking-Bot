const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');
const { createHash } = require('node:crypto');

module.exports = new SlashCommand({
    name: 'backup-database',
    category: 'Administración',
    description: 'Crea una copia de seguridad de la base de datos actual.',
    example: '/backup-database',
    only_owner: true,
    options: [],
    ejecutar: async (client, interaction) => {
        try {
            await interaction.deferReply({ flags: 64 });

            const dbData = {};
            const guilds = client.guilds.cache;
            
            for (const [guildId, guild] of guilds) {
                const guildData = await client.db.get(guildId) || {};
                if (guildData.elo && guildData.elo.length > 0) {
                    dbData[guildId] = guildData;
                }
            }

            if (Object.keys(dbData).length === 0) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.constants.colorWarning)
                            .setDescription(`${client.emojisId.warning} **La base de datos está vacía.**`)
                    ]
                });
            }

            const jsonData = JSON.stringify(dbData, null, 2);
            const checksum = createHash('sha256').update(jsonData).digest('hex').slice(0, 8);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}-${checksum}.json`;

            const buffer = Buffer.from(jsonData, 'utf-8');
            
            const embed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setTitle(`${client.emojisId.success} **Backup Completo**`)
                .setDescription(`**Resumen:**\n\`\`\`diff\n+ Servidores respaldados: ${Object.keys(dbData).length}\n+ Checksum: ${checksum}\n\`\`\``)
                .setFooter({ text: `Solicitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.editReply({
                embeds: [embed],
                files: [{
                    name: filename,
                    attachment: buffer
                }]
            });

        } catch (error) {
            console.error('Error en /backup-database:', error);
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.colors.error)
                        .setDescription(`${client.emojisId.error} **Error al generar el backup.**`)
                ]
            });
        }
    }
});