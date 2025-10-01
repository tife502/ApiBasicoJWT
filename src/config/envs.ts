import 'dotenv/config';
import { get } from 'env-var';
 

export const envs = {  

  PORT: get('PORT').required().asPortNumber(),

  DATABASE_URL: get('DATABASE_URL').required().asString(),

  JWT_SECRET: get('JWT_SECRET').required().asString(),

  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN').default('2h').asString(),

}



