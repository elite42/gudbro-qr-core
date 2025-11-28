# Deployment Notes - Memory File

**Purpose:** Deployment procedures, gotchas, and environment-specific knowledge
**Usage:** Quick reference when deploying or troubleshooting deployments
**Maintenance:** Update when deployment processes change

---

## Current Deployment State

### Core Platform (Modules 1-12)

**Development:**
- Docker Compose
- All services on localhost
- Ports: 3000-3013

**Staging:**
- Not yet set up
- Planned: Kubernetes cluster

**Production:**
- Not yet set up
- Planned: Kubernetes cluster with Kong Gateway

**Status:** Development only

---

### Vertical Packages (Rentals, Wellness, Coffeeshop)

**Development:**
- npm run dev (individual ports)
- No containerization
- Direct Node.js process

**Staging:**
- Not yet set up
- Planned: Vercel preview deployments

**Production:**
- Not yet deployed
- Planned: Vercel (frontend) + Railway/Heroku (backend where needed)

**Status:** Development only

---

## Environment Variables

### Core Platform

**Required:**
```bash
DATABASE_URL=postgresql://localhost/gudbro
JWT_SECRET=your-secret-key
KONG_ADMIN_URL=http://localhost:8001
NODE_ENV=development|staging|production
```

**Per Module:**
- Each module has own .env file
- Check module-specific README/CLAUDE.md

---

### Coffeeshop Frontend

**Required:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3004  # Or production URL
NEXT_PUBLIC_VENUE_ID=roots-danang
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...  # When payments added
```

**Optional:**
```bash
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

### Rentals

**Backend:**
```bash
PORT=3012  # Target: 3021
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3012  # Target: 3021
```

---

### Wellness

**Backend:**
```bash
PORT=3023
DATABASE_URL=postgresql://...
```

**Frontend (when created):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3023
```

---

## Deployment Procedures

### Local Development

**Start Core Platform:**
```bash
cd /path/to/qr-platform-complete
docker-compose up
```

**Start Individual Vertical:**
```bash
# Coffeeshop
cd packages/coffeeshop/frontend
npm run dev

# Rentals
cd packages/rentals/backend && npm start
cd packages/rentals/frontend && npm run dev

# Wellness
cd packages/wellness/backend && npm start
# Frontend not yet created
```

---

### Vercel Deployment (Planned)

**Coffeeshop:**
```bash
cd packages/coffeeshop/frontend
vercel --prod
```

**Rentals Frontend:**
```bash
cd packages/rentals/frontend
vercel --prod
```

**Environment Variables:**
- Set in Vercel dashboard
- Use Vercel environment secrets for sensitive data

---

## Known Gotchas

### Port Conflicts

**Issue:** Multiple services on same port fail to start

**Solution:** Check PORT-REGISTRY.json before starting services

**Quick Check:**
```bash
lsof -i :3004  # Check specific port
```

**Kill Process:**
```bash
lsof -ti:3004 | xargs kill -9
```

---

### .env Files Not Loaded

**Issue:** Environment variables not found

**Coffeeshop:** Next.js 14 requires `.env.local` (not `.env`)

**Solution:**
```bash
cp .env .env.local  # If using .env
```

**Note:** `.env.local` is gitignored by default

---

### Database Connection Issues

**Issue:** "Connection refused" or "Database not found"

**Check:**
```bash
# PostgreSQL running?
pg_isready

# Database exists?
psql -l | grep gudbro
```

**Create Database:**
```bash
createdb gudbro
psql gudbro < db/schema.sql
```

---

### Next.js Build Errors

**Issue:** TypeScript errors during build

**Common Cause:** Strict type checking in production build

**Solution:**
```bash
# Check types before building
npx tsc --noEmit

# Fix types, then build
npm run build
```

---

### Docker Compose Issues

**Issue:** Services fail to start

**Check Logs:**
```bash
docker-compose logs [service-name]
```

**Rebuild:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## Performance Considerations

### Next.js Optimization

**Image Optimization:**
- Use Next.js Image component
- Serve from CDN in production

**Static Generation:**
- Use `generateStaticParams` for dynamic routes
- Pre-render pages at build time where possible

**Bundle Size:**
- Check with `npm run build`
- Use dynamic imports for large components

---

### API Response Times

**Target:** < 200ms for API responses

**Monitor:**
```bash
curl -w "@curl-format.txt" http://localhost:3004/api/menu
```

**Optimize:**
- Add database indexes
- Implement caching (Redis planned)
- Use connection pooling

---

## Security Checklist

**Before Production:**

- [ ] All environment variables in secure vault
- [ ] No secrets in git repository
- [ ] HTTPS enabled (SSL certificates)
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF tokens for state-changing operations
- [ ] Authentication required for sensitive endpoints

---

## Rollback Procedures

### Vercel

**Instant Rollback:**
```bash
# Via dashboard: Select previous deployment
# Or via CLI:
vercel rollback <deployment-url>
```

**Verify:**
```bash
curl https://your-app.vercel.app/api/health
```

---

### Database Migrations

**Before Migration:**
```bash
# Backup database
pg_dump gudbro > backup_$(date +%Y%m%d).sql
```

**Rollback:**
```bash
# Restore from backup
psql gudbro < backup_YYYYMMDD.sql
```

---

## Monitoring (Planned)

### Application Monitoring

- **Sentry:** Error tracking
- **Vercel Analytics:** Performance metrics
- **LogRocket:** User session replay

### Infrastructure Monitoring

- **Kubernetes Dashboard:** Cluster health
- **Grafana:** Metrics visualization
- **Prometheus:** Metrics collection

---

## Deployment Checklist

**Before Deploying:**

- [ ] All tests passing (when implemented)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build succeeds locally
- [ ] Security checklist completed
- [ ] Backup database
- [ ] Review changes in staging
- [ ] Update documentation

**After Deploying:**

- [ ] Verify deployment successful
- [ ] Check application logs
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Update PROJECT-PLAN.md
- [ ] Create handover document

---

**Last Updated:** 2025-11-17
**Review Next:** After first production deployment
**Owner:** Development Team + DevOps
