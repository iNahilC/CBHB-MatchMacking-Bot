const { generate } = require("randomstring");

function randomId(longitud, tipo) {
    return generate({
        length: longitud,
        charset: tipo,
    });
}

module.exports = { randomId };
