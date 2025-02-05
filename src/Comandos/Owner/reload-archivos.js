const fs = require('fs');
const path = require('path');
const { SlashCommand } = require('../../ConfigBot/index.js');
const { Console } = require('../../ConfigBot/utilidades/ClientConsole.js');

function recargar_utilidades() {
    const utilidadesPath = path.join(__dirname, '../../Utilidades');
    fs.readdirSync(utilidadesPath).forEach(file => {
        if (file.endsWith('.js')) {
            const filePath = path.join(utilidadesPath, file);
            delete require.cache[require.resolve(filePath)];
        }
    });
    Console(["verde", "azul", "blanco"], `<0>[UTILIDADES] <1>Las utilidades han sido recargadas correctamente.`);
    return true;
}

module.exports = { recargar_utilidades };

module.exports = new SlashCommand({
    name: 'recargar-archivos',
    alias: ['ra', 'reload-files'],
    description: 'Recarga los archivos dentro de la carpeta Utilidades.',
    category: 'Owner',
    only_owner: true,
    exemple: '/recargar-archivos',
    ejecutar: async (client, interaction) => {
        if (interaction.channel.id !== '1324923267005415486') {
            return interaction.reply({
                content: `${client.emojisId.error} No puedes utilizar este comando aquí!`,
                flags: 64,
            });
        }

        try {
            const resultadoRecarga = recargar_utilidades();
            if (resultadoRecarga !== true) {
                return interaction.reply({
                    content: `${client.emojisId.error} No se pudieron recargar los archivos de utilidades.`,
                    allowedMentions: { repliedUser: false },
                });
            }
            return interaction.reply({
                content: `${client.emojisId.success} Se han recargado correctamente los archivos de utilidades.`,
                allowedMentions: { repliedUser: false },
            });
        } catch (e) {
            console.error(e);
            return interaction.reply({
                content: `${client.emojisId.error} Hubo un error al intentar recargar los archivos de utilidades.`,
                allowedMentions: { repliedUser: false },
            });
        }
    },
});
