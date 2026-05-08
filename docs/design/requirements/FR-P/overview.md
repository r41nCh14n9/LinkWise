# FR-P (Procurement) - 概述和需求映射

**設計編碼**: FR-P  
**模塊名稱**: LinkWise 採購管理系統 (Procurement)  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐⭐ (高)  
**需求總數**: 12 個 (FR-P1.1 ~ FR-P4.3)  

---

## 📋 需求映射表

| 需求編碼 | 功能名稱 | 優先級 | 複雜度 | 涉及文件 |
|---------|--------|-------|-------|--------|
| **FR-P1.1** | 採購申請創建 | P0 | ⭐⭐ | components.md, data-models.md, apis.md |
| **FR-P1.2** | 批量導入 (Excel) | P0 | ⭐⭐ | components.md, apis.md |
| **FR-P1.3** | 查詢與篩選 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-P2.1** | 批准路由規則 | P0 | ⭐⭐⭐⭐ | design.md, apis.md |
| **FR-P2.2** | 批准操作與歷史 | P0 | ⭐⭐⭐ | components.md, apis.md |
| **FR-P2.3** | 批准備註與溝通 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-P2.4** | 狀態與加速選項 | P0 | ⭐⭐⭐ | components.md, apis.md |
| **FR-P3.1** | 手動轉換 (PR → PO) | P0 | ⭐⭐⭐ | components.md, apis.md |
| **FR-P3.2** | 自動轉換規則 | P1 | ⭐⭐⭐ | design.md, apis.md |
| **FR-P4.1** | PO 查詢與追蹤 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-P4.2** | 收貨確認與履行 | P0 | ⭐⭐⭐ | components.md, apis.md |
| **FR-P4.3** | 多物流跟蹤 | P1 | ⭐⭐ | components.md, apis.md |

---

## 📂 文件結構

```
requirements/FR-P/
├── overview.md           ← 本文件 (需求映射)
├── design.md             (完整設計文檔)
├── data-models.md        (PR、PO、批准流程表結構)
├── components.md         (PR 表單、批准列表、PO 狀態組件)
├── apis.md               (PR、PO、批准、收貨端點)
└── README.md             (快速開始指南)
```

---

## 🎯 使用指南

### 對於開發者

**情景 1: 實現 PR 創建 (FR-P1.1)**
1. 打開 `design.md`，查看 PR 表單設計
2. 查看 `data-models.md` 了解 purchase_request, purchase_line 表
3. 查看 `components.md` 了解 PR 表單組件
4. 查看 `apis.md` 了解 `POST /purchase-requests` 端點

**情景 2: 實現批准工作流 (FR-P2.1 ~ FR-P2.4)**
1. 打開 `design.md`，查看批准路由規則設計 (金額、部門、緊急級別)
2. 查看 `data-models.md` 了解 approval_rule, approval_step 表
3. 查看 `apis.md` 了解批准相關端點
4. 查看 `components.md` 了解批准 UI

**情景 3: 實現 PR 轉 PO (FR-P3.1)**
1. 打開 `design.md`，查看轉換流程設計
2. 查看 `apis.md` 了解 `POST /purchase-requests/{id}/convert-po` 端點
3. 查看 `components.md` 了解轉換對話框

---

## 📊 模塊概述

### 核心職責

- 採購申請 (PR) 創建、導入、查詢
- 多層級批准工作流 (路由、操作、備註)
- PR 轉 PO 流程 (手動/自動)
- PO 狀態管理、收貨、物流追蹤

### 與其他模塊的關係

```
Procurement Service
  ├── Dashboard (提供 PR/PO 統計、漏斗數據)
  ├── VMS (查詢供應商、評分、交付績效)
  ├── RBAC (批准工作流權限、部門級數據)
  └── 外部系統 (物流 API、支付系統)
```

---

## 🔑 關鍵設計決策

| 決策 | 理由 |
|------|------|
| 多層級批准路由 | 根據金額、部門、商品類型自動路由 |
| 支持批量導入 | 提高用戶效率 |
| 自動轉換規則 (P1) | 減少手動操作 |
| Saga 模式 (PR → PO) | 確保分布式事務一致性 |

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
