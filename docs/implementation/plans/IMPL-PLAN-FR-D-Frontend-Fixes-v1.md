# 實現計畫：FR-D 前端代碼修復 v1

**日期**: 2026-05-08  
**狀態**: 進行中  
**優先級**: P0 (Critical) + P1 (Major)

---

## 📋 概述

根據 CODE-REVIEW-FR-D-Frontend-v1.md 的 12 個問題發現，實施系統性代碼修復。

**總體目標**: 將合規性評分從 82% 提升到 95%+

---

## 🎯 修復範圍

### Phase 1: Critical Issues (必須修復) - 4.5 小時
3 個 Critical 問題必須在 Phase 1 發布前完成：

| # | 問題 | 文件 | 優先級 | 時間 |
|---|------|------|--------|------|
| 1 | API 客戶端錯誤處理不完整 | `src/services/api.ts` | P0 | 1.5h |
| 2 | Hook 內存洩漏防護 | `src/hooks/useDashboard.ts` | P0 | 1h |
| 3 | API 響應驗證缺失 | `src/services/api.ts` | P0 | 2h |

### Phase 2: Major Issues (應該修復) - 4 小時
4 個 Major 問題應在 Phase 1 發布前完成：

| # | 問題 | 文件 | 優先級 | 時間 |
|---|------|------|--------|------|
| 4 | 文檔準確性 | `src/components/dashboard/DashboardPage.tsx` | P1 | 0.5h |
| 5 | Hook 類型定義 | `src/hooks/useDashboard.ts` | P1 | 1.5h |
| 6 | JSDoc 文檔缺失 | `src/utils/formatters.ts` | P1 | 1h |
| 7 | Skeleton Loading 缺失 | `src/components/dashboard/SummaryCards.tsx` | P1 | 1h |

### Phase 3: Minor Issues (優化建議) - 3 小時
5 個 Minor 問題可在 Phase 2 中完成：

| # | 問題 | 文件 | 優先級 | 時間 |
|---|------|------|--------|------|
| 8 | ESLint 配置 | 項目根目錄 | P2 | 0.5h |
| 9 | 常量註釋優化 | `src/utils/constants.ts` | P2 | 0.5h |
| 10 | i18n 規劃 | 全項目 | P3 | 2h |
| 11 | 驗證函數增強 | `src/utils/validators.ts` | P2 | 0.5h |

---

## 📝 修復方案

### Issue #1: API 客戶端錯誤處理不完整

**當前問題**:
```typescript
// 現狀：只有 console.error，沒有結構化錯誤處理
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);
```

**修復方案**:
1. 實現結構化錯誤分類
2. 區分：網絡錯誤、4xx、5xx
3. 實現自動 401 重定向
4. 添加錯誤上報機制

**文件**: `src/services/api.ts`

---

### Issue #2: Hook 內存洩漏防護

**當前問題**:
缺少 `isMounted` 檢查導致卸載後 setState

**修復方案**:
1. 使用 `useRef(true)` 跟蹤掛載狀態
2. 在 cleanup 中設置為 false
3. setState 前檢查 `isMountedRef.current`

**文件**: `src/hooks/useDashboard.ts`

---

### Issue #3: API 響應驗證缺失

**當前問題**:
無法驗證後端返回的數據格式

**修復方案**:
1. 在 `validators.ts` 添加 DTO 驗證函數
2. 在 `api.ts` handleResponse 中調用驗證
3. 驗證失敗時拋出有意義的錯誤

**文件**: `src/utils/validators.ts`, `src/services/api.ts`

---

### Issue #4: 文檔準確性

**當前問題**:
DashboardPage 聲稱完成全部 17 需求，實際只完成 4/17

**修復方案**:
1. 更新 JSDoc 註釋
2. 列出已完成功能
3. 列出計畫中功能
4. 顯示進度百分比

**文件**: `src/components/dashboard/DashboardPage.tsx`

---

### Issue #5: Hook 類型定義

**當前問題**:
某些 Hook 的返回類型不夠明確

**修復方案**:
1. 補充完整的返回類型註釋
2. 為所有 Hook 參數添加類型
3. 添加 JSDoc 文檔

