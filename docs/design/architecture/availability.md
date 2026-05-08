# NFR-5: 可用性設計文檔

**文檔編碼**: NFR-5  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**需求數**: 7 個  
**優先級**: P0 (MVP 必須)  
**狀態**: 🔄 初版

---

## 📋 需求映射表

| 需求編碼 | 需求名稱 | 優先級 | 設計位置 | 複雜度 |
|---------|--------|-------|---------|--------|
| **NFR-5.1** | 系統可用性 (99.5% SLA) | P0 | [第 2 部分](#sla-目標) | ⭐⭐⭐ |
| **NFR-5.2** | 故障轉移機制 | P0 | [第 3 部分](#故障轉移) | ⭐⭐ |
| **NFR-5.3** | 健康檢查 | P0 | [第 4 部分](#健康檢查) | ⭐⭐ |
| **NFR-5.4** | 優雅關閉 | P0 | [第 5 部分](#優雅關閉) | ⭐ |
| **NFR-5.5** | 超時管理 | P0 | [第 6 部分](#超時管理) | ⭐ |
| **NFR-5.6** | 斷路器模式 | P1 | [第 7 部分](#斷路器模式) | ⭐⭐ |
| **NFR-5.7** | 重試機制 | P1 | [第 8 部分](#重試機制) | ⭐ |

---

## 第 1 部分：可用性架構概述

### 高可用部署架構

```
┌──────────────────────────────────────────────────────┐
│                  DNS (多地域解析)                     │
├──────────────────────────────────────────────────────┤
│            Nginx (負載均衡層 x 2)                     │
│         (主 + 備 + Health Check)                     │
├──────────────────────────────────────────────────────┤
│    Spring Boot 應用 (x 3-5 副本)                      │
│   (容器化 + 自動重啟 + 滾動更新)                      │
├──────────────────────────────────────────────────────┤
│  PostgreSQL (主 + 備份副本 + 流複製)                 │
│            (自動故障轉移 + WAL 歸檔)                  │
├──────────────────────────────────────────────────────┤
│     Redis (Cluster + 哨兵模式)                       │
│          (自動故障檢測 + 切換)                        │
└──────────────────────────────────────────────────────┘
```

### 影響模塊

```
全部 FR 受影響:
✓ 所有功能都需要可用性保證
✓ 尤其是 FR-P (採購流程) 和 FR-D (數據查詢)
```

---

## 第 2 部分：SLA 目標

### NFR-5.1 設計

**目標**: 99.5% 系統可用性 SLA

### 實現方案

#### 1. SLA 定義

```
99.5% 可用性 = 每月最多 3.6 小時宕機時間

計算:
30 天 × 24 小時 = 720 小時
99.5% × 720 = 715.2 小時可用
宕機時間 = 720 - 715.2 = 4.8 小時 ≈ 3.6 小時/月
```

#### 2. 故障恢復時間目標

```
RTO (Recovery Time Objective): 15 分鐘
RTO (Recovery Point Objective): 5 分鐘

含義:
- 故障發生時，應在 15 分鐘內恢復服務
- 數據損失不超過 5 分鐘
```

#### 3. SLA 監控

```java
@Component
@Scheduled(fixedDelay = 60000) // 每分鐘檢查
public class SLAMonitor {
    
    public void checkServiceAvailability() {
        // 1. 檢查 API 可用性
        boolean apiHealthy = healthCheckService.isApiHealthy();
        
        // 2. 檢查數據庫連接
        boolean dbHealthy = healthCheckService.isDatabaseHealthy();
        
        // 3. 檢查 Redis
        boolean cacheHealthy = healthCheckService.isCacheHealthy();
        
        // 4. 計算可用性指標
        double availability = calculateAvailability(apiHealthy, dbHealthy, cacheHealthy);
        
        // 5. 記錄指標
        metricsService.recordAvailability(availability);
        
        // 6. 告警
        if (availability < 0.995) {
            alertService.sendAlert("SLA Breach Warning");
        }
    }
}
```

---

## 第 3 部分：故障轉移

### NFR-5.2 設計

**目標**: 自動故障檢測和轉移

### 實現方案

#### 1. 應用層故障轉移

```yaml
# docker-compose.yml
services:
  app-primary:
    image: linkwise-core:latest
    ports:
      - "8081:8080"
    environment:
      - ROLE=PRIMARY
    restart: unless-stopped

  app-replica:
    image: linkwise-core:latest
    ports:
      - "8082:8080"
    environment:
      - ROLE=REPLICA
    restart: unless-stopped

  nginx:
    image: nginx:latest
    ports:
      - "8080:8080"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app-primary
      - app-replica
```

#### 2. Nginx 配置

```nginx
upstream backend {
    server app-primary:8080 weight=50;
    server app-replica:8080 weight=50;
    
    # 健康檢查
    check interval=3000 rise=2 fall=3 timeout=1000 type=http;
    check_http_send "GET /actuator/health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx;
}

server {
    listen 8080;
    
    location / {
        proxy_pass http://backend;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
        proxy_write_timeout 30s;
    }
}
```

#### 3. 數據庫故障轉移

```sql
-- 主庫配置
CREATE PUBLICATION all_tables FOR ALL TABLES;

-- 備庫配置 (自動追趕)
CREATE SUBSCRIPTION all_tables_sub
    CONNECTION 'postgresql://user:password@primary:5432/linkwise'
    PUBLICATION all_tables
    WITH (copy_data = true);
```

---

## 第 4 部分：健康檢查

### NFR-5.3 設計

**目標**: 持續監控應用健康狀態

### 實現方案

#### 1. Spring Boot Actuator

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
      show-components: always
```

#### 2. 自定義健康檢查

```java
@Component
public class CustomHealthIndicator extends AbstractHealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Override
    protected void doHealthCheck(Health.Builder builder) {
        try {
            // 檢查數據庫
            checkDatabase(builder);
            
            // 檢查 Redis
            checkRedis(builder);
            
            // 檢查磁盤空間
            checkDiskSpace(builder);
            
            builder.up();
        } catch (Exception e) {
            builder.down().withException(e);
        }
    }
    
    private void checkDatabase(Health.Builder builder) {
        try (Connection conn = dataSource.getConnection()) {
            Statement stmt = conn.createStatement();
            stmt.execute("SELECT 1");
            builder.withDetail("database", "UP");
        } catch (Exception e) {
            builder.withDetail("database", "DOWN").withException(e);
        }
    }
    
    private void checkRedis(Health.Builder builder) {
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            builder.withDetail("redis", "UP");
        } catch (Exception e) {
            builder.withDetail("redis", "DOWN").withException(e);
        }
    }
}
```

#### 3. 健康檢查端點

```bash
# 查詢健康狀態
curl http://localhost:8080/actuator/health

# 詳細信息
curl http://localhost:8080/actuator/health/livenessState
curl http://localhost:8080/actuator/health/readinessState
```

---

## 第 5 部分：優雅關閉

### NFR-5.4 設計

**目標**: 有序地關閉應用，不丟失請求

### 實現方案

#### 1. 優雅關閉配置

```yaml
# application.yml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

#### 2. 關閉流程監聽

```java
@Component
public class GracefulShutdownListener {
    
    @EventListener(ContextClosedEvent.class)
    public void onContextClosed(ContextClosedEvent event) {
        logger.info("Application shutdown initiated");
        
        // 1. 停止接受新請求
        stopAcceptingRequests();
        
        // 2. 等待現有請求完成 (最多 30 秒)
        waitForPendingRequests();
        
        // 3. 關閉線程池
        shutdownThreadPools();
        
        // 4. 關閉數據庫連接
        closeDataSources();
        
        logger.info("Application shutdown completed");
    }
    
    private void waitForPendingRequests() {
        while (getActiveRequests() > 0) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}
```

---

## 第 6 部分：超時管理

### NFR-5.5 設計

**目標**: 防止資源泄漏和無限等待

### 實現方案

#### 1. 連接超時

```java
// 數據庫連接超時
config.setConnectionTimeout(20000); // 20 秒

// HTTP 請求超時
RestTemplate restTemplate = new RestTemplate();
HttpComponentsClientHttpRequestFactory factory = 
    new HttpComponentsClientHttpRequestFactory();
factory.setConnectionTimeout(5000);
factory.setReadTimeout(30000);
restTemplate.setRequestFactory(factory);
```

#### 2. 任務超時

```java
@Service
public class TaskService {
    
    @Async("taskExecutor")
    public CompletableFuture<Report> generateReport(String tenantId) {
        // 設置 30 秒超時
        return CompletableFuture.supplyAsync(() -> {
            try {
                return reportService.generate(tenantId);
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }).orTimeout(30, TimeUnit.SECONDS);
    }
}
```

---

## 第 7 部分：斷路器模式

### NFR-5.6 設計 (P1: 初期可選)

**目標**: 防止連鎖故障

### 實現方案

#### 1. Resilience4j 配置

```yaml
spring:
  cloud:
    circuitbreaker:
      resilience4j:
        instances:
          vendorService:
            registerHealthIndicator: true
            slidingWindowSize: 100
            minimumNumberOfCalls: 5
            automaticTransitionFromOpenToHalfOpenEnabled: true
            waitDurationInOpenState: 5s
            failureRateThreshold: 50
            eventConsumerBufferSize: 10
```

#### 2. 斷路器實現

```java
@Service
public class VendorServiceClient {
    
    @CircuitBreaker(name = "vendorService", fallbackMethod = "vendorServiceFallback")
    public Vendor getVendor(String vendorId) {
        // 調用遠程服務
        return remoteVendorService.getVendor(vendorId);
    }
    
    public Vendor vendorServiceFallback(String vendorId, Exception ex) {
        logger.warn("Vendor service failed, using fallback for {}", vendorId);
        // 返回緩存的舊數據或默認值
        return vendorCache.getOrDefault(vendorId, new Vendor());
    }
}
```

---

## 第 8 部分：重試機制

### NFR-5.7 設計 (P1: 初期可選)

**目標**: 自動重試瞬時故障

### 實現方案

#### 1. 指數退避重試

```java
@Service
public class RetryableService {
    
    @Retry(name = "default", fallbackMethod = "fallback")
    public void performRetryableOperation() {
        // 可能失敗的操作
        externalService.callApi();
    }
    
    public void fallback(Exception e) {
        logger.error("Operation failed after retries", e);
    }
}

@Configuration
public class RetryConfig {
    
    @Bean
    public Customizer<Resilience4jCircuitBreakerFactory> resilience4jCustomizer() {
        return factory -> factory.configureDefault(id -> new Resilience4jConfigBuilder(id)
            .retryConfig(RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(100))
                .intervalFunction(IntervalFunctionCompanion.exponentialRandomBackoff(100, 2))
                .retryOnException(ex -> ex instanceof IOException)
                .build())
            .build());
    }
}
```

---

## ✅ 驗證清單

- [ ] SLA 監控已部署
- [ ] 故障轉移已配置
- [ ] 健康檢查已啟用
- [ ] 優雅關閉已實施
- [ ] 超時管理已配置
- [ ] 斷路器已部署 (可選)
- [ ] 重試機制已配置 (可選)

---

## 🔄 實施順序

1. **第 1 週**: 健康檢查 + 優雅關閉
2. **第 2 週**: 故障轉移部署
3. **第 3 週**: 超時管理 + SLA 監控
4. **第 4 週**: 斷路器 + 重試 (可選)

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：可用性設計完整方案 |
