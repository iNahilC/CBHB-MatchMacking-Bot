const { ConfigBot, GatewayIntentBits, Partials  } = require("./src/ConfigBot/index");
// FTP exeo2HiFuxSXLds

new ConfigBot({
slashcommands: "./src/Comandos/",
eventos: "./src/Eventos/",
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
    ws: {
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
    }
});