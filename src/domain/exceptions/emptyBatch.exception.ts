export class EmptyBatchException extends Error {
    statusCode: number;
    constructor() {
      super('La lista de mensajes a enviar está vacía');
      this.name = 'EmptyBatchException';
      this.statusCode = 204; // NO_CONTENT
    }
  }
  
