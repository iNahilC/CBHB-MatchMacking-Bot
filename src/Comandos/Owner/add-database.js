const { SlashCommand, EmbedBuilder } = require("../../ConfigBot/index.js");

module.exports = new SlashCommand({
  name: "add-database",
  category: "Administración",
  description: "Agrega usuarios y sus puntos (Elo) a la base de datos.",
  example: "/add-database",
  only_owner: true,
  ejecutar: async (client, interaction) => {
    if (!client.db.has(`${interaction.guild.id}.elo`)) {
      await client.db.set(`${interaction.guild.id}.elo`, []);
    }

    const input = 
`
1) @[③] xPacmank - 455 points
2) @[③] DripFloppa_Master - 415 points
3) @[③] h7litz - 365 points
4) @[③] nwightcore - 360 points
5) @[③] pipexug - 345 points
6) @[③] danbestshot - 335 points
7) @[③] DanyPro - 325 points
8) @[③] AzureViiolet - 325 points
9) @[③] pachecitoYT - 290 points
10) @[③] kar1tes - 285 points
11) @[③] CB_Xiter - 275 points
12) @[⓪] mercuryofc - 275 points
13) @[②] t0m_atela - 235 points
14) @[②] ᲼ - 225 points
15) @[②] Dylan - 225 points
16) @[②] z9_rama - 220 points
17) @rafael - 220 points
18) @[②] ryukzito.s2 - 210 points
19) @[②] YEISON1598 - 185 points
20) @[②] ! Robert - 185 points
21) @[②] ! Jaozskrr - 160 points
22) @[②] alejandrooooooxx - 160 points
23) @[②] NiKo - 155 points
24) @[①] Dark_Sinom - 125 points
25) @[①] EuSouUmCaminhoneiro - 125 points
26) @[①] pazzpozx - 125 points
27) @Capitán Perúman - 120 points
28) <@1211365285031059546> - 115 points
29) @[①] itz_potito - 115 points
30) @[①] MinorSuperRedMatheus - 105 points
31) @[①] gabriel - 105 points
32) @[①] Soy el mas marihuano de aqui - 105 points
33) @[①] GOATz_iwnl - 100 points
34) @[①] budogues44 - 90 points
35) @[①] iEdgxr - 90 points
36) @[⓪] gnz4k - 90 points
37) @L_anarche - 90 points
38) @N. - 80 points
39) @[①] FekeDoClan - 80 points
40) @[①] Resetingggggg - 80 points
41) @[①] Amatency - 80 points
42) @[⓪] iNahilC - 75 points
43) @[①] nutria fachera - 75 points
44) @[①] shherps - 70 points
45) @[①] Rocky - 70 points
46) @[①] La cabra🐐 - 70 points
47) @[①] Whooosu - 65 points
48) @[①] breusebio - 65 points
49) @[①] Z - 60 points
50) @[⓪] hitsugui - 60 points
51) @[①] player_ofvalorant - 60 points
52) @[①] refIejo - 55 points
53) @[①] f_erco - 55 points
54) @[①] facilio2 - 55 points
55) @onefutbol - 50 points
56) @v1perse - 50 points
57) @[⓪] Vwiwi - 50 points
58) @danilo - 50 points
59) @[①] GABRIELRAN554 - 50 points
60) @[①] Tu_Papinuck - 50 points
61) @[①] H0PEF4LLD0WN - 50 points
62) @[⓪] Lil_SharkZ - 50 points
63) @[⓪] NoSunShines - 45 points
64) @[①] pdr - 45 points
65) @junior - 40 points
66) @[⓪] Vicentebl99 - 40 points
67) @[⓪] remboletilti - 40 points
68) @[①] mariano22805 - 40 points
69) @[⓪] indiosolarigamer - 40 points
70) @[⓪] wenri2301 - 40 points
71) @[①] suika - 40 points
72) @juazy - 35 points
73) @[⓪] izq_darkfire - 30 points
74) @[⓪] animatownersigusta44 - 30 points
75) @n ojuego - 30 points
76) @[⓪] jhovank467 - 30 points
77) @[⓪] figo88888888 - 25 points
78) @[⓪] n1troo_o - 25 points
79) @[⓪] enzogalvan - 20 points
80) @[⓪] Makia_Racban - 20 points
81) @[⓪] fausto1962 - 20 points
82) @[⓪] COOLGUyIS_real - 20 points
83) @[⓪] alevvvdfffdfbdfff - 20 points
84) <@1224125026224177252> - 20 points
85) @[⓪] mttixvs - 20 points
86) @[⓪] Fernandita14awp - 20 points
87) @[⓪] 2xTsr - 20 points
88) @[⓪] riusster - 20 points
89) @[⓪] shelbythommas - 20 points
90) @[⓪] Legolaz0114 - 15 points
91) @Xeapte - 15 points
92) @[⓪] jonatanoliver - 15 points
93) @[⓪] whiteradios - 15 points
94) @[⓪] dkcgs5 - 15 points
95) @[⓪] Equi Fernandez - 10 points
96) @[⓪] StopCry2016Smurf - 10 points
97) @[⓪] joacobizz - 10 points
98) @[⓪] Piter62423 - 10 points
99) <@1278361310266134563> - 10 points
100) @[⓪] pansudim - 10 points
101) @[⓪] marcus230904 - 10 points
102) @[①] legadaa - 10 points
103) @[⓪] RenatoPlat - 10 points
104) @[⓪] h_eavenzz - 10 points
105) @[⓪] jvxrgee - 10 points
106) @[D] Mx. - 10 points
107) @[⓪] raik_03 - 10 points
108) @[⓪] labosauro - 10 points
109) <@1292546840654385324> - 10 points
110) @[⓪] DomedCuzYourMad - 10 points
`;

    const regex = /^\s*\d+\)\s+@\[(.?)\]\s+([^\s-]+)\s+-\s+(\d+)\spoints$/gm;
    const parsedData = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      const [, rango, username, points] = match;
      parsedData.push({ rango, username, points: parseInt(points, 10) });
    }

    if (!parsedData.length) {
      const errorEmbed = new EmbedBuilder()
        .setColor(client.constants.colorError)
        .setDescription(`${client.emojisId.error} No se pudo parsear correctamente el input proporcionado.`);
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const guild = interaction.guild;
    const failedUsers = [];
    const successfulUsers = [];
    for (const { rango, username, points } of parsedData) {
      const member = guild.members.cache.find((m) => {
        const displayName = m.displayName || m.user.username;
        const expectedName = `[${rango}] ${username}`;
        return displayName === expectedName;
      });

      if (member) {
        // Asegúrate de que `currentElo` siempre sea un array

        const currentElo = (await client.db.get(`${interaction.guild.id}.elo`)) || [];
        const userElo = currentElo.find((entry) => entry.user_id === member.id);

        // Eliminar el prefijo de rango y agregar solo el nombre del usuario
        const cleanUsername = member.displayName.replace(/\[[^\]]+\]\s*/, '');

        if (userElo) {
          userElo.elo = Math.min(userElo.elo + points, 10000);
        } else {
          currentElo.push({ user_id: member.id, username: cleanUsername, elo: Math.min(points, 10000) });
        }

        await client.db.set(`${interaction.guild.id}.elo`, currentElo);
        successfulUsers.push({ username: cleanUsername, rango, id: member.id, points });
      } else {
        failedUsers.push(username);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(client.constants.colorSucess)
      .setTitle("Resultado de la importación")
      .setDescription(`**Usuarios agregados correctamente!**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
});
