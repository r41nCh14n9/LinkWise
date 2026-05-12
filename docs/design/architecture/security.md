# NFR-2: 安全設計文檔

**文檔編碼**: NFR-2  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**需求數**: 8 個  
**優先級**: P0 (MVP 必須)  
**狀態**: 🔄 初版

---

## 📋 需求映射表

| 需求編碼 | 需求名稱 | 優先級 | 設計位置 | 複雜度 |
|---------|--------|-------|---------|--------|
| **NFR-2.1** | 多租戶隔離 (行級 RLS) | P0 | [第 2 部分](#多租戶隔離) | ⭐⭐⭐ |
| **NFR-2.2** | OAuth 2.0 + OIDC 認證 | P0 | [第 3 部分](#認證架構) | ⭐⭐⭐ |
| **NFR-2.3** | JWT Token 管理 | P0 | [第 4 部分](#jwt-token-設計) | ⭐⭐ |
| **NFR-2.4** | RBAC 權限檢查 | P0 | [第 5 部分](#rbac-架構) | ⭐⭐ |
| **NFR-2.5** | 敏感數據加密 (AES-256) | P0 | [第 6 部分](#敏感數據加密) | ⭐⭐⭐ |
| **NFR-2.6** | SQL 注入防護 | P0 | [第 7 部分](#sql-注入防護) | ⭐ |
| **NFR-2.7** | CORS 策略限制 | P0 | [第 8 部分](#cors-策略) | ⭐ |
| **NFR-2.8** | 審計日誌記錄 | P0 | [第 9 部分](#審計日誌) | ⭐⭐ |

---

## 第 1 部分：安全架構概述

### 安全矩陣

```
┌─────────────────────────────────────────────────┐
│       安全層 1: 邊界防護 (Nginx + WAF)          │
│   - CORS 限制 / SSL/TLS / DDoS 防護              │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      安全層 2: 認證 (OAuth 2.0 / OIDC)         │
│   - Google OAuth / Keycloak / 本地帳號         │
│   - JWT Token 簽名驗證                          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│    安全層 3: 授權 (RBAC 矩陣)                   │
│   - 角色權限映射 / 細粒度控制                   │
│   - 資源級別權限檢查                            │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│    安全層 4: 數據隔離 (多租戶 RLS)              │
│   - 行級安全 (Row-Level Security)               │
│   - tenant_id 過濾                              │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      安全層 5: 數據保護 (加密 + 審計)          │
│   - AES-256 敏感字段加密 / 審計日誌             │
└─────────────────────────────────────────────────┘
```

### 影響模塊

```
主要:
✓ FR-R (RBAC) - 核心安全模塊
✓ 全部 FR - 都需要認證授權

次要:
✓ FR-D (Dashboard) - 敏感數據展示
✓ FR-V (VMS) - 供應商數據隔離
✓ FR-P (Procurement) - 採購數據隔離
```

---

## 第 2 部分：多租戶隔離

### NFR-2.1 設計

**目標**: 確保租戶數據完全隔離，租戶 A 無法看到租戶 B 的數據

### 實現方案

#### 1. 數據庫行級安全 (RLS)

```sql
-- 建立租戶政策
CREATE POLICY tenant_isolation_policy
ON purchase_request
USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- 應用政策
ALTER TABLE purchase_request ENABLE ROW LEVEL SECURITY;

-- 為所有表應用
CREATE POLICY tenant_policy ON user
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
-- ... 對所有表重複此操作
```

#### 2. 租戶上下文管理

```java
@Component
public class TenantContext {
    
    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
    
    public static void setTenantId(String tenantId) {
        TENANT_ID.set(tenantId);
    }
    
    public static String getTenantId() {
        String tenantId = TENANT_ID.get();
        if (tenantId == null) {
            throw new SecurityException("Tenant context not set");
        }
        return tenantId;
    }
    
    public static void clear() {
        TENANT_ID.remove();
    }
}

@Component
public class TenantFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // 從 JWT Token 中提取租戶 ID
        String tenantId = extractTenantFromToken(httpRequest);
        TenantContext.setTenantId(tenantId);
        
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

#### 3. JPA 查詢自動過濾

```java
@Entity
@Table(name = "purchase_request")
@Where(clause = "tenant_id = ?") // Hibernate 自動添加
public class PurchaseRequest {
    
    @Id
    private UUID id;
    
    @Column(nullable = false)
    private UUID tenantId;
    
    // ... 其他字段
}

// 自動過濾所有查詢
List<PurchaseRequest> purchases = purchaseRepository.findAll();
// SQL 自動變成: SELECT * FROM purchase_request WHERE tenant_id = 'current-tenant'
```

---

## 第 3 部分：認證架構

### NFR-2.2 設計

**目標**: 支持 Google OAuth、Keycloak SSO、本地帳號三種認證方式

### 實現方案

#### 1. Google OAuth 2.0 集成

```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid,profile,email
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          google:
            issuer-uri: https://accounts.google.com
            user-name-attribute: sub
```

#### 2. Keycloak SSO 集成

```yaml
# application.yml
keycloak:
  realm: linkwise
  auth-server-url: https://keycloak.example.com
  ssl-required: external
  resource: linkwise-app
  credentials:
    secret: ${KEYCLOAK_CLIENT_SECRET}
  use-resource-role-mappings: true
```

#### 3. 本地帳號認證

```java
@Service
public class LocalAuthenticationService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRepository userRepository;
    
    public AuthResponse authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationException("Invalid password");
        }
        
        // 生成 JWT Token
        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(token, user);
    }
    
    public void register(String email, String password, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setTenantId(resolveTenantId());
        
        userRepository.save(user);
    }
}
```

#### 4. 認證過程流程

```
┌──────────────────────────────────────────────────┐
│         用戶選擇認證方式                          │
└────┬─────────────┬──────────────┬────────────────┘
     │             │              │
     ▼             ▼              ▼
 Google OAuth  Keycloak SSO   本地帳號
     │             │              │
     └─────────────┼──────────────┘
                   ▼
         ┌─────────────────────┐
         │  驗證身份           │
         └────────┬────────────┘
                  ▼
         ┌─────────────────────┐
         │  查詢/創建用戶      │
         │  綁定租戶          │
         └────────┬────────────┘
                  ▼
         ┌─────────────────────┐
         │  生成 JWT Token    │
         │  設置會話          │
         └─────────────────────┘
```

---

## 第 4 部分：JWT Token 設計

### NFR-2.3 設計

**目標**: 安全可靠的 JWT Token 管理

### 實現方案

#### 1. Token 生成

```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 小時
    private long jwtExpiration;
    
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("tenantId", user.getTenantId().toString())
            .claim("roles", user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList()))
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getSubjectFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            logger.warn("Token expired: {}", e);
            return false;
        } catch (Exception e) {
            logger.warn("Invalid token: {}", e);
            return false;
        }
    }
}
```

#### 2. Token 驗證過濾器

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            
            if (token != null && jwtTokenProvider.validateToken(token)) {
                String userId = jwtTokenProvider.getSubjectFromToken(token);
                
                // 設置安全上下文
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                        userId, null, getAuthorities(token)
                    )
                );
            }
        } catch (Exception e) {
            logger.error("Authentication error: {}", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

#### 3. Token 刷新機制

```java
public class RefreshTokenResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
}

