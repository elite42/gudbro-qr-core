# Piano Implementazione

**Versione:** 1.0  
**Data:** 2025-11-03  
**Durata:** 4 settimane (160 ore)

---

## Week 1: MVP Foundation (40h)

### Day 1-2: Backend Setup (16h)

**Obiettivi:**
- Database schema migration
- AI Service skeleton
- Claude API integration
- Conversation Manager base
- Rate limiting (Redis)
- Security middleware
- Error handling base

**Deliverable:**
```
✓ Migration V11 applicata
✓ Tabelle: ai_conversations, ai_messages, ai_costs
✓ AI Service risponde a ping
✓ Claude API connessa
✓ Rate limiting funzionante
✓ Logging strutturato
```

**Comandi:**
```bash
# Migration
npm run migrate:up -- V11_ai_qr_creator

# Test
npm test -- ai-service
npm test -- rate-limiter
```

---

### Day 3-4: Frontend Chat UI (16h)

**Obiettivi:**
- Chat interface component
- Message list con typing indicators
- Input con auto-focus
- WebSocket connection
- Preview panel (base)
- Layout responsive mobile

**Componenti:**
```typescript
<AIChat>
  <ChatMessages messages={messages} />
  <TypingIndicator isTyping={isAITyping} />
  <ChatInput onSend={handleSend} />
</AIChat>

<PreviewPanel>
  <QRPreview qr={currentQR} />
  <Actions onDownload={...} onEdit={...} />
</PreviewPanel>
```

**Deliverable:**
```
✓ UI chat funzionale
✓ WebSocket connesso
✓ Messaggi invio/ricezione
✓ Preview statica
✓ Mobile responsive
```

---

### Day 5: Integration (8h)

**Obiettivi:**
- Connetti frontend ↔ backend
- Test WebSocket reliability
- QR Engine integration
- Payment flow stub
- Analytics tracking base

**Test:**
```typescript
describe('End-to-End Chat Flow', () => {
  it('completa creazione QR via chat', async () => {
    await startChat();
    await sendMessage("Menu QR");
    await sendMessage("https://menu.com");
    expect(await hasPreview()).toBe(true);
  });
});
```

**Deliverable:**
```
✓ Chat completa funzionante
✓ AI risponde in <1s
✓ 5 tipi QR supportati (URL, vCard, Menu, VietQR, Zalo)
✓ Preview base
✓ No upsells ancora
```

---

## Week 2: Upselling & Intelligence (40h)

### Day 6-7: Upsell Engine (16h)

**Obiettivi:**
- Sistema trigger upsell
- Valutatore condizioni
- Generatore comparazioni (base vs artistico)
- Upsell modal UI
- Flusso accept/decline
- Tracking eventi

**Componenti:**
```typescript
class UpsellEngine {
  async evaluate(
    context: ConversationContext,
    response: AIResponse
  ): Promise<Upsell | null> {
    // Check conditions
    if (!this.shouldSuggest(context)) return null;
    
    // Generate comparison
    const comparison = await this.generateComparison(
      response.qrData
    );
    
    return {
      type: this.detectUpsellType(context),
      comparison,
      price: this.calculatePrice(context)
    };
  }
}
```

**Deliverable:**
```
✓ Upsell system funzionale
✓ 3 tipi: artistic, logo, bundle
✓ Comparazioni visive
✓ Modal UI polished
✓ Tracking completo
```

---

### Day 8-9: System Prompt Optimization (16h)

**Obiettivi:**
- Master prompt finalization
- Test detection tipo QR
- Test multilingual (5 lingue)
- Test rejection off-topic
- Test injection defense

**Lingue:**
- Italiano
- English
- Tiếng Việt
- 한국어 (Korean)
- 中文 (Chinese)

**Test Suite:**
```typescript
describe('System Prompt', () => {
  test('rileva tipo QR da linguaggio naturale', async () => {
    const responses = {
      "menu ristorante": "menu",
      "biglietto visita": "vcard",
      "pagamento VietQR": "vietqr"
    };
    
    for (const [input, expected] of Object.entries(responses)) {
      const qrType = await ai.detectQRType(input);
      expect(qrType).toBe(expected);
    }
  });
  
  test('rifiuta off-topic', async () => {
    const offTopic = [
      "che tempo fa?",
      "scrivimi una poesia",
      "chi ha vinto le elezioni?"
    ];
    
    for (const question of offTopic) {
      const response = await ai.chat(question);
      expect(response).toContain("QR code");
    }
  });
});
```

