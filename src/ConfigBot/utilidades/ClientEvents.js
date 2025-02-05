const { readdirSync , lstatSync, existsSync } = require("fs"),
      { resolve } = require("path"),
      { Console } = require("../utilidades/ClientConsole"),
      ClientError  = require("../clases/ClientError");



function cargar_eventos(carpeta_eventos) {
  let eventos = new Array();

  try{var archivos = readdirSync(carpeta_eventos)}
  catch(error){throw new ClientError("EVENTO_ERROR", `Ocurrio un error al tratar de obtener la carpeta de los eventos: ${error}`)}

  archivos.map(archivo => {
    if(existsSync(`${carpeta_eventos}/${archivo}`) && lstatSync(`${carpeta_eventos}/${archivo}`).isDirectory()) {
      let sub_archivos = readdirSync(`${carpeta_eventos}/${archivo}`)
      let filter = sub_archivos.filter(a => a.split(".").pop() == "js")
      filter.map(sub_archivo => {
        let evento = require(`${resolve(carpeta_eventos)}/${archivo}/${sub_archivo}`)
        if(!evento.hasOwnProperty("nombre") || typeof evento.nombre != "string") throw new ClientError("EVENTO_ERROR", `El evento ${sub_archivo} no contiene la propiedad nombre, esto es obligatorio y debe ser un string.`)
        if(!evento.hasOwnProperty("ejecutar") || typeof evento.ejecutar != "function") throw new ClientError("EVENTO_ERROR", `El evento ${sub_archivo} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
        eventos.push(evento.nombre = {nombre: evento.nombre, ejecutar: evento.ejecutar})
        Console(["morado", "blanco", "amarillo"], `<0>[EVENTO]<1> El evento <2>${archivo}/${sub_archivo}<1> fue cargado correctamente.`)
      })
      return
    }
    if(archivo.split(".").pop() == "js") {
      let evento = require(`${resolve(carpeta_eventos)}/${archivo}`)
      if(!evento.hasOwnProperty("nombre") || typeof evento.nombre != "string") throw new ClientError("EVENTO_ERROR", `El evento ${archivo} no contiene la propiedad nombre, esto es obligatorio y debe ser un string.`)
      if(!evento.hasOwnProperty("ejecutar") || typeof evento.ejecutar != "function") throw new ClientError("EVENTO_ERROR", `El evento ${archivo} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
      eventos.push(evento.nombre = {nombre: evento.nombre, ejecutar: evento.ejecutar})
      Console(["morado", "blanco", "amarillo"], `<0>[EVENTO]<1> El evento <2>${archivo}<2> fue cargado correctamente.`)
    }
  })
  if(eventos.length <= 0) return false
  return eventos;

}

module.exports = cargar_eventos