@PostMapping("/auth/refresh")
public RefreshTokenResponse refreshToken(@RequestBody RefreshTokenRequest request) {
    // 驗證 refresh token
    if (!jwtTokenProvider.validateRefreshToken(request.getRefreshToken())) {
        throw new InvalidRefreshTokenException();
    }
    
    String userId = jwtTokenProvider.getSubjectFromToken(request.getRefreshToken());
    User user = userService.findById(userId);
    
    return new RefreshTokenResponse(
        jwtTokenProvider.generateToken(user),
        jwtTokenProvider.generateRefreshToken(user),
        24 * 60 * 60 * 1000
    );
}
```

---

## 第 5 部分：RBAC 架構

### NFR-2.4 設計

**目標**: 基於角色的精細權限控制

### 實現方案

#### 1. RBAC 矩陣

```
┌─────────────────────────────────────────────────────────┐
│                    RBAC 權限矩陣                         │
├─────────────────────────────────────────────────────────┤
│ 角色        │ FR-D  │ FR-R  │ FR-V  │ FR-P  │ 描述      │
├─────────────────────────────────────────────────────────┤
│ Admin       │ CRUD  │ CRUD  │ CRUD  │ CRUD  │ 全權限    │
│ Manager     │ R     │ RU    │ CRU   │ CRUD  │ 管理權限  │
│ Viewer      │ R     │ -     │ R     │ R     │ 查看權限  │
│ Approver    │ -     │ -     │ -     │ U     │ 審批權限  │
│ Vendor      │ R*    │ R*    │ R*    │ R*    │ 有限查看  │
└─────────────────────────────────────────────────────────┘
* 僅限自己的數據
```

#### 2. 數據庫表設計

```sql
-- 角色表
CREATE TABLE role (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 權限表
CREATE TABLE permission (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    resource VARCHAR(100), -- e.g., "PURCHASE_REQUEST"
    action VARCHAR(50)     -- e.g., "READ", "WRITE"
);

-- 角色權限映射
CREATE TABLE role_permission (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES role(id),
    permission_id UUID NOT NULL REFERENCES permission(id),
    UNIQUE(role_id, permission_id)
);

-- 用戶角色
CREATE TABLE user_role (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id),
    role_id UUID NOT NULL REFERENCES role(id),
    UNIQUE(user_id, role_id)
);
```

#### 3. 動態權限檢查

```java
@Service
public class PermissionService {
    
