const { Evento } = require('../../ConfigBot/index');
const { checkCustomStatus } = require('../../Utilidades/monitorCustomStatus');

module.exports = new Evento({
    nombre: 'ready',
	ejecutar: async (client) => {
		checkCustomStatus(client)
	},
});
