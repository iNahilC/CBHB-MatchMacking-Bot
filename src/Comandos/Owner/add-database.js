const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
	name: 'add-database',
	category: 'Owner',
	description: 'Agrega usuarios y sus puntos (Elo) a la base de datos.',
	example: '/add-database',
	only_owner: true,
	ejecutar: async (client, interaction) => {
        if (interaction.channel.id !== "1324923267005415486") return interaction.reply({
			content: `${client.emojisId.error} No puedes utilizar este comando aqui!`,
			flags: 64,
		})
		
		await client.db.set(`${interaction.guild.id}.season2`, [])
		const input = `
1) @[③] nghtcore - 550 points
2) @[③] AzureViiolet - 515 points
3) @[③] h7. - 500 points
4) @[②] DripFloppa_Master - 460 points
5) @[②] xPacmank - 435 points
6) @[②] mercuryofc - 420 points
7) @[①] pipe - 340 points
8) @[②] Elian - 325 points
9) @[②] kar1tes - 315 points
10) @[③] chris - 295 points
11) @[①] not_screen - 290 points
12) @[①] CB_Xiter - 275 points
13) @[①] bielx_d - 250 points
14) @[①] t0m_atela - 235 points
15) @[①] Dylan - 225 points
16) @[①] robinho103 - 225 points
17) @[②] Tarik_Estrellas - 220 points
18) @rafael - 220 points
19) @[①] Arabia - 210 points
20) @[①] ryukzito.s2 - 210 points
21) @[①] YEISON1598 - 185 points
22) @[①] NiKo - 155 points
23) @[①] IRacced3Times - 150 points
24) @[①] GOATz_iwnl - 140 points
25) @[①] EuSouUmCaminhoneiro - 135 points
26) @[①] pazzpozx - 125 points
27) @CSGO-pROzG-BHGjD-pf6TW-CYNvZ-dA7 - 120 points
28) @EvoILynx - 115 points
29) @Potitobaby - 115 points
30) @[①] Dark_Sinom - 110 points
31) @[①] Xvid_eos123 - 105 points
32) @[①] gabriel - 105 points
33) @[①] Soy el mas marihuano de aqui - 105 points
34) @[①] josuex - 105 points
35) @[①] budogues44 - 100 points
36) @[①] nutria fachera - 95 points
37) @[⓪] gnz4k - 90 points
38) @[③] L_anarche - 90 points
39) @[①] vwiwi - 85 points
40) @[①] breusebio - 85 points
41) @[①] felipaomister - 80 points
42) @N. - 80 points
43) @[①] FekeDoClan - 80 points
44) @[①] Resetingggggg - 80 points
45) @[⓪] iNahilC - 75 points
46) @[①] Rocky - 70 points
47) @[①] iEdgxr - 70 points
48) @El gato 🗣🧠 - 70 points
49) @[①] Amatency - 70 points
50) @[①] tx - 70 points
51) @[①] Whooosu - 65 points
52) @[①]FemboyLover69420 (Suika_J) - 65 points
53) @[①] Inspired_s - 60 points
54) @[①] GABRIELRAN554 - 60 points
55) @[①] player_ofvalorant - 60 points
56) @[①] CATAPIMBAS2014junioo - 55 points
57) @[①] refIejo - 55 points
58) @[①] f_erco - 55 points
59) @[①] H0P3F4LLD4WN - 55 points
60) @[①] remboletilti - 55 points
61) @onefutbol - 50 points
62) @v1perse - 50 points
63) @[①] Tu_Papinuck - 50 points
64) @[①] sapo - 50 points
65) @junior - 40 points
66) @[⓪] POLICIA DE CB - 40 points
67) @[①] Ricov - 40 points
68) @[⓪] mariano22805 - 40 points
69) @[①] indiosolarigamer - 40 points
70) @[⓪] wenri - 40 points
71) @[⓪] alevvvdfffdfbdfff - 35 points
72) @[⓪] juanzy - 35 points
73) @[⓪] PedroGameplays40 - 35 points
74) @[⓪] guizemR7 - 35 points
75) @[⓪] shherps - 30 points
76) @[⓪] izq_darkfire - 30 points
77) @[①] stfu - 30 points
78) @[⓪] tano - 30 points
79) @[⓪] is_john - 30 points
80) @[⓪] Igorjohn - 30 points
81) @[⓪] Oswlon - 30 points
82) @[⓪] facundolp - 25 points
83) @[⓪] mace - 25 points
84) @[⓪] thoung197 - 25 points
85) @[⓪] enzogalvan - 20 points
86) @[⓪] Makia_Racban - 20 points
87) @[⓪] fausto1962 - 20 points
88) @[⓪] COOLGUyIS_real - 20 points
89) <@1224125026224177252> - 20 points
90) @[⓪] mttixvs - 20 points
91) @[⓪] Fernandita14awp - 20 points
92) @[⓪] 2xTsr (boliviano) - 20 points
93) @[⓪] iTs_Cr4zy - 20 points
94) @[⓪] riusster - 20 points
95) @[⓪] shelbythommas - 20 points
96) @[⓪] Legolaz0114 - 15 points
97) @Xeapte - 15 points
98) @[⓪] jonatanoliver - 15 points
99) @[⓪] whiteradios - 15 points
100) @[⓪] baianobruh - 15 points
101) @[⓪] dkcgs5 - 15 points
102) @[⓪] Equi Fernandez - 10 points
103) @[⓪] StopCry2016Smurf - 10 points
104) @[⓪] joacobizz - 10 points
105) @[⓪] Piter62423 - 10 points
106) <@1278361310266134563> - 10 points
107) @[⓪] robertinn - 10 points
108) @[⓪] marcus230904 - 10 points
109) @[⓪] danilo - 10 points
110) @[⓪] becher - 10 points
111) @[⓪] RenatoPlat - 10 points
112) @[⓪] h_eavenzz - 10 points
113) @[⓪] jvxrgee - 10 points
114) @[⓪] 14k_SrMaxItsYours - 10 points
115) @[⓪] raik_03 - 10 points
116) @[⓪] labosauro - 10 points
117) @Ac3x - 10 points
118) @[⓪] DomedCuzYourMad - 10 points
119) @[⓪] tobtorta - 10 points
120) <@824728299669946422> - 10 points
121) @[⓪] scorpion1DEATH - 10 points
122) @[⓪] chueco__06 - 10 points
123) @[⓪] PORQUINHO_BANCA20 - 10 points
124) @Piece. - 10 points
125) @[⓪] sett1ng - 10 points
126) @[⓪] TakionDeath - 10 points
127) @[⓪] yx1ns - 10 points
128) @[⓪] elmejoryori - 10 points
129) @[⓪] juniordabolafina🗿 - 5 points
130) @[⑥] - 0 points
131) @[⓪] Amaro9010 - 0 points
132) @[⓪] AllegedlyBxxrja - 0 points
133) @[⓪] 444ip - 0 points
134) @[⓪] 9z_rama - 0 points
135) @[⓪] Perro_DeCh0l0cate - 0 points
136) @Mr Sexo - 0 points
137) @[⓪] laguma656 - 0 points
138) @[⓪] sssjjjblupro - 0 points
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
				.setColor(client.colors.error)
				.setDescription(`${client.emojisId.error} No se pudo parsear correctamente el input proporcionado.`);
			return interaction.reply({ embeds: [errorEmbed], flags: 64 });
		}

		const guild = interaction.guild;
		const successfulUsers = [];

		for (const { rango, username, points } of parsedData) {
			console.log(points);
			const member = guild.members.cache.find((m) => {
				const displayName = m.displayName || m.user.username;
				const expectedName = `[${rango}] ${username}`;
				return displayName === expectedName;
			});

			if (!member) {
				console.error(`Miembro no encontrado: ${username}`);
				continue;
			}
			const currentElo = (await client.db.get(`${interaction.guild.id}.season2`)) || [];
			const userElo = currentElo.find((entry) => entry.user_id === member.id);

			const cleanUsername = member.displayName.replace(/\[[^\]]+\]\s*/, '');

			if (userElo) {
				userElo.elo = Math.min(0, 10000);
			} else {
				currentElo.push({ user_id: member.id, displayName: cleanUsername, elo: Math.min(0, 10000) });
			}

			await client.db.set(`${interaction.guild.id}.season2`, currentElo);
			successfulUsers.push({ displayName: cleanUsername, rango, id: member.id, points });
		}

		console.log(successfulUsers
			.map((user) => `- ${user.displayName} (ID: ${user.id}, Puntos: ${user.points})`)
			.join("\n") || "Ninguno");

	},
});
