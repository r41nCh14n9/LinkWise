# 系統架構設計

**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  

---

## 📋 目錄

1. [系統概述](#系統概述)
2. [模塊交互](#模塊交互)
3. [技術棧](#技術棧)
4. [架構模式](#架構模式)

---

## 系統概述

### 4 大核心模塊

```
┌─────────────────────────────────────────────────────────┐
│                     Dashboard (FR-D)                    │
│           實時採購儀表板、KPI、分析、漏斗圖             │
└──────────────┬──────────────┬──────────────┬────────────┘
               │              │              │
        ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │  VMS (FR-V) │ │ RBAC(FR-R)│ │Procurement  │
        │  供應商管理 │ │ 角色權限  │ │ (FR-P) 採購 │
        │  風險評分   │ │ 用戶認證  │ │ 申請、批准  │
        │  績效追蹤   │ │ 部門組織  │ │ PO 管理     │
        └─────────────┘ └───────────┘ └─────────────┘
```

---

## 模塊交互

### 數據流向

```
User Request
  │
  ├─→ API Gateway (認證、速率限制)
  │    │
  │    ├─→ Dashboard Service
  │    │    ├─ 聚合 VMS 數據 (供應商評分)
  │    │    ├─ 聚合 Procurement 數據 (PR/PO)
  │    │    ├─ 調用 RBAC (權限檢查)
  │    │    └─ 返回儀表板數據
  │    │
  │    ├─→ VMS Service
  │    │    ├─ 供應商 CRUD
  │    │    ├─ 評分計算 (4 維度)
  │    │    ├─ 績效追蹤
  │    │    └─ 調用 RBAC (權限)
  │    │
  │    ├─→ Procurement Service
  │    │    ├─ PR 創建、查詢
  │    │    ├─ 批准工作流 (多層級)
  │    │    ├─ PR → PO 轉換
  │    │    ├─ PO 狀態管理
  │    │    └─ 調用 VMS (供應商) 和 RBAC
  │    │
  │    └─→ RBAC Service
  │         ├─ OAuth / Keycloak / 本地認證
  │         ├─ 用戶、角色、權限管理
  │         ├─ 部門組織結構
  │         └─ 權限檢查
  │
  └─→ 數據庫 (PostgreSQL + Row-Level Security)
```

### 依賴關係

```
RBAC ─────────┬─ 為所有模塊提供權限檢查
              │
              ├─→ Dashboard
              ├─→ VMS
              └─→ Procurement

VMS ──────────┬─ 提供供應商數據
              │
              ├─→ Dashboard (評分、績效)
              └─→ Procurement (供應商信息)

Procurement ──┬─ 提供 PR/PO 數據
              │
              ├─→ Dashboard (漏斗圖、統計)
              └─→ VMS (交付績效)

Dashboard ───── 純讀取，不修改其他模塊數據
```

---

## 技術棧

### 前端 (React 19)
```
Framework: React 19 + TypeScript
Build: Vite 6
UI: Tailwind CSS 4
State: Zustand (輕量級狀態管理)
Chart: Recharts (圖表庫)
Table: TanStack Table (高性能表格)
```

### 後端 (Spring Boot 3.2)
```
Framework: Spring Boot 3.2 (Java 17)
ORM: JPA/Hibernate
DB: PostgreSQL 16 with Row-Level Security
Cache: Redis 7.2
Queue: (Phase 2) RabbitMQ
Authentication: OAuth 2.0 + Keycloak + JWT
```

### 部署
```
Containerization: Docker + Docker Compose
Reverse Proxy: Nginx
Environment: Dev (docker-compose.dev.yml) / Prod (docker-compose.prod.yml)
```

---

## 架構模式

### 1. 三層快取策略 (性能優化)

**L1: 摘要卡片快取** (30 分鐘)
```
Key: dashboard:summary:{org_id}
更新: 實時 + 定時刷新
用途: Dashboard 摘要卡片 (支出、供應商、PR)
```

**L2: 圖表數據快取** (1 小時)
```
Key: dashboard:trend:{org_id}:{period}:{filters}
更新: 定時刷新
用途: Dashboard 趨勢圖、漏斗圖
```

**L3: 評分快取** (5 分鐘)
```
Key: dashboard:vendor:scores:{org_id}
更新: 定時 + 事件觸發
用途: 供應商評分、風險等級
```

### 2. 多租戶隔離 (安全設計)

**Row-Level Security (RLS)**
```
- PostgreSQL RLS 策略確保租戶數據隔離
- 每個表都有 organization_id 過濾
- 用戶只能訪問自己企業的數據
```

**權限檢查**
```
- API 層: @PreAuthorize 檢查用戶角色
- 數據庫層: RLS 策略確保行級隔離
- 應用層: 業務邏輯驗證數據所有權
```

### 3. 批准工作流 (業務流程)

**基於規則的路由**
```
IF 金額 <= 10K THEN 路由至直屬主管
IF 金額 > 10K AND 金額 <= 50K THEN 路由至部門經理
IF 金額 > 50K THEN 路由至副總 + 財務總監
IF 商品 == "IT設備" THEN 添加 CTO
```

**Saga 模式** (PR → PO)
```
1. 創建 PO
2. 更新 PR 狀態
3. 發送郵件通知
4. 如果任何步驟失敗，自動回滾
```

### 4. 4 維度評分算法 (VMS)

```
綜合評分 = 財務(40%) + 交付(30%) + 質量(20%) + 合規(10%)

財務健康度 (Financial Health):
  無逾期: 100分
  1-30天: 80分
  30-60天: 60分
  60+天: 40分

交付能力 (Delivery Performance):
  >=95%: 100分
  90-95%: 85分
  85-90%: 70分
  <85%: 50分

質量表現 (Quality):
  <1% 缺陷率: 100分
  1-3%: 80分
  3-5%: 60分
  >5%: 40分

合規狀態 (Compliance):
  所有資質有效: 100分
  有資質即期: 80分
  有過期資質: 60分
  有法律糾紛: 40分
  有行政處罰: 0分

風險等級:
  85-100 (綠): 低風險
  70-84 (黃): 中風險
  <70 (紅): 高風險
```

---

## 下一步

- 性能優化: 查看 [performance.md](performance.md)
- 安全設計: 查看 [security.md](security.md)
- 模塊集成: 查看 [integration.md](integration.md)

---

**最後更新**: 2026-05-08
