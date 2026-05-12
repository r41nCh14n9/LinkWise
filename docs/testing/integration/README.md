# FR-D Dashboard 測試計劃 - 執行摘要

**編製日期**: 2026-05-08  
**範圍**: FR-D Dashboard 後端 API  
**主要目標**: 驗證 17 個功能需求的正確實現  
**交付物**: 3 份詳細測試文檔

---

## 1. 測試計劃概述

### 1.1 測試範圍

✅ **完全涵蓋** FR-D 所有 17 個功能需求：

| 功能模塊 | 需求數 | 測試用例 | 優先級 |
|---------|-------|--------|-------|
| **FR-D1** 摘要卡片 | 4 | 4 | P0 |
| **FR-D2** 支出趨勢 | 4 | 4 | P0 |
| **FR-D3** 供應商評分 | 3 | 4 | P0 |
| **FR-D4** PR/PO 漏斗 | 3 | 3 | P0 |
| **FR-D5** 最近操作 | 3 | 4 | P0 |
| **系統層** | - | 5 | P0 |
| **總計** | **17** | **26** | - |

### 1.2 測試總量

```
├─ API 功能測試:      16 個
├─ 數據驗證測試:      6 個
├─ 多租戶隔離測試:    2 個
├─ 性能測試:          2 個
├─ 錯誤處理測試:      3 個
└─ 總計:              26 個測試用例
```

---

## 2. 測試策略

### 2.1 測試金字塔

```
┌─────────────────┐
│   E2E 測試      │  (未來 - React UI)
├────────────────┤
│  集成測試       │  ← 當前重點
├────────────────┤
│  單元測試       │  (JUnit - 可選)
└─────────────────┘
```

### 2.2 測試優先級

**P0 (阻擋性 - 必須通過)**
- 所有 API 端點返回 HTTP 200
- 所有摘要卡片數據非空且合理
- 多租戶隔離正確
- 基本性能達標 (< 500ms)

**P1 (重要 - 應該通過)**
- 高級過濾功能
- 詳細的數據驗證
- 詳細的性能指標

**P2 (可選 - 最好通過)**
- 並發負載測試
- 高級性能優化驗證

---

## 3. 交付物清單

### 3.1 已完成文檔

✅ **1. FR-D-Integration-Test-Plan.md** (450+ 行)
   - 完整的測試計劃
   - 26 個詳細測試用例說明
   - 8 個 API 端點規格
   - 測試工具和框架建議
   - 測試執行時間表

✅ **2. FR-D-Test-Traceability-Matrix.md** (400+ 行)
   - 需求 ↔ 測試用例映射
   - 功能覆蓋率分析 (100%)
   - NFR (非功能需求) 測試映射
   - 測試優先級分布
   - 缺陷追蹤模板

✅ **3. FR-D-Test-Execution-Report-Template.md** (300+ 行)
   - 測試執行報告模板
   - 結果統計表
   - 缺陷統計和追蹤
   - 覆蓋率分析
   - 風險評估

### 3.2 文檔位置

```
docs/testing/integration/
├─ FR-D-Integration-Test-Plan.md              (測試計劃)
├─ FR-D-Test-Traceability-Matrix.md           (追蹤矩陣)
├─ FR-D-Test-Execution-Report-Template.md     (執行報告)
└─ README.md (本文檔)
```

---

## 4. 測試用例快速參考

### 4.1 API 端點測試

