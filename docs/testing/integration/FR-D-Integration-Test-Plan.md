# FR-D Dashboard 集成測試計劃

**測試版本**: 1.0  
**日期**: 2026-05-08  
**範圍**: FR-D (全部 17 個功能)  
**優先級**: P0 (MVP 必須)  
**狀態**: 準備就緒

---

## 1. 測試策略概述

### 1.1 測試範圍

**涵蓋的功能** (17 個需求):
- **FR-D1**: 摘要卡片 (4 個子功能)
- **FR-D2**: 支出趨勢 (4 個子功能)
- **FR-D3**: 供應商評分 (3 個子功能)
- **FR-D4**: PR/PO 漏斗 (3 個子功能)
- **FR-D5**: 最近操作 (3 個子功能)

### 1.2 測試類型

| 類型 | 覆蓋 | 優先級 |
|------|------|-------|
| **API 集成測試** | 所有 REST 端點 | P0 |
| **數據正確性測試** | DTO 結構和數據計算 | P0 |
| **多租戶隔離測試** | organizationId 隔離 | P0 |
| **性能測試** | 響應時間 < 500ms | P1 |
| **錯誤處理測試** | 異常情況 | P1 |

### 1.3 測試環境

- **後端**: Spring Boot 3.2.2 (localhost:8080)
- **數據庫**: PostgreSQL 16 (localhost:5432)
- **測試工具**: JUnit + REST Assured 或 curl
- **部署方式**: Docker Compose

---

## 2. 測試計劃詳細

### 2.1 API 端點覆蓋

#### 1️⃣ 聚合端點 (2 個)

| 端點 | 方法 | 優先級 | 預期狀態 |
|------|------|-------|---------|
| `/api/v1/dashboard` | GET | P0 | 200 OK |
| `/api/v1/dashboard/health` | GET | P0 | 200 OK |

**測試用例**:
- TC1.1: 使用默認 organizationId 獲取完整儀表板
- TC1.2: 使用自定義 organizationId 獲取儀表板
- TC1.3: 獲取儀表板時參數包含 timeRange

#### 2️⃣ 摘要卡片端點 (1 個)

| 端點 | 方法 | 對應需求 | 預期狀態 |
|------|------|---------|---------|
| `/api/v1/dashboard/summary` | GET | FR-D1 | 200 OK |

**測試用例**:
- TC2.1: 獲取摘要卡片 - 驗證月度支出
  - 檢查 `monthlyExpense.amount` > 0
  - 檢查 `monthlyExpense.currency` = "CNY"
  - 檢查 `monthlyExpense.departmentBreakdown` 非空
  - 檢查 `monthlyExpense.categoryBreakdown` 非空

- TC2.2: 獲取摘要卡片 - 驗證活躍供應商
  - 檢查 `activeVendors.count` > 0
  - 檢查 `activeVendors.byCategory` 非空
  - 檢查分類數量合理

- TC2.3: 獲取摘要卡片 - 驗證待處理 PR
  - 檢查 `pendingPRs.count` >= 0
  - 檢查 `pendingPRs.overdue` <= `count`
  - 檢查 `pendingPRs.byCostCenter` 非空

- TC2.4: 獲取摘要卡片 - 驗證庫存預警
  - 檢查 `inventoryWarnings.count` >= 0
  - 檢查 `inventoryWarnings.criticalItems` 為列表

#### 3️⃣ 支出趨勢端點 (2 個)

| 端點 | 方法 | 對應需求 | 預期狀態 |
|------|------|---------|---------|
| `/api/v1/dashboard/spending-trend` | GET | FR-D2.1-2.3 | 200 OK |
| `/api/v1/dashboard/spending-trend/export` | GET | FR-D2.4 | 200 OK |

**測試用例**:
- TC3.1: 獲取 6 個月支出趨勢
  - 檢查 `timeRange` = "6MONTHS"
  - 檢查 `monthlyData` 長度 = 6
  - 驗證月度數據遞增/遞減合理

- TC3.2: 獲取 12 個月支出趨勢
  - 檢查 `timeRange` = "12MONTHS"
  - 檢查 `monthlyData` 長度 = 12
  - 驗證預算對比數據

- TC3.3: 支出趨勢多維度篩選
  - 請求參數: `department=採購部&category=物流`
  - 驗證返回數據按維度過濾

- TC3.4: 支出趨勢數據導出
  - 檢查 `isExportable` = true
  - 驗證導出格式標記

#### 4️⃣ 供應商評分端點 (1 個)

