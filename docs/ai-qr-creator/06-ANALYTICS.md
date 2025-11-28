# Analytics

**Versione:** 1.0  
**Data:** 2025-11-03

---

## Metriche Chiave

### Metriche Conversazione

```sql
-- Media messaggi per conversazione
SELECT 
  AVG(message_count) as avg_messages,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY message_count) as median,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY message_count) as p95
FROM ai_conversations
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Tasso completamento conversazioni
SELECT 
  COUNT(*) FILTER (WHERE qrs_generated > 0)::FLOAT / COUNT(*) as completion_rate
FROM ai_conversations
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Durata media sessione
SELECT 
  AVG(EXTRACT(EPOCH FROM (last_activity - created_at))) / 60 as avg_duration_minutes
FROM ai_conversations
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND last_activity > created_at;
```

---

### Metriche Upsell

```sql
-- Tassi conversione upsell per tipo
SELECT 
  upsell_type,
  COUNT(*) as shown,
  COUNT(*) FILTER (WHERE action = 'accepted') as accepted,
  COUNT(*) FILTER (WHERE action = 'declined') as declined,
  COUNT(*) FILTER (WHERE action IS NULL) as ignored,
  ROUND(
    COUNT(*) FILTER (WHERE action = 'accepted')::NUMERIC / COUNT(*) * 100,
    2
  ) as conversion_rate,
  ROUND(AVG(revenue_impact), 2) as avg_revenue_impact
FROM upsell_events
WHERE shown_at >= NOW() - INTERVAL '30 days'
GROUP BY upsell_type
ORDER BY conversion_rate DESC;

-- Analisi timing decisione upsell
SELECT 
  upsell_type,
  AVG(EXTRACT(EPOCH FROM (action_at - shown_at))) as avg_decision_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (action_at - shown_at))
  ) as median_decision_seconds
FROM upsell_events
WHERE action_at IS NOT NULL
  AND shown_at >= NOW() - INTERVAL '30 days'
GROUP BY upsell_type;
```

---

### Metriche Finanziarie

```sql
-- Impatto revenue AI
SELECT 
  DATE(c.created_at) as date,
  COUNT(DISTINCT c.id) as conversations,
  SUM(c.total_spent) as total_revenue,
  SUM(costs.cost) as ai_cost,
  SUM(c.total_spent) - SUM(costs.cost) as net_revenue,
  ROUND(
    (SUM(c.total_spent) - SUM(costs.cost)) / NULLIF(SUM(costs.cost), 0),
    2
  ) as roi
FROM ai_conversations c
LEFT JOIN (
  SELECT conversation_id, SUM(cost) as cost
  FROM ai_costs
  GROUP BY conversation_id
) costs ON c.id = costs.conversation_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(c.created_at)
ORDER BY date DESC;

-- ARPU (Average Revenue Per User) con/senza AI
SELECT 
  'Con AI' as segment,
  COUNT(DISTINCT c.user_id) as users,
  SUM(c.total_spent) / NULLIF(COUNT(DISTINCT c.user_id), 0) as arpu
FROM ai_conversations c
WHERE c.user_id IS NOT NULL
  AND c.created_at >= NOW() - INTERVAL '30 days'
  AND c.total_spent > 0

UNION ALL

SELECT 
  'Senza AI' as segment,
  COUNT(DISTINCT q.user_id) as users,
  SUM(q.price) / NULLIF(COUNT(DISTINCT q.user_id), 0) as arpu
FROM qr_codes q
WHERE q.user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM ai_conversations 
  WHERE user_id IS NOT NULL
)
  AND q.created_at >= NOW() - INTERVAL '30 days'
  AND q.price > 0;
```

---

### Metriche Viral Loop

