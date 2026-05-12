# Dashboard 設計文檔 (FR-D)

**設計編碼**: FR-D  
**模塊名稱**: LinkWise 採購儀表板 (Dashboard)  
**文檔版本**: 1.0  
**編寫日期**: 2026-05-08  
**支持的需求**: FR-D1.1 ~ FR-D5.3 (17 個需求)  
**優先級**: P0 (MVP 必須)  
**複雜度**: ⭐⭐⭐ (中等偏高)  

---

## 📋 目錄

1. [概述](#概述)
2. [模塊職責](#模塊職責)
3. [功能設計](#功能設計)
4. [性能設計](#性能設計)
5. [安全設計](#安全設計)
6. [設計決策](#設計決策)
7. [與其他模塊的交互](#與其他模塊的交互)

---

## 概述

### 模塊定位

Dashboard 是 LinkWise 的核心功能，為企業採購管理層提供實時的採購狀況監控、關鍵指標分析和業務洞察。

### 支持的需求

| 需求編碼 | 功能分組 | 優先級 | 複雜度 |
|---------|--------|-------|-------|
| **FR-D1.1 ~ FR-D1.3** | 摘要卡片 (月度支出、活躍供應商、待處理 PR) | P0 | ⭐⭐ |
| **FR-D2.1 ~ FR-D2.4** | 支出趨勢圖表 (時間範圍、過濾、導出) | P0 | ⭐⭐⭐ |
| **FR-D3.1 ~ FR-D3.3** | 供應商評分 (計算、篩選、歷史) | P0 | ⭐⭐⭐ |
| **FR-D4.1 ~ FR-D4.3** | PR/PO 流程漏斗 (分布、轉化、瓶頸) | P0 | ⭐⭐ |
| **FR-D5.1 ~ FR-D5.3** | 最近操作 (列表、搜索、詳情) | P0 | ⭐ |

### 業務價值

- 🎯 **決策支持**: 實時 KPI 幫助決策者快速了解採購健康狀態
- 📊 **數據可視化**: 直觀的圖表展示趨勢和異常
- ⚡ **性能要求**: P99 < 200ms (NFR-1.1), 首屏加載 < 2s (NFR-1.2)
- 🔒 **安全隔離**: 多租戶隔離、部門級權限控制

---

## 模塊職責

### 核心職責

1. **實時數據聚合**: 從採購、供應商、用戶系統聚合數據
2. **複雜計算**: 支出聚合、供應商評分、轉化率計算
3. **性能優化**: 三層快取策略 (L1, L2, L3) 保證響應速度
4. **多維過濾**: 時間、供應商、類別等多維度數據篩選

### 不在職責內

- ❌ 不負責供應商詳情管理 (VMS 負責)
- ❌ 不負責用戶權限檢查 (RBAC 負責)
- ❌ 不負責審批流程 (Procurement 負責)

---

## 功能設計

### 1️⃣ 摘要卡片 (FR-D1.1 ~ FR-D1.3)

**業務場景**: 用戶打開 Dashboard，首先看到 4 張摘要卡片，快速掌握採購狀況。

#### FR-D1.1: 月度總支出

**需求描述**: 自動計算月度總支出（按部門、供應商、類別聚合）

**系統行為**:
```
當用戶打開 Dashboard:
1. 系統計算當月（1日-當日）的所有已確認 PO 金額
2. 金額按以下維度聚合:
   - 全公司: 總支出
   - 按部門: 部門支出
   - 按供應商: 供應商支出
   - 按類別: 類別支出
3. 實時展示 "月度總支出: ¥2,345,678"
4. 與上月同期對比顯示增減幅度 (+12% 或 -5%)
5. 支持按時間範圍查詢（6個月、12個月等）
```

**計算公式**:
```
月度支出 = SUM(PO.total_amount) 
WHERE PO.status IN ('confirmed', 'partially_received', 'fully_received')
  AND PO.confirm_date >= MONTH_START
  AND PO.confirm_date <= NOW()
  AND PO.organization_id = CURRENT_ORG
```

**性能要求**:
- ✅ 響應時間 < 100ms (通過 L1 快取)
- ✅ 數據延遲 < 5 分鐘 (快取過期時間)
- ✅ 支持 1000 家企業

**多租戶隔離**:
```
organization_id 必須匹配當前用戶的企業
使用 Row-Level Security (RLS) 驗證
```

**涉及表**: 
- purchase_order
- purchase_request (統計待確認 PR 預算)

---

#### FR-D1.2: 活躍供應商數量

**需求描述**: 實時展示活躍供應商數量及變化趨勢

**系統行為**:
```
實時統計:
1. 當月有訂單的供應商數
2. 與上月對比
3. 顯示趨勢 (↑ ↓)

活躍定義: 
  有已確認或已完成的 PO
  在當月內
```

**計算邏輯**:
```sql
SELECT COUNT(DISTINCT vendor_id) 
FROM purchase_order
WHERE status IN ('confirmed', 'partially_received', 'fully_received')
  AND MONTH(confirm_date) = CURRENT_MONTH
  AND organization_id = CURRENT_ORG
```

**涉及表**: vendor, purchase_order

---

#### FR-D1.3: 待處理 PR 數量

**需求描述**: 動態計算待處理 PR 數量（含逾期標記）

**系統行為**:
```
顯示:
1. 待處理 PR 總數 (status = 'pending' 或 'in_approval')
2. 逾期數量 (created_at < NOW() - 7天)
3. 優先標記逾期項目
```

**逾期定義**:
```
如果 PR 的審批時間超過 7 天且未決，標記為逾期
created_at < (NOW() - INTERVAL '7 days')
AND status = 'in_approval'
```

**涉及表**: purchase_request

---

### 2️⃣ 支出趨勢圖表 (FR-D2.1 ~ FR-D2.4)

**業務場景**: 用戶想看採購支出的時間趨勢，判斷消費模式。

#### FR-D2.1: 支持時間範圍切換

**需求描述**: 支持 6 個月、12 個月時間範圍切換

**UI 交互**:
```
用戶選擇:
  ⚫ 最近 6 個月 (默認)
  ⚫ 最近 12 個月
  ⚫ 自定義範圍

系統返回相應時間段的數據
```

**查詢邏輯**:
```sql
SELECT DATE_TRUNC('month', confirm_date) as month,
       SUM(total_amount) as amount
FROM purchase_order
WHERE confirm_date >= DATE_TRUNC('month', NOW() - INTERVAL '6 months')
  AND confirm_date <= NOW()
  AND organization_id = CURRENT_ORG
GROUP BY DATE_TRUNC('month', confirm_date)
ORDER BY month
```

---

#### FR-D2.2: 支持按供應商維度過濾

**需求描述**: 支持按供應商維度過濾

**UI 交互**:
```
用戶選擇供應商:
  - 多選下拉框
  - 搜索支援
  - "全選" / "清空" 按鈕

系統返回所選供應商的支出趨勢
```

**過濾邏輯**:
```sql
... WHERE vendor_id IN (selected_vendors) ...
```

---

#### FR-D2.3: 支持按類別維度過濾

**需求描述**: 支持按類別維度過濾

**類別來源**: 採購請求中的 category 字段

**支持的類別**:
```
- Office 用品
- IT 設備
- 運輸服務
- 其他
```

---

#### FR-D2.4: 支持導出數據至 Excel

**需求描述**: 支持導出數據至 Excel (P1, 初期可選)

**導出內容**:
```
包含:
- 月份
- 金額
- 供應商
- 類別
- 對比數據
```

**格式**: .xlsx (Office Open XML)

---

### 3️⃣ 供應商評分 (FR-D3.1 ~ FR-D3.3)

**業務場景**: 採購經理想快速看供應商的健康狀況和風險等級。

#### FR-D3.1: 實時計算供應商綜合評分

**需求描述**: 實時計算供應商綜合評分

**評分維度** (4 個):
```
1. 財務健康度 (Financial Health) - 40%
   基於: 供應商財務信息、超期應付款
   
2. 交付能力 (Delivery Performance) - 30%
   基於: 準時交付率 (%)
   
3. 質量表現 (Quality Record) - 20%
   基於: 缺陷率、退貨率
   
4. 合規狀態 (Compliance) - 10%
   基於: 資質過期狀態、法律糾紛
```

**計算公式**:
```
綜合評分 = 
  (財務得分 × 40% +
   交付得分 × 30% +
   質量得分 × 20% +
   合規得分 × 10%) / 100

範圍: 0-100
```

**風險等級**:
```
綠色 (Green):   85-100 (低風險)
黃色 (Yellow):  70-84  (中風險)
紅色 (Red):     <70    (高風險)
```

**涉及表**: vendor, vendor_score, purchase_order (用於計算績效)

---

#### FR-D3.2: 按風險等級篩選供應商

**需求描述**: 按風險等級篩選供應商

**UI 交互**:
```
用戶可以選擇:
☑️ 綠色 (低風險)
☑️ 黃色 (中風險)  
☑️ 紅色 (高風險)

系統返回符合篩選條件的供應商列表
```

---

#### FR-D3.3: 查看評分歷史變化

**需求描述**: 查看評分歷史變化 (P1, 初期可選)

**展示內容**:
```
評分時間線:
- 最近 6 個月的評分變化
- 關鍵事件標記 (如缺陷事件)
- 趨勢線圖
```

---

### 4️⃣ PR/PO 流程漏斗 (FR-D4.1 ~ FR-D4.3)

**業務場景**: 流程管理者想了解採購流程的效率瓶頸。

#### FR-D4.1: 實時更新各階段 PR/PO 數量

**需求描述**: 實時更新各階段 PR/PO 數量

**流程階段**:
```
PR 階段:
1. 草稿     (Draft)
2. 待審批   (Pending Approval)
3. 已批准   (Approved)
4. 待轉換   (Ready to Convert)

PO 階段:
5. 已下達   (Placed)
6. 已確認   (Confirmed)
7. 部分收貨 (Partially Received)
8. 已收齊   (Fully Received)
9. 已開票   (Invoiced)
10. 已結案  (Closed)
```

**顯示漏斗**:
```
100 個 PR 創建
  ↓ 95 個通過審批 (-5%)
  ↓ 90 個已批准 (-5%)
  ↓ 85 個轉換為 PO (-5%)
  ↓ 82 個已下達 (-3%)
  ↓ 80 個已確認 (-2%)
  ...
```

**計算邏輯**:
```sql
SELECT status, COUNT(*) as count
FROM purchase_request
WHERE created_date >= MONTH_START
  AND organization_id = CURRENT_ORG
GROUP BY status
```

---

#### FR-D4.2: 計算各轉換環節的轉化率

**需求描述**: 計算各轉換環節的轉化率

**轉化率公式**:
```
轉化率 = (進入下一階段的數量 / 進入當前階段的數量) × 100%

例如:
從 PR 到 PO 的轉化率 = (已轉換為 PO 的 PR 數 / 總 PR 數) × 100%
```

**紅色預警**:
```
如果某個環節轉化率 < 80%，標記為瓶頸
```

---

#### FR-D4.3: 高亮顯示流程瓶頸

**需求描述**: 高亮顯示流程瓶頸 (P1, 初期可選)

**瓶頸識別**:
```
自動識別轉化率最低的環節，用紅色高亮
```

---

### 5️⃣ 最近操作 (FR-D5.1 ~ FR-D5.3)

**業務場景**: 用戶想快速看到最近的操作記錄，跳轉到詳情。

#### FR-D5.1: 展示最近 10-20 條 PR 記錄

**需求描述**: 展示最近 10-20 條 PR 記錄

**顯示內容**:
```
| PR 編號 | 金額 | 供應商 | 狀態 | 建立時間 |
|--------|------|-------|------|--------|
| PR-001 | ¥100K | 廠商A | 待審 | 2小時前 |
| PR-002 | ¥50K  | 廠商B | 已批 | 3小時前 |
...
```

**排序**: 按最新建立時間排序

**涉及表**: purchase_request, vendor

---

#### FR-D5.2: 支持快速搜索和過濾

**需求描述**: 支持快速搜索和過濾

**搜索字段**:
```
- PR 編號
- 供應商名稱
- 狀態
```

**過濾條件**:
```
- 時間範圍
- 金額範圍
- PR 狀態
```

---

#### FR-D5.3: 一鍵進入詳情頁

**需求描述**: 一鍵進入詳情頁 (P1, 初期可選)

**交互**:
```
點擊任意行 → 跳轉到 PR 詳情頁
```

---

## 性能設計

### 快取策略 (三層快取)

為達到 NFR-1.1 (P99 < 200ms) 和 NFR-1.2 (首屏 < 2s)：

#### L1 快取: 摘要卡片快取 (30 分鐘)
```
Key: dashboard:summary:{org_id}
Value: {支出, 供應商數, 待處理PR}
TTL: 30 分鐘

更新時機:
- 新 PO 確認時 (Real-time)
- 定時 30 分鐘更新一次
```

#### L2 快取: 圖表數據快取 (1 小時)
```
Key: dashboard:trend:{org_id}:{period}:{vendor_filter}
Value: {月份, 金額數組}
TTL: 1 小時

支持多組合快取:
- 按時間範圍
- 按供應商篩選
```

#### L3 快取: 供應商評分快取 (5 分鐘)
```
Key: dashboard:vendor:scores:{org_id}
Value: [{vendor_id, score, level}]
TTL: 5 分鐘

評分計算成本高，需要積極快取
```

### 查詢優化

#### 數據庫索引:
```sql
-- 支出趨勢查詢優化
CREATE INDEX idx_po_org_date ON purchase_order(organization_id, confirm_date, total_amount);

-- 活躍供應商優化
CREATE INDEX idx_po_vendor_org_date ON purchase_order(organization_id, vendor_id, confirm_date);

-- PR 狀態查詢優化
CREATE INDEX idx_pr_org_status_date ON purchase_request(organization_id, status, created_date);
```

#### 查詢分頁:
```
最近操作列表: 每頁 20 條
避免一次加載太多數據
```

---

## 安全設計

### 多租戶隔離

**隔離檢查點**:
```
1. 摘要卡片
   ✓ organization_id 必須匹配當前用戶
   ✓ 數據來自 purchase_order 表，該表有 RLS 政策

2. 圖表數據
   ✓ 所有聚合查詢都過濾 organization_id
   ✓ 支援者個人也只能看到自己企業的數據

3. 供應商評分
   ✓ 供應商與企業的關聯驗證
   ✓ 不同企業的供應商不能混淆
```

### 權限控制

**可見性規則**:
```
- Admin: 看全公司數據
- Approver: 看部門及下屬數據
- Buyer: 看自己的 PR/PO
- Requester: 只看自己的請求
```

**實現**:
```java
@PreAuthorize("hasAnyRole('ADMIN', 'APPROVER', 'BUYER', 'REQUESTER')")
public DashboardSummary getSummary() {
    // 根據當前用戶角色和部門篩選數據
    Organization org = SecurityUtil.getCurrentOrganization();
    Department dept = SecurityUtil.getCurrentDepartment();
    
    return dashboardService.calculateSummary(org, dept);
}
```

### 數據敏感性

**敏感字段**:
```
- 金額數據: 只顯示有權限的數據
- 供應商信息: 不顯示完整的聯繫方式
- 用戶信息: 只顯示用戶名，不顯示郵箱
```

---

## 設計決策

### 決策 1: 為什麼使用三層快取而不是直接查詢數據庫？

**背景**:
- Dashboard 需要支持 1000 家企業，每家企業可能有 100+ 供應商
- 聚合查詢成本高 (JOIN 多個表、SUM/COUNT 操作)
- 實時性要求不是毫秒級，可以接受 5-30 分鐘的延遲

**備選方案**:
1. ❌ 每次都查數據庫
   - 問題: 無法達到 P99 < 200ms 的要求
   - 成本: 1000 家企業 × 100 QPS = 100,000 QPS (不現實)

2. ✅ 三層快取 (選中)
   - 優點: 性能最好，成本最低
   - 權衡: 數據延遲 5-30 分鐘 (可接受)

3. ⚠️ 物化視圖
   - 優點: 實時性好
   - 問題: 維護複雜，性能不如快取

**決策理由**: 三層快取在性能、成本、可維護性之間達到最佳平衡。

---

### 決策 2: 為什麼供應商評分使用複雜公式而不是簡單平均？

**背景**:
- 不同維度對供應商風險的影響不同
- 財務健康度最重要 (40%)，因為財務風險影響交付

**公式**:
```
綜合評分 = 財務40% + 交付30% + 質量20% + 合規10%
```

**優點**:
- 符合業務邏輯
- 權重可根據業務需求調整

---

### 決策 3: 為什麼 FR-D2.4 (導出 Excel) 和 FR-D3.3 (評分歷史) 設為 P1？

**理由**:
- 初期用戶優先使用熱功能 (摘要、趨勢)
- 導出和歷史追蹤可延後到 Phase 2
- 節省 MVP 的開發時間

---

## 與其他模塊的交互

### 依賴關係

```
Dashboard Service
  ├── VMS Service
  │   └── 提供: 供應商信息、評分
  │   ├── 使用: GET /vendors, GET /vendors/{id}/score
  │   └── 參與者: Vendor Service
  │
  ├── Procurement Service
  │   └── 提供: PR/PO 數據、流程狀態
  │   ├── 使用: GET /purchase-requests, GET /purchase-orders
  │   └── 參與者: Procurement Service
  │
  ├── RBAC Service
  │   └── 提供: 用戶權限、部門信息
  │   ├── 使用: 權限檢查、部門篩選
  │   └── 參與者: RBAC Service
  │
  └── 數據庫 (PostgreSQL)
      └── 直接讀取：purchase_order, vendor, purchase_request 表
```

### 數據同步

**實時數據同步** (通過事件):
```
1. 新 PO 確認 → 更新 L1 快取 (摘要卡片)
2. 新 PR 提交 → 更新 L1 快取
3. 供應商評分更新 → 更新 L3 快取

技術: 使用 Kafka / RabbitMQ 異步事件
```

**定時同步** (定期刷新):
```
- L2 快取 (圖表): 每 1 小時刷新
- 供應商評分: 每 5 分鐘重算
```

---

## 後續設計文件

✅ 完成: FR-D_design.md (本文件)  
⏳ 關聯: 
- [FR-D_data-model.md](FR-D_data-model.md) - 數據模型設計
- [FR-D_components.md](FR-D_components.md) - 前後端組件設計
- [FR-D_api-spec.md](FR-D_api-spec.md) - REST API 規範

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-05-08 | 初版：17 個需求的完整設計 |

**最後更新**: 2026-05-08  
**責任人**: System Architect