| 端點 | 方法 | 對應需求 | 預期狀態 |
|------|------|---------|---------|
| `/api/v1/dashboard/vendor-scoring` | GET | FR-D3 | 200 OK |

**測試用例**:
- TC4.1: 獲取供應商評分列表
  - 檢查 `vendorScores` 非空
  - 驗證每個供應商有 `overallScore` (0-100)
  - 驗證 `riskLevel` ∈ {LOW, MEDIUM, HIGH}

- TC4.2: 風險等級分布統計
  - 檢查 `riskDistribution` 包含 LOW, MEDIUM, HIGH
  - 驗證計數合理性

- TC4.3: 高風險告警
  - 驗證 `alerts` 為列表
  - 檢查告警是否對應高風險供應商

- TC4.4: 按風險等級篩選
  - 查詢參數: `riskLevel=HIGH`
  - 驗證返回結果僅包含高風險供應商

#### 5️⃣ PR/PO 漏斗端點 (1 個)

| 端點 | 方法 | 對應需求 | 預期狀態 |
|------|------|---------|---------|
| `/api/v1/dashboard/pipeline-funnel` | GET | FR-D4 | 200 OK |

**測試用例**:
- TC5.1: 漏斗分布數據
  - 檢查 `funnel` 包含所有階段
  - 驗證階段順序: DRAFT → SUBMITTED → APPROVED → CONVERTED → COMPLETED
  - 檢查 `count` 逐級遞減

- TC5.2: 轉化率指標
  - 驗證 `conversionRates` 包含各階段轉化率
  - 檢查轉化率值在 0-100%

- TC5.3: 瓶頸分析
  - 驗證 `bottlenecks` 為列表
  - 檢查瓶頸是否對應低轉化率階段

#### 6️⃣ 最近操作端點 (1 個)

| 端點 | 方法 | 對應需求 | 預期狀態 |
|------|------|---------|---------|
| `/api/v1/dashboard/recent-operations` | GET | FR-D5 | 200 OK |

**測試用例**:
- TC6.1: 最近 PR/PO 列表
  - 檢查 `recentPRs` 為列表
  - 驗證每個 PR 有必要字段: prNumber, amount, status, vendor

- TC6.2: 最近供應商列表
  - 檢查 `recentVendors` 非空
  - 驗證供應商評分在 0-100

- TC6.3: 快速操作
  - 驗證 `quickActions` 為列表
  - 檢查操作類型有效

- TC6.4: 分頁支持
  - 查詢參數: `limit=10`
  - 驗證返回記錄數 ≤ 10

---

## 3. 數據正確性測試

### 3.1 DTO 結構驗證

```java
// 驗證 DashboardDTO 結構
public void testDashboardDTOStructure() {
    // 驗證所有 5 個主要部分非空
    assertNotNull(dashboard.getSummaryCards());
    assertNotNull(dashboard.getExpenseTrend());
    assertNotNull(dashboard.getVendorScoring());
    assertNotNull(dashboard.getPrpoFunnel());
    assertNotNull(dashboard.getRecentOperations());
    
    // 驗證租戶和用戶信息
    assertNotNull(dashboard.getOrganizationId());
    assertNotNull(dashboard.getUserId());
}

// 驗證摘要卡片完整性
public void testSummaryCardsCompleteness() {
    SummaryCards summary = dashboard.getSummaryCards();
    assertNotNull(summary.getMonthlyExpense());
    assertNotNull(summary.getActiveVendors());
    assertNotNull(summary.getPendingPRs());
    assertNotNull(summary.getInventoryWarnings());
}
```

### 3.2 數據邏輯驗證

```java
// 驗證支出趨勢數據邏輯
public void testExpenseTrendDataLogic() {
    List<MonthlyData> data = trend.getMonthlyData();
    
    // 檢查時間序列連續性
    for (int i = 0; i < data.size() - 1; i++) {
        assertNotNull(data.get(i).getMonth());
        assertNotNull(data.get(i+1).getMonth());
        // 驗證月份遞增
    }
    
    // 驗證數據分解合理性
    for (MonthlyData month : data) {
        BigDecimal total = month.getTotalExpense();
        BigDecimal sumByDept = month.getByDepartment()
            .values()
            .stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        // 分解合計應接近總數
        assertEquals(total, sumByDept, tolerance);
    }
}

// 驗證漏斗數據合理性
public void testFunnelDataLogic() {
    List<FunnelStage> funnel = funnelDTO.getFunnel();
    
    // 驗證階段遞減
    for (int i = 0; i < funnel.size() - 1; i++) {
        assertTrue(funnel.get(i).getCount() >= funnel.get(i+1).getCount());
    }
    
    // 驗證百分比合計為 100%
    double totalPercent = funnel.stream()
        .mapToDouble(FunnelStage::getPercentage)
        .sum();
    assertEquals(100.0, totalPercent, 0.1);
}
```

