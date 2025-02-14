const { Evento } = require('../../ConfigBot/index')
const { Console } = require('../../ConfigBot/utilidades/ClientConsole')
const { initializeClientProperties } = require('../../Utilidades/initializeClientProperties')

module.exports = new Evento({
	nombre: 'ready',
	ejecutar: async (client) => {
		Console(['verde', 'blanco'], '<0>[BOT]<1> Listo.')
		initializeClientProperties(client)
		console.log("[Base de Datos] Lista.")
		const array = [`CB:HB Bot Oficial | iNahilC.`]

		setInterval(() => {
			client.user.setPresence({
				activities: [
					{
						name: array[Math.floor(Math.random() * array.length)],
						type: 'WATCHING',
					},
				],
				status: 'online',
			})
		}, 20000)
	},
})
