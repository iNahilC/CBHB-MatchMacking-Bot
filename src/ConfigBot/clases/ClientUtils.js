/* eslint-disable no-constant-binary-expression */
const ClientError = require("./ClientError.js");
const { MessageActionRow, MessageButton } = require("discord.js");

let permisos_object = {
  "ADMINISTRATOR": ["Administrador", "Administrator"],
  "CREATE_INSTANT_INVITE": ["Crear invitaciones instantaneas", "Create instant invites"],
  "KICK_MEMBERS": ["Expulsar miembros", "Kick members"],
  "BAN_MEMBERS": ["Banear miembros", "Ban members"],
  "MANAGE_CHANNELS": ["Gestionar canales", "Manage channels"],
  "MANAGE_GUILD": ["Gestionar servidor", "Manage guild"],
  "ADD_REACTIONS": ["Añadir reacciones", "Add reactions"],
  "VIEW_AUDIT_LOG": ["Ver el registro de auditoria", "See the audit log"],
  "PRIORITY_SPEAKER": ["Prioridad de palabra", "Priority speaker"],
  "VIEW_CHANNEL": ["Ver canal", "View channel"],
  "READ_MESSAGES": ["Leer mensajes", "Read messages"],
  "SEND_MESSAGES": ["Enviar mensajes", "Send messages"],
  "SEND_TTS_MESSAGES": ["Enviar mensajes de texto a voz", "Send text messages to voice"],
  "MANAGE_MESSAGES": ["Gestionar mensajes", "Manage messages"],
  "EMBED_LINKS": ["Insertar enlaces", "Insert links"],
  "ATTACH_FILES": ["Adjuntar archivos", "Attach files"],
  "READ_MESSAGE_HISTORY": ["Leer el historial de mensajes", "Read message history"],
  "MENTION_EVERYONE": ["Mencionar a todos", "Mention everyone"],
  "USE_EXTERNAL_EMOJIS": ["Usar emojis externos", "Use external emojis"],
  "EXTERNAL_EMOJIS": ["Usar emojis externos", "Use external emojis"],
  "CONNECT": ["Conectar", "Connect"],
  "SPEAK": ["Hablar", "Talk"],
  "MUTE_MEMBERS": ["Silenciar miembros", "Mute members"],
  "DEAFEN_MEMBERS": ["Ensordecer miembros", "Deafen members"],
  "MOVE_MEMBERS": ["Mover miembros", "Move members"],
  "USE_VAD": ["Usar actividad de voz", "Use voice activity"],
  "CHANGE_NICKNAME": ["Cambiar apodo", "Change nickname"],
  "MANAGE_NICKNAMES": ["Gestionar apodos", "Manage nicknames"],
  "MANAGE_ROLES": ["Gestionar roles", "Manage roles"],
  "MANAGE_ROLES_OR_PERMISSIONS": ["Gestionar roles", "Manage roles"],
  "MANAGE_WEBHOOKS": ["Gestionar webhooks", "Manage webhooks"],
  "MANAGE_EMOJIS": ["Gestionar emojis", "Manage emojis"]
}


class DiscordUtils {
  constructor() {}