---

## 4. 多租戶隔離測試

### 4.1 租戶數據隔離

```java
// TC7.1: 不同租戶返回不同數據
public void testTenantDataIsolation() {
    DashboardDTO org1Dashboard = getDashboard(orgId = 1);
    DashboardDTO org2Dashboard = getDashboard(orgId = 2);
    
    // 驗證金額不同
    BigDecimal org1Expense = org1Dashboard.getSummaryCards()
        .getMonthlyExpense().getAmount();
    BigDecimal org2Expense = org2Dashboard.getSummaryCards()
        .getMonthlyExpense().getAmount();
    assertNotEquals(org1Expense, org2Expense);
    
    // 驗證供應商不同
    int org1VendorCount = org1Dashboard.getSummaryCards()
        .getActiveVendors().getCount();
    int org2VendorCount = org2Dashboard.getSummaryCards()
        .getActiveVendors().getCount();
    assertNotEquals(org1VendorCount, org2VendorCount);
}

// TC7.2: organizationId 是必需的
public void testOrganizationIdRequired() {
    // 缺少 organizationId 時，應使用默認值 1
    ResponseEntity<?> response = getDashboard(null);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    
    // 驗證返回數據中 organizationId = 1
    DashboardDTO dashboard = (DashboardDTO) response.getBody();
    assertEquals(1L, dashboard.getOrganizationId());
}
```

---

## 5. 性能測試

### 5.1 響應時間測試

```java
// TC8.1: 完整儀表板響應時間
public void testFullDashboardResponseTime() {
    long startTime = System.currentTimeMillis();
    DashboardDTO dashboard = getDashboard();
    long duration = System.currentTimeMillis() - startTime;
    
    // 預期: < 500ms
    assertTrue(duration < 500, "Response time exceeded 500ms: " + duration);
}

// TC8.2: 單個端點響應時間
public void testIndividualEndpointResponseTime() {
    // 摘要卡片: < 200ms
    testEndpointResponseTime("/api/v1/dashboard/summary", 200);
    
    // 支出趨勢: < 300ms
    testEndpointResponseTime("/api/v1/dashboard/spending-trend", 300);
    
    // 供應商評分: < 300ms
    testEndpointResponseTime("/api/v1/dashboard/vendor-scoring", 300);
}
```

---

## 6. 錯誤處理測試

### 6.1 異常情況

```java
// TC9.1: 無效的 organizationId
public void testInvalidOrganizationId() {
    ResponseEntity<?> response = getDashboard(orgId = -1);
    // 應返回 400 或使用默認值
    assertTrue(response.getStatusCode() == HttpStatus.BAD_REQUEST 
        || response.getStatusCode() == HttpStatus.OK);
}

// TC9.2: 無效的 timeRange
public void testInvalidTimeRange() {
    ResponseEntity<?> response = getSpendingTrend(timeRange = "INVALID");
    // 應返回 400 或使用默認值
    assertTrue(response.getStatusCode() == HttpStatus.BAD_REQUEST 
        || response.getStatusCode() == HttpStatus.OK);
}

// TC9.3: 無效的 limit
public void testInvalidLimit() {
    ResponseEntity<?> response = getRecentOperations(limit = -5);
    // 應返回 400 或使用 0
    assertTrue(response.getStatusCode() == HttpStatus.BAD_REQUEST);
}
```

---

## 7. 測試執行計劃

### 7.1 測試執行順序

1. **第一階段 - 健康檢查** (30 分鐘)
   - 驗證後端服務運行
   - 驗證數據庫連接
   - 執行 TC1.1, TC1.2

2. **第二階段 - API 功能測試** (2 小時)
   - 執行所有 TC2.x - TC6.x 測試用例
   - 驗證所有 REST 端點正常工作
   - 記錄任何異常

3. **第三階段 - 數據質量測試** (1 小時)
   - 執行所有結構和邏輯驗證
   - 驗證 DTO 完整性
   - 檢查數據合理性

4. **第四階段 - 隔離和安全測試** (1 小時)
   - 執行多租戶隔離測試
   - 驗證數據邊界

5. **第五階段 - 性能測試** (1 小時)
   - 執行響應時間測試
   - 進行負載測試（可選）

