const { SlashCommand, EmbedBuilder, PermissionsBitField } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
    name: 'change-nickname',
    category: 'Administración',
    description: 'Cambia el nombre de los usuarios manteniendo su prefijo de rango.',
    example: '/change-nickname usuarios: @user1 @user2 nombres: nombre1, nombre2',
    options: [
        {
            name: 'usuarios',
            description: 'Usuarios a cambiar (menciones).',
            type: 3,
            required: true,
        },
        {
            name: 'nombres',
            description: 'Nuevos nombres separados por comas.',
            type: 3,
            required: true,
        },
    ],
    ejecutar: async (client, interaction) => {
        try {
            await interaction.deferReply();

            // Verificar permisos de administrador
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando.**`);
                return interaction.editReply({ embeds: [e] });
            }

            // Obtener parámetros
            const usuariosTexto = interaction.options.getString('usuarios');
            const nombresTexto = interaction.options.getString('nombres');

            // Extraer menciones
            const usuarios = usuariosTexto.match(/<@!?\d+>/g);
            if (!usuarios || usuarios.length === 0) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} Debes **mencionar** a uno o varios **usuarios** válidos.`);
                return interaction.editReply({ embeds: [e] });
            }

            // Procesar nombres
            const nombresArray = nombresTexto.split(',')
                .map(nombre => nombre.trim())
                .filter(nombre => nombre.length > 0);

            // Validar cantidad de nombres
            if (nombresArray.length !== usuarios.length) {
                const e = new EmbedBuilder()
                    .setColor(client.colors.error)
                    .setDescription(`${client.emojisId.error} La cantidad de nombres (${nombresArray.length}) no coincide con la cantidad de usuarios (${usuarios.length}).`);
                return interaction.editReply({ embeds: [e] });
            }

            const resultados = [];
            const rangos = ['⓪', '①', '②', '③', '④', '⑤', '⑥'];

            // Procesar cada usuario
            for (let i = 0; i < usuarios.length; i++) {
                const userId = usuarios[i].replace(/[<@!>]/g, '');
                const miembro = interaction.guild.members.cache.get(userId);

                if (!miembro) {
                    resultados.push(`⚠️ <@${userId}> no está en este servidor.`);
                    continue;
                }

                try {
                    // Obtener rango actual
                    const rangoActual = rangos.find(rango => miembro.displayName.includes(`[${rango}]`)) || '⓪';
                    
                    // Construir nuevo nombre
                    const nuevoNombre = `[${rangoActual}] ${nombresArray[i]}`;
                    
                    // Cambiar nombre en Discord
                    await miembro.setNickname(nuevoNombre);

                    // Actualizar base de datos
                    const userData = await client.db.get(`${interaction.guild.id}.season2.${userId}`) || {};
                    userData.displayName = nombresArray[i];
                    await client.db.set(`${interaction.guild.id}.season2.${userId}`, userData);

                    resultados.push(`✔️ <@${userId}> ahora es \`${nuevoNombre}\``);
                } catch (error) {
                    console.error(`Error cambiando nombre a <@${userId}>:`, error);
                    resultados.push(`❌ No se pudo cambiar el nombre a <@${userId}>`);
                }
            }

            const embed = new EmbedBuilder()
                .setColor(client.colors.success)
                .setTitle('📝 Cambio de Nombres')
                .setDescription(resultados.join('\n'))
                .setFooter({ text: 'Sistema de Nombres', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en /change-nickname:', error);
            const embed = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription('❌ Ocurrió un error al procesar el comando.');
            return interaction.editReply({ embeds: [embed] });
        }
    },
});