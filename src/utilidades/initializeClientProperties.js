
function initializeClientProperties(client) {
	client.colorDefault = '#2F3136'
	client.servidor_oficial = '719351217616322602'
	client.servidor_test = '1339723734054863013'

	client.mm = {
		verifyRolId: "1311869127333249085", //Rol de Verificar",
		serverId: "1311782674964418640", //ID del servidor
		raidLogs: "1311782674964418640", //ID del canal de logs
		moderatorRoleId: "1312218056310657044", //ID del rol de moderador
		managerRoleId: "1318389054223683625", //ID del rol de manager
		founderRoleId: "1311799324019130399", //ID del rol de fundador
		picPermsRoleId: "1311864505139200050", //ID del rol de permisos de pic
	}

	client.api = {
		bloxlink: "6f5e8132-32ff-4954-9292-3cb66d5a3dbf"
	}

	client.elo = {
	topFiveChannel: "1335112789848621156",  //CHANNEL_TABLA_TOP_5
	topFiveMessage: "1335114103345123390",  //MESSAGE_TABLA_TOP_5
	eloAdderChannel: "1335078125763301446", //CHANNEL
	permissionRol: '1311860253696065717',   //ROL_ELO_ADDER
	channel: '1331414581779890308',         //CHANNEL_TABLA_TOP_30
	message: '1332060188815130635',         //MESSAGE_TABLA_TOP_30
	ranks: {
		rango10: '1340080580905144430', // Rango 10
		rango9: '1340080387715502211', // Rango 9
		rango8: '1340080126964269146', // Rango 8
		rango7: '1340079785614905344', // Rango 7
		rango6: '1318648000779780096', // Rango 6
		rango5: '1318647994702368788', // Rango 5
		rango4: '1318647992286449725', // Rango 4
		rango3: '1311862776259416124', // Rango 3
		rango2: '1311862590779031664', // Rango 2
		rango1: '1311863014818844743', // Rango 1
	},
	logs: {
		agregar: '1329155046897750086',     //CHANNEL_AGREGAR_ELO
		remover: '1329155266587136101',     //CHANNEL_REMOVER_ELO
		establecer: '1329155110135402628',  //CHANNEL_ESTABLECER_ELO
		eliminar: '1329155182524891271',    //CHANNEL_ELIMINAR_ELO
	},
	}

	client.constants = {
		ownerId: '656738884712923166',
	}

	client.colors = {
		success: 0x00ff00,
		error: 0xff0000,
	}

	client.emojisId = {
		crown: '👑',
		users: '👥',
		clock: '⏳',
		vote: '🗳️',
		join: '🎮',
		leave: '🚪',
		cancel: '❌',
		leftfull: '<:LF:1330319013913563266>',
		middlefull: '<:MF:1330319015863783484>',
		rightfull: '<:RF:1330319011673538713>',
		leftempty: '<:LE:1330319012948607047>',
		middleempty: '<:ME:1330319014886641694>',
		rightempty: '<:RE:1330319017289715722>',
		error: '<a:731642369396441100:760122074743570433>',
		success: '<a:checkgif:753779965933387888>',
		bot: '<:741688366663336067:760122067978420234>',
		off: '<:off:760120229380096021>',
		on: '<:on:760120229568970762>',
		waiting: '<a:waiting_emb:760122075771174943>',
		warning: '<:warning_emoji:934739379757400136>',
		arrowLeft: '<:arrow_left:935043629779652648>',
		arrowRight: '<:arrow_right:935043630014545961>',
		search: '<:search_emoji:934731150797180948>',
		sumar: '<:plus:744046576686596156>',
		restar: '<:minus:744046527730810932>',
	}
}
module.exports = { initializeClientProperties }
