# Mappa Documenti - AI QR Creator

**Percorso base:** `/Users/gianfrancodagostino/Desktop/qr-platform-complete/docs/ai-qr-creator/`

---

## File Disponibili

### 📋 Indice
**File:** `README.md`  
**Quando usare:** Overview generale, quick links  
**Leggi per:** Capire struttura documentazione

---

### 🎯 Strategia e Business
**File:** `01-VISION-STRATEGY.md`  
**Contenuto:**
- Executive summary
- Problema e soluzione
- Target utenti (60% indecisi, 40% esperti)
- Analisi competitiva
- Metriche successo

**Leggi per:** Decisioni strategiche, posizionamento mercato

---

### 👤 User Experience
**File:** `02-USER-STORIES.md`  
**Contenuto:**
- Pattern comportamentali utenti
- Flussi conversazionali (consultativo vs fast track)
- User stories con acceptance criteria
- Scenari test completi

**Leggi per:** Design UX, flussi conversazione, casi d'uso

---

### 🏗️ Architettura Tecnica
**File:** `03-SYSTEM-ARCHITECTURE.md`  
**Contenuto:**
- Stack tecnologico
- Componenti core (Mode Selector, Comprehension Engine, etc.)
- Database schema completo
- API REST + WebSocket
- Rate limiting

**Leggi per:** Implementazione backend, API design, database

---

### 💬 AI Configuration
**File:** `04-SYSTEM-PROMPTS.md`  
**Contenuto:**
- Master system prompt template
- Variabili dinamiche
- Esempi conversazionali per lingua
- Testing prompts

**Leggi per:** Configurazione AI, prompt engineering, multilingual

---

### 🔒 Sicurezza
**File:** `05-SECURITY.md`  
**Contenuto:**
- Difesa prompt injection
- Controllo costi budget
- Rate limiting multi-livello
- Input validation
- Audit logging

**Leggi per:** Security implementation, cost control

---

### 📊 Analytics e Metrics
**File:** `06-ANALYTICS.md`  
**Contenuto:**
- Query SQL metriche chiave
- Dashboard React components
- A/B testing framework
- Export e reporting

**Leggi per:** Analytics implementation, metriche business

---

### 🚀 Implementazione
**File:** `07-IMPLEMENTATION-PLAN.md`  
**Contenuto:**
- Timeline 4 settimane dettagliato
- Deliverable per day
- Test strategy
- Risk management

**Leggi per:** Planning sviluppo, task breakdown

---

### ✅ Launch
**File:** `08-LAUNCH-CHECKLIST.md`  
**Contenuto:**
- Pre-launch checklist completo
- Fasi launch (10% → 50% → 100%)
- Post-launch monitoring
- Rollback plan

**Leggi per:** Go-live planning, monitoring

---

## Come Usare in Chat

### Esempi Comandi

**Brainstorming UX:**
```
Leggi docs/ai-qr-creator/02-USER-STORIES.md

Voglio discutere il flusso consultativo per utenti F&B.
```

**Design API:**
```
Leggi docs/ai-qr-creator/03-SYSTEM-ARCHITECTURE.md sezione API

Devo aggiungere endpoint per gallery. Dove va?
```

**Ottimizzare Prompts:**
```
Leggi docs/ai-qr-creator/04-SYSTEM-PROMPTS.md

Il tone italiano è troppo formale. Come aggiusto?
```

**Planning Week 2:**
```
Leggi docs/ai-qr-creator/07-IMPLEMENTATION-PLAN.md Week 2

Quanto tempo serve upsell engine?
```

---

## Combinazioni Utili

### Per Feature Completa
Leggi in ordine:
1. `02-USER-STORIES.md` (cosa)
2. `03-SYSTEM-ARCHITECTURE.md` (come)
3. `07-IMPLEMENTATION-PLAN.md` (quando)

### Per Launch
Leggi:
1. `07-IMPLEMENTATION-PLAN.md` Week 4
2. `08-LAUNCH-CHECKLIST.md`

### Per Security Review
Leggi:
1. `05-SECURITY.md`
2. `03-SYSTEM-ARCHITECTURE.md` sezione Rate Limiting

---

## Note

- ✅ Puoi leggere sezioni specifiche: "leggi sezione X"
- ✅ Puoi chiedere modifiche: "aggiorna sezione Y"
- ✅ File sono in filesystem locale, persistono tra sessioni
- ✅ Modifiche salvate automaticamente

---

**Documenti Correlati (Progetto):**
- Master Plan: `/docs/GUDBRO-MASTER-PLAN.md`
- Workflow: `/docs/WORKFLOW-GUIDELINES.md`
- QR Engine: `/docs/QR-ENGINE-DEVELOPMENT-BRIEF.md`
