# FR-R (RBAC) - 概述和需求映射

**設計編碼**: FR-R  
**模塊名稱**: LinkWise 角色與權限控制系統 (RBAC)  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐ (中等偏高)  
**需求總數**: 13 個 (FR-R1.1 ~ FR-R4.3)  

---

## 📋 需求映射表

| 需求編碼 | 功能名稱 | 優先級 | 複雜度 | 涉及文件 |
|---------|--------|-------|-------|--------|
| **FR-R1.1** | Google OAuth 集成 | P0 | ⭐⭐ | apis.md, design.md |
| **FR-R1.2** | Keycloak SSO 集成 | P0 | ⭐⭐⭐ | apis.md, design.md |
| **FR-R1.3** | 本地帳號認證 | P0 | ⭐ | components.md, apis.md |
| **FR-R1.4** | 會話管理 | P0 | ⭐⭐ | apis.md, design.md |
| **FR-R2.1** | 用戶 CRUD | P0 | ⭐ | components.md, apis.md |
| **FR-R2.2** | 批量操作 | P0 | ⭐⭐ | components.md, apis.md |
| **FR-R2.3** | 搜索與篩選 | P0 | ⭐ | components.md, apis.md |
| **FR-R3.1** | RBAC 矩陣設計 | P0 | ⭐⭐ | data-models.md, components.md |
| **FR-R3.2** | 權限粒度控制 | P0 | ⭐⭐⭐ | apis.md, design.md |
| **FR-R3.3** | 動態權限檢查 | P0 | ⭐⭐ | apis.md, design.md |
| **FR-R4.1** | 部門層級管理 | P0 | ⭐⭐ | components.md, data-models.md |
| **FR-R4.2** | 組織結構設置 | P0 | ⭐⭐ | components.md, data-models.md |
| **FR-R4.3** | 跨部門權限 | P1 | ⭐⭐⭐ | design.md |

---

## 📂 文件結構

```
requirements/FR-R/
├── overview.md           ← 本文件 (需求映射)
├── design.md             (完整設計文檔)
├── data-models.md        (用戶、角色、權限表結構)
├── components.md         (登錄、用戶管理、權限管理組件)
├── apis.md               (認證、用戶、角色、部門端點)
└── README.md             (快速開始指南)
```

---

## 🎯 使用指南

### 對於開發者

**情景 1: 實現 Google OAuth (FR-R1.1)**
1. 打開 `design.md`，查看 Google OAuth 集成設計
2. 查看 `apis.md` 了解 `/auth/google` 端點
3. 查看 `components.md` 了解登錄組件

**情景 2: 實現 RBAC 權限管理 (FR-R3.1 ~ FR-R3.3)**
1. 打開 `design.md`，查看 RBAC 矩陣和權限檢查設計
2. 查看 `data-models.md` 了解 role, permission 表結構
3. 查看 `components.md` 了解權限管理 UI

---

## 📊 模塊概述

### 核心職責

- 多種認證方式 (Google OAuth, Keycloak, 本地)
- 用戶和部門管理
- 基於角色的權限控制 (RBAC)
- 組織結構管理

### 與其他模塊的關係

```
RBAC Service
  ├── 為所有模塊提供權限檢查
  ├── Dashboard (權限過濾、部門級數據)
  ├── VMS (供應商訪問控制)
  ├── Procurement (批准工作流權限)
  └── 第三方系統 (Keycloak, Google)
```

---

## 🔑 關鍵設計決策

| 決策 | 理由 |
|------|------|
| 三種認證方式 | 支持不同企業的需求 (企業 SSO vs 雲端 vs 本地) |
| 基於角色的權限 | 比基於用戶的權限更易維護和擴展 |
| 部門層級控制 | 支持組織結構化的權限管理 |

---

## 📝 相關文檔

- 完整設計: [design.md](design.md)
- 數據模型: [data-models.md](data-models.md)
- 組件設計: [components.md](components.md)
- API 規格: [apis.md](apis.md)
- 安全設計: [../../architecture/security.md](../../architecture/security.md)

---

**快速查詢**: 需要找某個需求的設計？使用上表的需求編碼快速定位
