const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js')
const similar = require('string-similarity')

module.exports = new SlashCommand({
	name: 'help',
	category: 'Información',
	description: 'Muestra una información destallada de algún comando.',
	exemple: '/help [comando]',
	options: [
		{
			name: 'comando',
			description: 'Escribe el nombre del comando que necesites para obtener una información detallada.',
			type: 3,
			required: true,
		},
	],
	ejecutar: async (client, interaction) => {
		const prefix = '/'
		let comando_al_obtener = interaction.options.getString('comando')

		let comando = client.obtener_slashcommand(comando_al_obtener)
		if (!comando) {
			let cmds_similares = []
			client.slashcommands.map((x) => cmds_similares.push(x.nombre))
			const matches = similar.findBestMatch(comando_al_obtener, cmds_similares)
			cmds_similares = []
			matches.ratings.map((rating) => {
				rating.rating > 0.4 ? cmds_similares.push(rating.target) : false
			})

			let cmd_not_found = '',
				index = 1
			if (cmds_similares.length == 0) {
				cmd_not_found =
					'El comando que intentas buscar **__no existe__**, Revisa que estas ingresando bien el nombre o el alias.'
			} else if (cmds_similares.length > 0) {
				cmd_not_found = `El comando que intentas buscar **__no existe__**, Comandos similares con tu búsqueda:\n\`\`\`${cmds_similares
					.map((x) => `${index++}# | ${prefix}${x}`)
					.join('\n')}\`\`\``
			}
			let e = new EmbedBuilder()
			e.setColor(client.colors.success)
			e.setDescription(cmd_not_found)
			return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: `false` } })
		}

		if (comando.category === 'Owner' || comando.category === 'Creador Del Bot' || comando.category === 'Bot Creator') {
			let e = new EmbedBuilder()
			e.setColor(client.colors.success)
			e.setDescription(
				`El comando que intentas buscar __no existe__, Revisa que estas ingresando bien el nombre o el alias.`,
			)
			return interaction.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
		}

		let nombre = comando.name
		let descripcion = comando.description
		let permisos = comando.category
		let ejemplo = comando.exemple.replace('$', '/')

		return interaction.reply({
			content: `
\`\`\`md
# Información del comando ${nombre}

* Nombre
> ${nombre}

* Nivel de permisos
> ${permisos}

* Ejemplo
> ${ejemplo}

* Descripción
> ${descripcion}
\`\`\``,
			allowedMentions: { repliedUser: false },
		})
	},
})
