
class ClientError extends Error {
  constructor(nombre, mensaje) {
    super();
    this.name = nombre      
    this.message = mensaje
  }
}

module.exports = ClientError
