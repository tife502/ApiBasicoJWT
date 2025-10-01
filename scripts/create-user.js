"use strict";
/**
 * Script de utilidad para crear un usuario inicial en la base de datos
 * Uso: npx ts-node scripts/create-user.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = __importDefault(require("../src/prisma/prisma.service"));
const bcrypt_adapter_1 = require("../src/config/adapters/bcrypt.adapter");
const readline = __importStar(require("readline"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}
function createUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const prisma = prisma_service_1.default.getInstance();
        try {
            console.log('\n=== Crear Usuario Inicial ===\n');
            const email = yield question('Email: ');
            const password = yield question('Contraseña: ');
            const name = yield question('Nombre: ');
            if (!email || !password || !name) {
                console.error('❌ Todos los campos son requeridos');
                process.exit(1);
            }
            // Verificar si el usuario ya existe
            const existingUser = yield prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                console.error(`❌ El usuario con email ${email} ya existe`);
                process.exit(1);
            }
            // Crear usuario
            const hashedPassword = bcrypt_adapter_1.BcryptAdapter.hash(password);
            const user = yield prisma.user.create({
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
        }
        catch (error) {
            console.error('❌ Error creando usuario:', error);
            process.exit(1);
        }
        finally {
            yield prisma.cleanup();
            rl.close();
            process.exit(0);
        }
    });
}
createUser();
