const { SlashCommand, EmbedBuilder, PermissionsBitField } = require('../../ConfigBot/index.js');
const { removeUserRankRole } = require('../../Utilidades/updateUserRankRole.js');
const { updateEloTable } = require('../../Utilidades/updateEloTable.js');

module.exports = new SlashCommand({
    name: 'remove-database',
    category: 'Role Verifier',
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
        if (interaction.guild.id !== "1327694586864341112") return interaction.reply({
			content: `${client.emojisId.error} No puedes utilizar este comando aqui!`,
			flags: 64,
		})

        try {
            await interaction.deferReply();
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Admin)) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando.**`);
                return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
    
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

            const eloData = await client.db.get(`1311782674964418640.season2`) || [];
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

            await client.db.set(`1311782674964418640.season2`, eloData);
            
            const guild = client.guilds.cache.get("1311782674964418640");
            const member = await guild.members.fetch(userId).catch(() => null);
            
            if (member) {
                await removeUserRankRole(client, "1311782674964418640", userId);
                
                const cleanName = member.displayName.replace(/\[[^\]]*\]\s*/, '');
                await member.setNickname(cleanName).catch(() => {});
            }

            // Actualizar tabla de ELO
            await updateEloTable(client, "1311782674964418640");

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