# API Básico JWT

API REST básica con sistema completo de autenticación JWT (JSON Web Tokens) implementado en TypeScript, Express y Prisma.

## Características

- 🔐 **Autenticación JWT completa**: Login, registro y validación de tokens
- 🛡️ **Middleware de autenticación**: Protección de rutas con JWT
- 🔒 **Encriptación de contraseñas**: Usando bcrypt para seguridad
- 📦 **Arquitectura modular**: Código organizado y escalable
- 🎯 **TypeScript**: Tipado fuerte para mayor seguridad
- 💾 **Prisma ORM**: Acceso a base de datos tipado y seguro
- 🌐 **WebSocket**: Soporte para notificaciones en tiempo real

## Requisitos Previos

- Node.js (v16 o superior)
- MySQL (o compatible)
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tife502/ApiBasicoJWT.git
cd ApiBasicoJWT
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.template .env
```

4. Editar el archivo `.env` con tus configuraciones:
```env
PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
JWT_SECRET="tu_secreto_super_seguro_aqui"
JWT_EXPIRES_IN="2h"
```

⚠️ **Importante**: 
- Usa un `JWT_SECRET` fuerte y único en producción
- Nunca subas tu archivo `.env` al repositorio
- Puedes cambiar `JWT_EXPIRES_IN` según tus necesidades (ej: "24h", "7d", "30m")

5. Generar el cliente de Prisma:
```bash
npx prisma generate
```

6. Ejecutar migraciones de base de datos:
```bash
npx prisma migrate dev
```

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con hot-reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Compilar y ejecutar en producción

## Estructura del Proyecto

```
src/
├── config/
│   ├── envs.ts                      # Configuración de variables de entorno
│   └── adapters/
│       ├── jwt.adapter.ts           # Adaptador para JWT
│       ├── bcrypt.adapter.ts        # Adaptador para bcrypt
│       ├── uuid.adapter.ts          # Adaptador para UUID
│       └── winstonAdapter.ts        # Adaptador para logging
├── presentation/
│   ├── server.ts                    # Configuración del servidor Express
│   ├── routes.ts                    # Rutas principales de la aplicación
│   └── middlewares/
│       └── auth.middleware.ts       # Middleware de autenticación JWT
├── auth/
│   ├── auth.service.ts              # Lógica de negocio de autenticación
│   ├── auth.controller.ts           # Controlador de autenticación
│   └── auth.routes.ts               # Rutas de autenticación
├── modulo/
│   ├── modulo.service.ts            # Servicios del módulo ejemplo
│   ├── modulo.controller.ts         # Controlador del módulo ejemplo
│   └── modulo.routes.ts             # Rutas del módulo ejemplo (protegidas)
├── prisma/
│   └── prisma.service.ts            # Servicio de Prisma
└── app.ts                           # Punto de entrada de la aplicación
```

## API Endpoints

### Autenticación (Rutas Públicas)

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

**Respuesta exitosa (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login de Usuario
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Rutas Protegidas (Requieren JWT)

#### Validar Token
```http
GET /api/auth/validate
Authorization: Bearer <tu_token_jwt>
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Ejemplo de Ruta Protegida
```http
POST /api/modulo/ejemplo
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json

{
  "mensaje": "Datos del ejemplo"
}
```

## Uso de la Autenticación

### 1. Registrar un Usuario

```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123',
    name: 'Nombre Usuario'
  })
});

const data = await response.json();
const token = data.token; // Guardar este token
```

### 2. Hacer Login

```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123'
  })
});

const data = await response.json();
const token = data.token; // Guardar este token
```

### 3. Usar el Token en Rutas Protegidas

```javascript
const response = await fetch('http://localhost:3000/api/modulo/ejemplo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Incluir el token aquí
  },
  body: JSON.stringify({
    mensaje: 'Datos del ejemplo'
  })
});
```

## Proteger Rutas con JWT

Para proteger cualquier ruta con autenticación JWT, simplemente agrega el middleware `AuthMiddleware.validateJWT`:

```typescript
import { Router } from 'express';
import { AuthMiddleware } from '../presentation/middlewares/auth.middleware';
import { MiController } from './mi.controller';

export class MisRutas {
  static get routes() {
    const router = Router();
    const controller = new MiController();

    // Ruta pública (sin middleware)
    router.get('/publico', controller.metodoPublico);

    // Ruta protegida (con middleware)
    router.post('/protegido', AuthMiddleware.validateJWT, controller.metodoProtegido);

    return router;
  }
}
```

## Manejo de Errores

### Errores de Autenticación

**401 Unauthorized:**
```json
{
  "error": "No se proporcionó token de autorización"
}
```

```json
{
  "error": "Formato de token inválido. Use: Bearer <token>"
}
```

```json
{
  "error": "Token inválido o expirado"
}
```

**400 Bad Request:**
```json
{
  "error": "Email y contraseña son requeridos"
}
```

```json
{
  "error": "El email ya está registrado"
}
```

## Seguridad

### Mejores Prácticas Implementadas

1. **Contraseñas Hasheadas**: Las contraseñas se hashean con bcrypt antes de guardarse
2. **Tokens con Expiración**: Los JWT tienen un tiempo de expiración configurable
3. **Secret Key**: El JWT_SECRET debe ser una cadena larga y segura
4. **Validación de Entrada**: Se validan los datos de entrada en los controladores
5. **CORS Configurado**: Se permite el control de acceso desde diferentes orígenes

### Recomendaciones Adicionales

- Usa HTTPS en producción
- Implementa rate limiting para prevenir ataques de fuerza bruta
- Considera agregar refresh tokens para sesiones más largas
- Implementa logout en el cliente (eliminar el token)
- Mantén actualizadas las dependencias de seguridad

## Desarrollo

### Crear un Nuevo Módulo Protegido

1. Crea la estructura del módulo en `src/mi-modulo/`
2. Implementa el servicio con la lógica de negocio
3. Crea el controlador
4. Define las rutas aplicando el middleware de autenticación:

```typescript
router.post('/ruta', AuthMiddleware.validateJWT, controller.metodo);
```

5. Registra las rutas en `src/presentation/routes.ts`

### Acceder a Datos del Usuario en Controladores

El middleware `AuthMiddleware.validateJWT` agrega los datos decodificados del token a `req.body.user`:

```typescript
async miMetodo(req: Request, res: Response) {
  const usuario = req.body.user; // { id, email, name }
  const userId = usuario.id;
  
  // Usar userId para operaciones
}
```

## Modelo de Base de Datos

### User (Usuario)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Testing

Para probar la API puedes usar herramientas como:

- **Postman**: Importa la colección de endpoints
- **curl**: Pruebas desde línea de comandos
- **Thunder Client** (VS Code): Extensión para pruebas de API
- **REST Client** (VS Code): Otra extensión para pruebas

### Ejemplo con curl

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Validar token (reemplaza TOKEN con el token recibido)
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer TOKEN"
```

## Licencia

ISC

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## Soporte

Para preguntas o problemas, abre un issue en el repositorio de GitHub.
