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
          url: envs.DATABASE_URL?envs.DATABASE_URL:"",
        },
      },
      
    } );

    this.init(); 
  }
  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
   
    }
    return PrismaService.instance;
  }

 
  /**************************************** del bot ****************************************************************************************/
  async onSomething(payload: any) {
    const message =onSomethingMethod(payload,prismaService)
    return message
  }
 

/*************************************************************** final metodos comunes **********************************************************/

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