import createError from 'http-errors';

export class MissingDestinationException extends createError.HttpError {
  constructor() {
    super('No se ha proporcionado un destino para el mensaje');
  }
}