import PrismaService from '../prisma/prisma.service';
import { BcryptAdapter } from '../config/adapters/bcrypt.adapter';
import { JwtAdapter } from '../config/adapters/jwt.adapter';

export class AuthService {
  private prisma = PrismaService.getInstance();

  /**
   * Login de usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Token JWT y datos del usuario o null si las credenciales son incorrectas
   */
  async loginUser(email: string, password: string) {
    try {
      // Buscar usuario por email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { error: 'Credenciales incorrectas' };
      }

      // Validar contraseña
      const isPasswordValid = BcryptAdapter.compare(password, user.password);

      if (!isPasswordValid) {
        return { error: 'Credenciales incorrectas' };
      }

      // Generar token JWT
      const token = await JwtAdapter.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      if (!token) {
        return { error: 'Error generando token' };
      }

      // Retornar datos del usuario sin la contraseña
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Error en loginUser:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  /**
   * Registrar un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param name - Nombre del usuario
   * @returns Token JWT y datos del usuario o error
   */
  async registerUser(email: string, password: string, name: string) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return { error: 'El email ya está registrado' };
      }

      // Hashear contraseña
      const hashedPassword = BcryptAdapter.hash(password);

      // Crear usuario
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      // Generar token JWT
      const token = await JwtAdapter.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      if (!token) {
        return { error: 'Error generando token' };
      }

      // Retornar datos del usuario sin la contraseña
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Error en registerUser:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  /**
   * Validar token y obtener datos del usuario
   * @param userId - ID del usuario extraído del token
   * @returns Datos del usuario sin la contraseña
   */
  async validateToken(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { error: 'Usuario no encontrado' };
      }

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword };
    } catch (error) {
      console.error('Error en validateToken:', error);
      return { error: 'Error interno del servidor' };
    }
  }
}
