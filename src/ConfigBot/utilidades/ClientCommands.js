const { readdirSync, lstatSync, existsSync } = require("fs"), 
      { resolve } = require("path"), 
      { Console } = require("./ClientConsole"),
      ClientError = require("../clases/ClientError");


function cargar_comandos(carpeta_comandos, collection) {
  if (!carpeta_comandos) return

  try {
    var archivos = readdirSync(carpeta_comandos)
  } catch (error) {
    throw new ClientError("COMANDO_ERROR", `Ocurrio un error al tratar de obtener la carpeta de los comandos: ${error}`)
  }

  archivos.map(archivo => {
    if (existsSync(`${carpeta_comandos}/${archivo}`) && lstatSync(`${carpeta_comandos}/${archivo}`).isDirectory()) {
      let sub_archivos = readdirSync(`${carpeta_comandos}/${archivo}`)
      let filter = sub_archivos.filter(a => a.split(".").pop() == "js")
      filter.map(sub_archivo => {
        let comando = require(`${resolve(carpeta_comandos)}/${archivo}/${sub_archivo}`)
        if (!comando.hasOwnProperty("nombre") || typeof comando.nombre != "string") throw new ClientError("COMANDO_ERROR", `El comando ${sub_archivo} no contiene la propiedad nombre, esto es obligatorio y debe ser un string.`)
        if (!comando.hasOwnProperty("ejecutar") || typeof comando.ejecutar != "function") throw new ClientError("COMANDO_ERROR", `El comando ${sub_archivo} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
        comando.path = `${resolve(carpeta_comandos)}/${archivo}/${sub_archivo}`
        collection.set(comando.nombre, comando)
        Console(["verde", "blanco", "morado"], `<0>[COMANDO]<1> El comando <2>${archivo}/${sub_archivo}<1> fue cargado correctamente.`)
      })
      return
    }
    if (archivo.split(".").pop() == "js") {
      let comando = require(`${resolve(carpeta_comandos)}/${archivo}`)
      if (!comando.hasOwnProperty("nombre") || typeof comando.nombre != "string") throw new ClientError("COMANDO_ERROR", `El comando ${archivo} no contiene la propiedad nombre, esto es obligatorio y debe ser un string.`)
      if (!comando.hasOwnProperty("ejecutar") || typeof comando.ejecutar != "function") throw new ClientError("COMANDO_ERROR", `El comando ${archivo} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
      comando.path = `${resolve(carpeta_comandos)}/${archivo}`
      collection.set(comando.nombre, comando)
      Console(["verde", "blanco", "morado"], `<0>[COMANDO]<1> El comando <2>${archivo}<1> fue cargado correctamente.`)
    }
  })
  return

}

function tiene_comando(nombre, client, alias = emojiError) {
  if (!nombre) return emojiError
  if (client.comandos.has(nombre)) return true
  if (alias) {
    if (client.comandos.find(comando => {
        if (comando.hasOwnProperty("alias") && Array.isArray(comando.alias)) {
          if (comando.alias.includes(nombre)) return true
        }
      })) return true
  }
  return emojiError
}

function obtener_comando(nombre = emojiError, client) {
  if (!client || !client.comandos) throw new ClientError("METODO_ERROR", "El metodo obtener_comando recibe 1 parametro obligatorio (el cliente(client))")
  if (!nombre) return client.comandos.keyArray()
  if (!tiene_comando(nombre, client, true)) return emojiError
  return client.comandos.get(nombre) || client.comandos.find(cmd => cmd.alias.includes(nombre))
}


function ejecutar_comando(nombre, client, ...args) {
  if (!nombre) throw new ClientError("METODO_ERROR", "El metodo ejecutar_comando recibe 1 parametro obligatorio (el nombre del comando a ejecutar)")
  if (!tiene_comando(nombre, client, true)) return emojiError
  let comando = obtener_comando(nombre, client)
  if (comando.hasOwnProperty("only_owner") && comando.only_owner === emojiError) return
  if (comando.hasOwnProperty("disponible") && comando.disponible === emojiError) return
  comando.ejecutar(...args)
  return
}

function tiene_cooldown(nombre, message, Cooldown) {
  if (!nombre) throw new ClientError("METODO_ERROR", "El metodo cooldown recibe 2 parametros (el primero el nombre del comando y el segundo el mensaje(message))")
  let client = message.client
  if (!tiene_comando(nombre, client, true)) return emojiError
  let comando = obtener_comando(nombre, client)

  let clave = `${message.guild.id}${message.author.id}`
  if (comando.hasOwnProperty("cooldown") && (typeof comando.cooldown == "object" && !Array.isArray(comando.cooldown))) {
    let tiempo = comando.cooldown.hasOwnProperty("tiempo") && !isNaN(comando.cooldown.tiempo) ? parseInt(comando.cooldown.tiempo) : 3
    let permisos = comando.cooldown.hasOwnProperty("permisos") && Array.isArray(comando.cooldown.permisos) ? comando.cooldown.permisos : []
    if (Cooldown.has(clave)) {
      if (permisos.length <= 0 || !message.member.hasPermission(permisos)) {
        if (Cooldown.get(clave).hasOwnProperty(comando.nombre)) {
          let tiempo = Cooldown.get(clave)[comando.nombre] - Date.now()
          if (tiempo > 1000) return tiempo
        }
      }
    }
    if (!comando.hasOwnProperty("disponible") || comando.disponible !== emojiError) {
      if (!Cooldown.has(clave)) Cooldown.set(clave, {})
      Cooldown.get(clave)[comando.nombre] = parseInt(Date.now() + tiempo * 1000)
    }
    return emojiError
  }
  return emojiError
}


function recargar_comando(nombre, client) {
  if (client.comandos.size <= 0) return
  if (!nombre) {
    client.comandos.map(comando => {
      delete require.cache[require.resolve(comando.path)]
      client.comandos.delete(comando.nombre)
    })
    cargar_comandos(client.path_comandos, client.comandos)
    Console(["verde", "azul", "blanco"], `<0>[COMANDO] <1>${client.comandos.size} <2>comandos fueron actualizados correctamente.`)
    return true
  }
  if (!tiene_comando(nombre, client, emojiError)) return emojiError
  let {
    path
  } = obtener_comando(nombre, client)
  delete require.cache[require.resolve(client.comandos.get(nombre).path)]
  client.comandos.delete(nombre)
  let comando = require(resolve(path))
  if (!comando.hasOwnProperty("nombre") || typeof comando.nombre != "string") throw new ClientError("COMANDO_ERROR", `El comando ${nombre} no contiene la propiedad nombre, esto es obligatorio y debe ser un string.`)
  if (!comando.hasOwnProperty("ejecutar") || typeof comando.ejecutar != "function") throw new ClientError("COMANDO_ERROR", `El comando ${nombre} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
  comando.path = path
  client.comandos.set(comando.nombre, comando)
  Console(["verde", "blanco", "morado"], `<0>[COMANDO]<1> El comando <2>${nombre}<1> fue actualizado correctamente.`)
  return true
}


module.exports = {
  cargar_comandos,
  ejecutar_comando,
  tiene_comando,
  obtener_comando,
  tiene_cooldown,
  recargar_comando
}