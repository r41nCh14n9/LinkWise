# 實施計劃：FR-D Dashboard 儀表板 v1

**計劃版本**: 1.0  
**編寫日期**: 2026-05-08  
**功能範圍**: FR-D1.1 ~ FR-D5.3 (17 個需求)  
**優先級**: P0 (MVP 必須)  
**預計工期**: 3-4 週

---

## 📋 概述

實現 LinkWise 採購儀表板的 MVP 版本，包括：
- 摘要卡片 (月度支出、活躍供應商、待處理 PR、庫存預警)
- 支出趨勢圖表 (時間篩選、多維過濾、數據導出)
- 供應商評分展示 (風險等級、評分詳情、告警)
- PR/PO 流程漏斗 (各階段分布、轉化率)
- 最近操作列表 (PR/PO、供應商、快速操作)

---

## 🎯 實施方法

### 整體策略

```
階段 1: 後端 API 設計 (1 週)
  ├─ 設計 DashboardDTO 數據結構
  ├─ 創建 DashboardService (計算 KPI)
  ├─ 創建 DashboardController (提供 API)
  └─ 集成 Mock 數據 (尚未依賴 VMS、Procurement、RBAC)

階段 2: 前端組件開發 (1.5 週)
  ├─ 建立 Dashboard 頁面結構
  ├─ 開發摘要卡片組件 (4 個卡片)
  ├─ 開發支出趨勢圖表 (ECharts)
  ├─ 開發供應商評分顯示
  ├─ 開發 PR/PO 漏斗圖
  └─ 開發最近操作列表

階段 3: 集成與優化 (0.5 週)
  ├─ API 集成測試
  ├─ 性能優化 (快取、分頁)
  ├─ 單元測試
  └─ 文檔完善

階段 4: 自檢與準備審查 (0.5 週)
  ├─ 自檢清單驗證
  ├─ 代碼記錄編寫
  └─ 集成指南準備
```

---

## 📁 文件結構

### 後端結構

```
src/linkwise-core/src/main/java/com/linkwise/
├─ controller/
│  └─ DashboardController.java          (Dashboard API 端點)
├─ service/
│  ├─ DashboardService.java             (計算 KPI)
│  ├─ MetricsCalculationService.java    (指標計算)
│  └─ DataAggregationService.java       (數據聚合)
├─ dto/
│  ├─ DashboardDTO.java                 (儀表板數據)
│  ├─ SummaryCcardDTO.java              (摘要卡片)
│  ├─ ExpenseTrendDTO.java              (支出趨勢)
│  ├─ VendorScoringDTO.java             (供應商評分)
│  ├─ PRPOFunnelDTO.java                (PR/PO 漏斗)
│  └─ RecentOperationDTO.java           (最近操作)
└─ entity/ (未來與 VMS、Procurement 集成時使用)
```

### 前端結構

```
src/linkwise-front/src/
├─ pages/
│  └─ Dashboard/
│     ├─ Dashboard.tsx                  (主容器)
│     ├─ Dashboard.module.css           (樣式)
│     └─ Dashboard.test.tsx             (測試)
├─ components/Dashboard/
│  ├─ SummaryCards/
│  │  ├─ SummaryCard.tsx                (卡片組件)
│  │  └─ SummaryCard.module.css
│  ├─ ExpenseTrend/
│  │  ├─ ExpenseTrendChart.tsx          (支出趨勢圖)
│  │  └─ ExpenseTrendChart.module.css
│  ├─ VendorScoring/
│  │  ├─ VendorScoringPanel.tsx         (供應商評分)
│  │  └─ VendorScoringPanel.module.css
│  ├─ PRPOFunnel/
│  │  ├─ FunnelChart.tsx                (漏斗圖)
│  │  └─ FunnelChart.module.css
│  └─ RecentOperations/
│     ├─ RecentOperationsList.tsx       (最近操作)
│     └─ RecentOperationsList.module.css
├─ hooks/
│  └─ useDashboard.ts                   (Dashboard 數據 Hook)
└─ services/
   └─ dashboardApi.ts                   (API 客戶端)
```

---

