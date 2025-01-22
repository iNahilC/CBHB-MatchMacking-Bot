const { readdirSync, lstatSync, existsSync } = require("fs"), 
      { resolve } = require("path"), 
      { Console } = require("./ClientConsole"),
      ClientError = require("../clases/ClientError");


function cargar_slashcommand(carpeta_slash_command, collection) {
  if (!carpeta_slash_command) return

  try {
    var archivos = readdirSync(carpeta_slash_command)
  } catch (error) {
    throw new ClientError("SLASHCOMANDO_ERROR", `Ocurrio un error al tratar de obtener la carpeta de los slash-command: ${error}`)
  }

  archivos.map(archivo => {
    if (existsSync(`${carpeta_slash_command}/${archivo}`) && lstatSync(`${carpeta_slash_command}/${archivo}`).isDirectory()) {
      let sub_archivos = readdirSync(`${carpeta_slash_command}/${archivo}`)
      let filter = sub_archivos.filter(a => a.split(".").pop() == "js")
      filter.map(sub_archivo => {
        let slashCommand = require(`${resolve(carpeta_slash_command)}/${archivo}/${sub_archivo}`)
        if (!slashCommand.hasOwnProperty("name") || typeof slashCommand.name != "string") throw new ClientError("SLASHCOMANDO_ERROR", `El slash-command ${sub_archivo} no contiene la propiedad name, esto es obligatorio y debe ser un string.`)
        if (!slashCommand.hasOwnProperty("ejecutar") || typeof slashCommand.ejecutar != "function") throw new ClientError("SLASHCOMANDO_ERROR", `El slash-command ${sub_archivo} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
        slashCommand.path = `${resolve(carpeta_slash_command)}/${archivo}/${sub_archivo}`
        collection.set(slashCommand.name, slashCommand)
        Console(["verde", "blanco", "morado"], `<0>[SLASH-COMMAND]<1> El slash-command <2>${archivo}/${sub_archivo}<1> fue cargado correctamente.`)
      })
      return
    }
    if (archivo.split(".").pop() == "js") {
      let slashCommand = require(`${resolve(carpeta_slash_command)}/${archivo}`)
      if (!slashCommand.hasOwnProperty("name") || typeof slashCommand.name != "string") throw new ClientError("SLASHCOMANDO_ERROR", `El slash-command ${archivo} no contiene la propiedad name, esto es obligatorio y debe ser un string.`)
      if (!slashCommand.hasOwnProperty("ejecutar") || typeof slashCommand.ejecutar != "function") throw new ClientError("SLASHCOMANDO_ERROR", `El slash-command ${archivo} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
      slashCommand.path = `${resolve(carpeta_slash_command)}/${archivo}`
      collection.set(slashCommand.name, slashCommand)
      Console(["verde", "blanco", "morado"], `<0>[SLASH-COMMAND]<1> El slash-command <2>${archivo}<1> fue cargado correctamente.`)
    }
  })
  return

}

function tiene_slashcommand(name, client, alias = false) {
  if (!name) return false
  if (client.slashcommands.has(name)) return true
  if (alias) {
    if (client.slashcommands.find(comando => {
        if (comando.hasOwnProperty("alias") && Array.isArray(comando.alias)) {
          if (comando.alias.includes(name)) return true
        }
      })) return true
  }
  return false
}

function obtener_slashcommand(name = false, client) {
  if (!client || !client.slashcommands) throw new ClientError("METODO_ERROR", "El metodo obtener_slashcommand recibe 1 parametro obligatorio (el cliente(client))")
  if (!name) return client.slashcommands.keyArray()
  if (!tiene_slashcommand(name, client, true)) return false
  return client.slashcommands.get(name) || client.slashcommands.find(cmd => cmd.alias.includes(name))
}


function ejecutar_slashcommand(name, client, ...interaction) {
  if (!name) throw new ClientError("METODO_ERROR", "El metodo ejecutar_slashcommand recibe 1 parametro obligatorio (el name del comando a ejecutar)")
  if (!tiene_slashcommand(name, client, true)) return false
  let comando = obtener_slashcommand(name, client)
  if (comando.hasOwnProperty("only_owner") && comando.only_owner === false) return
  if (comando.hasOwnProperty("disponible") && comando.disponible === false) return
  comando.ejecutar(...interaction)
  return
}

function add_slashcommand(name, client, owner) {
  if (!name) throw new ClientError("METODO_ERROR", "El metodo add_slashcommand recibe 1 parametro obligatorio (el name del comando a ejecutar)")
  if (!tiene_slashcommand(name, client, true)) return false;
  let comando = obtener_slashcommand(name, client)
  
  if (owner) return client.guilds.cache.get(client.servidor_test).commands.create(comando);
  if (!owner) return client.application.commands.create(comando);

  return
}


function recargar_slashcommand(name, client) {
  if (client.slashcommands.size <= 0) return
  if (!name) {
    client.slashcommands.map(comando => {
      delete require.cache[require.resolve(comando.path)]
      client.slashcommands.delete(comando.name)
    });

    Console(["morado"], `<0>=======================================================================`)
    cargar_slashcommand(client.path_slashcommands, client.slashcommands)
    Console(["verde", "azul", "blanco"], `<0>[SLASH-COMMAND] <1>${client.slashcommands.size}<2> slash-commands fueron actualizados correctamente.`)
    Console(["morado"], `<0>=======================================================================`)
    return true
  }

  if (!tiene_slashcommand(name, client, false)) return false
  let { path } = obtener_slashcommand(name, client)
  delete require.cache[require.resolve(client.slashcommands.get(name).path)]
  client.slashcommands.delete(name)
  let comando = require(resolve(path))
  if (!comando.hasOwnProperty("name") || typeof comando.name != "string") throw new ClientError("COMANDO_ERROR", `El slash-command ${name} no contiene la propiedad name, esto es obligatorio y debe ser un string.`)
  if (!comando.hasOwnProperty("ejecutar") || typeof comando.ejecutar != "function") throw new ClientError("COMANDO_ERROR", `El slash-command ${name} no contiene la propiedad ejecutar, esto es obligatorio y deber ser una funcion.`)
  comando.path = path
  client.slashcommands.set(comando.name, comando)
  Console(["morado"], `<0>=======================================================================`)
  Console(["verde", "blanco", "morado"], `<0>[SLASH-COMMAND]<1> El slash-command <2>${name}<1> fue actualizado correctamente.`)
  Console(["morado"], `<0>=======================================================================`)
  return true
}


module.exports = {
  cargar_slashcommand,
  ejecutar_slashcommand,
  tiene_slashcommand,
  obtener_slashcommand,
  recargar_slashcommand,
  add_slashcommand
}