    public boolean hasPermission(String userId, String resource, String action) {
        User user = userService.findById(userId);
        
        return user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .anyMatch(permission -> 
                permission.getResource().equals(resource) &&
                permission.getAction().equals(action)
            );
    }
}

@Component
public class PermissionEvaluator extends DefaultMethodSecurityExpressionHandler {
    
    @Bean
    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
        return new SecurityEvaluationContextExtension();
    }
}

// 使用註解
@PreAuthorize("hasPermission('PURCHASE_REQUEST', 'CREATE')")
@PostMapping("/api/purchases")
public PurchaseResponse createPurchase(@RequestBody CreatePurchaseRequest request) {
    // ...
}
```

---

## 第 6 部分：敏感數據加密

### NFR-2.5 設計

**目標**: 敏感數據使用 AES-256 加密存儲

### 實現方案

#### 1. 加密工具類

```java
@Service
public class EncryptionService {
    
    @Value("${encryption.key}")
    private String encryptionKey;
    
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String CIPHER_ALGORITHM = "AES";
    
    public String encrypt(String plainText) throws Exception {
        SecretKey key = new SecretKeySpec(encryptionKey.getBytes(), 0, 32, CIPHER_ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        
        byte[] encryptedData = cipher.doFinal(plainText.getBytes());
        byte[] iv = cipher.getIV();
        
        // 返回 base64 編碼的 IV + 加密數據
        ByteBuffer buffer = ByteBuffer.allocate(1 + iv.length + encryptedData.length);
        buffer.put((byte) iv.length);
        buffer.put(iv);
        buffer.put(encryptedData);
        
        return Base64.getEncoder().encodeToString(buffer.array());
    }
    
    public String decrypt(String encryptedText) throws Exception {
        ByteBuffer buffer = ByteBuffer.wrap(Base64.getDecoder().decode(encryptedText));
        
        int ivLength = buffer.get();
        byte[] iv = new byte[ivLength];
        buffer.get(iv);
        
        byte[] encryptedData = new byte[buffer.remaining()];
        buffer.get(encryptedData);
        
        SecretKey key = new SecretKeySpec(encryptionKey.getBytes(), 0, 32, CIPHER_ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        
        return new String(cipher.doFinal(encryptedData));
    }
}
```

#### 2. 加密字段定義

```java
@Entity
@Table(name = "vendor")
public class Vendor {
    
    @Id
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "bank_account_encrypted")
    @Convert(converter = EncryptionConverter.class)
    private String bankAccount; // 敏感：銀行賬號
    
    @Column(name = "tax_id_encrypted")
    @Convert(converter = EncryptionConverter.class)
    private String taxId; // 敏感：稅務 ID
}

@Converter
public class EncryptionConverter implements AttributeConverter<String, String> {
    
