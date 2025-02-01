function getVoicePlayers(guild) {
    const voiceChannels = [
        '1326671674057166868', // Waiting Room
        '1318320678490869862', // Duo 1
        '1311846538607333378', // Duo 2
        '1311846567359152218', // Duo 3
        '1311846597965123665', // Trio 1
        '1311846616923373640', // Trio 2
        '1330991669935476787',  // Trio 3
        '1325326260171440190', // Match 1
        '1325226687323181116',
        '1318298130294243439',
        '1318927968281694260' //LOBBY
    ];

    return voiceChannels.flatMap(id => {
        const channel = guild.channels.cache.get(id);
        return channel?.members.map(member => member) || [];
    });
}

module.exports = { getVoicePlayers }