```sql
-- Coefficiente virale
WITH referrer_stats AS (
  SELECT 
    referrer_user_id,
    COUNT(*) as referrals,
    COUNT(*) FILTER (WHERE signed_up_at IS NOT NULL) as conversions
  FROM viral_referrals
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY referrer_user_id
)
SELECT 
  COUNT(*) as total_referrers,
  SUM(referrals) as total_referrals,
  SUM(conversions) as total_conversions,
  ROUND(AVG(conversions::NUMERIC), 2) as avg_conversions_per_referrer,
  ROUND(
    SUM(conversions)::NUMERIC / NULLIF(COUNT(*), 0) / NULLIF(SUM(referrals), 0),
    4
  ) as viral_coefficient
FROM referrer_stats;

-- Efficacia canali share
SELECT 
  channel,
  COUNT(*) as referrals_sent,
  COUNT(*) FILTER (WHERE signed_up_at IS NOT NULL) as conversions,
  ROUND(
    COUNT(*) FILTER (WHERE signed_up_at IS NOT NULL)::NUMERIC / COUNT(*) * 100,
    2
  ) as conversion_rate,
  COUNT(*) FILTER (WHERE first_purchase_at IS NOT NULL) as paid_conversions
FROM viral_referrals
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY channel
ORDER BY conversions DESC;
```

---

## Dashboard React

```typescript
// packages/frontend/src/pages/analytics/AIAnalytics.tsx

const AIAnalyticsDashboard: React.FC = () => {
  const { data: metrics, isLoading } = useQuery('ai-metrics', fetchAIMetrics);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <DashboardLayout>
      <PageHeader title="AI QR Creator Analytics" />
      
      {/* Overview Cards */}
      <MetricsGrid>
        <MetricCard
          title="Conversazioni Totali"
          value={metrics.totalConversations}
          change={metrics.conversationsChange}
          trend="up"
        />
        <MetricCard
          title="Tasso Conversione"
          value={`${metrics.conversionRate}%`}
          change={metrics.conversionRateChange}
          trend="up"
        />
        <MetricCard
          title="Revenue Medio/Conv."
          value={`$${metrics.avgRevenue}`}
          change={metrics.avgRevenueChange}
          trend="up"
        />
        <MetricCard
          title="ROI AI"
          value={`${metrics.roi}:1`}
          change={metrics.roiChange}
          trend="up"
        />
      </MetricsGrid>
      
      {/* Conversion Funnel */}
      <Section title="Funnel Conversione">
        <FunnelChart data={metrics.funnel} />
      </Section>
      
      {/* Upsell Performance */}
      <Section title="Performance Upsell">
        <UpsellTable data={metrics.upsells} />
      </Section>
      
      {/* Language Distribution */}
      <Section title="Distribuzione Lingue">
        <PieChart 
          data={metrics.languages}
          title="Conversazioni per Lingua"
        />
      </Section>
      
      {/* Budget Usage */}
      <Section title="Utilizzo Budget AI">
        <BudgetGauge 
          used={metrics.budget.used}
          total={metrics.budget.total}
        />
        <LineChart 
          data={metrics.budget.daily}
          title="Spesa Giornaliera"
        />
      </Section>
      
      {/* Viral Loop */}
      <Section title="Crescita Virale">
        <ViralMetrics data={metrics.viral} />
      </Section>
    </DashboardLayout>
  );
};
```

---

### Componenti Metriche

```typescript
// MetricCard Component
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend 
}) => {
  const trendIcon = trend === 'up' ? '↑' : '↓';
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm text-gray-500 mb-2">{title}</h3>
      <div className="text-3xl font-bold">{value}</div>
      {change !== undefined && (
        <div className={`text-sm mt-2 ${trendColor}`}>
          {trendIcon} {Math.abs(change)}% vs periodo precedente
        </div>
      )}
    </div>
  );
};

// Funnel Chart
const FunnelChart: React.FC<{ data: FunnelData }> = ({ data }) => {
  const stages = [
    { name: 'Conversazioni Iniziate', value: data.total },
    { name: 'Engaged (3+ msg)', value: data.engaged },
    { name: 'QR Generati', value: data.generated },
    { name: 'Pagamenti', value: data.paid }
  ];
  
  return (
    <div className="space-y-4">
      {stages.map((stage, i) => {
        const percentage = (stage.value / data.total) * 100;
        const dropoff = i > 0 
          ? ((stages[i-1].value - stage.value) / stages[i-1].value * 100).toFixed(1)
          : null;
        
        return (
          <div key={stage.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stage.name}</span>
              <span className="font-semibold">
                {stage.value} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            {dropoff && (
              <div className="text-xs text-red-500">
                ↓ {dropoff}% drop-off
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
```

