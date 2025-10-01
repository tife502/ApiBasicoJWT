import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '../presentation/middlewares/auth.middleware';

export class AuthRoutes {
  static get routes() {
    const router = Router();
    const authController = new AuthController();

    // Rutas públicas (no requieren autenticación)
    router.post('/login', authController.login);
    router.post('/register', authController.register);

    // Rutas protegidas (requieren autenticación)
    router.get('/validate', AuthMiddleware.validateJWT, authController.validate);

    return router;
  }
}