    @Autowired
    private EncryptionService encryptionService;
    
    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            return encryptionService.encrypt(attribute);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return encryptionService.decrypt(dbData);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

---

## 第 7 部分：SQL 注入防護

### NFR-2.6 設計

**目標**: 防止 SQL 注入攻擊

### 實現方案

#### 1. 預編譯語句

```java
// ✗ 不安全
String query = "SELECT * FROM user WHERE email = '" + email + "'";
List<User> users = entityManager.createNativeQuery(query).getResultList();

// ✓ 安全：使用參數化查詢
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```

#### 2. 輸入驗證

```java
@Component
public class InputValidator {
    
    public void validateEmail(String email) {
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new InvalidInputException("Invalid email format");
        }
    }
    
    public void validateSearch(String searchTerm) {
        // 移除特殊字符
        if (searchTerm.contains("'") || searchTerm.contains("\"") || 
            searchTerm.contains(";") || searchTerm.contains("--")) {
            throw new InvalidInputException("Invalid characters in search");
        }
    }
}
```

#### 3. 允許列表方法

```java
public Page<Purchase> searchPurchases(String sortBy, String sortDir) {
    // 允許的排序字段
    Set<String> allowedFields = Set.of("id", "createdAt", "amount", "status");
    
    if (!allowedFields.contains(sortBy)) {
        throw new InvalidInputException("Invalid sort field");
    }
    
    Sort.Direction direction = Sort.Direction.fromString(sortDir.toUpperCase());
    Sort sort = Sort.by(direction, sortBy);
    
    return purchaseRepository.findAll(Pageable.ofSize(20).withSort(sort));
}
```

---

## 第 8 部分：CORS 策略

### NFR-2.7 設計

**目標**: 限制跨域請求，防止 CSRF 攻擊

### 實現方案

#### 1. CORS 配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "https://app.example.com",
                "https://admin.example.com"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

#### 2. 安全頭設置

```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .headers()
                .xssProtection()
                .and()
                .contentSecurityPolicy("default-src 'self'")
                .and()
                .frameOptions().deny()
            .and()
            .csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
    }
}
```

---

## 第 9 部分：審計日誌

### NFR-2.8 設計

**目標**: 記錄所有敏感操作以供審計

### 實現方案

#### 1. 審計日誌表

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,      -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(100) NOT NULL, -- Purchase, User, etc.
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at);
```

#### 2. 審計攔截器

```java
@Component
@Aspect
public class AuditAspect {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @AfterReturning("@annotation(com.linkwise.annotation.Audit)")
    public void auditAfterReturn(JoinPoint joinPoint) {
        String action = getAction(joinPoint);
        String entityType = getEntityType(joinPoint);
        Object entity = getEntity(joinPoint);
        
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(extractId(entity));
        log.setNewValues(JsonUtils.toJson(entity));
        log.setUserId(getCurrentUserId());
        log.setTenantId(TenantContext.getTenantId());
        log.setIpAddress(getClientIp());
        
        auditLogRepository.save(log);
    }
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audit {
    String action() default "";
}

// 使用
@Audit(action = "CREATE")
@PostMapping("/api/purchases")
public Purchase createPurchase(@RequestBody CreatePurchaseRequest request) {
    // ...
}
```

---

## ✅ 驗證清單

- [ ] 多租戶隔離已配置
- [ ] OAuth 2.0 / OIDC 已集成
- [ ] JWT Token 生成驗證已實施
- [ ] RBAC 矩陣已建立
- [ ] 敏感字段加密已配置
- [ ] SQL 注入防護已實施
- [ ] CORS 策略已配置
- [ ] 審計日誌已啟用

---

## 🔄 實施順序

1. **第 1 週**: 數據庫表設計 + 多租戶隔離
2. **第 2 週**: 認證機制實施 (OAuth + JWT)
3. **第 3 週**: RBAC 權限系統
4. **第 4 週**: 加密 + 審計日誌

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：安全設計完整方案 |

