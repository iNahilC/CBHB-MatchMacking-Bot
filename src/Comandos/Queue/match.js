const { SlashCommand, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('../../ConfigBot/index.js');
const { isValidRobloxLink } = require('../../Utilidades/validRobloxLink');
const { getVoicePlayers } = require("../../Utilidades/getVoicePlayers");

const CANALES_PERMITIDOS = [
    '1326671674057166868', // Waiting Room
    '1318320678490869862', // Duo 1
    '1311846538607333378', // Duo 2
    '1311846567359152218', // Duo 3
    '1311846597965123665', // Trio 1
    '1311846616923373640', // Trio 2
    '1330991669935476787',  // Trio 3
    '1318927968281694260', //LOBBY
    '1325326260171440190' // Match 1
];

module.exports = new SlashCommand({
    name: 'match',
    category: 'Owner',
    description: 'Crea una partida!',
    example: '/match [server_link: <link>]',
    options: [
        {
            name: 'server-link',
            description: 'Link de tu servidor de roblox!',
            type: 3,
            required: true,
        },
    ],
    ejecutar: async (client, interaction) => {
        if (interaction.channel.id !== "1324923267005415486") return interaction.reply({
			content: `${client.emojisId.error} No puedes utilizar este comando aqui!`,
			flags: 64,
		})
        
        await interaction.deferReply({ flags: 64 });

        // Verificar si el usuario está en un canal de voz permitido
        const miembro = interaction.member;
        if (!miembro.voice.channelId || !CANALES_PERMITIDOS.includes(miembro.voice.channelId)) {
            return interaction.editReply({
                content: '❌ Debes estar en un canal de voz permitido para crear una partida.',
            });
        }

        // Obtener todas las partidas del servidor
        const partidas = await client.db.get(`${interaction.guild.id}.matchs`) || [];

        // Verificar si el usuario ya tiene una partida activa
        const partidaExistente = partidas.find(p => p.hostId === interaction.user.id);
        if (partidaExistente) {
            return interaction.editReply({
                content: '❌ Ya tienes una partida activa. Solo puedes crear una partida a la vez.',
                flags: 64
            });
        }

        // Validar enlace Roblox
        const enlace = interaction.options.getString('server-link');
        if (!isValidRobloxLink(enlace)) {
            return interaction.editReply({
                content: '❌ Enlace inválido. Formato requerido: `https://www.roblox.com/share?code=*CODIGO*&type=Server`'
            });
        }

        // Obtener jugadores en el canal de voz
        const jugadores = getVoicePlayers(interaction.guild);

        // Crear embed para la partida
        const embed = new EmbedBuilder()
            .setTitle('🎮 Partida en Organización')
            .setColor(client.colors.success)
            .addFields(
                { name: '🛡️ Host', value: interaction.user.toString(), inline: true },
                { name: '👥 Jugadores', value: `${jugadores.length}/10`, inline: true },
                { name: '🏆 Jugadores Disponibles', value: "\n"+jugadores.map((p, i) => `**${i + 1}) ${p.displayName}** (${p.user})`).join('\n') || 'No hay jugadores disponibles aún.' },
            );

        if (jugadores.length >= 10) {
            embed.addFields({ name: 'Estado', value: `✅ ¡Suficientes jugadores! Esperando votación de capitanes...` });
        } else {
            embed.addFields({ name: 'Estado', value: `🕒 Esperando mínimo **${10 - jugadores.length}** jugador(es) más para empezar...` });
        }

        // Crear botones de interacción
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`queue_unirse_${interaction.user.id}`)
                .setLabel('Unirse')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎮'),
            new ButtonBuilder()
                .setCustomId(`queue_abandonar_${interaction.user.id}`)
                .setLabel('Abandonar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🚪'),
            new ButtonBuilder()
                .setCustomId(`queue_cancelar_${interaction.user.id}`)
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❌')
        );

        if (jugadores.length <= 9) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`queue_start_votation_${interaction.user.id}`)
                    .setLabel('Iniciar Votación de Capitanes')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Enviar mensaje en el canal designado
        const hostChannel = await client.channels.fetch('1334627919087272088');
        const message = await hostChannel.send({ 
            embeds: [embed],
            components: [row] 
        });

        // Crear nueva partida
        const nuevaPartida = {
            messageId: message.id,
            guildId: interaction.guild.id,
            hostId: interaction.user.id,
            enlace: enlace,
            jugadores: jugadores.map(m => m.id), // Almacenar IDs de los jugadores
            timestamp: Date.now()
        };

        // Guardar la nueva partida en la base de datos
        partidas.push(nuevaPartida);
        await client.db.set(`${interaction.guild.id}.matchs`, partidas);

        console.log(`[Partida] Nueva creada por ${interaction.user.tag} | Jugadores: ${jugadores.length}`);
        await interaction.editReply(`✅ Partida creada correctamente en <#1334627919087272088>`);
    },
});