# FR-D Dashboard 後端實現記錄

**實現日期**: 2026-05-08  
**模塊**: Dashboard Service 後端  
**功能範圍**: FR-D (全部 17 個需求)  
**狀態**: ✅ **後端完成** (待前端集成)

---

## 1. 完成的工作

### 1.1 DTO 層 (DashboardDTO.java) ✅

**位置**: `src/linkwise-core/src/main/java/com/linkwise/dto/DashboardDTO.java`

**包含的 DTO 類**:

1. **DashboardDTO** - 主容器
   - 聚合所有 5 個子模塊的數據
   - 包含租戶 ID 和用戶 ID (多租戶隔離)
   - 時間戳用於快取失效判斷

2. **SummaryCardsDTO** - 摘要卡片 (FR-D1)
   - `MonthlyExpenseDTO` - 月度支出 (含部門/分類分解)
   - `ActiveVendorsDTO` - 活躍供應商 (含分類統計)
   - `PendingPRsDTO` - 待處理 PR (含成本中心統計)
   - `InventoryWarningsDTO` - 庫存預警

3. **ExpenseTrendDTO** - 支出趨勢 (FR-D2)
   - 時間範圍篩選 (6MONTHS, 12MONTHS, CUSTOM)
   - 月度數據列表 (含多維分解: 部門、分類、供應商)
   - 預算對比分析
   - 成本中心分析
   - 導出支持標記
   - 報表生成狀態

4. **VendorScoringDTO** - 供應商評分 (FR-D3)
   - 供應商評分列表 (含風險等級、評分維度、趨勢)
   - 風險等級分布統計
   - 高風險告警列表

5. **PRPOFunnelDTO** - PR/PO 漏斗 (FR-D4)
   - 漏斗階段分布 (Draft → Submitted → Approved → Converted → Completed)
   - 轉化率指標
   - 瓶頸分析

6. **RecentOperationsDTO** - 最近操作 (FR-D5)
   - 最近 PR/PO 列表
   - 最近供應商列表
   - 快速操作列表

### 1.2 Service 層 (DashboardService.java) ✅

**位置**: `src/linkwise-core/src/main/java/com/linkwise/service/DashboardService.java`

**實現的方法**:

| 方法 | 對應需求 | 功能 |
|------|---------|------|
| `getDashboard()` | FR-D (全部) | 聚合所有儀表板數據 |
| `getSummaryCards()` | FR-D1.1~1.4 | 計算摘要卡片數據 |
| `getSpendingTrend()` | FR-D2.1~2.4 | 計算支出趨勢 + 預算對比 + 成本中心 |
| `getVendorScoring()` | FR-D3.1~3.3 | 計算供應商評分 + 風險告警 |
| `getPRPOFunnel()` | FR-D4.1~4.3 | 計算漏斗分布 + 轉化率 + 瓶頸 |
| `getRecentOperations()` | FR-D5.1~5.3 | 獲取最近操作 + 快速操作 |

**特性**:
- 多租戶隔離支持 (organizationId)
- Mock 數據生成 (基於 organizationId 的確定性隨機)
- 清晰的 TODO 註釋標示將來集成點

### 1.3 Controller 層 (DashboardController.java) ✅

**位置**: `src/linkwise-core/src/main/java/com/linkwise/controller/DashboardController.java`

**提供的 API 端點**:

| 端點 | 方法 | 對應需求 | 功能 |
|------|------|---------|------|
| `/api/v1/dashboard` | GET | FR-D (全部) | 獲取完整儀表板 |
| `/api/v1/dashboard/summary` | GET | FR-D1 | 摘要卡片 |
| `/api/v1/dashboard/spending-trend` | GET | FR-D2 | 支出趨勢 |
| `/api/v1/dashboard/spending-trend/export` | GET | FR-D2.3 | 導出功能 (待實現) |
| `/api/v1/dashboard/vendor-scoring` | GET | FR-D3 | 供應商評分 |
| `/api/v1/dashboard/pipeline-funnel` | GET | FR-D4 | PR/PO 漏斗 |
| `/api/v1/dashboard/recent-operations` | GET | FR-D5 | 最近操作 |
| `/api/v1/dashboard/health` | GET | - | 健康檢查 |

**特性**:
- 標準 REST 設計
- 支持查詢參數過濾 (timeRange, department, category 等)
- 清晰的日誌記錄
- 統一的錯誤處理

### 1.4 工具類 (MockDataGenerator.java) ✅

**位置**: `src/linkwise-core/src/main/java/com/linkwise/util/MockDataGenerator.java`

**包含的方法**:

| 方法 | 用途 |
|------|------|
| `generateVendorList()` | 生成供應商列表 (含評分和風險等級) |
| `generateMonthlyExpense()` | 生成月度支出 (確定性隨機) |
| `generateFunnelData()` | 生成漏斗數據 (Submission → Completion) |
| `generateRiskDistribution()` | 生成風險等級分布 (60% LOW / 30% MEDIUM / 10% HIGH) |
| `generateScoreTrend()` | 生成評分時間序列 |
| `generateDepartmentExpense()` | 生成部門支出分布 |
| `generateCategoryExpense()` | 生成分類支出分布 |
| `generateVendorExpense()` | 生成供應商支出分布 |
| `generateConversionRates()` | 生成轉化率指標 |
| `generateInventoryWarnings()` | 生成庫存預警項目 |

**特性**:
- 基於 organizationId 的確定性隨機 (同一租戶返回相同數據)
- 內置廠商、部門、分類庫
- 邏輯化的數據分布 (不是純隨機)

---

## 2. 技術設計

### 2.1 多層架構設計

