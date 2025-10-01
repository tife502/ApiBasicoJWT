import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(
    private readonly authService = new AuthService(),
  ) {}

  /**
   * Endpoint para login de usuario
   */
  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await this.authService.loginUser(email, password);

    if ('error' in result) {
      return res.status(401).json({ error: result.error });
    }

    return res.status(200).json(result);
  };

  /**
   * Endpoint para registro de usuario
   */
  register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    // Validar que se proporcionen todos los campos
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const result = await this.authService.registerUser(email, password, name);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json(result);
  };

  /**
   * Endpoint para validar token (ruta protegida)
   */
  validate = async (req: Request, res: Response) => {
    // El usuario viene del middleware que decodifica el token
    const user = req.body.user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const result = await this.authService.validateToken(user.id);

    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json(result);
  };
}
