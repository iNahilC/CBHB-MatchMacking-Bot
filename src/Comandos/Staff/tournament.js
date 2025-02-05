const { SlashCommand, PermissionsBitField } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
    name: 'tournament',
    category: 'Staff',
    description: 'Menciona los equipos a participar y el bot lo publicará en el canal indicado.',
    example: '/tournament [canal: #Canal] [equipo_1: @Rol] [equipo_2: @Rol] [mapa_1: Nombre] [mapa_2: Nombre] [mapa_3: Nombre]',
    options: [
        {
            name: 'canal',
            description: 'Canal al que deseas enviar el mensaje.',
            type: 7,
            required: true,
        },
        {
            name: 'equipo_1',
            description: 'Menciona al primer equipo.',
            type: 8,
            required: true,
        },
        {
            name: 'equipo_2',
            description: 'Menciona al segundo equipo.',
            type: 8,
            required: true,
        },
        {
            name: 'mapa_1',
            description: 'Primer mapa a jugar.',
            type: 3,
            required: true,
        },
        {
            name: 'mapa_2',
            description: 'Segundo mapa a jugar.',
            type: 3,
            required: true,
        },
        {
            name: 'mapa_3',
            description: 'Tercer mapa a jugar (decisivo).',
            type: 3,
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
        const equipo1 = interaction.options.getRole('equipo_1');
        const equipo2 = interaction.options.getRole('equipo_2');
        const mapa1 = interaction.options.getString('mapa_1');
        const mapa2 = interaction.options.getString('mapa_2');
        const mapa3 = interaction.options.getString('mapa_3');

        // Obtener los jugadores que tienen estos roles
        const jugadoresEquipo1 = interaction.guild.members.cache
            .filter(member => member.roles.cache.has(equipo1.id))
            .map(member => `<@${member.user.id}>`)
            .join(' & ') || 'No encontrado';

        const jugadoresEquipo2 = interaction.guild.members.cache
            .filter(member => member.roles.cache.has(equipo2.id))
            .map(member => `<@${member.user.id}>`)
            .join(' & ') || 'No encontrado';

        // Obtener el número actual de matchs y actualizarlo
        let matchNumber = await client.db.get('lower_bracket_match') || 0;
        matchNumber += 1;
        await client.db.set('lower_bracket_match', matchNumber);

        let getMatchCount = await client.db.get('lower_bracket_match')
        const mensaje = `
# 📢 ** ¡Atención equipos! [ Lowerbracket | Match #${getMatchCount} ]** 📢  
**🎮 Enfrentamiento 2vs2 🎮**  

🔥 ${equipo1} vs ${equipo2} 🔥  

👥 **Jugadores:**  
🟦 **${equipo1}**: ${jugadoresEquipo1}  
🟥 **${equipo2}**: ${jugadoresEquipo2}  

🗺️ **Mapas a jugar (BO3):**  
🔹 **Mapa 1:** ${mapa1}  
🔹 **Mapa 2:** ${mapa2}  
🔹 **Mapa 3 (Decisivo):** ${mapa3}  

📌 Por favor, entren al canal de voz <#1335333579424661575> para comenzar la partida.  
        `;

        await canal.send(mensaje);
        return interaction.reply({
            content: `${client.emojisId.success} **El anuncio ha sido enviado a ${canal}.**`,
            flags: 64
        });
    },
});
