const inviteRegex = /discord\.gg\/[a-zA-Z0-9]+/i;
const urlRegex = /https?:\/\/[^\s]+/g;
const cooldownTime = 60 * 5000;

function msToReadable(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${seconds}s`;
  return result;
}

async function checkCustomStatus(client) {
  setInterval(async () => {
    try {
      const guild = await client.guilds.fetch(client.mm.serverId);
      await guild.members.fetch();
      
      const invitesFromServer = await guild.invites.fetch();
      const serverInviteCodes = new Set(invitesFromServer.map(invite => invite.code.toLowerCase()));
      const guildVanity = guild.vanityURLCode ? guild.vanityURLCode.toLowerCase() : null;

      const logChannel = client.channels.cache.get("1338243183821193297");
      const premiumUsers = (await client.db.get(`${guild.id}.premium`)) || [];

      guild.members.cache.forEach(async member => {
        if (!member.presence) return;
        
        const isPremium = premiumUsers.includes(member.id);
        
        const customActivity = member.presence.activities.find(a => a.type === 4);
        if (!customActivity) return;

        const customStatus = customActivity.state || '';
        const urls = customStatus.match(urlRegex) || [];
        const invites = urls.filter(url => inviteRegex.test(url));

        if (invites.length === 0) {
          if (!isPremium && member.roles.cache.has(client.mm.picPermsRoleId)) {
            await member.roles.remove(client.mm.picPermsRoleId);
            logChannel.send(`❌ Se removió el rol **+Pic Perms** a **${member.displayName}** por no ser **usuario** premiún y por no tener invitación del servidor en su **estado**.`);
          }
          return;
        }
            
        const hasValidInvite = invites.some(invite => {
          const inviteCode = invite.split('/').pop().toLowerCase();
          return serverInviteCodes.has(inviteCode) || (guildVanity && guildVanity === inviteCode);
        });

        if (!hasValidInvite) {
          if (!isPremium && member.roles.cache.has(client.mm.picPermsRoleId)) {
            await member.roles.remove(client.mm.picPermsRoleId);
            logChannel.send(`❌ Se removió el rol **+Pic Perms** a **${member.displayName}** por no ser **usuario** premiún y por tener una invitación del servidor en su **estado**.`);
          }
          return;
        }
        
        const activityAge = Date.now() - customActivity.createdTimestamp;
        if (activityAge < cooldownTime) {
          return;
        }
        
        if (!member.roles.cache.has(client.mm.picPermsRoleId)) {
          const validInvite = invites.find(invite => {
            const inviteCode = invite.split('/').pop().toLowerCase();
            return serverInviteCodes.has(inviteCode) || (guildVanity && guildVanity === inviteCode) || "https://discord.com/invite/cbhb";
          });
          await member.roles.add(client.mm.picPermsRoleId);
          const readableTime = msToReadable(activityAge);
          console.log(`✅ Se agregó el rol "Pic Perms" a ${member.displayName} (estado con invitación válida por ${readableTime}).`);
          if (logChannel) {
            logChannel.send(`✅ **${member.displayName}** tiene la invitación **${validInvite}** en su estado por **${readableTime}**. Se le agregó el rol **+Pic Perms**.`);
          }
        }
      });
    } catch (error) {
      console.error('❌ Error en la verificación periódica del estado personalizado:', error);
    }
  }, 150000);
}

module.exports = { checkCustomStatus };
