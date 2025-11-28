# Architettura Sistema

**Versione:** 1.0  
**Data:** 2025-11-03

---

## Stack Tecnologico

```
Frontend:      Next.js 16 + React 19 + Tailwind 4
Backend:       Node.js + Express
AI:            Claude API (Sonnet 4)
QR:            QR Engine esistente (13 tipi)
Database:      PostgreSQL 15
Cache:         Redis 7
Real-time:     WebSocket
Storage:       S3 / CDN
```

---

## Architettura High-Level

```
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  ┌──────────────────┬──────────────────────────┐ │
│  │  Chat/Form Area  │  Preview Panel (Artifact)│ │
│  │  (Switchable)    │  - Live QR               │ │
│  │                  │  - Gallery               │ │
│  │  [input]         │  - Comparisons           │ │
│  │  🤖 AI | ⚙️ Adv.  │                          │ │
│  └────────┬─────────┴────────────┬─────────────┘ │
└───────────┼────────────────────┼─────────────────┘
            │ WebSocket        │ REST
            │                  │
┌───────────▼──────────────────▼─────────────────┐
│                Backend (Node.js)                │
│  ┌──────────────────────────────────────────┐  │
│  │          AI Service Layer                │  │
│  │  ┌──────────────┬─────────────┬────────┐│  │
│  │  │Conversation  │Comprehension│Mode    ││  │
│  │  │Manager       │Score Engine │Selector││  │
│  │  └──────────────┴─────────────┴────────┘│  │
│  │  ┌──────────────────────────────────────┐│  │
│  │  │   Claude API Wrapper + Security      ││  │
│  │  └──────────────────────────────────────┘│  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │    QR Engine Integration (13 types)      │  │
│  │  - Generation  - Gallery  - Customization│  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
            ┌────────▼────────┐
            │  PostgreSQL +   │
            │  Redis Cache    │
            └─────────────────┘
```

---

## Componenti Core

### 1. Mode Selector

Rileva automaticamente modalità appropriata basandosi su segnali utente.

```typescript
class ModeSelector {
  detectMode(messages: Message[]): 'consultative' | 'fast_track' {
    const signals = {
      technical: this.countTechnicalTerms(messages),
      specific: this.hasSpecificRequests(messages),
      uncertain: this.detectUncertainty(messages),
      urgency: this.detectUrgencySignals(messages)
    };
    
    // Esperto: technical + specific + urgency
    if (signals.technical > 3 && signals.specific && signals.urgency) {
      return 'fast_track';
    }
    
    // Incerto: domande + incertezza
    if (signals.uncertain > 2 || messages.some(m => m.content.includes('?'))) {
      return 'consultative';
    }
    
    return 'consultative'; // default sicuro
  }
  
  private countTechnicalTerms(messages: Message[]): number {
    const technicalTerms = [
      'vcard', 'wpa2', 'formato', 'risoluzione', 'dpi',
      'api', 'webhook', 'schema', 'endpoint'
    ];
    
    let count = 0;
    messages.forEach(m => {
      technicalTerms.forEach(term => {
        if (m.content.toLowerCase().includes(term)) count++;
      });
    });
    
    return count;
  }
  
  private detectUrgencySignals(messages: Message[]): boolean {
    const urgencyKeywords = ['veloce', 'quick', 'fast', 'urgent', 'subito', 'now'];
    return messages.some(m => 
      urgencyKeywords.some(keyword => 
        m.content.toLowerCase().includes(keyword)
      )
    );
  }
}
```

---

### 2. Comprehension Score Engine

Valuta comprensione utente attraverso 5 dimensioni.

