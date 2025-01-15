function initializeClientProperties(client) {
    client.colorDefault = "#2F3136";
    client.servidor_oficial = "719351217616322602";
    client.servidor_test = "656754930652151808";

    client.elo ={ 
      permissionRol: "1327694586893832211",
      channel: "1327694588814823459",
      message: "1327753713749852203",
      ranks: {
        rango7: "1327694586893832207", // Rango 7
        rango6: "1327694586893832206", // Rango 6
        rango5: "1327694586893832205", // Rango 5
        rango4: "1327694586893832204", // Rango 4
        rango3: "1327694586893832203", // Rango 3
        rango2: "1327694586893832202", // Rango 2
        rango1: "1327694586864341119" // Rango 1
      }
    }
  
    client.constants = {
      ownerId: "656738884712923166",
      colorSucess: 0x00ff00,
      colorError: 0xff0000,
    };
  
    client.emojisId = {
      error: "<a:731642369396441100:760122074743570433>",
      success: "<a:checkgif:753779965933387888>",
      bot: "<:741688366663336067:760122067978420234>",
      off: "<:off:760120229380096021>",
      on: "<:on:760120229568970762>",
      waiting: "<a:waiting_emb:760122075771174943>",
      warning: "<:warning_emoji:934739379757400136>",
      arrowLeft: "<:arrow_left:935043629779652648>",
      arrowRight: "<:arrow_right:935043630014545961>",
      cancel: "<:cancel_emoji:935043630039724113>",
      search: "<:search_emoji:934731150797180948>",
    };
  }
  module.exports = { initializeClientProperties };
  