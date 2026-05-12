# FR-D Dashboard 整合測試執行指南

**版本**: v1.0  
**日期**: 2026-05-08  
**用途**: 按步驟執行整合測試，驗證前後端集成

---

## 快速開始

```bash
# 1. 準備環境
cd f:\projects\LinkWise
npm install  # 前端依賴
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest @playwright/test

# 2. 啟動後端
docker-compose up -d mysql

# 3. 執行測試
npm run test:integration
```

---

## 詳細測試步驟

### Phase 1: API 層測試 (45 分鐘)

#### 步驟 1.1: 測試 getSummaryCards 正常流程

```bash
# 執行單個測試
npm run test -- api.test.ts -t "getSummaryCards正常流程"

# 預期結果:
# ✅ 請求正確發送
# ✅ 響應格式驗證通過
# ✅ 數據正確返回
```

#### 步驟 1.2: 測試錯誤分類 (3 層)

```bash
# 執行所有錯誤分類測試
npm run test -- api.test.ts -t "error classification"

# 驗證:
# ✅ 401 Unauthorized 正確識別
# ✅ 500 Server Error 正確識別
# ✅ Network error 正確識別
# ✅ Configuration error 正確識別
```

#### 步驟 1.3: 測試 4 層驗證

```bash
# 執行驗證層測試
npm run test -- api.test.ts -t "validation layers"

# 驗證:
# ✅ 層1: 結構驗證 (JSON 格式)
# ✅ 層2: 狀態碼驗證 (code === 200)
# ✅ 層3: 數據存在性驗證
# ✅ 層4: DTO 驗證 (類型檢查)
```

### Phase 2: Hook 層測試 (30 分鐘)

#### 步驟 2.1: 內存洩漏防護

```bash
# 執行內存測試
npm run test -- hooks.test.ts -t "memory leak protection"

# 在測試運行過程中監控:
open http://localhost:9222  # Chrome DevTools

# 預期:
# ✅ 無警告: "Can't perform a React state update on an unmounted component"
# ✅ 內存增長 < 10MB (10 次 mount/unmount 循環)
# ✅ isMountedRef 正確設置為 false
```

#### 步驟 2.2: 快取機制

```bash
# 執行快取測試
npm run test -- hooks.test.ts -t "caching mechanism"

# 預期:
# ✅ 第一次請求: 發送 HTTP 請求
# ✅ 第二次請求: 使用快取，無新 HTTP 請求
# ✅ 5 分鐘後: 快取過期，發送新請求
# ✅ 性能改進: 快取命中 < 10ms
```

#### 步驟 2.3: 錯誤狀態

```bash
# 執行錯誤狀態測試
npm run test -- hooks.test.ts -t "error handling"

# 預期:
# ✅ 錯誤正確傳遞到 state
# ✅ 錯誤消息可訪問
# ✅ 重試邏輯正確
```

### Phase 3: UI 層測試 (30 分鐘)

#### 步驟 3.1: Skeleton Loading

```bash
# 執行骨架屏測試
npm run test -- components.test.ts -t "skeleton loading"

# 預期:
# ✅ 加載時顯示 4 個骨架卡片
# ✅ 骨架卡片有 animate-pulse 動畫
# ✅ 卡片顯示 ARIA 標籤 (aria-loading="true")
# ✅ 數據到達後替換為真實卡片
```

#### 步驟 3.2: 錯誤提示

```bash
# 執行錯誤顯示測試
npm run test -- components.test.ts -t "error display"

# 預期:
# ✅ 顯示 SummaryCardsError 組件
# ✅ 紅色背景和警告圖標
# ✅ 顯示詳細錯誤消息
# ✅ ARIA role="alert" 無障礙支持
```

#### 步驟 3.3: 數據格式化

```bash
# 執行數據格式化測試
npm run test -- components.test.ts -t "data formatting"

# 驗證各種格式:
# ✅ 貨幣: 1234567 → ¥1,234,567
# ✅ 數字: 42 → 42
# ✅ 百分比: 12 → +12% ↑
# ✅ 負數: -5 → -5% ↓
```

### Phase 4: 端到端集成測試 (30 分鐘)

#### 步驟 4.1: 完整加載流程

```bash
# 執行 E2E 測試
npm run test:e2e -- --grep "full dashboard load"

# 操作:
# 1. 打開 Dashboard 頁面
# 2. 觀察骨架屏加載
# 3. 等待數據加載完成
# 4. 驗證卡片內容

# 預期:
# ✅ 頁面加載時間 < 2 秒
# ✅ 骨架屏動畫流暢
# ✅ 卡片內容正確顯示
# ✅ 無控制台錯誤
```

