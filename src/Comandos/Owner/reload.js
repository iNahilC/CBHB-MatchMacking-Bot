const { SlashCommand } = require('../../ConfigBot/index.js')

module.exports = new SlashCommand({
	name: 'reload',
	alias: ['r', 'recargar'],
	description: 'Este comando te permite actualizar un comando/evento.',
	category: 'Owner',
	only_owner: true,
	exemple: '$reload',
	options: [
		{ name: 'comando', description: 'El comando que deseas actualizar.', type: 3 },
		{ name: 'evento', description: 'El evento que deseas actualizar.', type: 3 },
	],
	ejecutar: async (client, interaction) => {
		if (!interaction.options.getString('comando') && !interaction.options.getString('evento')) {
			try {
				await client.recargar_slashcommand()
				await client.recargar_evento()

				return interaction.reply({
					content: `${client.emojisId.success} Se han recargado todos los **comandos** y **eventos**.`,
					allowedMentions: { repliedUser: false },
				})
			} catch (e) {
				console.error(e)
				return interaction.reply({
					content: `${client.emojisId.error} No se pudo recargar los **comandos** y **eventos**.`,
					allowedMentions: { repliedUser: false },
				})
			}
		} else {
			if (interaction.options.getString('comando')) {
				try {
					client.recargar_slashcommand(interaction.options.getString('comando'))
					return interaction.reply({
						content: `${client.emojisId.success} Se ha recargado el comando **${interaction.options.getString(
							'comando',
						)}**.`,
						allowedMentions: { repliedUser: false },
					})
				} catch (e) {
					console.error(e)

					return interaction.reply({
						content: `${client.emojisId.error} No se pudo recargar el comando **${interaction.options.getString(
							'comando',
						)}**.`,
						allowedMentions: { repliedUser: false },
					})
				}
			} else {
				try {
					client.recargar_evento(interaction.options.getString('evento'))
					return interaction.reply({
						content: `${client.emojisId.success} Se ha recargado el evento **${interaction.options.getString(
							'evento',
						)}**.`,
						allowedMentions: { repliedUser: false },
					})
				} catch (e) {
					console.error(e)
					return interaction.reply({
						content: `${client.emojisId.error} No se pudo recargar el evento **${interaction.options.getString(
							'evento',
						)}**.`,
						allowedMentions: { repliedUser: false },
					})
				}
			}
		}
	},
})