| 編號 | 端點 | 測試名稱 | 預期結果 | 優先級 |
|------|------|---------|---------|-------|
| TC1.1 | `/api/v1/dashboard` | 獲取完整儀表板 | HTTP 200, JSON | P0 |
| TC1.2 | `/api/v1/dashboard/health` | 健康檢查 | HTTP 200, "OK" | P0 |
| TC2.1 | `/api/v1/dashboard/summary` | 摘要卡片 - 支出 | amount > 0 | P0 |
| TC2.2 | `/api/v1/dashboard/summary` | 摘要卡片 - 供應商 | count > 0 | P0 |
| TC2.3 | `/api/v1/dashboard/summary` | 摘要卡片 - PR | count >= 0 | P0 |
| TC2.4 | `/api/v1/dashboard/summary` | 摘要卡片 - 預警 | count >= 0 | P0 |
| TC3.1 | `/api/v1/dashboard/spending-trend` | 支出趨勢 (6M) | 6 個月數據 | P0 |
| TC3.2 | `/api/v1/dashboard/spending-trend` | 支出趨勢 (12M) | 12 個月數據 | P1 |
| TC3.3 | `/api/v1/dashboard/spending-trend` | 支出趨勢 - 篩選 | 按維度過濾 | P1 |
| TC3.4 | `/api/v1/dashboard/spending-trend/export` | 支出 - 導出 | isExportable=true | P1 |
| TC4.1 | `/api/v1/dashboard/vendor-scoring` | 供應商評分 | score ∈ [0,100] | P0 |
| TC4.2 | `/api/v1/dashboard/vendor-scoring` | 風險分布 | 統計計數 | P0 |
| TC4.3 | `/api/v1/dashboard/vendor-scoring` | 高風險告警 | alerts 列表 | P1 |
| TC4.4 | `/api/v1/dashboard/vendor-scoring` | 風險篩選 | 按 riskLevel | P1 |
| TC5.1 | `/api/v1/dashboard/pipeline-funnel` | PR/PO 漏斗 | 5 階段分布 | P0 |
| TC5.2 | `/api/v1/dashboard/pipeline-funnel` | 轉化率指標 | rates ∈ [0%,100%] | P1 |
| TC5.3 | `/api/v1/dashboard/pipeline-funnel` | 瓶頸分析 | bottlenecks 列表 | P1 |
| TC6.1 | `/api/v1/dashboard/recent-operations` | 最近操作 - PR | recentPRs 列表 | P0 |
| TC6.2 | `/api/v1/dashboard/recent-operations` | 最近操作 - 供應商 | recentVendors 列表 | P0 |
| TC6.3 | `/api/v1/dashboard/recent-operations` | 快速操作 | quickActions >= 3 | P1 |
| TC6.4 | `/api/v1/dashboard/recent-operations` | 分頁支持 | limit 參數 | P1 |

### 4.2 系統層測試

| 編號 | 測試項 | 預期結果 | 優先級 |
|------|-------|---------|-------|
| TC7.1 | 多租戶隔離 | 不同 orgId 返回不同數據 | P0 |
| TC7.2 | 默認 organizationId | 缺省為 1 | P0 |
| TC8.1 | 響應時間 | < 500ms | P0 |
| TC8.2 | 單端點性能 | < 300ms | P1 |
| TC9.1 | 錯誤處理 | 無效參數返回 400 | P0 |

---

## 5. 快速開始測試

### 5.1 準備環境

```bash
# 1. 啟動後端服務
cd /f/projects/LinkWise
docker-compose -f docker-compose.dev.yml up -d

# 2. 驗證服務運行
docker ps | grep backend
curl http://localhost:8080/api/v1/dashboard/health
```

### 5.2 執行測試

**選項 1: 使用 curl (快速驗證)**
```bash
# 獲取完整儀表板
curl -X GET "http://localhost:8080/api/v1/dashboard?organizationId=1" \
  -H "Content-Type: application/json" | jq .

# 獲取摘要卡片
curl -X GET "http://localhost:8080/api/v1/dashboard/summary?organizationId=1" | jq .

# 獲取支出趨勢
curl -X GET "http://localhost:8080/api/v1/dashboard/spending-trend?organizationId=1&timeRange=6MONTHS" | jq .
```

**選項 2: 使用 REST Assured (自動化)**
```java
// 示例: 測試摘要卡片
@Test
public void testSummaryCards() {
    given()
        .baseUri("http://localhost:8080")
        .queryParam("organizationId", 1)
    .when()
        .get("/api/v1/dashboard/summary")
    .then()
        .statusCode(200)
        .body("monthlyExpense.amount", greaterThan(0))
        .body("monthlyExpense.currency", equalTo("CNY"));
}
```

**選項 3: 使用 Postman (可視化)**
- 導入提供的 Postman 集合
- 執行測試用例
- 查看結果

---

## 6. 成功標準

### 6.1 測試通過標準 (必須全部滿足)

- ✅ 所有 P0 測試通過率 = 100%
- ✅ 所有 P1 測試通過率 ≥ 95%
- ✅ 所有 17 個功能需求被覆蓋
- ✅ 響應時間 < 500ms
- ✅ 沒有 Critical 級別缺陷
- ✅ 多租戶隔離驗證通過

### 6.2 測試指標

```
┌──────────────────────────────┐
│   測試執行指標               │
├──────────────────────────────┤
│ 功能覆蓋率:      100% ✅      │
│ 需求覆蓋率:      100% ✅      │
│ 通過率:          > 95% ✅     │
│ 平均響應時間:    < 300ms ✅   │
│ 缺陷密度:        < 2/1000 LOC │
└──────────────────────────────┘
```

