import { PrismaClient } from '@prisma/client';
import { envs } from '../config/envs';
import { onSomethingMethod } from './methods/onSomething/onSomething';

class PrismaService extends PrismaClient {
  private static instance: PrismaService;

  /**************************************************************************************************
    clase de Prisma que se encargara de la comunicacion con la base de datos
  ***************************************************************************************************/
  constructor() {
    super({
      log: ['warn', 'error'],
      datasources: {
        db: {
          url: envs.DATABASE_URL ? envs.DATABASE_URL : "",
        },
      },
    });

    this.init(); 
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  /**************************************** MÉTODOS DE AUTENTICACIÓN JWT ****************************************************************************************/
  
  /**
   * Buscar usuario por email para autenticación
   */
  async findUserByEmail(email: string) {
    try {
      return await this.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database error while finding user');
    }
  }

  /**
   * Buscar usuario por ID (para validación de tokens)
   */
  async findUserById(id: string) {
    try {
      return await this.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Database error while finding user');
    }
  }

  /**
   * Crear nuevo usuario (para registro)
   */
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    try {
      return await this.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Database error while creating user');
    }
  }

  /**
   * Actualizar último login del usuario
   */
  async updateLastLogin(userId: string) {
    try {
      return await this.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // No lanzamos error aquí porque no es crítico
    }
  }

  /**
   * Verificar si el email ya existe
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.user.findUnique({
        where: { email },
        select: { id: true }
      });
      return !!user;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Database error while checking email');
    }
  }

  /**************************************** MÉTODOS EXISTENTES ****************************************************************************************/
  
  async onSomething(payload: any) {
    const message = onSomethingMethod(payload, prismaService);
    return message;
  }

  /*************************************************************** MÉTODOS COMUNES **********************************************************/

  async init() {
    try {
      await this.$connect();
      console.log(`Conexión a la base de datos establecida correctamente.`);
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
    }
  }

  async destroy() {
    try {
      await this.$disconnect();
      console.log('Conexión a la base de datos cerrada.');
    } catch (error) {
      console.error('Error al cerrar la conexión con la base de datos:', error);
    }
  }

  public async cleanup() {
    await this.$disconnect();
  } 
}

// Event handlers para cierre limpio
process.on('SIGINT', async () => {
  await prismaService.destroy();
  console.log('Conexión a la base de datos cerrada.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prismaService.destroy();
  console.log('Conexión a la base de datos cerrada.');
  process.exit(0);
});

const prismaService = PrismaService.getInstance();

export default PrismaService;