## 🔧 技術棧

### 後端
- **框架**: Spring Boot 3.x
- **語言**: Java 17+
- **ORM**: Spring Data JPA
- **數據庫**: PostgreSQL 16
- **緩存**: Redis (未來)
- **圖表**: ECharts 驅動 (後端提供數據)

### 前端
- **框架**: React 19
- **語言**: TypeScript
- **狀態管理**: Redux (未來集成)
- **圖表庫**: ECharts / Recharts
- **測試**: Vitest
- **構建**: Vite

### 依賴項

**後端**:
```gradle
// 數據處理
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

// 工具類
implementation 'org.apache.commons:commons-lang3:3.14.0'
implementation 'com.fasterxml.jackson.core:jackson-databind'

// 測試
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.junit.jupiter:junit-jupiter'
```

**前端**:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "echarts": "^5.4.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## 📊 數據模型

### DashboardDTO (主容器)

```java
@Data
public class DashboardDTO {
    private SummaryCardsDTO summaryCards;      // 摘要卡片
    private ExpenseTrendDTO expenseTrend;      // 支出趨勢
    private VendorScoringDTO vendorScoring;    // 供應商評分
    private PRPOFunnelDTO prpoFunnel;          // PR/PO 漏斗
    private RecentOperationsDTO recentOps;     // 最近操作
    private LocalDateTime lastUpdated;         // 最後更新時間
}
```

### 摘要卡片 (FR-D1.1 ~ FR-D1.4)

```json
{
  "monthlyExpense": {
    "amount": 2345678.50,
    "currency": "CNY",
    "trend": 12,           // +12% (與上月對比)
    "departmentBreakdown": {
      "採購部": 1000000,
      "運營部": 800000,
      "市場部": 545678.50
    }
  },
  "activeVendors": {
    "count": 45,
    "trend": 3,            // +3 (與上月對比)
    "byCategory": {
      "物流": 12,
      "原材料": 20,
      "服務": 13
    }
  },
  "pendingPRs": {
    "count": 12,
    "overdue": 2,
    "byCostCenter": {
      "CC001": 5,
      "CC002": 7
    }
  },
  "inventoryWarnings": {
    "count": 3,
    "criticalItems": ["Item-001", "Item-002", "Item-003"]
  }
}
```

### 支出趨勢 (FR-D2.1 ~ FR-D2.4)

```json
{
  "timeRange": "6MONTHS",
  "currencyUnit": "CNY",
  "monthlyData": [
    {
      "month": "2026-01",
      "totalExpense": 1000000,
      "byDepartment": {"採購部": 600000, "運營部": 400000},
      "byCategory": {"物流": 500000, "原材料": 500000},
      "byVendor": {"廠商A": 300000, "廠商B": 700000}
    },
    // ... 更多月份數據
  ],
  "budgetComparison": {
    "budgeted": 8000000,
    "actual": 7500000,
    "variance": -500000
  },
  "costCenterAnalysis": {
    "CC001": {"amount": 3000000, "trend": 5},
    "CC002": {"amount": 4500000, "trend": -2}
  }
}
```

### 供應商評分 (FR-D3.1 ~ FR-D3.3)

```json
{
  "vendorScores": [
    {
      "vendorId": "V001",
      "vendorName": "廠商A",
      "overallScore": 85,
      "riskLevel": "LOW",      // LOW, MEDIUM, HIGH
      "dimensions": {
        "financial": 90,       // 財務穩定性
        "delivery": 80,        // 交付準時性
        "quality": 85,         // 質量水平
        "compliance": 75       // 合規性
      },
      "trend": [80, 82, 84, 85],
      "lastUpdated": "2026-05-08T10:30:00Z"
    }
  ],
  "riskDistribution": {
    "LOW": 30,    // 低風險供應商數
    "MEDIUM": 12,
    "HIGH": 3
  },
  "alerts": [
    {
      "vendorId": "V003",
      "severity": "HIGH",
      "message": "財務風險升高，評分從 70 降至 55"
    }
  ]
}
```

### PR/PO 漏斗 (FR-D4.1 ~ FR-D4.3)

