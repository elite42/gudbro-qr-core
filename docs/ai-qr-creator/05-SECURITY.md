# Sicurezza

**Versione:** 1.0  
**Data:** 2025-11-03

---

## Difesa Prompt Injection

### Pattern Rilevamento

```typescript
const INJECTION_PATTERNS = [
  // Tentativi istruzione diretta
  /ignore (previous|all|above) instructions?/gi,
  /disregard (previous|all|above) (instructions?|prompts?)/gi,
  /forget (everything|all|previous|above)/gi,
  /ignora (precedenti|tutte|sopra) istruzioni?/gi,
  
  // Manipolazione ruolo
  /you are now/gi,
  /new role:/gi,
  /act as/gi,
  /pretend (you are|to be)/gi,
  /ora sei/gi,
  /nuovo ruolo:/gi,
  
  // Estrazione system prompt
  /show (me )?(your|the) (system )?prompt/gi,
  /what('?s| is) your (system )?prompt/gi,
  /repeat (your|the) instructions/gi,
  /mostra(mi)? (il tuo|il) prompt/gi,
  /qual è il tuo prompt/gi,
  
  // Token speciali
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  
  // Jailbreak attempts
  /DAN mode/gi,
  /developer mode/gi,
  /sudo mode/gi
];

const detectInjection = (message: string): InjectionResult => {
  const detected = INJECTION_PATTERNS.filter(pattern => 
    pattern.test(message)
  );
  
  if (detected.length > 0) {
    return {
      isInjection: true,
      patterns: detected.map(p => p.source),
      severity: detected.length > 2 ? 'high' : 'medium'
    };
  }
  
  return { isInjection: false };
};
```

---

### Gestione Injection

```typescript
const handleInjection = async (
  sessionId: string,
  message: string,
  detection: InjectionResult
) => {
  // Log evento sicurezza
  await logSecurityEvent({
    type: 'PROMPT_INJECTION_ATTEMPT',
    sessionId,
    message: message.substring(0, 500), // Truncate per privacy
    patterns: detection.patterns,
    severity: detection.severity,
    timestamp: new Date()
  });
  
  // Incrementa contatore tentativi
  const attempts = await redis.incr(`security:injection:${sessionId}`);
  
  // Blocca dopo 3 tentativi
  if (attempts >= 3) {
    await redis.setex(
      `security:blocked:${sessionId}`, 
      3600,  // Blocco 1 ora
      '1'
    );
    throw new SecurityError({
      code: 'TOO_MANY_VIOLATIONS',
      message: 'Sessione bloccata per attività sospette'
    });
  }
  
  // Ritorna errore generico (non rivelare detection)
  return {
    message: "Sono qui per aiutarti a creare QR codes. Dimmi cosa ti serve!",
    warning: attempts >= 2 
      ? 'Rimani in tema o la sessione sarà sospesa.' 
      : undefined
  };
};
```

---

## Controllo Costi

### Monitoraggio Budget

```typescript
class BudgetMonitor {
  private readonly DAILY_BUDGET = 200; // $200/giorno
  private readonly ALERT_THRESHOLD = 0.8; // 80%
  
  async checkBudget(): Promise<BudgetStatus> {
    const today = new Date().toISOString().split('T')[0];
    const spent = await this.getTodaySpending(today);
    
    const status: BudgetStatus = {
      budget: this.DAILY_BUDGET,
      spent,
      remaining: this.DAILY_BUDGET - spent,
      percentage: (spent / this.DAILY_BUDGET) * 100
    };
    
    // Alert se vicino al limite
    if (status.percentage >= this.ALERT_THRESHOLD * 100) {
      await this.sendBudgetAlert(status);
    }
    
    // Blocca se superato
    if (spent >= this.DAILY_BUDGET) {
      throw new BudgetExceededError({
        code: 'DAILY_BUDGET_EXCEEDED',
        message: 'Servizio AI temporaneamente non disponibile. Riprova domani.',
        resetAt: this.getTomorrowMidnight()
      });
    }
    
    return status;
  }
  
  private async getTodaySpending(date: string): Promise<number> {
    const result = await db.query(
      `SELECT COALESCE(SUM(cost), 0) as total
       FROM ai_costs
       WHERE DATE(created_at) = $1`,
      [date]
    );
    
    return parseFloat(result.rows[0].total);
  }
  
  private async sendBudgetAlert(status: BudgetStatus): Promise<void> {
    await notificationService.send({
      channel: 'slack',
      message: `⚠️ AI Budget Alert: ${status.percentage.toFixed(1)}% usato ($${status.spent.toFixed(2)}/$${status.budget})`
    });
  }
}
```

