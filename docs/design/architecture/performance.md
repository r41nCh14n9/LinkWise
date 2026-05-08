# NFR-1: 性能設計文檔

**文檔編碼**: NFR-1  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**需求數**: 7 個  
**優先級**: P0 (MVP 必須)  
**狀態**: 🔄 初版

---

## 📋 需求映射表

| 需求編碼 | 需求名稱 | 優先級 | 設計位置 | 複雜度 |
|---------|--------|-------|---------|--------|
| **NFR-1.1** | API 響應時間 (P99 < 200ms) | P0 | [第 2 部分](#api-響應時間-p99--200ms) | ⭐⭐ |
| **NFR-1.2** | 儀表板加載時間 (< 2s) | P0 | [第 3 部分](#儀表板加載時間--2s) | ⭐ |
| **NFR-1.3** | 數據查詢性能 (< 1s) | P0 | [第 4 部分](#數據查詢性能--1s) | ⭐⭐ |
| **NFR-1.4** | 報表生成時間 (< 5s) | P0 | [第 5 部分](#報表生成時間--5s) | ⭐⭐ |
| **NFR-1.5** | 快取命中率 (> 80%) | P0 | [第 6 部分](#快取策略與命中率--80) | ⭐⭐⭐ |
| **NFR-1.6** | 並發用戶支持 (1000 users) | P0 | [第 7 部分](#並發用戶支持-1000-users) | ⭐⭐⭐ |
| **NFR-1.7** | 索引查詢優化 | P0 | [第 8 部分](#數據庫索引設計) | ⭐⭐ |

---

## 第 1 部分：性能架構概述

### 性能目標

```
API 端點: P99 < 200ms (平均 < 100ms)
前端加載: < 2 秒
數據查詢: < 1 秒
報表生成: < 5 秒
快取命中率: > 80%
並發支持: 1000+ 用戶
```

### 性能三層策略

```
┌─────────────────────────────────────────────────┐
│           前端 (React 19 + Vite)                │
│   快取層 (LocalStorage / Memory)                │
│   最新數據展示 < 2s                              │
└────────────────────┬────────────────────────────┘
                     │ HTTP/2
┌────────────────────▼────────────────────────────┐
│         API 層 (Spring Boot)                    │
│   L1 快取: 30 分鐘 (Redis)                      │
│   P99 響應時間 < 200ms                          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      數據庫層 (PostgreSQL 16)                   │
│   L2 快取: 1 小時                               │
│   L3 快取: 5 分鐘 (即時數據)                    │
└─────────────────────────────────────────────────┘
```

### 影響模塊

```
全部 FR 受影響:
✓ FR-D (Dashboard) - 最關鍵
✓ FR-R (RBAC) - 認證性能
✓ FR-V (VMS) - 查詢性能
✓ FR-P (Procurement) - 批量操作性能
```

---

## 第 2 部分：API 響應時間 (P99 < 200ms)

### NFR-1.1 設計

**目標**: 99% 的 API 請求在 200ms 內完成，平均響應時間 < 100ms

### 實現方案

#### 1. 請求級別優化

```java
// Spring Boot 配置
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Bean
    public FilterRegistrationBean<TimingFilter> timingFilter() {
        FilterRegistrationBean<TimingFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new TimingFilter());
        bean.addUrlPatterns("/*");
        bean.setOrder(1);
        return bean;
    }
}

@Component
public class TimingFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws IOException, ServletException {
        long startTime = System.currentTimeMillis();
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            String endpoint = request.getRequestURI();
            
            // 記錄 P99 指標
            if (duration > 200) {
                logger.warn("SLOW_API: {} took {} ms", endpoint, duration);
            }
            
            // Prometheus 記錄
            meterRegistry.timer("http.request.duration", 
                "endpoint", endpoint, 
                "method", request.getMethod())
                .record(duration, TimeUnit.MILLISECONDS);
        }
    }
}
```

#### 2. 連接池優化

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/linkwise
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 600000
      connection-timeout: 20000
      leak-detection-threshold: 60000
      auto-commit: true

  jpa:
    hibernate:
      jdbc:
        batch_size: 25
        fetch_size: 100
```

#### 3. 查詢優化

```java
// 使用投影而非完整實體
@Query("""
    SELECT new com.linkwise.dto.DashboardSummaryDTO(
        e.id, e.totalExpense, e.trend, e.riskScore)
    FROM Expenditure e
    WHERE e.tenantId = :tenantId
    AND e.month = :month
    """)
Page<DashboardSummaryDTO> getDashboardSummary(
    @Param("tenantId") String tenantId,
    @Param("month") String month,
    Pageable pageable);

// 使用 N+1 查詢避免
@Query("""
    SELECT e FROM Expenditure e
    LEFT JOIN FETCH e.vendor v
    LEFT JOIN FETCH e.department d
    WHERE e.tenantId = :tenantId
    """)
List<Expenditure> findAllWithRelations(@Param("tenantId") String tenantId);
```

#### 4. API 端點設計

| 端點 | 預期響應時間 | 快取 | 備註 |
|------|----------|------|------|
| `GET /api/dashboard/summary` | < 100ms | L1 (30min) | 高頻訪問 |
| `GET /api/vendors/{id}` | < 150ms | L1 (1hr) | 供應商資料 |
| `GET /api/purchases` | < 200ms | 分頁 + L1 | 列表查詢 |
| `POST /api/purchases` | < 500ms | 無 | 創建操作 |

---

## 第 3 部分：儀表板加載時間 (< 2s)

### NFR-1.2 設計

**目標**: 儀表板在 2 秒內完全加載並可交互

### 實現方案

#### 1. 前端優化

```typescript
// Vite 配置優化
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
          'ui': ['@headlessui/react', '@radix-ui/react-dialog']
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  server: {
    middlewareMode: true
  }
})
```

#### 2. Code Splitting

```typescript
// 動態導入重組件
import { lazy, Suspense } from 'react'

const DashboardCharts = lazy(() => import('./components/DashboardCharts'))
const VendorScoreBoard = lazy(() => import('./components/VendorScoreBoard'))
const PurchaseFunnel = lazy(() => import('./components/PurchaseFunnel'))

export function Dashboard() {
  return (
    <>
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardCharts />
      </Suspense>
      
      <Suspense fallback={<LoadingSkeleton />}>
        <VendorScoreBoard />
      </Suspense>
      
      <Suspense fallback={<LoadingSkeleton />}>
        <PurchaseFunnel />
      </Suspense>
    </>
  )
}
```

#### 3. 資源優化

```html
<!-- 預加載關鍵資源 -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/charts.js" as="script">

<!-- 延遲加載非關鍵資源 -->
<link rel="preload" href="/vendor-list.js" as="script">
```

#### 4. 性能指標

```typescript
// 監測 Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)  // Cumulative Layout Shift
getFID(console.log)  // First Input Delay
getFCP(console.log)  // First Contentful Paint
getLCP(console.log)  // Largest Contentful Paint
getTTFB(console.log) // Time to First Byte
```

---

## 第 4 部分：數據查詢性能 (< 1s)

### NFR-1.3 設計

**目標**: 單條數據查詢在 1 秒內完成

### 實現方案

#### 1. 數據庫索引

```sql
-- 採購表索引
CREATE INDEX idx_purchase_tenant_status 
ON purchase_request(tenant_id, status);

CREATE INDEX idx_purchase_created_date 
ON purchase_request(created_at DESC);

CREATE INDEX idx_purchase_vendor_id 
ON purchase_request(vendor_id);

-- 供應商表索引
CREATE INDEX idx_vendor_tenant_score 
ON vendor(tenant_id, risk_score DESC);

CREATE INDEX idx_vendor_status 
ON vendor(tenant_id, status);

-- 金額範圍查詢
CREATE INDEX idx_purchase_amount 
ON purchase_request(amount);

-- 複合索引
CREATE INDEX idx_purchase_search 
ON purchase_request(tenant_id, status, created_at DESC);
```

#### 2. 查詢執行計劃

```sql
-- 查看執行計劃
EXPLAIN ANALYZE
SELECT p.id, p.total_amount, v.name, v.risk_score
FROM purchase_request p
JOIN vendor v ON p.vendor_id = v.id
WHERE p.tenant_id = '123'
AND p.status = 'APPROVED'
ORDER BY p.created_at DESC
LIMIT 20;

-- 結果應該使用索引，不能有 Seq Scan
```

#### 3. 查詢優化技巧

```java
// 1. 使用投影減少數據傳輸
@Query("""
    SELECT new map(p.id as id, p.amount as amount, v.name as vendorName)
    FROM Purchase p
    JOIN p.vendor v
    WHERE p.tenantId = :tenantId
    """)
List<Map<String, Object>> findPurchaseSummary(@Param("tenantId") String tenantId);

// 2. 分頁避免大結果集
Page<Purchase> findByTenantId(String tenantId, Pageable pageable);

// 3. 使用 EXISTS 而非 IN
@Query("""
    SELECT p FROM Purchase p
    WHERE EXISTS (
        SELECT 1 FROM Approval a WHERE a.purchase = p AND a.status = 'APPROVED'
    )
    """)
List<Purchase> findApprovedPurchases();
```

---

## 第 5 部分：報表生成時間 (< 5s)

### NFR-1.4 設計

**目標**: 報表生成在 5 秒內完成

### 實現方案

#### 1. 非同步報表生成

```java
@Service
public class ReportService {
    
    @Async("reportExecutor")
    public CompletableFuture<Report> generateReport(String tenantId, ReportParams params) {
        try {
            // 1. 收集數據 (< 1s)
            List<PurchaseData> data = purchaseRepository
                .findByTenantAndDateRange(tenantId, params.startDate, params.endDate);
            
            // 2. 聚合數據 (< 1s)
            ReportData aggregated = aggregateData(data);
            
            // 3. 生成報表 (< 2s)
            Report report = buildReport(aggregated, params);
            
            // 4. 保存到 S3 (< 1s)
            String reportUrl = s3Service.uploadReport(report);
            
            return CompletableFuture.completedFuture(report);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }
    
    @Bean("reportExecutor")
    public Executor reportExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("report-");
        executor.initialize();
        return executor;
    }
}
```

#### 2. 報表快取

```java
@Service
public class ReportCacheService {
    
    @Cacheable(value = "reports", key = "#tenantId + ':' + #reportType + ':' + #month")
    public Report getMonthlyReport(String tenantId, String reportType, String month) {
        // 如果快取不存在，才生成報表
        return reportService.generateReport(tenantId, month);
    }
    
    @CacheEvict(value = "reports", allEntries = true)
    @Scheduled(cron = "0 0 1 * * *") // 每月 1 日午夜刷新
    public void refreshMonthlyReports() {
        // 預生成本月報表
    }
}
```

#### 3. 報表格式優化

```java
// 使用流式生成，減少內存占用
public void streamReportToCSV(OutputStream output, ReportParams params) {
    try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(output))) {
        // 寫入頭部
        writer.writeNext(HEADERS);
        
        // 流式讀取數據
        purchaseRepository.findByTenantStream(params.tenantId)
            .forEach(p -> writer.writeNext(toRow(p)));
    }
}
```

---

## 第 6 部分：快取策略與命中率 (> 80%)

### NFR-1.5 設計

**目標**: 快取命中率超過 80%

### 實現方案

#### 1. Redis 三層快取架構

```
Layer 1 (30 min): 
  - 儀表板摘要卡片
  - 用戶權限信息
  - 常用篩選條件

Layer 2 (1 hour):
  - 供應商評分
  - 趨勢圖表數據
  - 月度統計

Layer 3 (5 min):
  - 即時風險分數
  - 最新採購狀態
  - 動態告警數據
```

#### 2. Redis 配置

```yaml
# application.yml
spring:
  redis:
    host: localhost
    port: 6379
    timeout: 60000ms
    jedis:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: -1ms
  
  cache:
    type: redis
    redis:
      time-to-live: 1800000 # 30 分鐘
```

#### 3. 快取實現

```java
@Service
public class DashboardCacheService {
    
    private static final String CACHE_KEY_PREFIX = "dashboard:";
    private static final long CACHE_DURATION_L1 = 30 * 60; // 30 min
    private static final long CACHE_DURATION_L2 = 60 * 60; // 1 hour
    private static final long CACHE_DURATION_L3 = 5 * 60;  // 5 min
    
    @Cacheable(value = "dashboard:summary", key = "#tenantId")
    public DashboardSummaryDTO getSummary(String tenantId) {
        // L1: 30 分鐘快取
        return dashboardService.computeSummary(tenantId);
    }
    
    @Cacheable(value = "dashboard:trends", key = "#tenantId + ':' + #month")
    public TrendDataDTO getTrendData(String tenantId, String month) {
        // L2: 1 小時快取
        return dashboardService.computeTrends(tenantId, month);
    }
    
    @Cacheable(value = "dashboard:alerts", key = "#tenantId")
    public List<AlertDTO> getAlerts(String tenantId) {
        // L3: 5 分鐘快取
        return alertService.getActiveAlerts(tenantId);
    }
    
    // 手動快取失效
    @CacheEvict(value = "dashboard:summary", key = "#tenantId")
    public void invalidateSummary(String tenantId) {}
}
```

#### 4. 快取命中率監控

```java
@Component
public class CacheMetricsCollector {
    
    @Bean
    public MeterBinder cacheMetrics(CacheManager cacheManager) {
        return (registry) -> {
            cacheManager.getCacheNames().forEach(cacheName -> {
                Cache cache = cacheManager.getCache(cacheName);
                registry.gauge("cache.hits", cache, c -> getHits(c));
                registry.gauge("cache.misses", cache, c -> getMisses(c));
            });
        };
    }
    
    // 快取命中率 = hits / (hits + misses)
}
```

---

## 第 7 部分：並發用戶支持 (1000+ users)

### NFR-1.6 設計

**目標**: 系統支持 1000+ 並發用戶

### 實現方案

#### 1. 應用層配置

```yaml
# application.yml
server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    max-connections: 10000
    accept-count: 100
    connection-timeout: 60000
  compression:
    enabled: true
    min-response-size: 1024
```

#### 2. 數據庫連接池

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(env.getProperty("spring.datasource.url"));
        config.setUsername(env.getProperty("spring.datasource.username"));
        config.setPassword(env.getProperty("spring.datasource.password"));
        
        // 並發配置
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(20000);
        
        return new HikariDataSource(config);
    }
}
```

#### 3. 負載測試配置

```bash
# JMeter 配置
# 1000 用戶 + 10 秒 ramp-up + 5 分鐘持續時間
jmeter -n -t /path/to/test.jmx \
  -l /path/to/results.jtl \
  -J num_threads=1000 \
  -J ramp_time=10 \
  -J duration=300
```

---

## 第 8 部分：數據庫索引設計

### NFR-1.7 設計

**索引策略**

| 表名 | 索引字段 | 類型 | 優先級 |
|------|--------|------|--------|
| purchase_request | (tenant_id, status) | Composite | ⭐⭐⭐ |
| purchase_request | (created_at DESC) | Single | ⭐⭐⭐ |
| vendor | (tenant_id, risk_score DESC) | Composite | ⭐⭐⭐ |
| user | (tenant_id, email) | Composite | ⭐⭐⭐ |
| approval | (purchase_request_id, status) | Composite | ⭐⭐ |
| expenditure | (month, tenant_id) | Composite | ⭐⭐ |

### 監控性能

```sql
-- 查看緩慢查詢
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- 查看索引使用情況
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## ✅ 驗證清單

- [ ] API 響應時間監控已配置
- [ ] 連接池參數已優化
- [ ] 數據庫索引已建立
- [ ] 快取策略已實施
- [ ] 代碼分割已配置
- [ ] 性能測試已執行
- [ ] 監控告警已部署

---

## 🔄 實施順序

1. **第 1 週**: 數據庫索引 + 連接池優化
2. **第 2 週**: Redis 快取實施
3. **第 3 週**: 前端代碼分割
4. **第 4 週**: 性能測試 + 優化

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：性能設計完整方案 |