6. **第六階段 - 錯誤處理測試** (30 分鐘)
   - 執行所有異常情況測試
   - 驗證錯誤信息清晰

### 7.2 測試時間估計

| 階段 | 時間 | 資源 |
|------|------|------|
| 準備環境 | 15 分鐘 | Docker Compose |
| 執行測試 | 5.5 小時 | 1 名測試工程師 |
| 報告分析 | 1 小時 | 1 名測試工程師 |
| **總計** | **6.5 小時** | **1 人** |

---

## 8. 測試覆蓋率目標

| 指標 | 目標 | 實際 |
|------|------|------|
| **行覆蓋率** | > 80% | ⏳ 待測試 |
| **分支覆蓋率** | > 75% | ⏳ 待測試 |
| **功能覆蓋率** | 100% | ✅ 17/17 需求 |
| **API 覆蓋率** | 100% | ✅ 8/8 端點 |

---

## 9. 測試工具和框架

### 9.1 推薦工具

```bash
# 方案 1: REST Assured + JUnit (推薦用於自動化)
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <version>5.4.0</version>
    <scope>test</scope>
</dependency>

# 方案 2: curl + 手動測試 (快速驗證)
curl -s -X GET "http://localhost:8080/api/v1/dashboard?organizationId=1" \
  -H "Content-Type: application/json" | jq .

# 方案 3: Postman Collection (可視化測試)
# 導入預定義的 Postman 集合進行手動和自動化測試
```

### 9.2 測試樣板

```java
public class DashboardAPITests {
    
    private static final String BASE_URL = "http://localhost:8080";
    
    @BeforeAll
    public static void setup() {
        RestAssured.baseURI = BASE_URL;
        RestAssured.basePath = "/api/v1/dashboard";
    }
    
    @Test
    @DisplayName("TC1.1: 獲取完整儀表板")
    public void testGetCompleteDashboard() {
        DashboardDTO dashboard = given()
            .queryParam("organizationId", 1)
            .when()
            .get()
            .then()
            .statusCode(200)
            .extract()
            .as(DashboardDTO.class);
        
        assertNotNull(dashboard.getSummaryCards());
        assertNotNull(dashboard.getExpenseTrend());
    }
    
    @Test
    @DisplayName("TC2.1: 獲取摘要卡片 - 驗證月度支出")
    public void testSummaryCardsMonthlyExpense() {
        SummaryCardsDTO summary = given()
            .queryParam("organizationId", 1)
            .when()
            .get("/summary")
            .then()
            .statusCode(200)
            .extract()
            .as(SummaryCardsDTO.class);
        
        MonthlyExpenseDTO expense = summary.getMonthlyExpense();
        assertNotNull(expense.getAmount());
        assertTrue(expense.getAmount().compareTo(BigDecimal.ZERO) > 0);
        assertEquals("CNY", expense.getCurrency());
    }
}
```

---

## 10. 測試驗收標準

### 10.1 通過條件 (全部需滿足)

- ✅ 所有 8 個 API 端點返回 HTTP 200 OK
- ✅ 所有 DTO 結構正確且數據非空（除非明確允許空值）
- ✅ 多租戶隔離正確：不同 organizationId 返回不同數據
- ✅ 響應時間 < 500ms
- ✅ 錯誤情況返回適當的 HTTP 狀態碼
- ✅ 所有 17 個功能需求都被測試覆蓋

### 10.2 失敗條件

- ❌ 任何 API 端點返回 5xx 錯誤
- ❌ 數據結構不完整或類型錯誤
- ❌ 響應時間超過 1000ms
- ❌ 多租戶數據混淆

---

## 11. 風險評估

| 風險 | 概率 | 影響 | 緩解措施 |
|------|------|------|---------|
| 後端編譯失敗 | 中 | 高 | 預先進行本地編譯測試 |
| 數據庫連接問題 | 低 | 高 | 驗證 PostgreSQL 運行狀態 |
| Mock 數據不逼真 | 低 | 中 | 使用預定義的測試數據集 |
| 性能達不到預期 | 中 | 中 | 進行數據庫查詢優化 |
| 多租戶隔離漏洞 | 低 | 高 | 嚴格的隔離測試 |

---

## 12. 待辦事項

- [ ] 創建 Postman 測試集合
- [ ] 編寫 JUnit 測試類
- [ ] 設置 CI/CD 管道以自動運行測試
- [ ] 創建測試數據初始化腳本
- [ ] 設置測試結果報告儀表板
- [ ] 進行負載測試和壓力測試

---

**版本歷史**:
| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版 - 完整的集成測試計劃 |
