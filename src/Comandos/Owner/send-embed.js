const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js')

module.exports = new SlashCommand({
	name: 'send-embed',
	category: 'Owner',
	description: 'Envia un embed a un canal.',
	example: '/send-embed',
	options: [
		{
			name: 'canal',
			description: 'Canal al que deseas enviar el embed.',
			type: 7,
			required: true,
		},
		{
			name: 'mensaje',
			description: 'Mensaje que deseas enviar.',
			type: 3,
			required: true,
		}
	],
	ejecutar: async (client, interaction) => {
		if (interaction.channel.id !== "1324923267005415486") return interaction.reply({
			content: `${client.emojisId.error} No puedes utilizar este comando aqui!`,
			flags: 64,
		})
		const canal = interaction.options.getChannel('canal')
		const mensaje = interaction.options.getString('mensaje')
		const e = new EmbedBuilder()
			.setColor(client.colors.success)
			.setDescription(`
${mensaje}
				`)

			return canal.send({ embeds: [e]});
	},
});