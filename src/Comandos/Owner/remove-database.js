const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');
const { removeUserRankRole } = require('../../Utilidades/updateUserRankRole.js');
const { updateEloTable } = require('../../Utilidades/updateEloTable.js');

module.exports = new SlashCommand({
    name: 'remove-database',
    category: 'Administración',
    description: 'Elimina un usuario de la base de datos y restablece sus roles y nombre.',
    example: '/remove-database usuario: @Usuario',
    only_owner: true,
    options: [
        {
            name: 'usuario',
            description: 'Menciona al usuario o ingresa su ID.',
            type: 3, // Tipo STRING para aceptar menciones o IDs
            required: true,
        },
    ],
    ejecutar: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const userInput = interaction.options.getString('usuario');
            const userId = userInput.replace(/[<@!>]/g, '');
            if (!userId || !/^\d+$/.test(userId)) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.colors.error)
                            .setDescription(`${client.emojisId.error} **ID de usuario inválido.**`)
                    ]
                });
            }

            const eloData = await client.db.get(`${interaction.guild.id}.elo`) || [];
            const userIndex = eloData.findIndex(entry => entry.user_id === userId);
            
            if (userIndex === -1) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.colors.error)
                            .setDescription(`${client.emojisId.error} <@${userId}> **no está en la base de datos.**`)
                    ]
                });
            }

            await client.db.set(`${interaction.guild.id}.elo`, eloData);
            
            const guild = client.guilds.cache.get(interaction.guild.id);
            const member = await guild.members.fetch(userId).catch(() => null);
            
            if (member) {
                await removeUserRankRole(client, interaction.guild.id, userId);
                
                const cleanName = member.displayName.replace(/\[[^\]]*\]\s*/, '');
                await member.setNickname(cleanName).catch(() => {});
            }

            // Actualizar tabla de ELO
            await updateEloTable(client, interaction.guild.id);

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.colors.success)
                        .setDescription(`${client.emojisId.success} <@${userId}> **fue eliminado completamente de la base de datos.**`)
                ]
            });

        } catch (error) {
            console.error('Error en /remove-database:', error);
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.colors.error)
                        .setDescription(`${client.emojisId.error} **Error al procesar la solicitud.**`)
                ]
            });
        }
    },
});