---

## 7. 已知限制和假設

### 7.1 測試環境假設

- ✅ PostgreSQL 16 已安裝並運行
- ✅ Spring Boot 後端已成功編譯
- ✅ 所有 8 個 API 端點都已實現
- ✅ Mock 數據生成器正常工作

### 7.2 測試限制

- ⏳ 前端 UI 測試不在本計劃範圍（待後續）
- ⏳ 集成 VMS、Procurement 服務的真實數據測試不在此輪
- ⏳ 負載測試和壓力測試為可選項

---

## 8. 後續行動計劃

### 8.1 短期 (本周)

- [ ] 運行所有 26 個測試用例
- [ ] 修復發現的缺陷
- [ ] 生成測試執行報告

### 8.2 中期 (下週)

- [ ] 自動化所有測試用例 (REST Assured)
- [ ] 設置 CI/CD 管道
- [ ] 進行性能基準測試

### 8.3 長期 (下月)

- [ ] 與 VMS、Procurement 服務集成測試
- [ ] 前端 E2E 測試
- [ ] 負載和壓力測試

---

## 9. 參考資源

### 9.1 相關文檔

- [FR-D Design](../design/requirements/FR-D/design.md) - 設計文檔
- [需求分析](../analysis/requirements/需求分析文件.md) - 需求分析
- [架構設計](../design/architecture/modules.md) - 架構模塊

### 9.2 測試工具文檔

- **REST Assured**: https://rest-assured.io/
- **JUnit 5**: https://junit.org/junit5/
- **Postman**: https://www.postman.com/
- **JMeter**: https://jmeter.apache.org/

---

## 10. 聯絡方式

| 角色 | 名字 | Email | 電話 |
|------|------|-------|------|
| 測試主管 | TBD | | |
| QA 工程師 | TBD | | |
| 產品經理 | TBD | | |

---

## 附錄 A：完整測試用例清單

### A.1 P0 測試用例 (14 個 - 必須通過)

```
✅ TC1.1  - 獲取完整儀表板
✅ TC1.2  - 健康檢查
✅ TC2.1  - 摘要卡片 - 月度支出
✅ TC2.2  - 摘要卡片 - 活躍供應商
✅ TC2.3  - 摘要卡片 - 待處理 PR
✅ TC2.4  - 摘要卡片 - 庫存預警
✅ TC3.1  - 支出趨勢 (6 個月)
✅ TC3.4  - 支出趨勢 - 導出
✅ TC4.1  - 供應商評分
✅ TC4.2  - 風險分布
✅ TC5.1  - PR/PO 漏斗
✅ TC6.1  - 最近 PR/PO
✅ TC7.1  - 多租戶隔離
✅ TC8.1  - 性能測試 (基準)
```

### A.2 P1 測試用例 (10 個 - 應該通過)

```
⭐ TC3.2  - 支出趨勢 (12 個月)
⭐ TC3.3  - 支出趨勢 - 多維篩選
⭐ TC4.3  - 高風險告警
⭐ TC4.4  - 風險等級篩選
⭐ TC5.2  - 轉化率指標
⭐ TC5.3  - 瓶頸分析
⭐ TC6.2  - 最近供應商
⭐ TC6.3  - 快速操作
⭐ TC6.4  - 分頁支持
⭐ TC8.2  - 單端點性能
```

### A.3 P2 測試用例 (2 個 - 可選)

```
🌟 TC8.3  - 並發負載測試
🌟 TC9.1  - 錯誤處理
```

---

## 附錄 B：DTO 驗證檢查清單

```
DashboardDTO:
  □ summaryCards 非空
  □ expenseTrend 非空
  □ vendorScoring 非空
  □ prpoFunnel 非空
  □ recentOperations 非空
  □ organizationId 匹配
  □ userId 非空
  □ lastUpdated 近期時間戳

SummaryCardsDTO:
  □ monthlyExpense 非空
    □ amount > 0
    □ currency = "CNY"
    □ departmentBreakdown 非空
    □ categoryBreakdown 非空
  □ activeVendors 非空
    □ count > 0
    □ byCategory 非空
  □ pendingPRs 非空
    □ count >= 0
    □ overdue <= count
  □ inventoryWarnings 非空
    □ count >= 0
    □ criticalItems 列表
```

---

**最後更新**: 2026-05-08  
**文檔版本**: 1.0  
**狀態**: ✅ 完成 - 準備執行

