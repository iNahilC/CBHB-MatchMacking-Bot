const ClientError = require("./ClientError");

class Comando {
  constructor(datos = {}) {
    if(!datos.hasOwnProperty("nombre") || typeof datos.nombre != "string") throw new ClientError("COMANDO_ERROR","No se especificó el nombre del comando.")
    if(!datos.hasOwnProperty("ejecutar") || typeof datos.ejecutar != "function") throw new ClientError("COMANDO_ERROR", `El comando ${datos.nombre} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
     
    return datos
  }
}


module.exports = Comando