# NFR-6: 可維護性設計文檔

**文檔編碼**: NFR-6  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**需求數**: 6 個  
**優先級**: P0 (MVP 必須)  
**狀態**: 🔄 初版

---

## 📋 需求映射表

| 需求編碼 | 需求名稱 | 優先級 | 設計位置 | 複雜度 |
|---------|--------|-------|---------|--------|
| **NFR-6.1** | 代碼風格指南 | P0 | [第 2 部分](#代碼風格指南) | ⭐ |
| **NFR-6.2** | 單元測試覆蓋率 (> 80%) | P0 | [第 3 部分](#單元測試) | ⭐⭐ |
| **NFR-6.3** | 集成測試覆蓋率 (> 70%) | P0 | [第 4 部分](#集成測試) | ⭐⭐ |
| **NFR-6.4** | API 文檔 | P0 | [第 5 部分](#api-文檔) | ⭐ |
| **NFR-6.5** | 代碼評審流程 | P0 | [第 6 部分](#代碼評審) | ⭐⭐ |
| **NFR-6.6** | 依賴版本管理 | P0 | [第 7 部分](#依賴版本管理) | ⭐ |

---

## 第 1 部分：可維護性架構概述

### 可維護性支柱

```
┌─────────────────────────────────────────────────────┐
│            可維護性 (6 大支柱)                       │
├─────────────────────────────────────────────────────┤
│ 1. 代碼標準化 → 風格指南 + Linter + Formatter      │
│ 2. 測試驅動   → Unit + Integration + E2E 測試      │
│ 3. 文檔完整   → API + 架構 + 部署文檔               │
│ 4. 代碼評審   → GitHub PR + 自動檢查                │
│ 5. 日誌管理   → 結構化 / 級別 / 聚合                │
│ 6. 依賴管理   → 版本鎖定 / 更新政策                │
└─────────────────────────────────────────────────────┘
```

### 影響模塊

```
全部 FR 受影響:
✓ 代碼質量影響所有模塊
✓ 測試覆蓋所有功能
✓ 文檔幫助開發者理解設計
```

---

## 第 2 部分：代碼風格指南

### NFR-6.1 設計

**目標**: 統一的代碼風格提高可讀性

### 實現方案

#### 1. Java 編碼標準 (Google Java Style)

```java
// ✓ 正確
public class PurchaseService {
    
    private final PurchaseRepository purchaseRepository;
    private final VendorService vendorService;
    
    public PurchaseService(
            PurchaseRepository purchaseRepository,
            VendorService vendorService) {
        this.purchaseRepository = purchaseRepository;
        this.vendorService = vendorService;
    }
    
    public Purchase createPurchase(CreatePurchaseRequest request) {
        // 實現邏輯
        return purchase;
    }
}

// ✗ 錯誤：不遵循風格
public class purchaseservice{
    public Purchase createpurchase(CreatePurchaseRequest req){
        return new Purchase();
    }
}
```

#### 2. TypeScript 編碼標準 (Airbnb Style)

```typescript
// ✓ 正確
interface User {
  id: string;
  email: string;
  name: string;
}

const createUser = async (data: User): Promise<User> => {
  const response = await api.post('/users', data);
  return response.data;
};

// ✗ 錯誤
interface User {
  id: String,
  email: String
}

var createUser = function(data) {
  return api.post('/users', data)
}
```

#### 3. ESLint / Prettier 配置

```json
// .eslintrc.json
{
  "extends": ["airbnb", "prettier"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

#### 4. Java Checkstyle

```xml
<!-- checkstyle.xml -->
<module name="Checker">
  <module name="TreeWalker">
    <module name="NamingConventions"/>
    <module name="UnusedImports"/>
    <module name="MethodLength">
      <property name="max" value="50"/>
    </module>
    <module name="ParameterNumber">
      <property name="max" value="5"/>
    </module>
  </module>
</module>
```

#### 5. Git Pre-commit 鉤子

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 運行 Prettier
npx prettier --write src/

# 運行 ESLint
npx eslint src/ --fix

# 運行 Checkstyle
mvn checkstyle:check

# 檢查是否有效
if [ $? -ne 0 ]; then
  echo "Code style check failed"
  exit 1
fi
```

---

## 第 3 部分：單元測試

### NFR-6.2 設計

**目標**: > 80% 單元測試覆蓋率

### 實現方案

#### 1. 單元測試框架

```java
// 使用 JUnit 5 + Mockito + AssertJ
@ExtendWith(MockitoExtension.class)
public class PurchaseServiceTest {
    
    @Mock
    private PurchaseRepository purchaseRepository;
    
    @Mock
    private VendorService vendorService;
    
    @InjectMocks
    private PurchaseService purchaseService;
    
    @Test
    @DisplayName("建立採購時應驗證金額")
    public void testCreatePurchase_WithValidAmount() {
        // Arrange
        CreatePurchaseRequest request = new CreatePurchaseRequest();
        request.setAmount(1000.0);
        request.setVendorId("vendor-1");
        
        Vendor vendor = new Vendor();
        vendor.setId("vendor-1");
        vendor.setName("Test Vendor");
        
        when(vendorService.getVendor("vendor-1")).thenReturn(vendor);
        when(purchaseRepository.save(any(Purchase.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // Act
        Purchase result = purchaseService.createPurchase(request);
        
        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(1000.0);
        assertThat(result.getVendor()).isEqualTo(vendor);
        
        verify(purchaseRepository).save(any(Purchase.class));
    }
    
    @Test
    @DisplayName("金額為零應拋出異常")
    public void testCreatePurchase_WithZeroAmount() {
        CreatePurchaseRequest request = new CreatePurchaseRequest();
        request.setAmount(0.0);
        
        assertThatThrownBy(() -> purchaseService.createPurchase(request))
            .isInstanceOf(InvalidPurchaseException.class);
    }
}
```

#### 2. 前端單元測試

```typescript
// vitest + React Testing Library
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseForm } from './PurchaseForm';

describe('PurchaseForm', () => {
  it('should submit form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<PurchaseForm onSubmit={handleSubmit} />);
    
    const amountInput = screen.getByLabelText(/amount/i);
    const vendorSelect = screen.getByLabelText(/vendor/i);
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    
    await userEvent.type(amountInput, '1000');
    await userEvent.selectOptions(vendorSelect, 'vendor-1');
    await userEvent.click(submitBtn);
    
    expect(handleSubmit).toHaveBeenCalledWith({
      amount: '1000',
      vendorId: 'vendor-1'
    });
  });
});
```

#### 3. 代碼覆蓋率報告

```bash
# Maven 配置
mvn clean test jacoco:report

# Vitest 配置
vitest --coverage

# 結果輸出
- Backend: 82% 覆蓋率
- Frontend: 78% 覆蓋率
```

---

## 第 4 部分：集成測試

### NFR-6.3 設計

**目標**: > 70% 集成測試覆蓋率

### 實現方案

#### 1. 集成測試框架

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class PurchaseControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private PurchaseRepository purchaseRepository;
    
    @BeforeEach
    public void setUp() {
        purchaseRepository.deleteAll();
    }
    
    @Test
    @DisplayName("創建採購 - 集成測試")
    public void testCreatePurchase_Integration() {
        // Arrange
        CreatePurchaseRequest request = new CreatePurchaseRequest();
        request.setAmount(1000.0);
        request.setVendorId("vendor-1");
        
        // Act
        ResponseEntity<PurchaseResponse> response = restTemplate.postForEntity(
            "/api/purchases",
            request,
            PurchaseResponse.class
        );
        
        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(purchaseRepository.count()).isEqualTo(1);
    }
    
    @Test
    @DisplayName("查詢採購 - 集成測試")
    public void testGetPurchase_Integration() {
        // Arrange
        Purchase purchase = new Purchase();
        purchase.setAmount(500.0);
        purchase = purchaseRepository.save(purchase);
        
        // Act
        ResponseEntity<PurchaseResponse> response = restTemplate.getForEntity(
            "/api/purchases/" + purchase.getId(),
            PurchaseResponse.class
        );
        
        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getId()).isEqualTo(purchase.getId());
    }
}
```

#### 2. 測試容器 (TestContainers)

```java
@SpringBootTest
public class DatabaseIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>()
        .withDatabaseName("linkwise_test")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```

---

## 第 5 部分：API 文檔

### NFR-6.4 設計

**目標**: 自動生成 API 文檔

### 實現方案

#### 1. Springfox / Swagger 配置

```java
@Configuration
@EnableOpenApi
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("LinkWise API")
                .version("1.0")
                .description("採購管理系統 API"))
            .addServersItem(new Server()
                .url("http://localhost:8080")
                .description("Development"));
    }
}
```

#### 2. API 端點文檔

```java
@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {
    
    @PostMapping
    @Operation(summary = "創建採購申請", description = "創建新的採購申請單")
    @ApiResponse(responseCode = "201", description = "成功創建")
    public ResponseEntity<PurchaseResponse> createPurchase(
            @RequestBody @Valid CreatePurchaseRequest request) {
        // 實現
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "查詢採購申請")
    @ApiResponse(responseCode = "200", description = "查詢成功")
    @ApiResponse(responseCode = "404", description = "採購申請不存在")
    public ResponseEntity<PurchaseResponse> getPurchase(
            @PathVariable @NotBlank String id) {
        // 實現
        return ResponseEntity.ok().build();
    }
}
```

#### 3. 文檔生成

```bash
# Swagger UI 訪問
http://localhost:8080/swagger-ui.html

# OpenAPI JSON
http://localhost:8080/api-docs
```

---

## 第 6 部分：代碼評審

### NFR-6.5 設計

**目標**: 建立代碼評審流程

### 實現方案

#### 1. PR 提交規範

```markdown
## PR 描述
簡要描述更改內容

## 關聯 Issue
- Fixes #123
- Related to #456

## 更改類型
- [ ] Bug 修復
- [ ] 新功能
- [ ] 性能優化
- [x] 代碼重構

## 自檢清單
- [x] 代碼遵循風格指南
- [x] 添加了單元測試
- [x] 所有測試通過
- [x] 更新了文檔

## 審查者請特別關注
- 新添加的 N+1 查詢邏輯
- 安全相關變更
```

#### 2. 自動檢查

```yaml
# .github/workflows/ci.yml
name: CI

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Code Style Check
        run: mvn checkstyle:check
      
      - name: Unit Tests
        run: mvn clean test
      
      - name: Code Coverage
        run: mvn jacoco:report
      
      - name: SONAR Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: SonarCloud Quality Gate
        uses: sonarsource/sonarcloud-github-c-cpp@SonarSource/sonarcloud-github-c-cpp-v1
```

#### 3. 評審要點

```
代碼評審檢查清單:

□ 代碼風格
  - 遵循命名規範
  - 縮進一致
  - 註釋清晰

□ 邏輯正確性
  - 邊界條件處理
  - 錯誤處理完善
  - 無邏輯漏洞

□ 性能考慮
  - 無 N+1 查詢
  - 算法複雜度合理
  - 適當使用快取

□ 安全性
  - SQL 注入防護
  - 訪問控制檢查
  - 敏感數據保護

□ 測試覆蓋
  - 有單元測試
  - 涵蓋邊界情況
  - 覆蓋率足夠
```

---

## 第 7 部分：依賴版本管理

### NFR-6.6 設計

**目標**: 安全管理依賴版本

### 實現方案

#### 1. Maven BOM (Bill of Materials)

```xml
<!-- pom.xml -->
<dependencyManagement>
  <dependencies>
    <!-- Spring Boot -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.2.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
    
    <!-- 自定義 BOM -->
    <dependency>
      <groupId>com.linkwise</groupId>
      <artifactId>linkwise-bom</artifactId>
      <version>1.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <!-- 無需指定版本，由 BOM 管理 -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
</dependencies>
```

#### 2. 依賴安全掃描

```bash
# Maven Dependency Check
mvn org.owasp:dependency-check-maven:check

# npm Audit
npm audit

# Snyk 掃描
snyk test
```

#### 3. 更新政策

```
安全更新: 立即應用
主版本更新: 評估兼容性後更新
次版本更新: 定期檢查並更新
補丁版本: 自動應用
```

---

## ✅ 驗證清單

- [ ] 代碼風格指南已制定
- [ ] Linter / Formatter 已配置
- [ ] 單元測試覆蓋率達到 > 80%
- [ ] 集成測試覆蓋率達到 > 70%
- [ ] API 文檔已生成
- [ ] PR 評審流程已建立
- [ ] 自動檢查已部署
- [ ] 依賴版本已鎖定

---

## 🔄 實施順序

1. **第 1 週**: 代碼風格 + Linter 配置
2. **第 2 週**: 單元測試框架 + 自動檢查
3. **第 3 週**: 集成測試 + API 文檔
4. **第 4 週**: PR 流程 + 依賴管理

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：可維護性設計完整方案 |