**Deliverable:**
```
✓ Accuracy >95% detection tipo QR
✓ 5 lingue testate
✓ Off-topic rejection funzionante
✓ Injection defense attivo
```

---

### Day 10: Preview & Polish (8h)

**Obiettivi:**
- Live preview updates
- Comparazione side-by-side
- Stats visualization
- Ottimizzazione mobile
- Loading states

**UI Components:**
```typescript
<ComparisonView>
  <PreviewCard 
    title="Base" 
    qr={basicQR}
    price={100000}
  />
  <VSIndicator />
  <PreviewCard 
    title="Artistico" 
    qr={artisticQR}
    price={300000}
    badge="40% più scan"
  />
</ComparisonView>
```

**Deliverable:**
```
✓ Preview aggiornamenti real-time
✓ Comparazioni polished
✓ Mobile ottimizzato
✓ Loading smooth
```

---

## Week 3: Viral Loop & Advanced (40h)

### Day 11-12: Viral Loop (16h)

**Obiettivi:**
- Generazione codici referral
- Modal share social
- Integrazione link review
- Sistema rewards
- Tracking referral
- Dashboard analytics

**Database:**
```sql
CREATE TABLE viral_referrals (
  referral_code VARCHAR(20) UNIQUE,
  referrer_user_id UUID,
  referee_user_id UUID,
  channel VARCHAR(50),
  reward_type VARCHAR(50),
  reward_claimed BOOLEAN
);
```

**UI:**
```typescript
<ViralPrompt>
  <Reward 
    action="share_social"
    reward="20% sconto"
    code={generatedCode}
  />
  <Reward 
    action="write_review"
    reward="1 QR artistico gratis"
    url={reviewURL}
  />
  <SocialShareButtons />
</ViralPrompt>
```

**Deliverable:**
```
✓ Loop virale completo
✓ Codici referral generati
✓ Share tracking
✓ Rewards funzionanti
✓ Dashboard referral
```

---

### Day 13-14: Advanced QR Types (16h)

**Obiettivi:**
- Tutti 13 tipi QR integrati
- Accuracy detection tipo
- Validazione custom per tipo
- Preview per ogni tipo
- Test suite

**Tipi:**
```
Base: URL, vCard, Email, SMS, Phone, WiFi
Asia: VietQR, Zalo, WeChat, KakaoTalk, LINE  
Business: Menu, Business Page, Event, Feedback, Coupon
Media: PDF, Video, Audio, App Store
Advanced: Multi-URL, Artistic
```

**Deliverable:**
```
✓ 13 tipi QR supportati
✓ Detection >95% accuracy
✓ Validazione per ogni tipo
✓ Preview funzionanti
✓ 150+ tests passing
```

---

### Day 15: Payment Integration (8h)

**Obiettivi:**
- Integrazione Stripe/Momo
- Limiti free tier
- Logica pricing
- Generazione ricevute
- Flusso refund

**Payment Flow:**
```typescript
const processPayment = async (
  sessionId: string,
  method: 'stripe' | 'momo' | 'free_tier'
): Promise<PaymentResult> => {
  // Validate payment
  const amount = await calculateAmount(sessionId);
  
  if (method === 'free_tier') {
    return await handleFreeTier(sessionId);
  }
  
  // Process payment
  const payment = await paymentGateway.charge({
    amount,
    method,
    description: 'AI QR Creator'
  });
  
  // Generate QR
  const qr = await generateQR(sessionId);
  
  return { payment, qr };
};
```

**Deliverable:**
```
✓ Payment Stripe/Momo
✓ Free tier limits
✓ Receipt generation
✓ Refund flow
✓ Error handling
```

---

## Week 4: Testing, Optimization & Launch (40h)

### Day 16-17: Testing (16h)

**Test Coverage:**
```
Unit Tests (80+):
- AI Service (25)
- Upsell Engine (15)
- Mode Selector (10)
- Comprehension Score (15)
- Security (15)

Integration Tests (20+):
- Chat flow completo (5)
- Payment flow (3)
- Viral loop (3)
- API endpoints (9)

E2E Tests (10+):
- Conversazione consultativa (3)
- Fast track (2)
- Upsell acceptance (2)
- Off-topic rejection (1)
- Prompt injection (2)
```

**Performance Tests:**
```typescript
describe('Load Testing', () => {
  it('gestisce 100 utenti concorrenti', async () => {
    const users = Array(100).fill(null).map(() => 
      simulateUser()
    );
    
    const results = await Promise.all(users);
    
    expect(results.every(r => r.success)).toBe(true);
    expect(Math.max(...results.map(r => r.responseTime))).toBeLessThan(2000);
  });
});
```

