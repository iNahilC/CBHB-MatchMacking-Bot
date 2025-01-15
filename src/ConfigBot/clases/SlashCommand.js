const ClientError = require("./ClientError.js");

class SlashCommand {
  constructor(datos = {}) {
    if(!datos.hasOwnProperty("name") || typeof datos.name != "string") throw new ClientError("SLASHCOMANDO_ERROR","No se especificó el nombre del slash-command.")
    if(!datos.hasOwnProperty("ejecutar") || typeof datos.ejecutar != "function") throw new ClientError("SLASHCOMANDO_ERROR", `El slash-command ${datos.nombre} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
    return datos
  }
}


module.exports = SlashCommand