```typescript
interface Score {
  sector: number;      // 0-20
  useCase: number;     // 0-20
  budget: number;      // 0-20
  brand: number;       // 0-20
  goals: number;       // 0-20
  total: number;       // 0-100
  profile: ProfileData;
}

class ComprehensionEngine {
  async evaluate(
    conversation: Message[], 
    userProfile?: ClientProfile
  ): Promise<Score> {
    // Parti da profilo esistente se disponibile
    let baseScore = userProfile?.comprehensionScore || 0;
    
    const extracted = {
      sector: this.detectSector(conversation) || userProfile?.sector,
      useCase: this.detectUseCase(conversation),
      budget: this.inferBudget(conversation, userProfile),
      brand: this.extractBrand(conversation, userProfile),
      goals: this.identifyGoals(conversation)
    };
    
    return {
      sector: extracted.sector ? 20 : 0,
      useCase: extracted.useCase ? 20 : 0,
      budget: extracted.budget ? 20 : 0,
      brand: extracted.brand ? 20 : 0,
      goals: extracted.goals ? 20 : 0,
      total: this.calculateTotal(extracted),
      profile: extracted
    };
  }
  
  private detectSector(messages: Message[]): string | null {
    const sectorKeywords = {
      'f&b': ['ristorante', 'bar', 'hotel', 'menu', 'cibo'],
      'retail': ['negozio', 'shop', 'vendita', 'prodotto'],
      'fashion': ['moda', 'abbigliamento', 'boutique', 'brand'],
      'events': ['evento', 'conferenza', 'matrimonio', 'party'],
      'real-estate': ['immobiliare', 'casa', 'appartamento', 'agenzia']
    };
    
    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      for (const msg of messages) {
        if (keywords.some(kw => msg.content.toLowerCase().includes(kw))) {
          return sector;
        }
      }
    }
    
    return null;
  }
}
```

---

### 3. Unified Profile Manager

Raccoglie dati da chat E form standard.

```typescript
interface ClientProfile {
  userId: string;
  sector?: string;
  brand?: {
    colors: string[];
    logo: string;
    style: string;
  };
  preferences: {
    qrTypesUsed: string[];
    colorsUsed: string[];
    customization: string;
  };
  comprehensionScore: number;
  aiSessions: number;
  standardSessions: number;
  lastUpdated: Date;
}

class ProfileManager {
  async enrichProfile(
    userId: string, 
    data: ProfileData
  ): Promise<void> {
    const profile = await this.getProfile(userId);
    
    // Merge nuovi dati
    if (data.source === 'chat') {
      profile.aiSessions++;
      profile.preferences = { 
        ...profile.preferences, 
        ...data.chat 
      };
    } else {
      profile.standardSessions++;
      profile.preferences.qrTypesUsed.push(data.qrType);
      profile.preferences.colorsUsed.push(...data.colors);
    }
    
    // Ricalcola comprehension score
    profile.comprehensionScore = this.calculateScore(profile);
    
    await this.saveProfile(userId, profile);
  }
  
  private calculateScore(profile: ClientProfile): number {
    let score = 0;
    
    if (profile.sector) score += 20;
    if (profile.preferences.qrTypesUsed.length > 0) score += 20;
    if (profile.brand) score += 20;
    if (profile.preferences.customization) score += 20;
    if (profile.aiSessions + profile.standardSessions > 3) score += 20;
    
    return score;
  }
}
```

---

### 4. Gallery Manager

Pre-genera e cache esempi QR per settori.

```typescript
class GalleryManager {
  async getExamples(
    sector: string, 
    limit: number = 10
  ): Promise<QRExample[]> {
    // Cache-first strategy
    const cached = await redis.get(`gallery:${sector}`);
    if (cached) return JSON.parse(cached);
    
    // Query gallery pre-generata
    const examples = await db.query(
      `SELECT * FROM qr_gallery 
       WHERE sector = $1 
       ORDER BY usage_count DESC 
       LIMIT $2`,
      [sector, limit]
    );
    
    // Cache 1 ora
    await redis.setex(
      `gallery:${sector}`, 
      3600, 
      JSON.stringify(examples)
    );
    
    return examples;
  }
  
  async trackUsage(exampleId: string): Promise<void> {
    await db.query(
      `UPDATE qr_gallery 
       SET usage_count = usage_count + 1 
       WHERE id = $1`,
      [exampleId]
    );
  }
}
```

---

## Database Schema

### Tabelle AI