#### 步驟 4.2: 錯誤場景

```bash
# 執行錯誤場景 E2E 測試
npm run test:e2e -- --grep "error scenarios"

# 場景 1: 無網絡連接
# - 禁用網絡
# - 重新加載頁面
# - 驗證顯示 "連接失敗"

# 場景 2: 401 未授權
# - 清除認證 token
# - 重新加載頁面
# - 驗證顯示 "未授權"

# 場景 3: 500 服務器錯誤
# - 模擬後端服務不可用
# - 驗證顯示 "服務器錯誤"
```

### Phase 5: 性能測試 (45 分鐘)

#### 步驟 5.1: 響應時間基準

```bash
# 執行性能測試
npm run test:performance -- --baseline

# 測試項目:
# 1. API 響應時間 (100 次請求)
# 2. UI 渲染時間
# 3. 快取命中時間

# 預期結果:
# ✅ P50 (中位數) < 50ms
# ✅ P95 < 150ms
# ✅ P99 < 200ms
# ✅ 快取命中 < 10ms
```

#### 步驟 5.2: 併發負載測試

```bash
# 執行併發測試
npm run test:performance -- --concurrent=10

# 測試:
# - 10 個併發請求
# - 20 個併發請求
# - 50 個併發請求

# 預期:
# ✅ 所有請求成功
# ✅ 無超時或 502 錯誤
# ✅ 響應時間在可接受範圍內
```

#### 步驟 5.3: 內存監控

```bash
# 執行內存測試
npm run test:performance -- --memory

# 監控項目:
# - 初始內存使用
# - 加載 10 次數據後的內存
# - 內存是否洩漏

# 預期:
# ✅ 內存增長 < 5MB
# ✅ 垃圾回收後返回初始水平
# ✅ 無內存洩漏
```

---

## 故障排查

### 問題 1: 測試超時 (TIMEOUT)

```bash
# 原因: 後端服務不可用或網絡慢

# 解決:
1. 檢查後端是否運行: docker ps | grep linkwise
2. 檢查網絡連接: ping localhost:8080
3. 增加超時時間: npm run test -- --timeout=10000
4. 檢查防火牆設置
```

### 問題 2: 內存測試失敗

```bash
# 原因: 內存洩漏或測試環境限制

# 解決:
1. 運行單個測試隔離問題
2. 檢查 isMountedRef 是否正確使用
3. 驗證清理函數是否執行
4. 增加垃圾回收次數: npm run test -- --gc-interval=100
```

### 問題 3: 驗證失敗

```bash
# 原因: 響應格式不匹配

# 解決:
1. 檢查後端返回的實際格式
2. 驗證 DTO 定義是否最新
3. 檢查驗證器邏輯
4. 添加詳細的錯誤日誌
```

---

## 測試結果檢查表

### API 層 ✅

- [ ] getSummaryCards 返回正確格式
- [ ] 錯誤分類 3 層完整
- [ ] 響應驗證 4 層完整
- [ ] 全局錯誤事件發出
- [ ] 緩存機制正常

### Hook 層 ✅

- [ ] useAsyncData isMountedRef 防止洩漏
- [ ] 清理函數正確執行
- [ ] 快取在 5 分鐘內有效
- [ ] 快取過期後重新請求
- [ ] 錯誤狀態正確傳遞

### UI 層 ✅

- [ ] 加載時顯示骨架屏
- [ ] 卡片格式化正確
- [ ] 錯誤狀態正確顯示
- [ ] 無控制台警告
- [ ] 無 React 警告

### 端到端 ✅

- [ ] 完整加載流程正常
- [ ] 錯誤恢復機制有效
- [ ] 性能指標達標
- [ ] 無內存洩漏
- [ ] 用戶體驗良好

---

## 生成報告

```bash
# 生成完整測試報告
npm run test:report

# 生成覆蓋率報告
npm run test:coverage

# 查看 HTML 覆蓋率報告
open coverage/index.html

# 生成性能報告
npm run test:perf-report

# 查看性能結果
open perf-results/index.html
```

---

## 部署前檢查

在部署到開發環境前，確認:

- [ ] 所有 25 個測試用例通過
- [ ] 代碼覆蓋率 ≥ 80%
- [ ] P99 響應時間 < 200ms
- [ ] 無內存洩漏
- [ ] 無未捕捉的異常
- [ ] 代碼審查通過
- [ ] 性能基準達標

---

**測試計畫完成日期**: 2026-05-08  
**執行狀態**: ⏳ 待執行  
**預計完成**: 2026-05-09