```json
{
  "funnel": [
    {
      "stage": "DRAFT",
      "stageName": "草稿",
      "count": 5,
      "percentage": 8.3
    },
    {
      "stage": "SUBMITTED",
      "stageName": "已提交",
      "count": 30,
      "percentage": 50.0
    },
    {
      "stage": "APPROVED",
      "stageName": "已批准",
      "count": 20,
      "percentage": 33.3
    },
    {
      "stage": "CONVERTED_TO_PO",
      "stageName": "已轉 PO",
      "count": 15,
      "percentage": 25.0
    },
    {
      "stage": "PO_COMPLETED",
      "stageName": "完成",
      "count": 8,
      "percentage": 13.3
    }
  ],
  "conversionRates": {
    "submitToApprove": "66.7%",
    "approveToConvert": "75%",
    "convertToComplete": "53.3%"
  },
  "bottlenecks": [
    {
      "stage": "SUBMITTED",
      "reason": "批准人過多，審批效率低",
      "recommendation": "優化批准流程"
    }
  ]
}
```

### 最近操作 (FR-D5.1 ~ FR-D5.3)

```json
{
  "recentPRs": [
    {
      "prNumber": "PR-2026-001",
      "amount": 50000,
      "status": "APPROVED",
      "vendor": "廠商A",
      "createdAt": "2026-05-08T08:00:00Z",
      "lastUpdated": "2026-05-08T09:30:00Z"
    }
  ],
  "recentVendors": [
    {
      "vendorId": "V001",
      "vendorName": "廠商A",
      "score": 85,
      "lastOrder": "2026-05-07T14:20:00Z"
    }
  ],
  "quickActions": [
    {
      "action": "CREATE_PR",
      "label": "創建採購申請",
      "icon": "plus"
    },
    {
      "action": "VIEW_VENDOR",
      "label": "查看供應商",
      "icon": "building"
    }
  ]
}
```

---

## 🚀 實施步驟

### 步驟 1: 後端 API 實現 (第 1-2 週)

#### 1.1 創建 DTO 類

```java
// DashboardDTO、SummaryCardsDTO、ExpenseTrendDTO 等
// 位置: src/linkwise-core/src/main/java/com/linkwise/dto/
```

#### 1.2 創建 Service 層

```java
// DashboardService
// 責任: 聚合數據、調用其他服務
// 當前: 返回 Mock 數據
// 未來: 調用 VMS、Procurement、RBAC 服務

// MetricsCalculationService
// 責任: 計算 KPI (支出、供應商評分、漏斗轉化率)

// DataAggregationService
// 責任: 從多個數據源聚合數據
```

#### 1.3 創建 Controller

```java
// DashboardController
// GET /api/dashboard              - 獲取完整儀表板數據
// GET /api/dashboard/summary      - 獲取摘要卡片
// GET /api/dashboard/expense      - 獲取支出趨勢
// GET /api/dashboard/vendors      - 獲取供應商評分
// GET /api/dashboard/funnel       - 獲取 PR/PO 漏斗
// GET /api/dashboard/recent       - 獲取最近操作
// POST /api/dashboard/export      - 導出數據
```

### 步驟 2: 前端組件開發 (第 2-3 週)

#### 2.1 設置基礎結構

```typescript
// src/pages/Dashboard/Dashboard.tsx
// 主容器組件，布局儀表板各部分
// 使用 Grid / Flexbox 布局

// src/services/dashboardApi.ts
// API 客戶端，調用後端接口
```

#### 2.2 開發各個子組件

```typescript
// SummaryCard.tsx - 摘要卡片 (4 個)
// ExpenseTrendChart.tsx - 支出趨勢圖表
// VendorScoringPanel.tsx - 供應商評分
// FunnelChart.tsx - PR/PO 漏斗圖
// RecentOperationsList.tsx - 最近操作列表
```

#### 2.3 實現交互與過濾

```typescript
// 時間範圍篩選 (6 個月、12 個月等)
// 多維過濾 (部門、供應商、類別)
// 數據導出 (CSV、Excel)
```

### 步驟 3: 測試與優化 (第 3.5-4 週)

