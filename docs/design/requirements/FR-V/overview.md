# FR-V (VMS) - 概述和需求映射

**設計編碼**: FR-V  
**模塊名稱**: LinkWise 供應商管理系統 (VMS)  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐⭐ (高)  
**需求總數**: 10 個 (FR-V1.1 ~ FR-V4.2)  

---

## 📋 需求映射表

| 需求編碼 | 功能名稱 | 優先級 | 複雜度 | 涉及文件 |
|---------|--------|-------|-------|--------|
| **FR-V1.1** | 供應商列表頁面 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-V1.2** | 供應商創建/詳情 | P0 | ⭐⭐⭐ | components.md, data-models.md, apis.md |
| **FR-V1.3** | 檔案版本控制 | P1 | ⭐⭐ | data-models.md, apis.md |
| **FR-V2.1** | 實時風險評分 (4 維度) | P0 | ⭐⭐⭐⭐ | design.md, data-models.md, apis.md |
| **FR-V2.2** | 風險預警規則 | P0 | ⭐⭐⭐ | design.md, apis.md |
| **FR-V2.3** | 評分詳情查看 | P1 | ⭐⭐ | components.md, apis.md |
| **FR-V3.1** | 績效指標看板 | P0 | ⭐⭐⭐ | components.md, data-models.md, apis.md |
| **FR-V3.2** | 歷史數據追蹤 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-V4.1** | Onboarding 檢查清單 | P0 | ⭐⭐⭐ | components.md, data-models.md, apis.md |
| **FR-V4.2** | Onboarding 風險控制 | P1 | ⭐⭐ | design.md, apis.md |

---

## 📂 文件結構

```
requirements/FR-V/
├── overview.md           ← 本文件 (需求映射)
├── design.md             (完整設計文檔)
├── data-models.md        (供應商、評分、績效表結構)
├── components.md         (供應商列表、評分卡、績效看板組件)
├── apis.md               (供應商、評分、績效、Onboarding 端點)
└── README.md             (快速開始指南)
```

---

## 🎯 使用指南

### 對於開發者

**情景 1: 實現供應商風險評分 (FR-V2.1)**
1. 打開 `design.md`，查看 4 維度評分計算 (財務 40%, 交付 30%, 質量 20%, 合規 10%)
2. 查看 `data-models.md` 了解 vendor, vendor_score, vendor_defect 表
3. 查看 `apis.md` 了解 `/vendors/{id}/score` 計算端點

**情景 2: 實現 Onboarding 流程 (FR-V4.1 ~ FR-V4.2)**
1. 打開 `design.md`，查看 Onboarding 檢查清單設計
2. 查看 `data-models.md` 了解 vendor_onboarding 表
3. 查看 `components.md` 了解檢查清單 UI

---

## 📊 模塊概述

### 核心職責

- 供應商檔案管理 (CRUD、版本控制)
- 4 維度風險評分 (財務、交付、質量、合規)
- 績效指標追蹤
- Onboarding 流程管理

### 與其他模塊的關係

```
VMS Service
  ├── Dashboard (提供供應商評分、績效)
  ├── Procurement (提供供應商信息、交付績效)
  └── RBAC (權限檢查)
```

---

## 🔑 關鍵設計決策

| 決策 | 理由 |
|------|------|
| 4 維度評分而非簡單平均 | 不同維度對風險影響不同 |
| Onboarding 檢查清單 | 規範化供應商合作流程 |
| 風險預警規則 | 主動識別高風險供應商 |

---

## 📝 相關文檔

- 完整設計: [design.md](design.md)
- 數據模型: [data-models.md](data-models.md)
- 組件設計: [components.md](components.md)
- API 規格: [apis.md](apis.md)
- 性能設計: [../../architecture/performance.md](../../architecture/performance.md)

---

**快速查詢**: 需要找某個需求的設計？使用上表的需求編碼快速定位
