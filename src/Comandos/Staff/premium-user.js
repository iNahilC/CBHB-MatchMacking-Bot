const { SlashCommand, PermissionsBitField, EmbedBuilder } = require('../../ConfigBot/index.js');
const { table } = require('table');

module.exports = new SlashCommand({
    name: 'premium-user',
    category: 'Administración',
    description: 'Administra usuarios premium. Usa las subopciones add, remove o list.',
    example: '/premium-user add usuario:@Usuario',
    options: [
        {
            name: 'add',
            description: 'Agrega un usuario a la lista de usuarios premium y le asigna el rol "Pic Perms".',
            type: 1,
            options: [
                {
                    name: 'usuario',
                    description: 'El usuario que deseas agregar como premium.',
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description: 'Remueve un usuario de la lista de usuarios premium.',
            type: 1,
            options: [
                {
                    name: 'usuario',
                    description: 'El usuario que deseas remover del premium.',
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: 'list',
            description: 'Muestra una tabla de usuarios premium y de usuarios no premium que tienen el rol "Pic Perms".',
            type: 1,
        },
    ],
    ejecutar: async (client, interaction) => {
        await interaction.deferReply({ flags: 64 });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embedError = new EmbedBuilder()
                .setColor(client.colors.error)
                .setDescription(`${client.emojisId.error} **No tienes permisos para usar este comando.**`);
            return interaction.editReply({ embeds: [embedError], flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();
        const roleId = '1311864505139200050'; // Rol Pic Perms
        const guildId = interaction.guild.id;
        const premiumKey = `${guildId}.premium`;

        switch (subcommand) {
            case 'add': {
                const usuario = interaction.options.getUser('usuario');
                let premiumUsers = (await client.db.get(premiumKey)) || [];

                if (premiumUsers.includes(usuario.id)) {
                    return interaction.editReply({ content: `⚠️ **${usuario.tag}** ya es un usuario premium.` });
                }

                premiumUsers.push(usuario.id);
                await client.db.set(premiumKey, premiumUsers);

                const member = await interaction.guild.members.fetch(usuario.id);
                if (!member.roles.cache.has(roleId)) {
                    await member.roles.add(roleId);
                }

                return interaction.editReply({ content: `✅ Se agregó a **${usuario.tag}** a la lista premium y se le asignó el rol "Pic Perms".` });
            }
            case 'remove': {
                const usuario = interaction.options.getUser('usuario');
                let premiumUsers = (await client.db.get(premiumKey)) || [];

                if (!premiumUsers.includes(usuario.id)) {
                    return interaction.editReply({ content: `⚠️ **${usuario.tag}** no es un usuario premium.` });
                }

                premiumUsers = premiumUsers.filter(id => id !== usuario.id);
                await client.db.set(premiumKey, premiumUsers);

                const member = await interaction.guild.members.fetch(usuario.id);
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                }

                return interaction.editReply({ content: `✅ Se removió a **${usuario.tag}** de la lista premium.` });
            }
            case 'list': {
                const premiumUsers = (await client.db.get(premiumKey)) || [];
                await interaction.guild.members.fetch();

                const premiumList = premiumUsers.map(userId => {
                    const member = interaction.guild.members.cache.get(userId);
                    return member ? member.user.tag : userId;
                });

                const membersWithRole = interaction.guild.members.cache.filter(member => member.roles.cache.has(roleId));
                const nonPremiumList = membersWithRole
                    .filter(member => !premiumUsers.includes(member.id))
                    .map(member => member.user.tag);

                let premiumTable = premiumList.length === 0 
                    ? 'No hay usuarios premium.' 
                    : table([['Usuarios Premium'], ...premiumList.map(tag => [tag])]);

                let nonPremiumTable = nonPremiumList.length === 0 
                    ? 'No hay usuarios no premium con el rol "Pic Perms".' 
                    : table([['Usuarios no Premium con rol "Pic Perms"'], ...nonPremiumList.map(tag => [tag])]);

                const embedList = new EmbedBuilder()
                    .setTitle('Listado de Usuarios Premium y no Premium con rol "Pic Perms"')
                    .setColor(client.colors.success)
                    .setDescription(`**Usuarios Premium:**\n\`\`\`\n${premiumTable}\n\`\`\`\n**Usuarios no Premium con rol "Pic Perms":**\n\`\`\`\n${nonPremiumTable}\n\`\`\``);

                return interaction.editReply({ embeds: [embedList] });
            }
        }
    }
});