---

### Tracking Costi Per-Request

```typescript
const trackAICost = async (
  conversationId: string,
  userId: string,
  tokens: TokenUsage,
  responseTime: number
) => {
  // Pricing Claude (approssimativo)
  const PRICE_PER_1K_INPUT = 0.003;   // $3 per 1M input tokens
  const PRICE_PER_1K_OUTPUT = 0.015;  // $15 per 1M output tokens
  
  const cost = (
    (tokens.input / 1000) * PRICE_PER_1K_INPUT +
    (tokens.output / 1000) * PRICE_PER_1K_OUTPUT
  );
  
  await db.query(
    `INSERT INTO ai_costs 
     (conversation_id, user_id, input_tokens, output_tokens, 
      total_tokens, cost, model, response_time_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      conversationId,
      userId,
      tokens.input,
      tokens.output,
      tokens.input + tokens.output,
      cost,
      'claude-sonnet-4',
      responseTime
    ]
  );
  
  return cost;
};
```

---

## Validazione Input

### Sanitizzazione Messaggi

```typescript
const sanitizeMessage = (message: string): SanitizedMessage => {
  let sanitized = message;
  
  // Limite lunghezza
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  // Rimuovi pattern pericolosi
  INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  });
  
  // Rimuovi whitespace eccessivo
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Check se modificato pesantemente
  const modificationRate = 
    (message.length - sanitized.length) / message.length;
  
  return {
    original: message,
    sanitized,
    wasModified: modificationRate > 0.1,
    modificationRate
  };
};
```

---

### Validazione Session

```typescript
class SessionValidator {
  async validateSession(sessionId: string): Promise<SessionStatus> {
    // Check se bloccata
    const blocked = await redis.get(`security:blocked:${sessionId}`);
    if (blocked) {
      throw new SecurityError({
        code: 'SESSION_BLOCKED',
        message: 'Sessione bloccata per violazioni sicurezza'
      });
    }
    
    // Check età sessione
    const session = await this.getSession(sessionId);
    const age = Date.now() - session.createdAt.getTime();
    
    if (age > 3600000) { // 1 ora
      throw new SessionExpiredError({
        code: 'SESSION_EXPIRED',
        message: 'Sessione scaduta. Inizia nuova conversazione.'
      });
    }
    
    // Check rate limit
    await rateLimiter.checkLimit(sessionId);
    
    return { valid: true, session };
  }
}
```

---

## Rate Limiting

### Implementazione Redis

```typescript
class RateLimiter {
  private readonly limits = {
    free: { messages: 10, window: 300 },      // 10 msg/5min
    paid: { messages: 50, window: 300 },      // 50 msg/5min
    ip: { messages: 100, window: 3600 }       // 100 msg/ora per IP
  };
  