**Deliverable:**
```
✓ 150+ tests passing
✓ Coverage >80%
✓ Load test passed (100 concurrent)
✓ Security audit passed
```

---

### Day 18: A/B Testing Framework (8h)

**Obiettivi:**
- Framework esperimenti
- Gestione varianti
- Tracking metriche per variante
- Admin dashboard
- Primo esperimento: Timing upsell

**Framework:**
```typescript
const experiment = await abTest.create({
  name: 'Upsell Timing',
  variants: [
    { id: 'control', weight: 0.5 },
    { id: 'early', weight: 0.25 },   // Mostra dopo 3 msg
    { id: 'late', weight: 0.25 }     // Mostra dopo 7 msg
  ],
  targetMetric: 'conversion_rate'
});

// Assign variant
const variant = await abTest.assignVariant(userId, experiment.id);

// Track conversion
await abTest.trackConversion(userId, experiment.id, 'conversion', 1);
```

**Deliverable:**
```
✓ A/B test framework
✓ Variant assignment
✓ Metrics tracking
✓ Admin dashboard
✓ 1 esperimento attivo
```

---

### Day 19: Optimization (8h)

**Obiettivi:**
- Response time <1s (p95)
- Cost optimization (ridurre tokens)
- Cache strategy
- Query optimization database
- CDN setup previews

**Ottimizzazioni:**
```typescript
// Cache frequently used prompts
const cachedPrompt = await redis.get(`prompt:${language}`);
if (cachedPrompt) return cachedPrompt;

// Compress images
const preview = await sharp(qrBuffer)
  .resize(400, 400)
  .webp({ quality: 80 })
  .toBuffer();

// Database connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});
```

**Targets:**
- Response time: <1s (p95)
- AI cost: <$0.02/session
- Page load: <2s
- Image load: <500ms

**Deliverable:**
```
✓ Response <1s p95
✓ Cost optimized
✓ Cache funzionante
✓ DB queries ottimizzate
✓ CDN configurato
```

---

### Day 20: Launch Prep (8h)

**Obiettivi:**
- Documentazione completa
- Training admin
- Script supporto
- Monitoring alerts
- Rollback plan
- Soft launch 10% utenti

**Checklist Pre-Launch:**
```
Infrastructure:
✓ Database migrated
✓ Redis configured
✓ CDN active
✓ Monitoring (Sentry, DataDog)

Security:
✓ Rate limiting active
✓ Injection defense tested
✓ Budget monitoring active
✓ CORS configured

Testing:
✓ 150+ tests passing
✓ Load test passed
✓ Security audit passed
✓ Manual QA complete

Documentation:
✓ API docs
✓ Admin guide
✓ Support scripts
✓ Troubleshooting guide
```

**Soft Launch:**
```typescript
// Feature flag
const AI_CREATOR_ENABLED = process.env.AI_CREATOR_ROLLOUT || 0.1;

const shouldShowAI = () => {
  return Math.random() < AI_CREATOR_ENABLED;
};
```

**Deliverable:**
```
✓ Docs complete
✓ Team trained
✓ Monitoring active
✓ Rollback tested
✓ Soft launch 10%
```

---

## Gestione Rischi

### Rischio: AI Cost Overrun
**Mitigazione:**
- Budget cap giornaliero: $200
- Alert al 80%
- Auto-disable al 100%
- Review giornaliero costi

### Rischio: Low Conversion
**Mitigazione:**
- A/B testing attivo Week 2
- Iterate prompts weekly
- User feedback loop
- Fallback a form standard

### Rischio: Security Breach
**Mitigazione:**
- Multi-layer defense
- Real-time monitoring
- Incident response plan
- Regular security audits

### Rischio: Performance Issues
**Mitigazione:**
- Load testing Week 4
- Cache strategy
- CDN for static assets
- Database optimization

---

## Success Criteria

### Week 1 (MVP)
- [ ] Chat funzionante
- [ ] 5 tipi QR supportati
- [ ] Response time <2s
- [ ] 0 critical bugs

### Week 2 (Upselling)
- [ ] Upsell system live
- [ ] 5 lingue testate
- [ ] Conversion rate >10%
- [ ] 80+ tests passing

### Week 3 (Advanced)
- [ ] 13 tipi QR completi
- [ ] Viral loop attivo
- [ ] Payment integrato
- [ ] 150+ tests passing

### Week 4 (Launch)
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Soft launch successful (10%)
- [ ] 0 critical issues

---

**Prossimo:** [Launch Checklist](08-LAUNCH-CHECKLIST.md)
