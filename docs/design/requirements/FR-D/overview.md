# FR-D (Dashboard) - 概述和需求映射

**設計編碼**: FR-D  
**模塊名稱**: LinkWise 採購儀表板 (Dashboard)  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐ (中等偏高)  
**需求總數**: 17 個 (FR-D1.1 ~ FR-D5.3)  

---

## 📋 需求映射表

| 需求編碼 | 功能名稱 | 優先級 | 複雜度 | 涉及文件 |
|---------|--------|-------|-------|--------|
| **FR-D1.1** | 月度總支出計算 | P0 | ⭐ | data-models.md, components.md, apis.md |
| **FR-D1.2** | 活躍供應商數量 | P0 | ⭐ | data-models.md, apis.md |
| **FR-D1.3** | 待處理 PR 數量 | P0 | ⭐ | data-models.md, apis.md |
| **FR-D2.1** | 時間範圍切換 | P0 | ⭐ | components.md, apis.md |
| **FR-D2.2** | 供應商維度篩選 | P0 | ⭐ | components.md, apis.md |
| **FR-D2.3** | 類別維度篩選 | P0 | ⭐ | components.md, apis.md |
| **FR-D2.4** | 數據導出 Excel | P1 | ⭐⭐ | components.md, apis.md |
| **FR-D3.1** | 實時風險評分 | P0 | ⭐⭐⭐ | data-models.md, components.md, apis.md |
| **FR-D3.2** | 風險等級篩選 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-D3.3** | 評分歷史查看 | P1 | ⭐⭐ | data-models.md, components.md |
| **FR-D4.1** | PR/PO 漏斗圖 | P0 | ⭐⭐⭐ | components.md, apis.md |
| **FR-D4.2** | 轉化率計算 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-D4.3** | 流程瓶頸高亮 | P1 | ⭐⭐ | components.md |
| **FR-D5.1** | 最近 PR 列表 | P0 | ⭐ | components.md, apis.md |
| **FR-D5.2** | 搜索和過濾 | P0 | ⭐ | components.md, apis.md |
| **FR-D5.3** | 快速進入詳情 | P1 | ⭐ | components.md |
| **FR-D5.4** | 模塊職責和交互 | P0 | ⭐ | design.md |

---

## 📂 文件結構

```
requirements/FR-D/
├── overview.md           ← 本文件 (需求映射)
├── design.md             (完整設計文檔 2000+ 行)
├── data-models.md        (數據表結構、SQL DDL)
├── components.md         (React 組件設計)
├── apis.md               (REST API 規格)
└── README.md             (快速開始指南)
```

---

## 🎯 使用指南

### 對於開發者

**情景 1: 實現 FR-D1.1 月度支出計算**
1. 打開 `design.md`，找到 "FR-D1.1" 部分
2. 查看 `data-models.md` 了解涉及的表結構
3. 查看 `apis.md` 了解端點規格
4. 查看 `components.md` 了解前端組件

**情景 2: 實現 PR/PO 漏斗圖 (FR-D4.1)**
1. 打開 `design.md`，找到 "FR-D4.1 PR/PO 流程漏斗"
2. 查看 `components.md` 中的漏斗圖表組件
3. 查看 `apis.md` 中的 `/dashboard/funnel` 端點
4. 查看 `data-models.md` 了解 purchase_request 表

---

## 📊 模塊概述

### 核心職責

- 實時數據聚合 (採購、供應商、用戶系統)
- 複雜計算 (支出聚合、評分計算、轉化率)
- 性能優化 (三層快取策略)
- 多維過濾 (時間、供應商、類別)

### 與其他模塊的關係

```
Dashboard
  ├── VMS (提供供應商信息、評分)
  ├── Procurement (提供 PR/PO 數據)
  └── RBAC (權限檢查)
```

---

## 🔑 關鍵設計決策

| 決策 | 理由 |
|------|------|
| 使用三層快取 | 性能需要達到 P99 < 200ms |
| 複雜評分公式 | 不同維度對風險影響不同 (財務 40%) |
| P0 vs P1 優先級 | MVP 優先實現熱功能 (摘要、趨勢) |

---

## 📝 相關文檔

- 完整設計: [design.md](design.md)
- 數據模型: [data-models.md](data-models.md)
- 組件設計: [components.md](components.md)
- API 規格: [apis.md](apis.md)
- 性能設計: [../../architecture/performance.md](../../architecture/performance.md)
- 安全設計: [../../architecture/security.md](../../architecture/security.md)

---

**快速查詢**: 需要找某個需求的設計？使用上表的需求編碼快速定位