```sql
-- Conversazioni AI
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Dati conversazione
  messages JSONB NOT NULL DEFAULT '[]',
  current_qr JSONB,
  language VARCHAR(10),
  
  -- Tracking upsell
  upsells_shown TEXT[] DEFAULT '{}',
  upsells_accepted TEXT[] DEFAULT '{}',
  conversion_intent INTEGER DEFAULT 0,
  
  -- Metadata
  country VARCHAR(2),
  device_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Analytics
  message_count INTEGER DEFAULT 0,
  qrs_generated INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0
);

-- Messaggi AI (log dettagliato)
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  
  -- Metadata
  tokens_used INTEGER,
  response_time_ms INTEGER,
  language VARCHAR(10),
  
  -- Security
  was_filtered BOOLEAN DEFAULT false,
  filter_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eventi Upsell
CREATE TABLE upsell_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  
  -- Dettagli upsell
  upsell_type VARCHAR(50) NOT NULL, -- 'artistic', 'bundle', 'logo'
  shown_at TIMESTAMP NOT NULL,
  
  -- Azione utente
  action VARCHAR(20), -- 'accepted', 'declined', 'ignored'
  action_at TIMESTAMP,
  
  -- Impatto finanziario
  original_price NUMERIC,
  upsell_price NUMERIC,
  revenue_impact NUMERIC,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral Virali
CREATE TABLE viral_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer
  referrer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Referee
  referee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referee_email VARCHAR(255),
  
  -- Tracking
  channel VARCHAR(50), -- 'facebook', 'twitter', 'email', 'direct'
  signed_up_at TIMESTAMP,
  first_purchase_at TIMESTAMP,
  
  -- Rewards
  reward_type VARCHAR(50), -- 'discount', 'free_qr', 'points'
  reward_value NUMERIC,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracking Costi AI
CREATE TABLE ai_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dettagli request
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Usage
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  
  -- Costo (in USD)
  cost NUMERIC(10, 6) NOT NULL,
  
  -- Metadata
  model VARCHAR(50) NOT NULL, -- 'claude-sonnet-4'
  response_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profili Cliente
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  sector VARCHAR(50),
  brand JSONB, -- {colors, logo, style}
  preferences JSONB, -- {qrTypesUsed, colorsUsed, customization}
  
  comprehension_score INTEGER DEFAULT 0,
  ai_sessions INTEGER DEFAULT 0,
  standard_sessions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery QR Pre-Generati
CREATE TABLE qr_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector VARCHAR(50) NOT NULL,
  qr_type VARCHAR(50) NOT NULL,
  
  preview_url TEXT NOT NULL,
  metadata JSONB NOT NULL,
  
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_last_activity ON ai_conversations(last_activity);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX idx_upsell_events_conversation_id ON upsell_events(conversation_id);
CREATE INDEX idx_upsell_events_action ON upsell_events(action);
CREATE INDEX idx_viral_referrals_referrer ON viral_referrals(referrer_user_id);
CREATE INDEX idx_viral_referrals_code ON viral_referrals(referral_code);
CREATE INDEX idx_ai_costs_user_id ON ai_costs(user_id);
CREATE INDEX idx_ai_costs_created_at ON ai_costs(created_at);
CREATE INDEX idx_qr_gallery_sector ON qr_gallery(sector, qr_type);
```

### Views

```sql
-- Vista monitoraggio budget giornaliero
CREATE VIEW ai_budget_daily AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as request_count,
  SUM(total_tokens) as total_tokens,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost_per_request,
  AVG(response_time_ms) as avg_response_time
FROM ai_costs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Vista funnel conversione
CREATE VIEW ai_conversion_funnel AS
SELECT
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT CASE WHEN c.message_count >= 3 THEN c.id END) as engaged,
  COUNT(DISTINCT CASE WHEN c.qrs_generated > 0 THEN c.id END) as generated,
  COUNT(DISTINCT CASE WHEN c.total_spent > 0 THEN c.id END) as paid,
  ROUND(
    COUNT(DISTINCT CASE WHEN c.total_spent > 0 THEN c.id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT c.id), 0) * 100, 
    2
  ) as conversion_rate,
  ROUND(AVG(c.total_spent), 2) as avg_revenue
FROM ai_conversations c
WHERE c.created_at >= NOW() - INTERVAL '30 days';
```

---

## API Endpoints