- 單元測試 (UT)
- 集成測試 (IT)
- 性能測試 (快取、分頁)
- UI/UX 驗證

---

## 📋 依賴項與假設

### 已有依賴
✅ Spring Boot 基礎框架  
✅ PostgreSQL 數據庫  
✅ React 19 前端框架

### 尚需開發 (後期集成)
❌ VMS 服務 (供應商數據、風險評分)  
❌ Procurement 服務 (PR/PO 數據)  
❌ RBAC 服務 (用戶權限檢查)  
❌ 緩存機制 (Redis)

### 當前解決方案
🟡 使用 Mock 數據代替上述服務  
🟡 後端註解標記未來集成點  
🟡 接口設計預留擴展空間

---

## ⚡ 性能設計

### 快取策略 (3 層)

```
L1 緩存 (30 分鐘)
├─ 摘要卡片數據
├─ 支出趨勢
└─ 供應商評分

L2 緩存 (1 小時)
├─ PR/PO 漏斗
└─ 歷史數據

L3 緩存 (5 分鐘)
└─ 實時更新數據
```

### 優化措施

1. **分頁查詢**: 最近操作列表分頁 (每頁 10-20 條)
2. **索引優化**: PO、PR 表添加必要索引
3. **異步計算**: 複雜 KPI 計算異步執行
4. **前端優化**: 虛擬列表、圖表懶加載

---

## 📚 涵蓋的需求

| 需求編碼 | 需求名稱 | 實現狀態 | 優先級 |
|---------|--------|--------|-------|
| FR-D1.1 | 月度總支出計算 | 🟢 v1 計劃 | P0 |
| FR-D1.2 | 活躍供應商展示 | 🟢 v1 計劃 | P0 |
| FR-D1.3 | 待處理 PR 數量 | 🟢 v1 計劃 | P0 |
| FR-D1.4 | 庫存預警 | 🟡 Mock | P0 |
| FR-D2.1 | 時間篩選 | 🟢 v1 計劃 | P0 |
| FR-D2.2 | 多維篩選 | 🟢 v1 計劃 | P0 |
| FR-D2.3 | 數據導出 | 🟡 v1.1 | P0 |
| FR-D2.4 | 報表預生成 | 🟡 v1.1 | P1 |
| FR-D3.1 | 風險等級展示 | 🟢 v1 計劃 | P0 |
| FR-D3.2 | 評分詳情 | 🟢 v1 計劃 | P0 |
| FR-D3.3 | 高風險告警 | 🟢 v1 計劃 | P0 |
| FR-D4.1 | 採購漏斗 | 🟢 v1 計劃 | P0 |
| FR-D4.2 | 漏斗分析 | 🟢 v1 計劃 | P0 |
| FR-D4.3 | 轉化率指標 | 🟢 v1 計劃 | P0 |
| FR-D5.1 | 最近 PR/PO | 🟢 v1 計劃 | P0 |
| FR-D5.2 | 最近供應商 | 🟢 v1 計劃 | P0 |
| FR-D5.3 | 快速操作 | 🟢 v1 計劃 | P0 |

---

## 📝 成果交付物

1. **IMPL-PLAN-FR-D-Dashboard-v1.md** (本文檔)
2. **IMPL-DECISIONS-FR-D-Dashboard-v1.md** (設計決策)
3. **CODE-DashboardController-FR-D-v1.md** (代碼記錄)
4. **CODE-DashboardComponents-FR-D-v1.md** (前端代碼記錄)
5. **SELF-CHECK-FR-D-Dashboard-v1.md** (自檢清單)
6. **INTEGRATION-GUIDE-FR-D-Dashboard-v1.md** (集成指南)
7. 完整源代碼 (後端 + 前端)

---

## 🔗 相關文檔

- [FR-D 設計文檔](../../design/requirements/FR-D/design.md)
- [系統架構](../../design/architecture/modules.md)
- [API 規範](../../design/requirements/FR-D/apis.md)
- [數據模型](../../design/requirements/FR-D/data-models.md)

---

**下一步**: 開始階段 1 - 後端 API 實現
