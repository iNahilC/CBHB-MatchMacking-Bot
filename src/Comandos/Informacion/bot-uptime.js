const { SlashCommand, DiscordUtils } = require('../../ConfigBot/index')

module.exports = new SlashCommand({
	name: 'bot-uptime',
	category: 'Información',
	description: 'Mire desde cuanto el bot está activo.',
	ejemplo: '/bot-uptime',
	ejecutar: async (client, interaction) => {
		return interaction.reply({
			content: `${client.emojisId.success} **Estoy** activo desde hace **${new DiscordUtils().parse_tiempo(
				client.uptime,
				'{{tiempo}}',
			)}**`,
			allowedMentions: { repliedUser: false },
		})
	},
})
