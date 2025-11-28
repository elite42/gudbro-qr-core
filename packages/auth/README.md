# 🔐 Authentication Service

Sistema di autenticazione JWT con gestione utenti, refresh tokens e password reset.

## Features

✅ **Registrazione e Login**
- Validazione email e password robusta
- Password hashing con bcrypt (10 rounds)
- Email sanitization

✅ **JWT Tokens**
- Access token (15 minuti)
- Refresh token (7 giorni)
- Token revocation su logout
- Automatic token cleanup

✅ **Password Security**
- Password reset con token temporanei (1 ora)
- Password strength validation
- Revoca di tutti i token su reset password

✅ **User Roles & Plans**
- Ruoli: `admin`, `user`
- Piani: `free`, `basic`, `pro`, `enterprise`
- Middleware per controllo permessi

✅ **Security**
- Rate limiting aggressivo
  - Login: 5 tentativi / 15 min
  - Register: 3 tentativi / ora
  - Password reset: 3 tentativi / ora
- CORS configurabile
- Helmet security headers
- SQL injection protection (parametrized queries)

## API Endpoints

### POST /auth/register
Registra nuovo utente

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Mario Rossi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrazione completata con successo",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Mario Rossi",
      "role": "user",
      "plan": "free"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": "15m"
    }
  }
}
```

### POST /auth/login
Login utente

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as register

### POST /auth/refresh
Rinnova access token

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": "15m"
  }
}
```

### POST /auth/logout
Logout utente (revoca refresh token)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."  // Optional, revokes all if missing
}
```

### POST /auth/reset-password-request
Richiedi reset password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Se l'email esiste, riceverai le istruzioni"
}
```

### POST /auth/reset-password
Reset password con token

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "NewSecurePass456"
}
```

### GET /auth/me
Ottieni info utente corrente

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Mario Rossi",
      "role": "user",
      "plan": "free",
      "emailVerified": false,
      "createdAt": "2025-11-01T10:00:00Z",
      "lastLogin": "2025-11-01T12:00:00Z"
    }
  }
}
```

## Middleware Usage

### Proteggere una route (autenticazione richiesta)

```javascript
const { authenticateToken } = require('@gudbro/auth/middleware/authMiddleware');

router.get('/protected', authenticateToken, (req, res) => {
  // req.user è disponibile
  res.json({ user: req.user });
});
```

### Richiedere ruolo admin

```javascript
const { authenticateToken, requireAdmin } = require('@gudbro/auth/middleware/authMiddleware');

router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  // Solo admin possono accedere
});
```

### Richiedere piano specifico

```javascript
const { authenticateToken, requirePlan } = require('@gudbro/auth/middleware/authMiddleware');

router.post('/bulk-qr', authenticateToken, requirePlan('pro'), (req, res) => {
  // Solo utenti pro+ possono accedere
});
```

### Autenticazione opzionale

```javascript
const { optionalAuth } = require('@gudbro/auth/middleware/authMiddleware');

router.get('/public', optionalAuth, (req, res) => {
  // req.user è null se non autenticato, altrimenti contiene user info
  if (req.user) {
    res.json({ message: 'Benvenuto ' + req.user.name });
  } else {
    res.json({ message: 'Benvenuto ospite' });
  }
});
```

### Richiedere ownership

```javascript
const { authenticateToken, requireOwnership } = require('@gudbro/auth/middleware/authMiddleware');

router.get('/qr/:userId', authenticateToken, requireOwnership, (req, res) => {
  // Solo il proprietario o admin possono accedere
});
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/qrplatform

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (MUST BE CHANGED IN PRODUCTION!)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3020

# Server
AUTH_PORT=3013
NODE_ENV=production

# Frontend URL (for password reset emails)
FRONTEND_URL=https://your-domain.com
```

## Password Requirements

- Minimo 8 caratteri
- Massimo 100 caratteri
- Almeno una lettera maiuscola
- Almeno una lettera minuscola
- Almeno un numero

**Raccomandato:**
- Caratteri speciali (!@#$%^&*)
- Lunghezza >= 12 caratteri

## Security Best Practices

1. **JWT Secrets**: Genera secrets casuali di almeno 32 caratteri
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **HTTPS Only**: In produzione, usa sempre HTTPS

3. **Environment Variables**: Non commitare mai `.env` con secrets reali

4. **Token Storage**:
   - Access token: Memoria (non localStorage)
   - Refresh token: httpOnly cookie (preferito) o secure storage

5. **Rate Limiting**: Già configurato, ma puoi personalizzare in `server.js`

## Database Schema

Il modulo usa queste tabelle:

- `users` - Utenti (enhanced con role, email_verified, is_active)
- `refresh_tokens` - Token di refresh con expiry e revocation
- `password_resets` - Token per reset password

Vedi `/shared/database/migration_v5_auth_system.sql` per lo schema completo.

## Development

```bash
# Installa dipendenze
npm install

# Sviluppo con auto-reload
npm run dev

# Produzione
npm start
```

## Testing

```bash
# Test registrazione
curl -X POST http://localhost:3013/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test login
curl -X POST http://localhost:3013/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test /me con token
curl http://localhost:3013/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Integration Example

```javascript
// Altri moduli possono usare il middleware auth
const express = require('express');
const { authenticateToken, requirePlan } = require('../auth/middleware/authMiddleware');

const router = express.Router();

// Route protetta
router.post('/qr', authenticateToken, async (req, res) => {
  const userId = req.user.id;  // User ID dal token

  // Crea QR code per questo utente
  // ...
});

// Route solo per utenti pro
router.post('/bulk', authenticateToken, requirePlan('pro'), async (req, res) => {
  // Feature premium
  // ...
});

module.exports = router;
```

## License

MIT