  async checkLimit(
    identifier: string,
    tier: 'free' | 'paid' | 'ip' = 'free'
  ): Promise<void> {
    const limit = this.limits[tier];
    const key = `ratelimit:${tier}:${identifier}`;
    
    const current = await redis.get(key);
    const count = parseInt(current || '0');
    
    if (count >= limit.messages) {
      const ttl = await redis.ttl(key);
      
      // Log per analytics
      await this.logRateLimit(identifier, tier);
      
      throw new RateLimitError({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Troppi messaggi. Attendi ${ttl} secondi.`,
        retryAfter: ttl,
        limit: limit.messages,
        window: limit.window
      });
    }
    
    // Incrementa counter con expiry
    await redis.multi()
      .incr(key)
      .expire(key, limit.window)
      .exec();
  }
  
  private async logRateLimit(
    identifier: string, 
    tier: string
  ): Promise<void> {
    await db.query(
      `INSERT INTO rate_limit_events 
       (identifier, tier, timestamp)
       VALUES ($1, $2, NOW())`,
      [identifier, tier]
    );
  }
}
```

---

### Rate Limit Multi-Livello

```typescript
class MultiLevelRateLimiter {
  async checkAllLimits(req: Request): Promise<void> {
    const checks = [
      // Per user
      this.checkUserLimit(req.userId),
      
      // Per session
      this.checkSessionLimit(req.sessionId),
      
      // Per IP
      this.checkIPLimit(req.ip),
      
      // Per API key (se presente)
      req.apiKey && this.checkAPIKeyLimit(req.apiKey)
    ];
    
    await Promise.all(checks.filter(Boolean));
  }
  
  private async checkUserLimit(userId: string): Promise<void> {
    const tier = await this.getUserTier(userId);
    await rateLimiter.checkLimit(userId, tier);
  }
  
  private async checkIPLimit(ip: string): Promise<void> {
    // Più restrittivo per IP non autenticati
    await rateLimiter.checkLimit(ip, 'ip');
  }
}
```

---

## CORS & Headers Sicurezza

```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://qr.gudbro.com',
      'https://app.gudbro.com',
      process.env.NODE_ENV === 'development' && 'http://localhost:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  maxAge: 86400 // 24 ore
};

app.use(cors(corsOptions));
```

---

## Audit Logging

```typescript
class SecurityAuditLogger {
  async log(event: SecurityEvent): Promise<void> {
    await db.query(
      `INSERT INTO security_audit_log 
       (event_type, severity, user_id, session_id, 
        ip_address, user_agent, details, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        event.type,
        event.severity,
        event.userId,
        event.sessionId,
        event.ip,
        event.userAgent,
        JSON.stringify(event.details)
      ]
    );
    
    // Alert per eventi high severity
    if (event.severity === 'high') {
      await this.sendSecurityAlert(event);
    }
  }
  
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    await notificationService.send({
      channel: 'slack',
      priority: 'high',
      message: `🚨 Security Event: ${event.type}\nUser: ${event.userId}\nDetails: ${JSON.stringify(event.details, null, 2)}`
    });
  }
}
```

---

## Input Validation Schema

```typescript
import Joi from 'joi';

const messageSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .custom((value, helpers) => {
      // Check injection patterns
      const detection = detectInjection(value);
      if (detection.isInjection) {
        return helpers.error('message.injection');
      }
      return value;
    }),
  
  context: Joi.object({
    url: Joi.string().uri(),
    qrId: Joi.string().uuid()
  }).optional()
});

const validateMessage = (req, res, next) => {
  const { error } = messageSchema.validate(req.body);
  
  if (error) {
    if (error.message.includes('injection')) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Messaggio contiene contenuto non valido'
      });
    }
    
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details[0].message
    });
  }
  
  next();
};
```

---

## Checklist Sicurezza

### Pre-Launch

- [ ] Tutti pattern injection testati
- [ ] Rate limiting funzionante su tutti endpoint
- [ ] Budget monitoring attivo
- [ ] Audit logging configurato
- [ ] CORS configurato correttamente
- [ ] Security headers impostati
- [ ] Input validation su tutti endpoint
- [ ] Session validation implementata
- [ ] Error handling non rivela info sensibili
- [ ] Secrets in environment variables (non hardcoded)

### Post-Launch Monitoring

- [ ] Review giornaliero security logs
- [ ] Alert configurati per eventi high severity
- [ ] Budget usage monitorato
- [ ] Rate limit events analizzati
- [ ] Pattern injection nuovi identificati
- [ ] Aggiornamento pattern injection mensile

---

## Incident Response Plan

### Step 1: Rilevamento
- Alert automatici su eventi high severity
- Review manuale giornaliero logs
- User reports via support

### Step 2: Valutazione
- Severità: low / medium / high / critical
- Impatto: numero utenti / dati / costi
- Urgenza: immediata / alta / media / bassa

### Step 3: Contenimento
- Block session/user/IP se necessario
- Disable feature se compromessa
- Isola sistema se necessario

### Step 4: Eradicazione
- Identifica causa root
- Patch vulnerability
- Update security patterns

### Step 5: Recovery
- Re-enable sistemi
- Monitora strettamente
- Comunica a utenti se necessario

### Step 6: Post-Mortem
- Documenta incidente
- Identifica lesson learned
- Update procedures
- Train team

---

**Prossimo:** [Analytics](06-ANALYTICS.md)