  parse_tiempo(ms, formato, len = false) {
    if (isNaN(ms)) throw new ClientError("METODO_ERROR", "El metodo parse_tiempo recibe 3 parametros (el primero un numero, el segundo un formato del texto y el tercero el lenguaje: en-es)")
    if (!formato) throw new ClientError("METODO_ERROR", "El valor del segundo parametro del metodo parse_tiempo debe ser un string, recuerda usar {{tiempo}} en el lugar donde quieres que se muestre el tiempo.")
    if (!len) len = "es"
    if (typeof len != "string" || !["en", "es"].includes(len.toLowerCase())) throw new ClientError("PROPIEDAD_ERROR", "El valor del tercer parametro del metodo parse_tiempo debe ser un string, tambien debes de indicar el lenguajes: en-es")
    len = len.toLowerCase()
    let final = ""

    let años = Math.floor((ms) / (1000 * 60 * 60 * 24 * 365));
    let meses = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    let dias = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    let horas = Math.floor(((ms) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutos = Math.floor(((ms) % (1000 * 60 * 60)) / (1000 * 60));
    let segundos = Math.floor(((ms) % (1000 * 60)) / 1000);

    let tiempo = {
      es: {
        A: ["año", "años"],
        M: ["mes", "meses"],
        d: ["dia", "dias"],
        h: ["hora", "horas"],
        m: ["minuto y", "minutos y"],
        s: ["segundo", "segundos"]
      },
      en: {
        A: ["year", "years"],
        M: ["month", "months"],
        d: ["day", "days"],
        h: ["hour", "hours"],
        m: ["minute and", "minutes and"],
        s: ["second", "seconds"]
      }
    }

    if (años > 0) final += años > 1 ? `${años} ${tiempo[len].A[1]}, ` : `${tiempo[len].A[0]}, `
    if (meses > 0) final += meses > 1 ? `${meses} ${tiempo[len].M[1]}, ` : `${meses} ${tiempo[len].M[0]}, `
    if (dias > 0) final += dias > 1 ? `${dias} ${tiempo[len].d[1]}, ` : `${dias} ${tiempo[len].d[0]}, `
    if (horas > 0) final += horas > 1 ? `${horas} ${tiempo[len].h[1]}, ` : `${horas} ${tiempo[len].h[0]}, `
    if (minutos > 0) final += minutos > 1 ? `${minutos} ${tiempo[len].m[1]} ` : `${minutos} ${tiempo[len].m[0]} `
    if (segundos > 0) final += segundos > 1 ? `${segundos} ${tiempo[len].s[1]}` : `${segundos} ${tiempo[len].s[0]}`

    if (final.endsWith("and ")) final = final.slice(0, final.length - 5)
    else if (final.endsWith("y ")) final = final.slice(0, -3)

    return formato.replace(new RegExp(`{{tiempo}}`, 'g'), final)
  }


  ms_converter(ms) {
    let años = Math.floor((ms) / (1000 * 60 * 60 * 24 * 365));
    let meses = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    let dias = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    let horas = Math.floor(((ms) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutos = Math.floor(((ms) % (1000 * 60 * 60)) / (1000 * 60));
    let segundos = Math.floor(((ms) % (1000 * 60)) / 1000);


    let final = ""
    if (años > 0) final += años > 1 ? `${años} años, ` : `${años} año, `
    if (meses > 0) final += meses > 1 ? `${meses} meses, ` : `${meses} mes, `
    if (dias > 0) final += dias > 1 ? `${dias} dias, ` : `${dias} dia, `
    if (horas > 0) final += horas > 1 ? `${horas} horas, ` : `${horas} hora, `
    if (minutos > 0) final += minutos > 1 ? `${minutos} minutos y ` : `${minutos} minuto y `
    if (segundos > 0) final += segundos > 1 ? `${segundos} segundos.` : `${segundos} segundo.`
    return final;
  }


  obtener_rol(message, nombre_id = false) {
    if (!message) throw new ClientError("METODO_ERROR", "El metodo obtener_rol recibe 1 parametro obligatorio (el mensaje(message))")
    if (!message.mentions || !message.guild) return null
    return message.mentions.roles.first() || message.guild.roles.get(nombre_id) || message.guild.roles.find(r => r.name == nombre_id)
  }


  obtener_miembro(message, nombre_id = false, global_user = false) {
    if (!message) throw new ClientError("METODO_ERROR", "El metodo obtener_miembro recibe 1 parametro obligatorio (el mensaje(message))")
    if (!message.mentions || !message.guild || !message.client) return null
    if (!global_user) return message.mentions.members.first() || message.guild.members.cache.get(nombre_id) || message.guild.members.cache.find(u => u.user.username == nombre_id)
    return message.client.users.cache.get(nombre_id) || message.client.users.cache.find(u => u.username == nombre_id)
  }


  obtener_emoji(message, nombre_id = false, global_emoji = false) {
    if (!message) throw new ClientError("METODO_ERROR", "El metodo obtener_emoji recibe 1 parametro obligatorio (el mensaje(message))")
    if (!message.guild || !message.client) return null
    if (!global_emoji) return message.guild.emojis.cache.get(nombre_id) || message.guild.emojis.cache.find(e => e.name == nombre_id)
    return message.client.emojisId.cache.get(nombre_id) || message.client.emojisId.cache.find(e => e.name == nombre_id)
  }


  obtener_canal(message, nombre_id = false, global_channel = false) {
    if (!message) throw new ClientError("METODO_ERROR", "El metodo obtener_canal recibe 1 parametro obligatorio (el mensaje(message))")
    if (!message.mentions || !message.guild || !message.client) return null
    if (!global_channel) return message.mentions.channels.first() || message.guild.channels.cache.get(nombre_id) || message.guild.channels.cache.find(c => c.name == nombre_id)
    return message.mentions.channels.first() || message.client.channels.cache.get(nombre_id) || message.client.channels.cache.find(c => c.name == nombre_id)
  }

  permisos(permisos, member, len = false) {
    if (!permisos) throw new ClientError("METODO_ERROR", "El metodo permisos recibe 3 parametros (un array de permisos, el GuildMember y el lenguaje: en-es <opcional>)")
    if (!Array.isArray(permisos)) throw new ClientError("METODO_ERROR", "El primer parametro del metodo permisos debe contener un array con los permisos a verificar")
    if (!member.permissions) throw new ClientError("METODO_ERROR", "El segundo parametro del metodo permisos debe ser un GuildMember.")
    if (!len) len = "es"
    if (typeof len != "string") throw new ClientError("METODO_ERROR", "El tercer parametro del metodo permisos debe ser un string: en-es")
    len = len.toLowerCase()
    if (!["es", "en"].includes(len)) throw new ClientError("PROPIEDAD_ERROR", "El valor del tercer parametro del metodo permisos debe ser un string, tambien debes de indicar el lenguajes: en-es")
    return permisos.filter(p => !member.permissions.toArray().includes(p)).map((p) => p = `${permisos_object[p][len == "es" ? 0 : 1]}`)
  }


  esObject(type_var) {
    if (!type_var && type_var != 0) throw new ClientError("METODO_ERROR", "El metodo esObject recibe 1 parametro (un valor a verificar)")
    if (typeof type_var == "object" && !(type_var instanceof Array)) return true
    return false
  }


  esArray(type_var) {
    if (!type_var && type_var != 0) throw new ClientError("METODO_ERROR", "El metodo esArray recibe 1 parametro (un valor a verificar)")
    if (Array.isArray(type_var)) return true
    return false
  }


  esFloat(type_var) {
    if (!type_var && type_var != 0) throw new ClientError("METODO_ERROR", "El metodo esFloat recibe 1 parametro (un valor a verificar)")
    return typeof(type_var, "Number") && !!(type_var % 1)
  }


  esNum(type_var) {
    if (!type_var && type_var != 0) throw new ClientError("METODO_ERROR", "El metodo esNum recibe 1 parametro (un valor a verificar)")
    return !!parseInt(type_var) == false && parseInt(type_var) != 0 ? false : true
  }


  unir_array(array, ...args) {
    if (!array || !Array.isArray(array)) throw new ClientError("METODO_ERROR", "El metodo unir_array recibe 1 parametro obligatorio (un array)")
    if (args.length <= 0) throw new ClientError("METODO_ERROR", "El metodo unir_array necesita uno o mas parametros que contengan los array que se uniran al array del primer parametro.")
    if (args.some(a => !Array.isArray(a))) throw new ClientError("METODO_ERROR", "Un parametro del metodo unir_array no es un array.")
    let new_array = [].concat(array)
    for (var arr of args)
      for (var item of arr) new_array.push(item)
    return new_array
  }


  unir_object(object, ...args) {
    if (!object || typeof object != "object" || (object instanceof Array)) throw new ClientError("METODO_ERROR", "El metodo unir_object recibe 1 parametro obligatorio (un objeto)")
    if (args.length <= 0) throw new ClientError("METODO_ERROR", "El metodo unir_object necesita uno o mas parametros que contengan los objetos que se uniran al objetos del primer parametro.")
    if (args.some(a => typeof a != "object" || (a instanceof Array))) throw new ClientError("METODO_ERROR", "Un parametro del metodo unir_object no es un objeto.")
    let new_object = Object.assign({}, object)
    for (var obj of args)
      for (var key in obj) new_object[key] = obj[key]
    return new_object
  }


  math(symbol, ...args) {
    if (!symbol || typeof symbol != "string") throw new ClientError("METODO_ERROR", "El metodo math recibe 2 parametros (el primero el simbolo: *-/+ y luego uno o mas parametros con los numeros que se evaluaran en la operacion.")
    if (!["*", "/", "-", "+"].includes(symbol)) throw new ClientError("METODO_ERROR", "El simbolo que se usa en el metodo math deben ser los siguientes: *-+/")
    if (args.length < 2) throw new ClientError("METODO_ERROR", "El metodo math necesita recibir uno o mas parametros con los numeros que se evaluaran en la operacion especificada.")
    if (args.some(n => !!parseInt(n) == false && parseInt(n) != 0)) throw new ClientError("METODO_ERROR", "Un parametro del metodo math no es un numero.")
    let result = this.esFloat(args[0]) ? parseFloat(args[0]) : parseInt(args[0])
    for (var number of args.slice(1)) {
      number = this.esFloat(number) ? parseFloat(number) : parseInt(number)
      if (symbol == "+") result += number
      else if (symbol == "-") result -= number
      else if (symbol == "*") result = result * number
      else if (symbol == "/") {
        if (number == 0) throw new ClientError("METODO_ERROR", "El numero a dividir del metodo math no puede ser 0.")
        result = result / number
        break
      }
    }
    return result
  }


  verificar_array(array) {
    if (!array || !Array.isArray(array)) throw new ClientError("METODO_ERROR", "El metodo verificar_array debe recibir como parametro 1 array.")
    var obj = {},
      x,
      size;
    for (x = 0, size = array.length; x < size; x++) {
      if (obj[array[x]]) return false
      obj[array[x]] = true
    }
    return true
  }

  remove_item_from_array(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }


  split_texto(texto, longitud = 1024, split = "\n") {
    if (typeof texto != "string" || texto.length <= 0) throw new ClientError("METODO_ERROR", "El metodo split_texto recibe 1 parametro obligatorio y 2 opcionales (El primer parametro un string(texto/obligatorio), el segundo parametro la longitud maxima de caracteres por mensaje y el tercer parametro el simbolo que se usará para dividir la cadena de texto, por default es \\n))")
    if (isNaN(longitud) || parseInt(longitud) <= 0) throw new ClientError("METODO_ERROR", "La longitud maxima de caracteres por mensaje a verificar debe ser un numero, tambien debe ser mayor a 0.")
    longitud = parseInt(longitud)
    if (!split) throw new ClientError("METODO_ERROR", "Necesitas colocar el simbolo que se usara como identificador para separar la cadena de texto, por default es \\n")
    if (texto.length <= longitud) return [texto]

    let split_message = texto.split(split),
      global_split = [],
      internal_text = "";

    let find = split_message.filter(i => i.length > longitud)
    if (find.length > 0) throw new ClientError("METODO_ERROR", `El numero de la longitud que se usará como identificador debe ser mayor o igual a ${find.sort((a,b) => b.length-a.length)[0].length}`)
    for (var x = 0; x < split_message.length; x++) {
      if (internal_text && (internal_text + split + split_message[x]).length < longitud) {
        internal_text += (internal_text !== "" ? split : "") + split_message[x]
        continue
      }
      global_split.push(internal_text)
      internal_text = split_message[x]
    }
    return global_split.concat(internal_text).filter(f => f.length > 0)
  }


  snowflake(id) {
    if (!id || isNaN(id)) throw new ClientError("METODO_ERROR", "El metodo snowflake recibe 1 parametro obligatorio (una ID-snowflake)")

    let data = new Date((id * Math.pow(2, -22)) + 1420070400000)

    let año = data.getUTCFullYear()
    let mes = data.getUTCMonth() + 1
    let dia = data.getUTCDate()
    let hora = data.getUTCHours()
    let minuto = data.getUTCMinutes()
    let segundo = data.getUTCSeconds()

    if (mes.toString().length == 1) mes = "0" + mes
    if (dia.toString().length == 1) dia = "0" + dia
    if (hora.toString().length == 1) hora = "0" + hora
    if (minuto.toString().length == 1) minuto = "0" + minuto
    if (segundo.toString().length == 1) segundo = "0" + segundo

    return {
      año,
      mes,
      dia,
      hora,
      minuto,
      segundo
    }
  }


  button_id_generator(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    for (var button_id_generator = 0; button_id_generator < length; button_id_generator++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
    }
    return result;
  }


  Convert(date) {
    let valid_keys = {
      "w": {
        nombre: "semana(s)",
        tiempo: 604800000
      },
      "d": {
        nombre: "dia(s)",
        tiempo: 86400000
      },
      "h": {
        nombre: "hora(s)",
        tiempo: 3600000
      },
      "m": {
        nombre: "minuto(s)",
        tiempo: 60000
      },
      "s": {
        nombre: "segundo(s)",
        tiempo: 1000
      }
    }

    let format = date.slice(-1),
      time = date.slice(0, -1)

    if (!valid_keys[format]) return false
    if (isNaN(time)) return false
    if (parseInt(time) <= 0) return false
    return {
      nombre: `${parseInt(time)} ${valid_keys[format].nombre}`,
      tiempo: valid_keys[format].tiempo * parseInt(time)
    }
  }


  addRow(btns) {
    const row = new MessageActionRow();
    for (const btn of btns) {
      row.addComponents(btn);
    }
    return row;
  }


  createButton(label, disabled,) {
    let style = 'SECONDARY';
    if (label === 'AC' || label === 'DC' || label === '⌫') {
      style = 'DANGER';
    } else if (label === '=') {
      style = 'SUCCESS';
    } else if (
      label === '(' ||
      label === ')' ||
      label === '^' ||
      label === '%' ||
      label === '÷' ||
      label === 'x' ||
      label === '-' ||
      label === '+' ||
      label === '.'
    ) {
      style = 'PRIMARY';
    }
    if (disabled) {
      const btn = new MessageButton()
        .setLabel(label)
        .setStyle(style)
        .setDisabled(true);

      function i(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
        }
        return result;
      }

      if (label === '\u200b') {
        btn.setCustomId(i(10));
      } else {
        btn.setCustomId('cal' + label);
      }
      return btn;
    } else {
      function i(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
        }
        return result;
      }
      const btn = new MessageButton().setLabel(label).setStyle(style);
      if (label === '\u200b') {
        btn.setDisabled();
        btn.setCustomId(i(10));
      } else {
        btn.setCustomId('cal' + label);
      }
      return btn;
    }
  }

  advanced_channels_map(c) {
    let r = "";
    switch (c.type) {
      case "GUILD_NEWS":
      case "GUILD_TEXT":
        r += "[📃] " + c.name;
        break;
      case "GUILD_VOICE":
        r += "[🎙] " + c.name + (c.members.size ? (c.members.map(d => {
          if (d.user.bot) {
            return "\n\t\t[🤖] " + d.user.tag;
          } else {
            return "\n\t\t[🙎] " + d.user.tag;
          }
        })).join("") : "")
        break;
      case "GUILD_STORE":
        r += "[🏪] " + c.name;
        break;
      default:
        r += "[?] " + c.name;
        break;
    }
    return r;
  }
}

module.exports = DiscordUtils