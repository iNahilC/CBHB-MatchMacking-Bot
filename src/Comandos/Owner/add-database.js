const { SlashCommand, EmbedBuilder } = require('../../ConfigBot/index.js');

module.exports = new SlashCommand({
	name: 'add-database',
	category: 'Administración',
	description: 'Agrega usuarios y sus puntos (Elo) a la base de datos.',
	example: '/add-database',
	only_owner: true,
	ejecutar: async (client, interaction) => {
		await client.db.set(`${interaction.guild.id}.elo`, [])
		const input = `
1) @[②] Gaytor - 515 points
2) @[③] AzureViiolet - 515 points
3) @[②] DripFloppa_Master - 475 points
4) @[②] h7. - 460 points
5) @[②] xPacmank - 435 points
6) @[②] mercuryofc - 395 points
7) @pipe - 340 points
8) @[②] kar1tes - 335 points
9) @[②] Elian - 325 points
10) @[③] chris - 295 points
11) @[①] not_screen - 290 points
12) @[①] d_nvm - 275 points
13) @[①] bielx_d - 250 points
14) @[①] t0m_atela - 235 points
15) @[①] Dylan - 225 points
16) @[②] Tarik_Estrellas - 220 points
17) @rafael - 220 points
18) @[①] Arabia - 210 points
19) @[①] ryukzito.s2 - 210 points
20) @[①] robinho103 - 205 points
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
34) @[①] budogues44 - 100 points
35) @[①] nutria fachera - 95 points
36) @[⓪] gnz4k - 90 points
37) @[①] L_anarche - 90 points
38) @[①] vwiwi - 85 points
39) @[①] breusebio - 85 points
40) @[①] felipaomister - 80 points
41) @[①] FekeDoClan - 80 points
42) @[①] Resetingggggg - 80 points
43) @[①] Amatency - 80 points
44) @[①] iNahilC - 75 points
45) @[①] Rocky - 70 points
46) @[①] iEdgxr - 70 points
47) @[①] La cabra🐐 - 70 points
48) @[①] Whooosu - 65 points
49) @[①] breusebio - 65 points
50) @[⓪] Gustambo - 65 points
51) @[①] Inspired_s - 60 points
52) @[①] player_ofvalorant - 60 points
53) @[⓪] SrN3_Blox - 60 points
54) @[⓪] CATAPIMBAS2014junioo - 55 points
55) @[①] refIejo - 55 points
56) @[①] f_erco - 55 points
57) @[①] H0PEF4LLD0WN - 55 points
58) @[⓪] remboletilti - 55 points
59) @onefutbol - 50 points
60) @v1perse - 50 points
61) @danilo - 50 points
62) @[①] GABRIELRAN554 - 50 points
63) @[①] Tu_Papinuck - 50 points
64) @[①] Lil_SharkZ - 50 points
65) @[⓪] n1troo_o - 50 points
66) @[①] shherps - 45 points
67) @junior - 40 points
68) @[①] Vicentebl99 - 40 points
69) @[⓪] mariano22805 - 40 points
70) @[⓪] indiosolarigamer - 40 points
71) @[①] wenri - 40 points
72) @juazy - 35 points
73) @[①] izq_darkfire - 30 points
74) @[⓪] animatownersigusta44 - 30 points
75) @n ojuego - 30 points
76) @[①] is_john - 30 points
77) @[⓪] Igorjohn - 30 points
78) @[⓪] Oswlon - 30 points
79) @[①] facilio2 - 25 points
80) @[①] mace - 25 points
81) @[⓪] PedroGameplays40 - 25 points
82) @[⓪] guizemR7 - 25 points
83) @[⓪] enzogalvan - 20 points
84) @[⓪] Makia_Racban - 20 points
85) @[⓪] fausto1962 - 20 points
86) @[⓪] COOLGUyIS_real - 20 points
87) @[⓪] alevvvdfffdfbdfff - 20 points
88) @[⓪] Skibidi Sigma - 20 points
90) @[⓪] mttixvs - 20 points
91) @[⓪] Fernandita14awp - 20 points
92) @[⓪] 2xTsr - 20 points
93) @[⓪] riusster - 20 points
94) @[⓪] shelbythommas - 20 points
95) @[⓪] Legolaz0114 - 15 points
96) @Xeapte - 15 points
97) @[⓪] jonatanoliver - 15 points
98) @[⓪] whiteradios - 15 points
99) @[⓪] baianobruh - 15 points
100) @[⓪] dkcgs5 - 15 points
101) @[⓪] thoung197 - 15 points
102) @[⓪] Equi Fernandez - 10 points
103) @[⓪] StopCry2016Smurf - 10 points
104) @[⓪] joacobizz - 10 points
105) @[⓪] Piter62423 - 10 points
107) @[⓪] pansudim - 10 points
108) @[⓪] marcus230904 - 10 points
109) @[⓪] legadaa - 10 points
110) @[⓪] RenatoPlat - 10 points
111) @[⓪] h_eavenzz - 10 points
112) @[⓪] jvxrgee - 10 points
113) @[⓪] 14k_SrMaxItsYours - 10 points
114) @[⓪] raik_03 - 10 points
115) @[⓪] labosauro - 10 points
117) @[⓪] DomedCuzYourMad - 10 points
118) @[⓪] tobtorta - 10 points
120) @[⓪] scorpion1DEATH - 10 points
121) @[⓪] chueco__06 - 10 points
122) @[⓪] PORQUINHO_BANCA20 - 10 points
123) @Piece. - 10 points
124) @[⓪] sett1ng - 10 points
125) @[⓪] TakionDeath - 10 points
126) @[⓪] yx1ns - 10 points
127) @[⓪] elmejoryori - 10 points
128) @[⓪] juniordabolafina🗿 - 5 points
129) @[⓪] iTs_Cr4zy - 5 points
130) @Gsth - 0 points
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
			console.log(parsedData);
			const member = guild.members.cache.find((m) => {
				const displayName = m.displayName || m.user.username;
				const expectedName = `[${rango}] ${username}`;
				return displayName === expectedName;
			});

			if (!member) {
				console.error(`Miembro no encontrado: ${username}`);
				continue;
			}
			const currentElo = (await client.db.get(`${interaction.guild.id}.elo`)) || [];
			const userElo = currentElo.find((entry) => entry.user_id === member.id);

			const cleanUsername = member.displayName.replace(/\[[^\]]+\]\s*/, '');

			if (userElo) {
				userElo.elo = Math.min(userElo.elo + points, 10000);
			} else {
				currentElo.push({ user_id: member.id, username: cleanUsername, elo: Math.min(points, 10000) });
			}

			await client.db.set(`${interaction.guild.id}.elo`, currentElo);
			successfulUsers.push({ username: cleanUsername, rango, id: member.id, points });
		}

		console.log(successfulUsers
			.map((user) => `- ${user.username} (ID: ${user.id}, Puntos: ${user.points})`)
			.join("\n") || "Ninguno");

	},
});
