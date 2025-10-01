/**
 * Script de utilidad para crear un usuario inicial en la base de datos
 * Uso: npx ts-node scripts/create-user.ts
 */

import PrismaService from '../src/prisma/prisma.service';
import { BcryptAdapter } from '../src/config/adapters/bcrypt.adapter';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createUser() {
  const prisma = PrismaService.getInstance();

  try {
    console.log('\n=== Crear Usuario Inicial ===\n');

    const email = await question('Email: ');
    const password = await question('Contraseña: ');
    const name = await question('Nombre: ');

    if (!email || !password || !name) {
      console.error('❌ Todos los campos son requeridos');
      process.exit(1);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`❌ El usuario con email ${email} ya existe`);
      process.exit(1);
    }

    // Crear usuario
    const hashedPassword = BcryptAdapter.hash(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('\n✅ Usuario creado exitosamente:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Creado: ${user.createdAt}`);
    console.log('\nPuedes usar este usuario para hacer login en /api/auth/login\n');

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    process.exit(1);
  } finally {
    await prisma.cleanup();
    rl.close();
    process.exit(0);
  }
}

createUser();
