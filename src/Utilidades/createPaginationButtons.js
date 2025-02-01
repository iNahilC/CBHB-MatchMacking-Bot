const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

function createPaginationButtons(paginaActual, paginasTotal) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('prev_pagina')
			.setLabel('←')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(paginaActual === 0),
		new ButtonBuilder()
			.setCustomId('next_pagina')
			.setLabel('→')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(paginaActual === paginasTotal - 1),
	)
}

module.exports = { createPaginationButtons }
