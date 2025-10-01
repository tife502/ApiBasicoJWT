import { Request, Response, NextFunction } from 'express';
import { JwtAdapter } from '../../config/adapters/jwt.adapter';

export class AuthMiddleware {
  /**
   * Middleware para validar token JWT en las peticiones
   */
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header('Authorization');

    if (!authorization) {
      return res.status(401).json({ error: 'No se proporcionó token de autorización' });
    }

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
    }

    const token = authorization.split(' ')[1] || '';

    try {
      const payload = await JwtAdapter.validateToken(token);

      if (!payload) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }

      // Agregar el payload decodificado a la request para uso posterior
      req.body.user = payload;

      next();
    } catch (error) {
      console.error('Error validando token:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