**文件**: `src/hooks/useDashboard.ts`

---

### Issue #6: JSDoc 文檔缺失

**當前問題**:
`formatters.ts` 某些函數缺少文檔

**修復方案**:
1. 為每個函數添加 JSDoc
2. 說明參數和返回值
3. 記錄邊界情況處理

**文件**: `src/utils/formatters.ts`

---

### Issue #7: Skeleton Loading 缺失

**當前問題**:
加載時只顯示 "Loading..."，沒有骨架屏

**修復方案**:
1. 創建 `SummaryCardsSkeleton` 組件
2. 使用 Tailwind 的 `animate-pulse`
3. 與實際卡片等高度

**文件**: `src/components/dashboard/SummaryCards.tsx`

---

## 📂 修復順序

```
1️⃣ 修復 Issue #3 (API 驗證)
   ↓ 依賴關係：其他功能需要驗證層
   
2️⃣ 修復 Issue #1 (API 錯誤處理)
   ↓ 基礎設施改進
   
3️⃣ 修復 Issue #2 (Hook 內存洩漏)
   ↓ 已部分實現，需要驗證和完整性檢查
   
4️⃣ 修復 Issue #4,5,6,7 (文檔和組件)
   ↓ 可並行進行
```

---

## 🛠️ 實現檢查清單

### 準備階段
- ✅ 讀取 API 響應碼設計文檔
- ✅ 查看代碼審查報告
- ✅ 確認後端 API 契約
- ⏳ 創建本實現計畫

### 實現階段
- ⏳ Issue #1: API 錯誤處理
- ⏳ Issue #2: Hook 內存洩漏
- ⏳ Issue #3: API 驗證
- ⏳ Issue #4-7: 文檔和組件

### 驗證階段
- ⏳ 代碼審查（Review Agent）
- ⏳ 單元測試
- ⏳ 集成測試

### 文檔階段
- ⏳ 代碼記錄
- ⏳ 自檢清單
- ⏳ 集成指南

---

## 📚 參考材料

### 適用的指南
- `docs/reference/guidelines/GUIDELINES-API-ResponseCodes-v1.md` (新)
- `docs/reference/guidelines/GUIDELINES-Coding-Standards-v*.md`
- `docs/reference/guidelines/GUIDELINES-Performance-Security-v*.md`

### 適用的模板
- `docs/reference/templates/TEMPLATE-*.ts` (如適用)

### 優秀示例
- `docs/reference/examples/good/` (類似實現)

### 審查報告
- `docs/review/code-reviews/CODE-REVIEW-FR-D-Frontend-v1.md`

---

## 📈 成功指標

| 指標 | 當前 | 目標 | 方法 |
|------|------|------|------|
| 合規性評分 | 82% | 95%+ | 修復所有 Critical 和 Major |
| 類型安全 | 95% | 100% | 完善 Hook 類型 |
| 文檔完整性 | 75% | 90%+ | 添加 JSDoc 和註釋 |
| 錯誤處理 | 78% | 95%+ | 實現結構化錯誤處理 |

---

## ⏱️ 時間估計

| 階段 | 任務 | 時間 |
|------|------|------|
| 準備 | 讀取文檔、制定計畫 | 1h |
| Phase 1 | 修復 3 個 Critical Issues | 4.5h |
| Phase 2 | 修復 4 個 Major Issues | 4h |
| Phase 3 | 修復 5 個 Minor Issues | 3h |
| 驗證 | 測試、審查、文檔 | 4h |
| **總計** | | **16.5h** |

---

## 🔄 後續步驟

1. **開始 Issue #1** (API 驗證) - 添加驗證層
2. **進行 Issue #2** (API 錯誤) - 結構化錯誤處理
3. **進行 Issue #3** (Hook) - 內存洩漏防護
4. **進行 Issues #4-7** (文檔和組件)
5. **單元測試** - 確保功能正常
6. **二次審查** - Review Agent 驗證修復
7. **部署** - 合併到 main 分支

---

**計畫創建時間**: 2026-05-08 12:00 UTC  
**計畫作者**: GitHub Copilot Development Agent  
**狀態**: 就緒開始實施
