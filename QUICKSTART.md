# Guía Rápida de Inicio - API JWT

## Configuración Inicial

1. **Copiar y configurar el archivo .env:**
```bash
cp .env.template .env
```

2. **Editar .env con tus configuraciones:**
```env
PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
JWT_SECRET="mi_secreto_super_seguro_de_al_menos_32_caracteres"
JWT_EXPIRES_IN="2h"
```

3. **Instalar dependencias:**
```bash
npm install
```

4. **Generar cliente de Prisma:**
```bash
npx prisma generate
```

5. **Ejecutar migraciones:**
```bash
npx prisma migrate dev --name init
```

6. **Iniciar en desarrollo:**
```bash
npm run dev
```

## Probar la API

### 1. Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456",
    "name": "Usuario Test"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123456"
  }'
```

Respuesta:
```json
{
  "user": {
    "id": "...",
    "email": "test@test.com",
    "name": "Usuario Test"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Validar token (ruta protegida)
```bash
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 4. Usar ruta protegida
```bash
curl -X POST http://localhost:3000/api/modulo/ejemplo \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "mensaje": "Datos de prueba"
  }'
```

## Endpoints Disponibles

### Públicos (sin autenticación)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login

### Protegidos (requieren JWT)
- `GET /api/auth/validate` - Validar token
- `POST /api/modulo/ejemplo` - Ejemplo de ruta protegida

## Errores Comunes

### "No se proporcionó token de autorización"
- Asegúrate de incluir el header: `Authorization: Bearer TOKEN`

### "Token inválido o expirado"
- Haz login nuevamente para obtener un nuevo token

### "Credenciales incorrectas"
- Verifica email y contraseña

### Error de conexión a BD
- Verifica que DATABASE_URL esté correctamente configurado
- Asegúrate de que MySQL esté corriendo
- Verifica que la base de datos exista

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del servidor | 3000 |
| DATABASE_URL | URL de conexión a MySQL | mysql://user:pass@localhost:3306/db |
| JWT_SECRET | Secreto para firmar JWT | cadena_larga_y_segura |
| JWT_EXPIRES_IN | Tiempo de expiración | 2h, 7d, 30m |

## Próximos Pasos

1. Crear tu primer modelo en `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev` para crear las tablas
3. Crear un nuevo módulo en `src/mi-modulo/`
4. Proteger rutas con `AuthMiddleware.validateJWT`
5. ¡Desarrollar tu aplicación!
