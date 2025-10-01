import jwt from 'jsonwebtoken';
import { envs } from '../envs';

const JWT_SECRET = envs.JWT_SECRET;

export class JwtAdapter {
  /**
   * Genera un token JWT
   * @param payload - Datos a incluir en el token
   * @param duration - Duración del token (opcional, por defecto usa JWT_EXPIRES_IN del .env)
   * @returns Token JWT como string o null si hay error
   */
  static async generateToken(payload: any, duration?: string | number): Promise<string | null> {
    return new Promise((resolve) => {
      const expiresIn = duration || envs.JWT_EXPIRES_IN;
      
      jwt.sign(payload, JWT_SECRET, { expiresIn } as any, (err, token) => {
        if (err) {
          console.error('Error generando token:', err);
          return resolve(null);
        }
        resolve(token!);
      });
    });
  }

  /**
   * Valida y decodifica un token JWT
   * @param token - Token JWT a validar
   * @returns Payload decodificado o null si el token no es válido
   */
  static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return resolve(null);
        }
        resolve(decoded as T);
      });
    });
  }
}
