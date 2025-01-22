/*///////////////////////////////////////////////////////////*/
// ╔════════════════════════════════════════════════════════╗//
// ║                                                        ║//
// ║    ██╗███╗░░██╗░█████╗░██╗░░██╗██╗██╗░░░░░░█████╗░░░░  ║//
// ║    ██║████╗░██║██╔══██╗██║░░██║██║██║░░░░░██╔══██╗░░░  ║//
// ║    ██║██╔██╗██║███████║███████║██║██║░░░░░██║░░╚═╝░░░  ║//
// ║    ██║██║╚████║██╔══██║██╔══██║██║██║░░░░░██║░░██╗░░░  ║//
// ║    ██║██║░╚███║██║░░██║██║░░██║██║███████╗╚█████╔╝██╗  ║//
// ║    ╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝░╚════╝░╚═╝  ║//
// ║                        D-ConfigBot                     ║//
// ╚════════════════════════════════════════════════════════╝//
/*///////////////////////////////////////////////////////////*/

const { Client, Collection } = require("discord.js"), { Console } = require("../utilidades/ClientConsole"), 
      { cargar_slashcommand, tiene_slashcommand, ejecutar_slashcommand, obtener_slashcommand, recargar_slashcommand, add_slashcommand } = require("../utilidades/ClientSlashCommands"),
      { cargar_comandos, tiene_comando, ejecutar_comando, obtener_comando, recargar_comando } = require("../utilidades/ClientCommands"),
      cargar_eventos = require("../utilidades/ClientEvents"),
      ClientError = require("./ClientError.js"),
      Commands_guild = new Collection(),
      SlashCommands_guild = new Collection(),
      Cooldown = new Map();


class ConfigBot extends Client {
    constructor(options = {}) {
        if (options.hasOwnProperty("comandos") && typeof options.comandos !== "string" && options.comandos !== false) throw new ClientError("COMANDO_ERROR", "Necesitar colocar una rota para los comandos.")
        // if (!options.hasOwnProperty("token") || typeof options.token != "string") throw new ClientError("TOKEN_ERROR", "Token invalido, necesitas colocar el token del bot.")
        if (!options.hasOwnProperty("slashcommands") || typeof options.slashcommands !== "string" && options.slashcommands !== false) throw new ClientError("SLASHCOMANDO_ERROR", "Necesitas colocar la ruta de la carpeta donde estan tus slash-commands, puedes colocar false en caso de que no contengas ningun slash-command.")
        if (!options.hasOwnProperty("eventos") || typeof options.eventos != "string") throw new ClientError("EVENTO_ERROR", "Necesitas colocar la ruta de la carpeta donde estan tus eventos, esto es obligatorio.")
        if (options.hasOwnProperty("partials") && !Array.isArray(options.partials)) throw new ClientError("EVENTO_ERROR", "La propiedad partials debe ser un array.")

        super(options)

        this.token = ""
        this.path_eventos = options.eventos
        this.path_comandos = options.comandos
        this.path_slashcommands = options.slashcommands
        this.login()
    }

    login() {
        let start_time = Date.now()

        super.login(this.token).catch(error => { throw new ClientError("TOKEN_ERROR", error) })

        this.start_time = start_time;
        let eventos = cargar_eventos(this.path_eventos)
        if (!eventos) Console(["morado", "blanco"], "<0>[EVENTO]<1> ^Ningún evento encontrado.")
        else {
            eventos.map(evento => {
                this.on(evento.nombre, (...args) => evento.ejecutar(this, ...args))
            })
        }


        Console(["verde", "blanco"], "<0>[COMANDO]<1> Cargando comandos...")
        cargar_comandos(this.path_comandos, Commands_guild)
        if (Commands_guild.size <= 0) Console(["verde", "blanco"], "<0>[COMANDO]<1> Ningún comando encontrando...");

        this.comandos = Commands_guild
        this.tiene_comando = (nombre) => {
          if(tiene_comando(nombre, this, true)) return true
          return false
        }

        this.obtener_comando = (nombre = false) => {
          if(obtener_comando(nombre, this)) return obtener_comando(nombre, this)
          return undefined
        }

        this.ejecutar_comando = (nombre = false, ...args) => {
          ejecutar_comando(nombre, this, ...args)
        }

        this.recargar_comando = (nombre = false) => {
          return recargar_comando(nombre, this)
        }


        Console(["verde", "blanco"], "<0>[SLASH-COMMAND]<1> Cargando slash-commands...")
        cargar_slashcommand(this.path_slashcommands, SlashCommands_guild)
        if (SlashCommands_guild.size <= 0) Console(["verde", "blanco"], "<0>[SLASH-COMMAND]<1> Ningún slash-command encontrando...");

        this.slashcommands = SlashCommands_guild
        this.tiene_slashcommand = (name) => {
            if (tiene_slashcommand(name, this, true)) return true
            return false
        }

        this.obtener_slashcommand = (name = false) => {
            if (obtener_slashcommand(name, this)) return obtener_slashcommand(name, this)
            return undefined
        }

        this.ejecutar_slashcommand = (name = false, ...interaction) => {
            ejecutar_slashcommand(name, this, ...interaction)
        }

        this.recargar_slashcommand = (name = false) => {
            return recargar_slashcommand(name, this)
        }

        this.add_slashcommand = (nombre, owner = false) => {
            return add_slashcommand(nombre, this, owner)
        }

        Console(["azul", "blanco"], `<0>[BOT]<1> archivos cargados correctamente, tiempo estimado: <0>${Math.floor((Date.now() - start_time) / 1000)}<1> segundo(s).`)
    }
}

module.exports = ConfigBot