---

## Query Analytics Complesse

### Analisi Comportamento Utente

```sql
-- Segmentazione utenti per comportamento
WITH user_behavior AS (
  SELECT 
    user_id,
    COUNT(*) as total_conversations,
    AVG(message_count) as avg_messages,
    SUM(qrs_generated) as total_qrs,
    SUM(total_spent) as total_revenue,
    COUNT(*) FILTER (WHERE 'artistic' = ANY(upsells_accepted)) as artistic_accepted,
    MAX(created_at) as last_conversation
  FROM ai_conversations
  WHERE user_id IS NOT NULL
  GROUP BY user_id
)
SELECT 
  CASE 
    WHEN total_conversations = 1 THEN 'New'
    WHEN total_conversations BETWEEN 2 AND 5 THEN 'Active'
    WHEN total_conversations > 5 THEN 'Power User'
  END as user_segment,
  COUNT(*) as users,
  ROUND(AVG(total_revenue), 2) as avg_revenue,
  ROUND(AVG(artistic_accepted::NUMERIC / NULLIF(total_conversations, 0)), 2) as artistic_rate
FROM user_behavior
GROUP BY user_segment;
```

---

### Ottimizzazione Timing Upsell

```sql
-- Messaggio ottimale per mostrare upsell
WITH upsell_timing AS (
  SELECT 
    c.session_id,
    c.message_count,
    u.upsell_type,
    u.action,
    ROW_NUMBER() OVER (PARTITION BY c.session_id ORDER BY u.shown_at) as upsell_sequence
  FROM ai_conversations c
  JOIN upsell_events u ON c.id = u.conversation_id
  WHERE u.shown_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  message_count as messages_before_upsell,
  upsell_type,
  COUNT(*) as shown,
  COUNT(*) FILTER (WHERE action = 'accepted') as accepted,
  ROUND(
    COUNT(*) FILTER (WHERE action = 'accepted')::NUMERIC / COUNT(*) * 100,
    2
  ) as conversion_rate
FROM upsell_timing
WHERE upsell_sequence = 1  -- Primo upsell
GROUP BY message_count, upsell_type
ORDER BY message_count, conversion_rate DESC;
```

---

### Analisi Lifetime Value

```sql
-- LTV per coorte mensile
WITH cohorts AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', MIN(created_at)) as cohort_month
  FROM ai_conversations
  WHERE user_id IS NOT NULL
  GROUP BY user_id
),
revenue_by_month AS (
  SELECT 
    c.user_id,
    DATE_TRUNC('month', c.created_at) as revenue_month,
    SUM(c.total_spent) as monthly_revenue
  FROM ai_conversations c
  WHERE c.user_id IS NOT NULL
  GROUP BY c.user_id, DATE_TRUNC('month', c.created_at)
)
SELECT 
  cohorts.cohort_month,
  COUNT(DISTINCT cohorts.user_id) as cohort_size,
  ROUND(SUM(CASE WHEN revenue_month = cohort_month THEN monthly_revenue END) / 
    COUNT(DISTINCT cohorts.user_id), 2) as month_0_arpu,
  ROUND(SUM(monthly_revenue) / COUNT(DISTINCT cohorts.user_id), 2) as ltv
FROM cohorts
LEFT JOIN revenue_by_month ON cohorts.user_id = revenue_by_month.user_id
GROUP BY cohorts.cohort_month
ORDER BY cohorts.cohort_month DESC;
```

---

## Export e Reporting

### Report PDF Automatico

