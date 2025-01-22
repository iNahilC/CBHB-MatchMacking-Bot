const { QuickDB } = require("quick.db");

function initializeClientProperties(client) {
    client.db = new QuickDB();
    client.colorDefault = "#2F3136";
    client.servidor_oficial = "719351217616322602";
    client.servidor_test = "656754930652151808";

    client.elo ={ 
      permissionRol: "1311860253696065717",
      channel: "1331414581779890308",
      message: "1331415463447494757",
      ranks: {
        rango6: "1318648000779780096", // Rango 6
        rango5: "1318647994702368788", // Rango 5
        rango4: "1318647992286449725", // Rango 4
        rango3: "1311862776259416124", // Rango 3
        rango2: "1311862590779031664", // Rango 2
        rango1: "1311862422658613268", // Rango 1
        rango0: "1311863014818844743" // Rango 0
      }
    }
  
    client.constants = {
      ownerId: "656738884712923166",
      colorSucess: 0x00ff00,
      colorError: 0xff0000,
    };
  
    client.emojisId = {
      leftfull: "<:LF:1330319013913563266>",
      middlefull: "<:MF:1330319015863783484>",
      rightfull: "<:RF:1330319011673538713>",
      leftempty: "<:LE:1330319012948607047>",
      middleempty: "<:ME:1330319014886641694>",
      rightempty: "<:RE:1330319017289715722>",
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
  