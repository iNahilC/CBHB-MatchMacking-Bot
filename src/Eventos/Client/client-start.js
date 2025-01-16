const { Evento } = require("../../ConfigBot/index");
const { Console } = require("../../ConfigBot/utilidades/ClientConsole");
const { initializeClientProperties } = require("../../utilidades/initializeClientProperties");

module.exports = new Evento({
  nombre: "ready",
  ejecutar: async (client) => {
    Console(["verde", "blanco"], "<0>[BOT]<1> Listo.");
    initializeClientProperties(client);

    const array = [`CB:HB Bot Oficial | iNahilC.`];
    setInterval(() => {
      client.user.setPresence({
        activities: [
          {
            name: array[Math.floor(Math.random() * array.length)],
            type: "WATCHING",
          },
        ],
        status: "online",
      });
    }, 20000);
  },
});