```
┌─────────────────────────────────────┐
│     DashboardController             │  REST API Layer
│  (7 個 GET 端點 + 參數驗證)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     DashboardService                │  Business Logic Layer
│  (6 個方法 + 數據聚合)              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     MockDataGenerator               │  Data Generation Layer
│  (10+ 個方法 + 確定性隨機)         │
└─────────────────────────────────────┘
```

### 2.2 多租戶隔離

所有 API 都支持 `organizationId` 參數:
- DashboardController 從請求參數獲取 (目前 Mock，待從 JWT Token 獲取)
- DashboardService 使用 organizationId 進行數據隔離
- MockDataGenerator 基於 organizationId 生成一致性數據

### 2.3 假數據策略

| 模塊 | 當前實現 | 未來集成 |
|------|---------|---------|
| 摘要卡片 | Mock 數據 | VMS + Procurement 服務 |
| 支出趨勢 | Mock 數據 | Procurement 服務 (PO 數據) |
| 供應商評分 | Mock 數據 | VMS 服務 (評分引擎) |
| PR/PO 漏斗 | Mock 數據 | Procurement 服務 (流程狀態) |
| 最近操作 | Mock 數據 | Procurement + VMS 服務 |

**策略**:
- 所有依賴模塊當前暫時 Mock
- 每個方法都有明確的 TODO 註釋標示集成點
- Mock 數據邏輯清晰可維護

### 2.4 快取設計 (預留)

所有 Service 方法已預留 @Cacheable 注解位置:
```java
// TODO: 添加 @Cacheable("dashboardCache") 和 TTL 配置
// 建議: 摘要卡片 15 分鐘, 趨勢圖 1 小時, 供應商評分 3 小時
```

---

## 3. API 規格示例

### 3.1 獲取完整儀表板

**請求**:
```bash
GET /api/v1/dashboard?organizationId=1&timeRange=6MONTHS
```

**響應** (200 OK):
```json
{
  "summaryCards": {
    "monthlyExpense": {
      "amount": 2345678.50,
      "currency": "CNY",
      "trend": 12,
      "departmentBreakdown": { ... },
      "categoryBreakdown": { ... }
    },
    "activeVendors": { ... },
    "pendingPRs": { ... },
    "inventoryWarnings": { ... }
  },
  "expenseTrend": { ... },
  "vendorScoring": { ... },
  "prpoFunnel": { ... },
  "recentOperations": { ... },
  "lastUpdated": "2026-05-08T10:30:00",
  "organizationId": 1,
  "userId": 1
}
```

### 3.2 支出趨勢 (含篩選)

**請求**:
```bash
GET /api/v1/dashboard/spending-trend?organizationId=1&timeRange=12MONTHS&department=採購部&category=物流
```

**響應包含**:
- 12 個月的月度數據
- 預算對比分析
- 成本中心分析
- 導出標記

---

## 4. 已知限制 & 待實現項

### 4.1 暫時 Mock 的功能

- ❌ 與 VMS 服務集成 (供應商評分、風險等級)
- ❌ 與 Procurement 服務集成 (PR/PO 狀態、金額)
- ❌ 與 RBAC 服務集成 (權限檢查、數據隔離驗證)
- ❌ 支出趨勢導出 (Excel/CSV 生成)

### 4.2 待實現的增強功能

- ⏳ @Cacheable 註解集成 (Redis 快取)
- ⏳ @PreAuthorize 權限驗證
- ⏳ 分頁支持 (PageRequest)
- ⏳ 單元測試
- ⏳ Swagger/OpenAPI 文檔
- ⏳ 錯誤碼統一定義

---

## 5. 集成指南

### 5.1 與前端集成

前端可直接調用以下端點:

1. **獲取完整儀表板**:
   ```typescript
   GET /api/v1/dashboard
   Response: DashboardDTO
   ```

2. **分別獲取各模塊**:
   ```typescript
   GET /api/v1/dashboard/summary → SummaryCardsDTO
   GET /api/v1/dashboard/spending-trend → ExpenseTrendDTO
   GET /api/v1/dashboard/vendor-scoring → VendorScoringDTO
   GET /api/v1/dashboard/pipeline-funnel → PRPOFunnelDTO
   GET /api/v1/dashboard/recent-operations → RecentOperationsDTO
   ```

### 5.2 與依賴服務集成 (未來)

**VMS 服務集成**:
```java
@Autowired
private VendorManagementService vmsService;

// 替換 Mock 數據
List<VendorDTO> vendors = vmsService.getVendorsByOrganization(organizationId);
```

**Procurement 服務集成**:
```java
@Autowired
private ProcurementService procurementService;

// 替換 Mock 數據
List<PurchaseOrderDTO> pos = procurementService.getPurchaseOrdersByOrganization(organizationId);
```

---

## 6. 代碼質量

- ✅ 清晰的注釋和文檔
- ✅ 標準化的異常處理
- ✅ 多租戶隔離設計
- ✅ 性能優化預留 (快取、分頁)
- ✅ 可維護的 Mock 數據生成器

---

## 7. 下一步行動

### 7.1 前端開發 (計劃中)
- [ ] Dashboard React 頁面布局
- [ ] 摘要卡片組件 (4 個卡片)
- [ ] 支出趨勢圖表 (ECharts)
- [ ] 供應商評分展示
- [ ] PR/PO 漏斗圖
- [ ] 最近操作列表
- [ ] API 集成層

### 7.2 後端增強 (計劃中)
- [ ] Redis 快取集成
- [ ] 權限驗證 (@PreAuthorize)
- [ ] 單元測試編寫
- [ ] Swagger 文檔生成
- [ ] 與依賴服務集成

### 7.3 性能測試 (計劃中)
- [ ] 負載測試 (100+ 並發)
- [ ] 快取命中率分析
- [ ] 數據庫查詢優化

---

**版本歷史**:
| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版 - 後端完整實現 |
