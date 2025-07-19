import { createLogger, format, transports } from 'winston';

// Definir el formato de log
const logFormat = format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Crear el logger
const logger = createLogger({
  level: 'info', // Nivel de log mínimo a registrar (puede ser 'info', 'warn', 'error', etc.)
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // Incluir stack trace
    format.splat(),
    format.json(),
    logFormat
  ),
  transports: [
    new transports.Console(), // Transport para la consola
    new transports.File({ filename: 'error.log', level: 'error' }), // Transport para errores
    new transports.File({ filename: 'combined.log' }) // Transport para todos los logs
  ],
});

export default logger;
