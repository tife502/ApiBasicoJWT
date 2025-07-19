import createError from 'http-errors';

class MissingBodyException extends createError.HttpError {
  constructor(destination: string) {
    super( `Parece que intentaste enviar un mensaje vacío a ${destination}. Agrégale contenido antes de enviarlo.`);
  }
}

class MissingSourceException extends createError.HttpError {
  constructor(destination:string) {
    super(`No se ha proporcionado un origen desde donde enviar el mensaje a ${destination}`);
  }
}

class MissingDestinationException extends createError.HttpError {
  constructor() {
    super('No se ha proporcionado un destino para enviar el mensaje');
  }
}

export {
  MissingBodyException,
  MissingSourceException,
  MissingDestinationException
};