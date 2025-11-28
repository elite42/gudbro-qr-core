# GUDBRO QR Core

Core QR platform microservices, admin UI, and foundational packages.

## 📦 Repository Structure

```
gudbro-qr-core/
├── frontend/                # QR Platform Admin UI (Port 3000)
├── packages/
│   ├── qr-engine/          # QR code generation engine (Port 3001)
│   ├── analytics/          # Analytics & tracking (Port 3002)
│   ├── api/                # Main API gateway (Port 3000)
│   ├── auth/               # Authentication service (Port 3003)
│   ├── bulk/               # Bulk operations (Port 3006)
│   ├── customization/      # QR customization (Port 3007)
│   ├── dynamic-qr/         # Dynamic QR redirects (Port 3008)
│   ├── filters/            # Safety filters (Port 3009)
│   ├── hub/                # Admin Hub (Port 3010)
│   ├── i18n/               # Internationalization (Port 3011)
│   ├── menu/               # Menu management (Port 3012)
│   ├── templates/          # QR templates (Port 3013)
│   ├── shared/             # Shared utilities & database
│   └── menu-template/      # Reusable menu components
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install all dependencies
npm install
```

### Development

Run individual services:

```bash
# Frontend Admin UI
npm run dev:frontend

# QR Engine
npm run dev:qr-engine

# Analytics
npm run dev:analytics

# API Gateway
npm run dev:api

# Auth Service
npm run dev:auth

# Admin Hub
npm run dev:hub
```

### Production Build

```bash
# Build frontend
npm run build:frontend

# Build all packages
npm run build:all
```

## 🏗️ Microservices Architecture

### Core Services

**Frontend (Port 3000)**
- QR Platform Admin UI
- Next.js 14 application
- Manage QR codes, analytics, users

**QR Engine (Port 3001)**
- QR code generation
- 13 QR code types supported
- High-performance generation

**Analytics (Port 3002)**
- Scan tracking
- User analytics
- Real-time dashboards

**API Gateway (Port 3000)**
- Main entry point
- Request routing
- Authentication middleware

**Auth Service (Port 3003)**
- User authentication
- JWT token management
- Role-based access control

### Extended Services

**Bulk (Port 3006)** - Batch QR generation
**Customization (Port 3007)** - QR design customization
**Dynamic QR (Port 3008)** - Dynamic redirect handling
**Filters (Port 3009)** - Safety filter management
**Hub (Port 3010)** - Admin dashboard
**i18n (Port 3011)** - Multi-language support
**Menu (Port 3012)** - Menu management
**Templates (Port 3013)** - QR template library

## 📚 Documentation

See `/docs` directory for:
- Architecture Decision Records (ADRs)
- API documentation
- Deployment guides
- Development workflow

## 🔗 Related Repositories

- **gudbro-verticals** - Standalone vertical business apps (coffeeshop, wellness, rentals)

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint:all
```

## 📄 License

UNLICENSED - Proprietary software

## 👥 Team

GUDBRO Development Team

---

**Last Updated:** 2025-11-28
