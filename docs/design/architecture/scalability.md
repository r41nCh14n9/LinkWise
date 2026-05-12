# NFR-4: 可擴展性設計文檔

**文檔編碼**: NFR-4  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**需求數**: 6 個  
**優先級**: P0 (MVP 必須)  
**狀態**: 🔄 初版

---

## 📋 需求映射表

| 需求編碼 | 需求名稱 | 優先級 | 設計位置 | 複雜度 |
|---------|--------|-------|---------|--------|
| **NFR-4.1** | 水平擴展支持 (無狀態設計) | P0 | [第 2 部分](#無狀態設計) | ⭐⭐⭐ |
| **NFR-4.2** | 數據庫連接池 | P0 | [第 3 部分](#數據庫連接池) | ⭐⭐ |
| **NFR-4.3** | 異步任務隊列 | P0 | [第 4 部分](#異步任務隊列) | ⭐⭐ |
| **NFR-4.4** | 消息隊列支持 | P1 | [第 5 部分](#消息隊列-可選) | ⭐⭐ |
| **NFR-4.5** | 分佈式事務 (Saga 模式) | P0 | [第 6 部分](#分佈式事務-saga-模式) | ⭐⭐⭐ |
| **NFR-4.6** | CDN 支持靜態資源 | P1 | [第 7 部分](#cdn-支持) | ⭐ |

---

## 第 1 部分：可擴展性架構概述

### 擴展策略

```
┌─────────────────────────────────────────────────────┐
│           可擴展性架構 (3 層)                        │
├─────────────────────────────────────────────────────┤
│ 應用層      → 無狀態 / 水平擴展 / 負載均衡          │
│ 數據層      → 連接池 / 讀寫分離 / 分片              │
│ 緩存層      → Redis / 三層快取 / 預熱               │
└─────────────────────────────────────────────────────┘
```

### 影響模塊

```
全部 FR 受影響:
✓ FR-D (Dashboard) - 高查詢負載
✓ FR-R (RBAC) - 認證瓶頸
✓ FR-V (VMS) - 供應商數據量大
✓ FR-P (Procurement) - 批量操作頻繁
```

---

## 第 2 部分：無狀態設計

### NFR-4.1 設計

**目標**: 應用層完全無狀態，支持水平擴展

### 實現方案

#### 1. 無狀態設計原則

```
✗ 禁止做法:
  - 在應用內存中存儲會話 (HttpSession)
  - 依賴本地文件系統
  - 使用實例變數存儲業務數據
  - 依賴服務器時間同步

✓ 正確做法:
  - 所有狀態存儲到 Redis / 數據庫
  - 使用 JWT Token (自包含)
  - 無狀態 API 設計
  - 使用 NTP 時間同步
```

#### 2. JWT 會話設計

```java
@Service
public class StatelessAuthService {
    
    // JWT Token 包含所有必要信息
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("tenantId", user.getTenantId())
            .claim("roles", extractRoles(user))
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    // 無需查詢會話表，直接驗證 Token
    public UserContext validateToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        
        return new UserContext(
            claims.getSubject(),
            claims.get("email", String.class),
            claims.get("tenantId", String.class),
            (List<String>) claims.get("roles")
        );
    }
}
```

#### 3. 請求上下文管理

```java
@Component
public class RequestContextFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // 設置請求上下文 (使用 ThreadLocal)
        RequestContext.setRequestId(UUID.randomUUID().toString());
        RequestContext.setStartTime(System.currentTimeMillis());
        RequestContext.setUserId(extractUserId(httpRequest));
        RequestContext.setTenantId(extractTenantId(httpRequest));
        
        try {
            chain.doFilter(request, response);
        } finally {
            RequestContext.clear(); // 避免 ThreadLocal 泄漏
        }
    }
}

@Component
public class RequestContext {
    private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();
    private static final ThreadLocal<Long> START_TIME = new ThreadLocal<>();
    private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
    
    // ... getter/setter/clear methods
}
```

#### 4. 水平擴展部署

```
Docker 容器化:
✓ 每個容器都是無狀態副本
✓ 通過 Docker Compose 或 Kubernetes 啟動多個副本
✓ Nginx 進行負載均衡
✓ 可動態添加/移除容器
```

---

## 第 3 部分：數據庫連接池

### NFR-4.2 設計

**目標**: 有效管理數據庫連接，提高並發性能

### 實現方案

#### 1. HikariCP 配置

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/linkwise
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      # 池大小配置
      maximum-pool-size: 20          # 最大連接數
      minimum-idle: 5                # 最小空閒連接
      
      # 超時配置
      connection-timeout: 20000      # 獲取連接超時 (ms)
      idle-timeout: 600000           # 空閒連接超時 (10 min)
      max-lifetime: 1800000          # 連接最大生命期 (30 min)
      
      # 性能配置
      auto-commit: true
      leak-detection-threshold: 60000 # 連接泄漏檢測 (ms)
      
      # 驗證
      connection-test-query: SELECT 1
```

#### 2. 連接池監控

```java
@Component
public class ConnectionPoolMetrics {
    
    @Autowired
    private HikariDataSource dataSource;
    
    @Bean
    public MeterBinder connectionPoolMetrics() {
        return registry -> {
            registry.gauge("db.connection.pool.max", 
                dataSource::getMaximumPoolSize);
            registry.gauge("db.connection.pool.active", 
                dataSource::getActiveConnections);
            registry.gauge("db.connection.pool.idle", 
                dataSource::getIdleConnections);
        };
    }
    
    @Scheduled(fixedDelay = 60000) // 每分鐘檢查
    public void monitorConnectionPool() {
        HikariPoolMXBean mxBean = dataSource.getHikariPoolMXBean();
        
        int activeConnections = mxBean.getActiveConnections();
        int idleConnections = mxBean.getIdleConnections();
        int totalConnections = activeConnections + idleConnections;
        
        logger.info("Connection Pool Status - Active: {}, Idle: {}, Total: {}", 
            activeConnections, idleConnections, totalConnections);
        
        if (activeConnections > 15) {
            logger.warn("High connection usage detected: {}/{}", 
                activeConnections, dataSource.getMaximumPoolSize());
        }
    }
}
```

---

## 第 4 部分：異步任務隊列

### NFR-4.3 設計

**目標**: 異步處理耗時操作，提高應用響應時間

### 實現方案

#### 1. 任務隊列配置

```java
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    
    @Bean("taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-task-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
    
    @Bean("reportExecutor")
    public Executor reportExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("report-");
        executor.initialize();
        return executor;
    }
}
```

#### 2. 異步任務實現

```java
@Service
public class AsyncTaskService {
    
    // 報表生成 (異步)
    @Async("reportExecutor")
    public CompletableFuture<Report> generateReportAsync(String tenantId, ReportParams params) {
        try {
            Report report = reportService.generateReport(tenantId, params);
            return CompletableFuture.completedFuture(report);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }
    
    // 郵件發送 (異步)
    @Async("taskExecutor")
    public void sendEmailAsync(String to, String subject, String content) {
        emailService.send(to, subject, content);
    }
    
    // 批量導入 (異步)
    @Async("taskExecutor")
    public void importPurchasesAsync(String tenantId, File file) {
        importService.importFromCSV(tenantId, file);
    }
}

// 控制器調用異步方法
@PostMapping("/api/reports/generate")
public ResponseEntity<String> generateReport(@RequestBody ReportRequest request) {
    asyncTaskService.generateReportAsync(request.getTenantId(), request.getParams())
        .thenAccept(report -> notificationService.notifyReportReady(request.getUserId()))
        .exceptionally(ex -> {
            notificationService.notifyReportError(request.getUserId(), ex);
            return null;
        });
    
    return ResponseEntity.accepted().body("Report generation started");
}
```

#### 3. 任務持久化

```java
@Entity
@Table(name = "async_task")
public class AsyncTask {
    
    @Id
    private UUID id;
    
    private String taskType; // "REPORT", "IMPORT", "EXPORT"
    private UUID tenantId;
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    private TaskStatus status; // PENDING, RUNNING, COMPLETED, FAILED
    
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    
    private String resultPath;
    private String errorMessage;
}

public enum TaskStatus {
    PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
}

@Component
@Scheduled(fixedDelay = 60000) // 每分鐘檢查
public class TaskStatusMonitor {
    
    public void monitorTasks() {
        List<AsyncTask> runningTasks = asyncTaskRepository.findByStatus(TaskStatus.RUNNING);
        
        for (AsyncTask task : runningTasks) {
            // 檢查是否超時 (> 30 min)
            if (task.getStartedAt().isBefore(LocalDateTime.now().minusMinutes(30))) {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorMessage("Task timeout");
                asyncTaskRepository.save(task);
            }
        }
    }
}
```

---

## 第 5 部分：消息隊列 (可選)

### NFR-4.4 設計 (P1: 初期可選)

**目標**: 支持事件驅動架構 (Phase 2)

### 實現方案

#### 1. Kafka / RabbitMQ 配置

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      acks: all
      retries: 3
      batch-size: 16384
    consumer:
      group-id: linkwise-consumer-group
      auto-offset-reset: earliest
```

#### 2. 事件發布

```java
@Service
public class EventPublisher {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void publishPurchaseCreated(Purchase purchase) {
        PurchaseCreatedEvent event = new PurchaseCreatedEvent(
            purchase.getId(),
            purchase.getTenantId(),
            purchase.getAmount(),
            LocalDateTime.now()
        );
        
        kafkaTemplate.send("purchases.created", event.toJson());
    }
}
```

---

## 第 6 部分：分佈式事務 (Saga 模式)

### NFR-4.5 設計

**目標**: 支持跨服務的分佈式事務

### 實現方案

#### 1. Saga 模式實現

```
PR 轉 PO 流程 (分佈式事務):

Step 1: 驗證 PR 內容
Step 2: 創建 PO
Step 3: 扣除預算
Step 4: 通知供應商

失敗回滾:
- 如果 Step 2 失敗: 回滾 (無需操作)
- 如果 Step 3 失敗: 刪除 PO，回滾
- 如果 Step 4 失敗: 記錄錯誤，重試
```

#### 2. Spring Statemachine 實現

```java
@Configuration
@EnableStateMachine
public class PurchaseOrderStateMachine extends EnumStateMachineConfigurerAdapter<OrderState, OrderEvent> {
    
    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states)
            throws Exception {
        states.withStates()
            .initial(OrderState.PENDING)
            .state(OrderState.VALIDATING)
            .state(OrderState.PO_CREATED)
            .state(OrderState.BUDGET_DEDUCTED)
            .state(OrderState.NOTIFICATION_SENT)
            .state(OrderState.COMPLETED)
            .state(OrderState.FAILED);
    }
    
    @Override
    public void configure(StateMachineTransitionConfigurer<OrderState, OrderEvent> transitions)
            throws Exception {
        transitions
            .withExternal()
                .source(OrderState.PENDING).target(OrderState.VALIDATING)
                .event(OrderEvent.VALIDATE)
                .action(validatePurchaseOrder())
            .and()
            .withExternal()
                .source(OrderState.VALIDATING).target(OrderState.PO_CREATED)
                .event(OrderEvent.CREATE_PO)
                .action(createPurchaseOrder());
    }
}
```

---

## 第 7 部分：CDN 支持

### NFR-4.6 設計 (P1: 初期可選)

**目標**: 靜態資源 CDN 分發

### 實現方案

#### 1. CDN 配置

```
靜態資源分佈:
✓ JavaScript 包 (main.js, vendor.js)
✓ CSS 文件 (styles.css)
✓ 圖片資源 (logo, icon)
✓ 字體文件 (woff2)

CDN 節點分佈:
✓ 亞太地區 (新加坡)
✓ 歐洲 (倫敦)
✓ 北美 (弗吉尼亞)
```

#### 2. 前端配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        dir: 'dist',
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  define: {
    __CDN_URL__: JSON.stringify(process.env.VITE_CDN_URL || '/'),
  }
})

// 資源加載
const cdnUrl = import.meta.env.VITE_CDN_URL || '/';
const imageUrl = `${cdnUrl}images/logo.png`;
```

---

## ✅ 驗證清單

- [ ] 無狀態設計已驗證
- [ ] 連接池配置已優化
- [ ] 異步任務隊列已部署
- [ ] 消息隊列已配置 (可選)
- [ ] Saga 模式已實現
- [ ] CDN 已配置 (可選)

---

## 🔄 實施順序

1. **第 1 週**: 無狀態設計 + 連接池
2. **第 2 週**: 異步任務隊列
3. **第 3 週**: Saga 模式實現
4. **第 4 週**: CDN 配置 (可選)

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：可擴展性設計完整方案 |
