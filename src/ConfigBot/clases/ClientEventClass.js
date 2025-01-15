const ClientError = require("./ClientError.js");

class Evento {
  constructor(datos = {}) {
    if(!datos.hasOwnProperty("nombre") || typeof datos.nombre != "string") throw new MegaError("EVENTO_ERROR", "No se especificó el nombre del evento.")
    if(!datos.hasOwnProperty("ejecutar") || typeof datos.ejecutar != "function") throw new MegaError("EVENTO_ERROR", `El evento ${datos.nombre} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
    return datos
  }
}


module.exports = Evento