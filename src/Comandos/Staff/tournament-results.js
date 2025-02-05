const { SlashCommand, PermissionsBitField } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
    name: 'tournament-results',
    category: 'Staff',
    description: 'Envía los resultados de un torneo con imagen(es), equipos y puntajes de los 3 mapas.',
    example: '/tournament-results [canal] [ganador] [perdedor] [mapa1_ganador] [mapa1_perdedor] [mapa2_ganador] [mapa2_perdedor] [mapa3_ganador] [mapa3_perdedor] [imagen1] [imagen2] ...',
    options: [
        {
            name: 'match-images',
            description: 'Imagen(es) que representan el resultado del partido.',
            type: 11, // Archivos adjuntos
            required: true,
            max_values: 10 // Permitimos hasta 10 imágenes como máximo
        },
        {
            name: 'canal',
            description: 'Canal donde se publicará el resultado.',
            type: 7, // Canal de texto
            required: true,
        },
        {
            name: 'ganador',
            description: 'Equipo que ganó el partido.',
            type: 8, // Rol del equipo ganador
            required: true,
        },
        {
            name: 'perdedor',
            description: 'Equipo que perdió el partido.',
            type: 8, // Rol del equipo perdedor
            required: true,
        },
        {
            name: 'mapa1_ganador',
            description: 'Puntos obtenidos por el equipo ganador en el primer mapa.',
            type: 4, // Número entero
            required: true,
        },
        {
            name: 'mapa1_perdedor',
            description: 'Puntos obtenidos por el equipo perdedor en el primer mapa.',
            type: 4, // Número entero
            required: true,
        },
        {
            name: 'mapa2_ganador',
            description: 'Puntos obtenidos por el equipo ganador en el segundo mapa.',
            type: 4, // Número entero
            required: true,
        },
        {
            name: 'mapa2_perdedor',
            description: 'Puntos obtenidos por el equipo perdedor en el segundo mapa.',
            type: 4, // Número entero
            required: true,
        },
        {
            name: 'mapa3_ganador',
            description: 'Puntos obtenidos por el equipo ganador en el tercer mapa.',
            type: 4, // Número entero
            required: true,
        },
        {
            name: 'mapa3_perdedor',
            description: 'Puntos obtenidos por el equipo perdedor en el tercer mapa.',
            type: 4, // Número entero
            required: true,
        }
    ],
    ejecutar: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: `${client.emojisId.error} **No tienes permisos para usar este comando.**`,
                flags: 64
            });
        }

        const canal = interaction.options.getChannel('canal');
        const ganador = interaction.options.getRole('ganador');
        const perdedor = interaction.options.getRole('perdedor');
        const mapa1Ganador = interaction.options.getInteger('mapa1_ganador');
        const mapa1Perdedor = interaction.options.getInteger('mapa1_perdedor');
        const mapa2Ganador = interaction.options.getInteger('mapa2_ganador');
        const mapa2Perdedor = interaction.options.getInteger('mapa2_perdedor');
        const mapa3Ganador = interaction.options.getInteger('mapa3_ganador');
        const mapa3Perdedor = interaction.options.getInteger('mapa3_perdedor');

        // Obtener las imágenes
        const imagenes = interaction.options.getAttachment('match-images')

        // Obtener los jugadores de cada equipo
        const jugadoresGanador = interaction.guild.members.cache
            .filter(member => member.roles.cache.has(ganador.id))
            .map(member => `<@${member.user.id}>`)
            .join(' & ');

        const jugadoresPerdedor = interaction.guild.members.cache
            .filter(member => member.roles.cache.has(perdedor.id))
            .map(member => `<@${member.user.id}>`)
            .join(' & ');

        const getMatchCount = await client.db.get('lower_bracket_match');
        const respuesta = `
# 📢 **[ 2vs2 Tournament | Match \`#${getMatchCount}/4\` ]**  

🏆 **Equipos Clasificados:**
🔺**Ganador:** ${ganador.name}
🔻**Perdedor (Eliminado definitivamente):** ${perdedor.name}

# Mapas 🗺️
🔹**Mapa 1:** ${mapa1Ganador} - ${mapa1Perdedor}
🔹**Mapa 2:** ${mapa2Ganador} - ${mapa2Perdedor}
🔹**Mapa 3:** ${mapa3Ganador} - ${mapa3Perdedor}

**Jugadores en el equipo ganador:** ${jugadoresGanador}
**Jugadores en el equipo perdedor:** ${jugadoresPerdedor}
`;

    await canal.send({
                content: respuesta,
                files: [imagenes]
            });

        // Responder a la interacción
        return interaction.reply({
            content: `${client.emojisId.success} El resultado del torneo ha sido enviado con éxito.`,
            flags: 64
        });
    }
});