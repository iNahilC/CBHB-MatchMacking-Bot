/*///////////////////////////////////////////////////////////*/
// ╔════════════════════════════════════════════════════════╗//
// ║                                                        ║//
// ║    ██╗███╗░░██╗░█████╗░██╗░░██╗██╗██╗░░░░░░█████╗░░░░  ║//
// ║    ██║████╗░██║██╔══██╗██║░░██║██║██║░░░░░██╔══██╗░░░  ║//
// ║    ██║██╔██╗██║███████║███████║██║██║░░░░░██║░░╚═╝░░░  ║//
// ║    ██║██║╚████║██╔══██║██╔══██║██║██║░░░░░██║░░██╗░░░  ║//
// ║    ██║██║░╚███║██║░░██║██║░░██║██║███████╗╚█████╔╝██╗  ║//
// ║    ╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝░╚════╝░╚═╝  ║//
// ║                        D-ConfigBot                     ║//
// ╚════════════════════════════════════════════════════════╝//
/*///////////////////////////////////////////////////////////*/

const {
  BaseClient,
  Shard,
  ShardClientUtil,
  ShardingManager,
  WebhookClient,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ActivityFlagsBitField,
  BitField,
  Collection,
  Constants,
  DataResolver,
  BaseManager,
  DiscordAPIError,
  HTTPError,
  MessageFlagsBitField,
  GatewayIntentBits,
  PermissionsBitField,
  Speaking,
  SnowflakeUtil,
  Util,
  version,
  ChannelManager,
  GuildChannelManager,
  GuildEmojiManager,
  GuildEmojiRoleManager,
  GuildMemberManager,
  GuildMemberRoleManager,
  GuildManager,
  ReactionUserManager,
  MessageManager,
  PresenceManager,
  RoleManager,
  UserManager,
  discordSort,
  escapeMarkdown,
  fetchRecommendedShards,
  resolveColor,
  resolveString,
  splitMessage,
  Base,
  Activity,
  CategoryChannel,
  Channel,
  ClientApplication,
  ClientUser,
  Collector,
  DMChannel,
  Emoji,
  Guild,
  GuildAuditLogs,
  GuildChannel,
  BaseGuild,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  GuildEmoji,
  GuildMember,
  GuildPreview,
  Integration,
  Invite,
  Message,
  AttachmentBuilder,
  MessageCollector,
  EmbedBuilder,
  MessageMentions,
  MessageReaction,
  NewsChannel,
  PermissionOverwrites,
  Presence,
  ReactionCollector,
  ReactionEmoji,
  RichPresenceAssets,
  Role,
  Team,
  TeamMember,
  TextChannel,
  User,
  VoiceChannel,
  VoiceRegion,
  VoiceState,
  VoiceStateUpdate,
  Webhook,
  WebSocket,
  Routes,
  REST,
  ComponentType,
  Partials
} = require('discord.js');

module.exports = {
  BaseClient,
  ConfigBot: require("./clases/Client"),
  Evento: require("./clases/ClientEventClass"),
  DiscordUtils: require("./clases/ClientUtils"),
  Comando: require("./clases/ClientCommandClass"),
  SlashCommand: require("./clases/SlashCommand"),
  Shard,
  REST,
  Routes,
  ShardClientUtil,
  ShardingManager,
  WebhookClient,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ActivityFlagsBitField,
  BitField,
  Collection,
  Constants,
  DataResolver,
  BaseManager,
  DiscordAPIError,
  HTTPError,
  MessageFlagsBitField,
  GatewayIntentBits,
  PermissionsBitField,
  Speaking,
  SnowflakeUtil,
  Util,
  version,
  ChannelManager,
  GuildChannelManager,
  GuildEmojiManager,
  GuildEmojiRoleManager,
  GuildMemberManager,
  GuildMemberRoleManager,
  GuildManager,
  ReactionUserManager,
  MessageManager,
  PresenceManager,
  RoleManager,
  UserManager,
  discordSort,
  escapeMarkdown,
  fetchRecommendedShards,
  resolveColor,
  resolveString,
  splitMessage,
  Base,
  Activity,
  CategoryChannel,
  Channel,
  ClientApplication,
  ClientUser,
  Collector,
  DMChannel,
  Emoji,
  Guild,
  GuildAuditLogs,
  GuildChannel,
  BaseGuild,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  GuildEmoji,
  GuildMember,
  GuildPreview,
  Integration,
  Invite,
  Message,
  AttachmentBuilder,
  MessageCollector,
  EmbedBuilder,
  MessageMentions,
  MessageReaction,
  NewsChannel,
  PermissionOverwrites,
  Presence,
  ReactionCollector,
  ReactionEmoji,
  RichPresenceAssets,
  Role,
  Team,
  TeamMember,
  TextChannel,
  User,
  VoiceChannel,
  VoiceRegion,
  VoiceState,
  VoiceStateUpdate,
  Webhook,
  WebSocket,
  ComponentType,
  Partials
};
