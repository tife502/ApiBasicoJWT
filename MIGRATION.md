# Migration Guide - Adding JWT to Existing Projects

This guide helps integrate the JWT authentication system into existing projects or upgrade from the basic version.

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### Step 2: Update Environment Configuration

1. Add JWT variables to your `.env`:
```env
JWT_SECRET="your_super_secure_secret_key_here_at_least_32_chars"
JWT_EXPIRES_IN="2h"
```

2. Update `src/config/envs.ts`:
```typescript
export const envs = {
  // ... existing config
  JWT_SECRET: get('JWT_SECRET').required().asString(),
  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN').default('2h').asString(),
}
```

### Step 3: Update Database Schema

Add the User model to `prisma/schema.prisma`:

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

Run migration:
```bash
npx prisma migrate dev --name add_user_model
```

### Step 4: Create Adapters

Copy these files:
- `src/config/adapters/jwt.adapter.ts`
- `src/config/adapters/bcrypt.adapter.ts`

### Step 5: Create Authentication Middleware

Copy:
- `src/presentation/middlewares/auth.middleware.ts`

### Step 6: Create Auth Module

Copy the entire `src/auth/` directory:
- `auth.service.ts`
- `auth.controller.ts`
- `auth.routes.ts`

### Step 7: Update Routes

In `src/presentation/routes.ts`, add auth routes:

```typescript
import { AuthRoutes } from '../auth/auth.routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    
    // Add auth routes
    router.use('/api/auth', AuthRoutes.routes);
    
    // ... other routes
    
    return router;
  }
}
```

### Step 8: Protect Existing Routes

For any route you want to protect, add the middleware:

```typescript
import { AuthMiddleware } from '../presentation/middlewares/auth.middleware';

// Before:
router.post('/endpoint', controller.method);

// After (protected):
router.post('/endpoint', AuthMiddleware.validateJWT, controller.method);
```

### Step 9: Test the Integration

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm run dev
```

3. Test registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'
```

4. Test login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

5. Save the token from the response and test a protected route:
```bash
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Migrating Existing Users

If you have existing users in your database, you'll need to:

### Option 1: Reset Passwords
1. Truncate or drop the existing user table
2. Have users re-register

### Option 2: Migrate Existing Users
1. Create a migration script to hash existing passwords
2. Update the schema to match the new User model

Example migration script:
```typescript
import PrismaService from './src/prisma/prisma.service';
import { BcryptAdapter } from './src/config/adapters/bcrypt.adapter';

async function migratePasswords() {
  const prisma = PrismaService.getInstance();
  
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    // Assuming old passwords were plain text (NOT RECOMMENDED)
    const hashedPassword = BcryptAdapter.hash(user.password);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
  }
  
  console.log(`Migrated ${users.length} users`);
}

migratePasswords();
```

## Breaking Changes

### Routes
- All protected routes now require `Authorization: Bearer <token>` header
- Clients need to store and send the token with each request

### Responses
- Login/Register now return `{ user, token }` instead of just user data
- Error responses follow consistent format

### Client Changes Required

Update your client/frontend to:

1. **Store the token** after login/register:
```javascript
const response = await fetch('/api/auth/login', {...});
const { token } = await response.json();
localStorage.setItem('token', token); // or use cookies
```

2. **Send token with requests**:
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

3. **Handle 401 errors** (expired/invalid token):
```javascript
if (response.status === 401) {
  // Redirect to login
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## Rollback Plan

If you need to rollback:

1. **Remove auth routes** from `src/presentation/routes.ts`
2. **Remove middleware** from protected routes
3. **Run database migration** to remove User table if needed:
```bash
npx prisma migrate dev --name remove_user_model
```

4. **Remove dependencies**:
```bash
npm uninstall jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs
```

## Gradual Migration Strategy

Instead of protecting all routes at once:

1. **Phase 1**: Add auth system (all routes still public)
2. **Phase 2**: Make new routes protected
3. **Phase 3**: Gradually add middleware to existing routes
4. **Phase 4**: Deprecate unprotected endpoints

This allows clients to migrate gradually.

## Common Issues & Solutions

### Issue: "No se proporcionó token de autorización"
**Solution**: Make sure client sends `Authorization: Bearer <token>` header

### Issue: "Token inválido o expirado"
**Solution**: Token has expired. User needs to login again.

### Issue: "Credenciales incorrectas"
**Solution**: Email or password is wrong. Check database for user existence.

### Issue: Build fails with JWT type errors
**Solution**: Make sure @types/jsonwebtoken is installed and tsconfig is updated

### Issue: CORS errors
**Solution**: Update CORS configuration to allow Authorization header:
```typescript
this.app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Performance Considerations

- JWT validation is fast (< 1ms typically)
- No database queries needed to validate tokens
- Token expiration prevents database bloat
- Consider implementing refresh tokens for long-lived sessions

## Security Checklist

After migration, verify:

- [ ] JWT_SECRET is strong and unique
- [ ] JWT_SECRET is not committed to repository
- [ ] Token expiration is appropriate for your use case
- [ ] All sensitive routes are protected
- [ ] Passwords are properly hashed
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting is in place (recommended)

## Need Help?

- Check IMPLEMENTATION.md for complete documentation
- Review README.md for usage examples
- See QUICKSTART.md for setup guide
- Open an issue on GitHub

---

**Last Updated**: 2024
**Compatible With**: API Básico JWT v1.0.0+