```typescript
class ReportGenerator {
  async generateMonthlyReport(month: Date): Promise<Buffer> {
    const metrics = await this.fetchMonthlyMetrics(month);
    
    const doc = new PDFDocument();
    
    // Header
    doc.fontSize(20).text('AI QR Creator - Report Mensile', { align: 'center' });
    doc.fontSize(12).text(format(month, 'MMMM yyyy'), { align: 'center' });
    doc.moveDown();
    
    // Overview
    doc.fontSize(16).text('Overview');
    doc.fontSize(10).text(`Conversazioni: ${metrics.conversations}`);
    doc.text(`Revenue: $${metrics.revenue.toFixed(2)}`);
    doc.text(`ROI: ${metrics.roi}:1`);
    doc.moveDown();
    
    // Upsell Performance
    doc.fontSize(16).text('Performance Upsell');
    metrics.upsells.forEach(u => {
      doc.fontSize(10).text(
        `${u.type}: ${u.conversionRate}% (${u.accepted}/${u.shown})`
      );
    });
    doc.moveDown();
    
    // Charts (convert to images)
    const funnelChart = await this.generateFunnelChart(metrics.funnel);
    doc.image(funnelChart, { width: 500 });
    
    return doc.end();
  }
}
```

---

### Dashboard Export CSV

```typescript
const exportToCSV = async (query: AnalyticsQuery): Promise<string> => {
  const data = await db.query(query.sql, query.params);
  
  const headers = Object.keys(data.rows[0]);
  const rows = data.rows.map(row => 
    headers.map(h => JSON.stringify(row[h])).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

// API endpoint
app.get('/api/analytics/export', async (req, res) => {
  const { metric, startDate, endDate } = req.query;
  
  const query = buildQuery(metric, startDate, endDate);
  const csv = await exportToCSV(query);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${metric}-${Date.now()}.csv`);
  res.send(csv);
});
```

---

## A/B Testing Framework

```typescript
interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  startDate: Date;
  endDate?: Date;
  targetMetric: string;
}

class ABTestManager {
  async assignVariant(
    userId: string, 
    experimentId: string
  ): Promise<string> {
    // Check se già assegnato
    const existing = await redis.get(`experiment:${experimentId}:${userId}`);
    if (existing) return existing;
    
    // Assign random variant
    const experiment = await this.getExperiment(experimentId);
    const variant = this.weightedRandom(experiment.variants);
    
    // Store assignment
    await redis.set(
      `experiment:${experimentId}:${userId}`,
      variant.id,
      'EX',
      experiment.endDate 
        ? Math.floor((experiment.endDate.getTime() - Date.now()) / 1000)
        : 2592000 // 30 giorni default
    );
    
    // Log assignment
    await db.query(
      `INSERT INTO experiment_assignments 
       (experiment_id, user_id, variant_id, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      [experimentId, userId, variant.id]
    );
    
    return variant.id;
  }
  
  async trackConversion(
    userId: string,
    experimentId: string,
    metric: string,
    value: number
  ): Promise<void> {
    const variant = await redis.get(`experiment:${experimentId}:${userId}`);
    
    if (!variant) return; // Non in esperimento
    
    await db.query(
      `INSERT INTO experiment_events 
       (experiment_id, user_id, variant_id, metric, value, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [experimentId, userId, variant, metric, value]
    );
  }
  
  async getResults(experimentId: string): Promise<ExperimentResults> {
    const results = await db.query(`
      SELECT 
        variant_id,
        COUNT(DISTINCT user_id) as users,
        COUNT(*) FILTER (WHERE metric = 'conversion') as conversions,
        AVG(value) FILTER (WHERE metric = 'revenue') as avg_revenue
      FROM experiment_events
      WHERE experiment_id = $1
      GROUP BY variant_id
    `, [experimentId]);
    
    return this.calculateSignificance(results.rows);
  }
}
```

---

**Prossimo:** [Piano Implementazione](07-IMPLEMENTATION-PLAN.md)
