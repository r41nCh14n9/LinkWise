# 實現計畫: FR-D Dashboard 前端 v1

**計畫編碼**: IMPL-PLAN-FR-D-Frontend  
**版本**: v1.0  
**編寫日期**: 2026-05-08  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐ (中等偏高)  

---

## 📋 目錄

1. [概述](#概述)
2. [需求分析](#需求分析)
3. [實現方法](#實現方法)
4. [文件結構](#文件結構)
5. [組件設計](#組件設計)
6. [分階段任務](#分階段任務)
7. [依賴和配置](#依賴和配置)
8. [估計工作量](#估計工作量)

---

## 概述

### 目標

實現 FR-D Dashboard 的完整前端界面，包含 5 個功能模塊、17 個需求、100% 功能覆蓋。

### 核心功能

| 模塊 | 功能 | 需求數 | 優先級 | 複雜度 |
|------|------|-------|-------|-------|
| **摘要卡片** | 月度支出、活躍供應商、待處理 PR、庫存預警 | 4 | P0 | ⭐⭐ |
| **支出趨勢** | 時間篩選、多維過濾、圖表展示 | 4 | P0 | ⭐⭐⭐ |
| **供應商評分** | 風險評分、分布圖、篩選 | 3 | P0 | ⭐⭐⭐ |
| **PR/PO 漏斗** | 漏斗圖、轉化率、瓶頸分析 | 3 | P0 | ⭐⭐⭐ |
| **最近操作** | 列表、搜索、快速操作 | 3 | P0 | ⭐⭐ |

**總計**: 17 個需求，8 個 API 端點

---

## 需求分析

### 後端 API 已完成 ✅

```
✅ GET /api/v1/dashboard           (完整儀表板)
✅ GET /api/v1/dashboard/summary   (摘要卡片)
✅ GET /api/v1/dashboard/spending-trend       (支出趨勢)
✅ GET /api/v1/dashboard/vendor-scoring      (供應商評分)
✅ GET /api/v1/dashboard/pipeline-funnel     (PR/PO 漏斗)
✅ GET /api/v1/dashboard/recent-operations   (最近操作)
✅ GET /api/v1/dashboard/health              (健康檢查)
```

### 前端需求對應

```
1. 摘要卡片 (FR-D1.1-FR-D1.3)
   ├─ 月度支出卡片        → GET /summary → amount, trend
   ├─ 活躍供應商卡片      → GET /summary → activeVendors
   ├─ 待處理 PR 卡片      → GET /summary → pendingPRs
   └─ 庫存預警卡片        → GET /summary → inventoryWarnings

2. 支出趨勢 (FR-D2.1-FR-D2.4)
   ├─ 趨勢圖表            → GET /spending-trend → monthlyData
   ├─ 時間範圍篩選        → ?timeRange=6MONTHS|12MONTHS
   ├─ 預算對比            → budgetComparison
   └─ 成本中心分析        → costCenterAnalysis

3. 供應商評分 (FR-D3.1-FR-D3.3)
   ├─ 風險評分列表        → GET /vendor-scoring → vendorScores
   ├─ 風險分布圖          → 柱狀圖
   └─ 高風險告警          → 篩選 HIGH 風險供應商

4. PR/PO 漏斗 (FR-D4.1-FR-D4.3)
   ├─ 漏斗圖展示          → GET /pipeline-funnel → funnel[]
   ├─ 轉化率計算          → conversionRates
   └─ 瓶頸分析            → bottlenecks[]

5. 最近操作 (FR-D5.1-FR-D5.3)
   ├─ 最近 PR 列表        → GET /recent-operations → recentPRs
   ├─ 最近供應商          → recentVendors
   └─ 快速操作按鈕        → quickActions[]
```

---

## 實現方法

### 技術棧選擇

| 層級 | 技術 | 版本 | 決策 |
|------|------|------|------|
| **框架** | React | 19 | 最新版本，支持 Server Components |
| **語言** | TypeScript | 5.8 | 類型安全、開發體驗 |
| **樣式** | Tailwind CSS | 4.1 | 原子化 CSS、快速開發 |
| **圖表** | Recharts / Chart.js | (待選) | 動態圖表庫 |
| **構建** | Vite | 6.2 | 極速冷啟動、HMR |
| **組件庫** | Lucide React | 0.546 | 高質量圖標 |
| **動畫** | Motion | 12.23 | 流暢動畫效果 |

### 架構設計

```
Frontend (React 19 + TypeScript)
    ├── Components/
    │   ├── Layout/
    │   │   ├── DashboardLayout.tsx        (主布局)
    │   │   └── Header.tsx                  (頭部導航)
    │   ├── Dashboard/
    │   │   ├── DashboardPage.tsx           (主頁面)
    │   │   ├── SummaryCards.tsx            (摘要卡片)
    │   │   ├── SpendingTrend.tsx           (支出趨勢)
    │   │   ├── VendorScoring.tsx           (供應商評分)
    │   │   ├── PRPOFunnel.tsx              (PR/PO 漏斗)
    │   │   └── RecentOperations.tsx        (最近操作)
    │   └── Common/
    │       ├── Card.tsx                    (通用卡片)
    │       ├── Chart.tsx                   (圖表包裝)
    │       └── LoadingState.tsx            (加載狀態)
    ├── Services/
    │   ├── api.ts                         (API 請求封裝)
    │   ├── dashboardService.ts            (Dashboard 業務邏輯)
    │   └── transformers.ts                (數據轉換)
    ├── Types/
    │   ├── dashboard.ts                   (DTO 類型定義)
    │   ├── api.ts                         (API 類型)
    │   └── index.ts                       (類型導出)
    ├── Hooks/
    │   ├── useDashboard.ts                (獲取 Dashboard 數據)
    │   ├── useSpendingTrend.ts            (獲取趨勢數據)
    │   └── useFetchWithCache.ts           (帶快取的請求 Hook)
    ├── Utils/
    │   ├── formatters.ts                  (格式化工具)
    │   ├── validators.ts                  (驗證工具)
    │   └── constants.ts                   (常量定義)
    ├── Styles/
    │   ├── globals.css                    (全局樣式)
    │   ├── dashboard.css                  (儀表板樣式)
    │   └── theme.css                      (主題配置)
    ├── App.tsx                            (根組件)
    ├── main.tsx                           (入口文件)
    ├── index.css                          (Tailwind imports)
    ├── types.ts                           (全局類型)
    ├── vite.config.ts                     (Vite 配置)
    ├── tsconfig.json                      (TypeScript 配置)
    └── package.json                       (依賴管理)
```

### 分層實現方法

```
Layer 1: UI Components (表現層)
    ├─ SummaryCards 組件
    ├─ SpendingTrendChart 組件
    ├─ VendorScoringChart 組件
    ├─ PRPOFunnelChart 組件
    └─ RecentOperationsList 組件
        ↓
Layer 2: Business Logic (業務邏輯層)
    ├─ useDashboard Hook (獲取數據)
    ├─ useSpendingTrend Hook
    ├─ useVendorScoring Hook
    ├─ useFunnelData Hook
    └─ useRecentOperations Hook
        ↓
Layer 3: API Client (數據層)
    ├─ api.ts (HTTP 請求)
    ├─ dashboardService.ts (業務服務)
    └─ transformers.ts (數據轉換)
```

---

## 文件結構

### 新建文件清單

```
src/linkwise-front/src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx           (新)
│   │   ├── Header.tsx                    (新)
│   │   └── Sidebar.tsx                   (新)
│   ├── dashboard/
│   │   ├── DashboardPage.tsx             (新)
│   │   ├── SummaryCards.tsx              (新)
│   │   ├── SpendingTrend.tsx             (新)
│   │   ├── VendorScoring.tsx             (新)
│   │   ├── PRPOFunnel.tsx                (新)
│   │   ├── RecentOperations.tsx          (新)
│   │   └── index.ts                      (新)
│   ├── common/
│   │   ├── Card.tsx                      (新)
│   │   ├── LoadingState.tsx              (新)
│   │   ├── ErrorState.tsx                (新)
│   │   └── index.ts                      (新)
│   └── charts/
│       ├── AreaChart.tsx                 (新)
│       ├── BarChart.tsx                  (新)
│       ├── FunnelChart.tsx               (新)
│       └── index.ts                      (新)
├── services/
│   ├── api.ts                            (新)
│   ├── dashboardService.ts               (新)
│   ├── transformers.ts                   (新)
│   └── index.ts                          (新)
├── hooks/
│   ├── useDashboard.ts                   (新)
│   ├── useFetchWithCache.ts              (新)
│   └── index.ts                          (新)
├── types/
│   ├── dashboard.ts                      (新)
│   ├── api.ts                            (新)
│   └── index.ts                          (新)
├── utils/
│   ├── formatters.ts                     (新)
│   ├── validators.ts                     (新)
│   ├── constants.ts                      (新)
│   └── index.ts                          (新)
├── styles/
│   ├── dashboard.module.css              (新)
│   ├── charts.module.css                 (新)
│   └── theme.css                         (新)
├── App.tsx                               (改)
├── main.tsx                              (保留)
├── index.css                             (改)
└── types.ts                              (改)
```

---

## 組件設計

### 1. SummaryCards 組件

```typescript
// 功能: 顯示 4 張摘要卡片
// 對應需求: FR-D1.1, FR-D1.2, FR-D1.3, FR-D1.4
// API: GET /api/v1/dashboard/summary
// 狀態: 必需品 (P0)

Props {
  monthlyExpense: {
    amount: number,
    currency: string,
    trend: number  // 增減百分比
  },
  activeVendors: number,
  pendingPRs: number,
  inventoryWarnings: number
}

Features:
  - 顯示大數字卡片
  - 趨勢指示器 (↑ ↓)
  - 顏色代碼 (綠=增長, 紅=下降)
  - 響應式布局 (4 列 → 2 列 → 1 列)
```

### 2. SpendingTrend 組件

```typescript
// 功能: 顯示支出趨勢圖表
// 對應需求: FR-D2.1, FR-D2.2, FR-D2.3
// API: GET /api/v1/dashboard/spending-trend
// 狀態: 必需品 (P0)

Props {
  timeRange: '6MONTHS' | '12MONTHS',
  monthlyData: Array<{
    month: string,
    totalExpense: number,
    byDepartment: {},
    byCategory: {},
    byVendor: {}
  }>,
  budgetComparison: { budgeted, actual, variance },
  costCenterAnalysis: {}
}

Features:
  - 面積圖展示趨勢
  - 時間範圍篩選 (6個月、12個月)
  - 預算對比線
  - 懸停提示信息
  - 導出為 Excel 按鈕
```

### 3. VendorScoring 組件

```typescript
// 功能: 顯示供應商評分和風險分布
// 對應需求: FR-D3.1, FR-D3.2, FR-D3.3
// API: GET /api/v1/dashboard/vendor-scoring
// 狀態: 必需品 (P0)

Props {
  vendorScores: Array<{
    vendorId: string,
    vendorName: string,
    overallScore: number,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH',
    dimensions: {}
  }>
}

Features:
  - 供應商評分表格
  - 風險等級篩選 (HIGH, MEDIUM, LOW)
  - 風險分布圖 (柱狀圖)
  - 風險等級色碼 (綠、黃、紅)
  - 排序 (評分、風險)
```

### 4. PRPOFunnel 組件

```typescript
// 功能: 顯示 PR/PO 漏斗圖
// 對應需求: FR-D4.1, FR-D4.2, FR-D4.3
// API: GET /api/v1/dashboard/pipeline-funnel
// 狀態: 必需品 (P0)

Props {
  funnel: Array<{
    stageName: string,
    count: number,
    percentage: number
  }>,
  conversionRates: {},
  bottlenecks: []
}

Features:
  - 漏斗圖展示 5 個階段
  - 轉化率標籤
  - 瓶頸高亮提示
  - 各階段計數和百分比
```

### 5. RecentOperations 組件

```typescript
// 功能: 顯示最近操作列表
// 對應需求: FR-D5.1, FR-D5.2, FR-D5.3
// API: GET /api/v1/dashboard/recent-operations
// 狀態: 必需品 (P0)

Props {
  recentPRs: Array<{ ... }>,
  recentVendors: Array<{ ... }>,
  quickActions: Array<{ ... }>
}

Features:
  - 最近 PR/PO 列表
  - 最近供應商卡片
  - 快速操作按鈕
  - 搜索和過濾
```

---

## 分階段任務

### 階段 1: 基礎設置和類型定義 (Day 1)

```
Task 1.1: 創建 TypeScript 類型定義
  ├─ src/types/dashboard.ts       (DTO 類型)
  ├─ src/types/api.ts             (API 響應類型)
  └─ Estimated: 1 小時

Task 1.2: 創建 API 服務層
  ├─ src/services/api.ts          (HTTP 請求封裝)
  ├─ src/services/dashboardService.ts
  └─ Estimated: 1.5 小時

Task 1.3: 創建自定義 Hooks
  ├─ src/hooks/useDashboard.ts
  ├─ src/hooks/useFetchWithCache.ts
  └─ Estimated: 1.5 小時

Task 1.4: 創建工具函數
  ├─ src/utils/formatters.ts
  ├─ src/utils/constants.ts
  └─ Estimated: 1 小時
```

### 階段 2: 公共組件 (Day 1-2)

```
Task 2.1: 創建佈局組件
  ├─ src/components/layout/DashboardLayout.tsx
  ├─ src/components/layout/Header.tsx
  └─ Estimated: 2 小時

Task 2.2: 創建通用組件
  ├─ src/components/common/Card.tsx
  ├─ src/components/common/LoadingState.tsx
  ├─ src/components/common/ErrorState.tsx
  └─ Estimated: 2 小時

Task 2.3: 創建圖表包裝組件
  ├─ src/components/charts/AreaChart.tsx
  ├─ src/components/charts/BarChart.tsx
  ├─ src/components/charts/FunnelChart.tsx
  └─ Estimated: 3 小時
```

### 階段 3: 功能組件 (Day 2-3)

```
Task 3.1: 摘要卡片 (P0)
  ├─ src/components/dashboard/SummaryCards.tsx
  └─ Estimated: 1.5 小時

Task 3.2: 支出趨勢 (P0)
  ├─ src/components/dashboard/SpendingTrend.tsx
  └─ Estimated: 2.5 小時

Task 3.3: 供應商評分 (P0)
  ├─ src/components/dashboard/VendorScoring.tsx
  └─ Estimated: 2.5 小時

Task 3.4: PR/PO 漏斗 (P0)
  ├─ src/components/dashboard/PRPOFunnel.tsx
  └─ Estimated: 2.5 小時

Task 3.5: 最近操作 (P0)
  ├─ src/components/dashboard/RecentOperations.tsx
  └─ Estimated: 1.5 小時
```

### 階段 4: 主頁面整合 (Day 3)

```
Task 4.1: 創建 DashboardPage
  ├─ src/components/dashboard/DashboardPage.tsx
  ├─ 整合所有功能組件
  └─ Estimated: 1.5 小時

Task 4.2: 更新 App.tsx 和路由
  ├─ src/App.tsx
  └─ Estimated: 0.5 小時

Task 4.3: 樣式調整和響應式設計
  ├─ src/styles/dashboard.module.css
  └─ Estimated: 2 小時
```

### 階段 5: 測試和優化 (Day 4)

```
Task 5.1: 功能測試
  ├─ 本地測試所有功能
  ├─ 瀏覽器兼容性測試
  └─ Estimated: 2 小時

Task 5.2: 性能優化
  ├─ 組件懶加載
  ├─ 圖表性能優化
  └─ Estimated: 2 小時

Task 5.3: 文檔和自檢
  ├─ 創建 SELF-CHECK 文檔
  ├─ 創建 INTEGRATION-GUIDE 文檔
  └─ Estimated: 1 小時
```

---

## 依賴和配置

### 已有依賴 ✅

```json
{
  "react": "^19.0.1",
  "react-dom": "^19.0.1",
  "typescript": "~5.8.2",
  "vite": "^6.2.3",
  "tailwindcss": "^4.1.14",
  "@tailwindcss/vite": "^4.1.14",
  "lucide-react": "^0.546.0",
  "motion": "^12.23.24"
}
```

### 可能需要添加的依賴

```json
{
  "recharts": "^2.15.0",      // 圖表庫 (輕量級，適合 React)
  "axios": "^1.7.0",          // HTTP 請求客戶端
  "date-fns": "^3.0.0",       // 日期格式化
  "clsx": "^2.0.0"            // 動態類名
}
```

### 配置調整

**vite.config.ts**: 已配置 ✅
- React 快速刷新
- Tailwind CSS 支持
- 路徑別名 (@)

**tsconfig.json**: 已配置 ✅
- React JSX 支持
- ES2022 目標
- 嚴格模式

**tailwind.config.js**: 需要創建
- 自定義顏色主題
- 自定義字體
- 響應式斷點

---

## 估計工作量

| 階段 | 任務 | 時間 | 備註 |
|------|------|------|------|
| **1** | 基礎設置、類型、API | 5 小時 | 基礎準備 |
| **2** | 佈局、通用、圖表組件 | 7 小時 | 可重用組件 |
| **3** | 5 個功能組件 | 10.5 小時 | 核心功能 |
| **4** | 主頁面整合、路由、樣式 | 4 小時 | 頁面整合 |
| **5** | 測試、優化、文檔 | 5 小時 | 質量保證 |
| **總計** | | **31.5 小時** | ~4 個工作日 |

### 時間表 (預計)

```
Day 1 (8 小時)
  ├─ 上午: 類型定義、API 服務層、Hooks
  └─ 下午: 工具函數、佈局組件

Day 2 (8 小時)
  ├─ 上午: 通用組件、圖表包裝組件
  └─ 下午: 摘要卡片、支出趨勢組件

Day 3 (8 小時)
  ├─ 上午: 供應商評分、PR/PO 漏斗、最近操作
  └─ 下午: 主頁面整合、樣式調整

Day 4 (8 小時)
  ├─ 上午: 功能測試、性能優化
  └─ 下午: 文檔、自檢、整理
```

---

## 指南遵循

### 開發工作流遵循

✅ **代碼組織**
- 按功能分層 (Components, Services, Hooks, Utils)
- 清晰的職責分離
- 可重用組件設計

✅ **類型安全**
- 完整的 TypeScript 類型定義
- 無 `any` 類型
- 嚴格模式

✅ **性能優化**
- React 組件優化 (useMemo, useCallback)
- 圖表懶加載
- 數據快取策略

✅ **可讀性**
- 清晰的函數和變量命名
- 複雜邏輯註釋
- JSDoc 文檔

✅ **測試準備**
- 易於單元測試的組件設計
- 純函數工具方法
- 依賴注入

---

## 風險和應對

| 風險 | 影響 | 對策 |
|------|------|------|
| 圖表庫性能 | 大數據集渲染慢 | 分頁或虛擬滾動 |
| API 響應慢 | 首屏加載延遲 | 缺省快取、骨架屏 |
| 瀏覽器兼容性 | 老舊瀏覽器不相容 | 使用 Polyfill |
| TypeScript 複雜性 | 開發效率降低 | 漸進式應用 TS |

---

## 下一步

1. ✅ 確認本計畫
2. ⏳ 進行 Phase 3: Implementation (編寫代碼)
3. ⏳ 進行 Phase 4: Self-Check (自檢和文檔)
4. ⏳ 提交至 Review Agent 進行正式代碼審查

---

**計畫狀態**: 📋 已準備  
**版本**: v1.0  
**最後更新**: 2026-05-08  
**下一步**: 開始 Phase 3 實現