### REST API

#### POST /api/ai/chat/start
Inizializza nuova sessione conversazione.

**Request:**
```json
{
  "userId": "uuid",      // opzionale
  "language": "it",      // opzionale, auto-detect
  "initialMessage": ""   // opzionale
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "sessionId": "uuid",
    "language": "it",
    "wsUrl": "ws://api.gudbro.com/ai/ws/uuid"
  }
}
```

---

#### POST /api/ai/chat/:sessionId/message
Invia messaggio a AI (alternativa a WebSocket).

**Request:**
```json
{
  "message": "Serve QR per menu ristorante",
  "context": {
    "url": "string",    // opzionale
    "qrId": "uuid"      // opzionale
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "message": "Perfetto! URL menu?",
    "language": "it",
    "qrPreview": {
      "type": "menu",
      "previewUrl": "https://cdn.gudbro.com/previews/uuid.png",
      "data": {}
    },
    "upsell": {
      "type": "artistic",
      "title": "Upgrade a QR Artistico",
      "description": "40% scan in più con design professionale",
      "comparison": {
        "basic": "url",
        "artistic": "url"
      },
      "price": {
        "current": 100000,
        "upgraded": 300000,
        "currency": "VND"
      }
    }
  }
}
```

---

#### POST /api/ai/upsell/:sessionId/respond
Risposta utente a suggerimento upsell.

**Request:**
```json
{
  "upsellType": "artistic",
  "action": "accepted" | "declined" | "request_info"
}
```

---

#### POST /api/ai/qr/:sessionId/generate
Finalizza e genera QR code.

**Request:**
```json
{
  "confirm": true,
  "paymentMethod": "stripe" | "momo" | "free_tier"
}
```

**Response:**
```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "menu",
    "downloadUrl": "url",
    "editUrl": "url",
    "scanUrl": "url"
  },
  "viralPrompt": {
    "show": true,
    "rewards": [
      {
        "action": "share_social",
        "reward": "20% sconto prossimo QR",
        "code": "SHARE20-XXXX"
      }
    ]
  }
}
```

---

### WebSocket Protocol

**Connection:**
```javascript
const ws = new WebSocket('wss://api.gudbro.com/ai/ws/:sessionId');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleAIMessage(data);
};
```

**Message Types:**

Client → Server:
```json
// Messaggio utente
{
  "type": "user_message",
  "content": "Serve QR",
  "timestamp": "2025-11-03T10:30:00Z"
}

// Typing indicator
{
  "type": "user_typing",
  "isTyping": true
}
```

Server → Client:
```json
// Messaggio AI (streaming)
{
  "type": "ai_message_chunk",
  "content": "Perfetto!",
  "isComplete": false
}

// Preview update
{
  "type": "preview_update",
  "qrPreview": {}
}

// Upsell suggestion
{
  "type": "upsell_suggestion",
  "upsell": {}
}
```

---

## Rate Limiting

```javascript
const RATE_LIMITS = {
  free: {
    messages: 10,
    period: 300,        // 5 minuti
    qrGeneration: 5,
    qrPeriod: 86400     // 1 giorno
  },
  paid: {
    messages: 50,
    period: 300,
    qrGeneration: 100,
    qrPeriod: 86400
  }
};
```

**Implementazione:**
```typescript
class AIRateLimiter {
  async checkLimit(
    identifier: string,
    tier: 'free' | 'paid' = 'free'
  ): Promise<RateLimitResult> {
    const limits = RATE_LIMITS[tier];
    const key = `ratelimit:ai:${tier}:${identifier}`;
    
    const current = await redis.get(key);
    const count = parseInt(current || '0');
    
    if (count >= limits.messages) {
      const ttl = await redis.ttl(key);
      throw new RateLimitError({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Limite raggiunto. Attendi ${ttl}s`,
        retryAfter: ttl
      });
    }
    
    await redis.multi()
      .incr(key)
      .expire(key, limits.period)
      .exec();
    
    return {
      allowed: true,
      remaining: limits.messages - count - 1
    };
  }
}
```

---

**Prossimo:** [System Prompts](04-SYSTEM-PROMPTS.md)
