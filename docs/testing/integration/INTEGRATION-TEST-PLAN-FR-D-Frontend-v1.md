# FR-D Dashboard 前後端整合測試計畫 v1

**文檔版本**: v1.0  
**建立日期**: 2026-05-08  
**測試模塊**: FR-D Dashboard (SummaryCards Phase 1)  
**測試範圍**: API 層、Hook 層、UI 層  
**預期完成**: 4-5 小時  

---

## 📋 目錄

1. [測試概述](#測試概述)
2. [測試架構](#測試架構)
3. [測試環境設置](#測試環境設置)
4. [功能整合測試](#功能整合測試)
5. [API 層測試](#api-層測試)
6. [UI 層測試](#ui-層測試)
7. [性能與負載測試](#性能與負載測試)
8. [錯誤與恢復測試](#錯誤與恢復測試)
9. [數據驗證測試](#數據驗證測試)
10. [需求-測試映射](#需求-測試映射)
11. [測試執行計畫](#測試執行計畫)

---

## 1️⃣ 測試概述

### 測試目標

✅ **驗證 FR-D Phase 1 實現的 4 個功能需求**:
- FR-D1.1: 月度總支出卡片展示
- FR-D1.2: 活躍供應商數卡片展示
- FR-D1.3: 待處理 PR 數卡片展示
- FR-D1.4: 庫存預警數卡片展示

✅ **驗證代碼修復質量**:
- API 錯誤處理的 3 層分類正確運作
- Hook 內存保護防止洩漏
- 響應驗證 4 層完整
- 加載和錯誤狀態正確顯示

### 測試範圍

| 層級 | 組件 | 測試內容 |
|------|------|--------|
| **API 層** | DashboardApiClient | 請求/響應、錯誤處理、驗證 |
| **Hook 層** | useSummaryCards | 數據獲取、快取、內存管理 |
| **UI 層** | SummaryCards 組件 | 骨架屏、加載、錯誤、數據渲染 |
| **集成** | 端到端流程 | API → Hook → UI 完整路徑 |

### 成功標準

✅ 所有 API 調用返回正確的數據格式  
✅ Hook 無內存洩漏警告  
✅ UI 正確顯示加載、成功、錯誤狀態  
✅ 錯誤恢復機制正常運作  
✅ 性能指標達到預期 (P99 < 200ms)  

---

## 2️⃣ 測試架構

### 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    React 前端 (vite)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ DashboardPage 組件                                   │  │
│  │ ├─ useSummaryCards Hook                            │  │
│  │ └─ SummaryCards UI Component                       │  │
│  │    ├─ SummaryCardsSkeleton (加載狀態)              │  │
│  │    ├─ SummaryCardsError (錯誤狀態)                 │  │
│  │    └─ Card List (成功狀態)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Axios Client (api.ts)                              │  │
│  │ ├─ 請求攔截器 (認證)                              │  │
│  │ ├─ 響應攔截器 (錯誤分類)                          │  │
│  │ └─ DashboardApiClient (業務邏輯)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓                                                │
├─────────────────────────────────────────────────────────────┤
│                    HTTP 層                                   │
├─────────────────────────────────────────────────────────────┤
│              ↓                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SpringBoot 後端                                      │  │
│  │ ├─ Controller: DashboardController                 │  │
│  │ ├─ Service: DashboardService                       │  │
│  │ ├─ Repository: Dashboard Query                     │  │
│  │ └─ Response: ApiResponse<SummaryCardsDTO>          │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 數據層                                              │  │
│  │ ├─ purchase_request 表                             │  │
│  │ ├─ vendor 表                                       │  │
│  │ ├─ inventory 表                                    │  │
│  │ └─ organization 表                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 測試分層

```
前端 UI 層測試
    ↓
Hook 層測試
    ↓
API 層測試
    ↓
後端集成測試
    ↓
端到端測試
```

---

## 3️⃣ 測試環境設置

### 環境準備

```bash
# 前置條件
✅ Node.js 18+ 已安裝
✅ Python 3.8+ 已安裝
✅ Docker 已啟動
✅ 後端服務已啟動 (http://localhost:8080)
✅ 前端開發服務已啟動 (http://localhost:5173)
```

### 依賴安裝

```bash
# 1. 安裝前端依賴
cd src/linkwise-front
npm install

# 2. 安裝測試依賴
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
npm install --save-dev @playwright/test

# 3. 安裝 Python 測試依賴
pip install pytest playwright
playwright install chromium
```

### 環境配置

```bash
# 前端環境變數 (.env.test)
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_VERSION=/api/v1
NODE_ENV=test

# 後端環境變數 (application-test.yml)
server.port: 8080
spring.datasource.url: jdbc:mysql://localhost:3306/linkwise_test
spring.datasource.username: root
spring.datasource.password: password
```

### 測試數據準備

```sql
-- 1. 建立測試組織
INSERT INTO organization (id, name, code) VALUES (999, 'Test Org', 'TEST_ORG');

-- 2. 建立測試用戶
INSERT INTO user (id, organization_id, email, name, role) 
VALUES (999, 999, 'test@linkwise.com', 'Test User', 'ADMIN');

-- 3. 建立測試供應商
INSERT INTO vendor (id, organization_id, name, risk_level, score) 
VALUES 
  (1, 999, 'Vendor A', 'GREEN', 95),
  (2, 999, 'Vendor B', 'YELLOW', 75),
  (3, 999, 'Vendor C', 'RED', 60);

-- 4. 建立測試採購請求
INSERT INTO purchase_request (id, organization_id, amount, status, created_at) 
VALUES 
  (1, 999, 100000, 'PENDING', NOW()),
  (2, 999, 50000, 'APPROVED', NOW()),
  (3, 999, 75000, 'PENDING', NOW());

-- 5. 建立測試庫存
INSERT INTO inventory (id, organization_id, name, warning_count) 
VALUES 
  (1, 999, 'SKU-001', 2),
  (2, 999, 'SKU-002', 1),
  (3, 999, 'SKU-003', 3);
```

---

## 4️⃣ 功能整合測試

### 測試用例 1: 成功加載摘要卡片

**測試編碼**: T-001  
**優先級**: 高  
**前置條件**:
- 後端服務運行中
- 測試數據已準備
- 用戶已認證

**測試步驟**:
```
1. 打開 Dashboard 頁面
2. 觀察是否顯示 Skeleton 加載狀態
3. 等待網絡請求完成
4. 驗證顯示的數據正確性
```

**預期結果**:
```
✅ 頁面加載時顯示 4 個骨架卡片
✅ 發送 GET /api/v1/dashboard/summary-cards 請求
✅ 後端返回 200 OK，包含正確數據
✅ 卡片順序: 月度支出 → 活躍供應商 → 待處理PR → 庫存預警
✅ 數值格式化正確 (貨幣、數字、百分比)
✅ 趨勢指示器正確顯示 (↑ 或 ↓)
```

**驗證檢查點**:
```typescript
// 1. 驗證網絡請求
expect(apiCall).toHaveBeenCalledWith({
  url: '/api/v1/dashboard/summary-cards',
  method: 'GET',
  params: { organizationId: 999 }
});

// 2. 驗證響應格式
expect(response.data).toMatchObject({
  code: 200,
  message: 'Success',
  data: {
    monthlyExpense: { value: 225000, trend: 12 },
    activeVendors: { value: 3, trend: -5 },
    pendingPRs: { value: 2, trend: 8 },
    inventoryWarnings: { value: 6, trend: 0 }
  }
});

// 3. 驗證 UI 渲染
expect(screen.getByText('月度支出')).toBeInTheDocument();
expect(screen.getByText('¥225,000')).toBeInTheDocument();
expect(screen.getByText('+12%')).toBeInTheDocument();
```

**測試時間**: 5-10 秒

---

### 測試用例 2: API 錯誤處理 - 401 未授權

**測試編碼**: T-002  
**優先級**: 高  
**前置條件**:
- 後端模擬 401 Unauthorized 響應

**測試步驟**:
```
1. 模擬無效認證 token
2. 請求摘要卡片數據
3. 驗證錯誤分類和處理
4. 驗證 UI 顯示錯誤消息
```

**預期結果**:
```
✅ 響應攔截器捕捉 401 狀態碼
✅ 控制台日誌: '[API] 401 Unauthorized'
✅ 發送全局錯誤事件: apiErrorEmitter.emit()
✅ UI 顯示 SummaryCardsError 組件
✅ 顯示: '加載失敗' 和詳細錯誤信息
✅ 用戶可以嘗試重新登錄
```

**驗證檢查點**:
```typescript
// 1. 驗證錯誤事件發出
expect(apiErrorEmitter.emit).toHaveBeenCalledWith({
  status: 401,
  message: 'Unauthorized',
  timestamp: expect.any(String)
});

// 2. 驗證 Hook 狀態
expect(useSummaryCards().error).toBeDefined();
expect(useSummaryCards().error.message).toContain('401');

// 3. 驗證 UI 顯示
expect(screen.getByRole('alert')).toBeInTheDocument();
expect(screen.getByText('加載失敗')).toBeInTheDocument();
```

**測試時間**: 5 秒

---

### 測試用例 3: Hook 內存洩漏防護

**測試編碼**: T-003  
**優先級**: 高  
**前置條件**:
- React 開發模式監控內存
- 測試執行時捕捉警告

**測試步驟**:
```
1. 加載 Dashboard 組件
2. 立即卸載組件 (模擬快速返回/前進)
3. 重複 10 次
4. 檢查控制台警告
5. 監控內存使用變化
```

**預期結果**:
```
✅ 無 React 警告: 
   "Can't perform a React state update on an unmounted component"
✅ 無內存持續增長
✅ isMountedRef 正確追蹤掛載狀態
✅ 清理函數正確執行
```

**驗證檢查點**:
```typescript
// 1. 驗證 isMountedRef 模式
const { unmount } = render(<DashboardPage />);
// 模擬組件卸載
unmount();
// 驗證沒有警告
expect(consoleError).not.toHaveBeenCalled();

// 2. 驗證內存使用
const memBefore = process.memoryUsage().heapUsed;
// 執行 10 次掛載/卸載
for (let i = 0; i < 10; i++) {
  render(<DashboardPage />);
  unmount();
}
const memAfter = process.memoryUsage().heapUsed;
// 內存增長應 < 10MB
expect(memAfter - memBefore).toBeLessThan(10 * 1024 * 1024);
```

**測試時間**: 10-15 秒

---

### 測試用例 4: 響應驗證 - 無效數據

**測試編碼**: T-004  
**優先級**: 中  
**前置條件**:
- 後端模擬返回無效數據結構

**測試步驟**:
```
1. 後端返回缺少必需字段的響應
2. 驗證 4 層驗證是否捕捉
3. 驗證錯誤消息
4. 驗證 UI 錯誤顯示
```

**預期結果**:
```
✅ 驗證層 1 (結構驗證): 檢測缺少 'code' 字段
✅ 驗證層 2 (狀態碼): 檢測 code !== 200
✅ 驗證層 3 (數據存在): 檢測 data === null
✅ 驗證層 4 (DTO 驗證): 檢測數據不符合 SummaryCardsDTO
✅ 拋出詳細錯誤: 'Response data failed validation'
✅ UI 顯示: '加載失敗' 錯誤組件
```

**驗證檢查點**:
```typescript
// 模擬無效響應
const invalidResponses = [
  { data: null },  // 缺少 code 字段
  { code: 400, message: 'Error' },  // code !== 200
  { code: 200, message: 'Success', data: null },  // 缺少數據
  { code: 200, message: 'Success', data: { invalid: 'structure' } }  // DTO 無效
];

for (const response of invalidResponses) {
  expect(() => {
    handleResponse(response, validators.isValidSummaryCards);
  }).toThrow();
}
```

**測試時間**: 5-8 秒

---

### 測試用例 5: 快取機制

**測試編碼**: T-005  
**優先級**: 中  
**前置條件**:
- 快取設置 5 分鐘有效期
- 網絡監控工具可用

**測試步驟**:
```
1. 第一次請求摘要卡片
2. 驗證發送 HTTP 請求
3. 立即第二次請求相同數據
4. 驗證使用快取，無新 HTTP 請求
5. 等待快取過期 (5 分鐘)
6. 再次請求，驗證發送新 HTTP 請求
```

**預期結果**:
```
✅ 第一次請求: 發送 HTTP 請求，收到 200
✅ 第二次請求 (在 5 分鐘內): 無新 HTTP 請求，直接返回快取
✅ 第三次請求 (5 分鐘後): 發送新 HTTP 請求
✅ 快取命中率: 100%
✅ 性能改進: 第二次請求 < 10ms
```

**驗證檢查點**:
```typescript
// 監控 HTTP 請求
const httpSpy = jest.spyOn(axios, 'get');

// 第一次請求
await useSummaryCards({ organizationId: 999 });
expect(httpSpy).toHaveBeenCalledTimes(1);

// 第二次請求 (應使用快取)
const start = performance.now();
await useSummaryCards({ organizationId: 999 });
const duration = performance.now() - start;
expect(httpSpy).toHaveBeenCalledTimes(1);  // 仍為 1
expect(duration).toBeLessThan(10);  // < 10ms

// 等待快取過期
jest.useFakeTimers();
jest.advanceTimersByTime(5 * 60 * 1000 + 1000);  // 5 分 1 秒

// 第三次請求 (應發新請求)
await useSummaryCards({ organizationId: 999 });
expect(httpSpy).toHaveBeenCalledTimes(2);
```

**測試時間**: 5-10 秒 (+ 模擬時間)

---

## 5️⃣ API 層測試

### DashboardApiClient 測試

#### T-006: getSummaryCards 正常流程

```typescript
describe('DashboardApiClient.getSummaryCards', () => {
  test('should fetch and validate summary cards', async () => {
    // 模擬後端響應
    const mockResponse: ApiResponse<SummaryCardsDTO> = {
      code: 200,
      message: 'Success',
      data: {
        monthlyExpense: { value: 225000, trend: 12 },
        activeVendors: { value: 3, trend: -5 },
        pendingPRs: { value: 2, trend: 8 },
        inventoryWarnings: { value: 6, trend: 0 }
      },
      timestamp: new Date().toISOString(),
      traceId: 'trace-123'
    };

    jest.spyOn(axios, 'get').mockResolvedValue({ data: mockResponse });

    // 執行
    const result = await dashboardApiClient.getSummaryCards({ organizationId: 999 });

    // 驗證
    expect(result).toEqual(mockResponse.data);
    expect(axios.get).toHaveBeenCalledWith(
      '/summary-cards',
      expect.objectContaining({ params: { organizationId: 999 } })
    );
  });
});
```

#### T-007: 錯誤響應處理

```typescript
test('should handle 500 server error', async () => {
  const mockError = new AxiosError();
  mockError.response = {
    status: 500,
    data: { code: 1000, message: 'Internal Server Error' }
  };

  jest.spyOn(axios, 'get').mockRejectedValue(mockError);

  // 驗證錯誤拋出
  await expect(dashboardApiClient.getSummaryCards({ organizationId: 999 }))
    .rejects.toThrow();
});
```

#### T-008: 響應驗證

```typescript
test('should validate response structure', async () => {
  // 模擬無效響應
  const invalidResponse = {
    code: 200,
    message: 'Success',
    data: null  // 缺少數據
  };

  jest.spyOn(axios, 'get').mockResolvedValue({ data: invalidResponse });

  // 驗證驗證器捕捉錯誤
  await expect(dashboardApiClient.getSummaryCards({ organizationId: 999 }))
    .rejects.toThrow('Response data is empty');
});
```

---

## 6️⃣ UI 層測試

### Skeleton Loading 測試

#### T-009: 加載狀態顯示骨架屏

```typescript
test('should display skeleton while loading', async () => {
  // 模擬延遲響應
  jest.spyOn(dashboardApiClient, 'getSummaryCards')
    .mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve(mockData), 500)
    ));

  const { rerender } = render(<SummaryCards isLoading={true} />);

  // 驗證骨架屏
  expect(screen.getByText('載入中... (卡片 1)')).toBeInTheDocument();
  expect(screen.queryByText('月度支出')).not.toBeInTheDocument();

  // 等待加載完成
  await waitFor(() => {
    rerender(<SummaryCards data={mockData} isLoading={false} />);
  });

  // 驗證卡片顯示
  expect(screen.getByText('月度支出')).toBeInTheDocument();
});
```

#### T-010: 錯誤狀態顯示警告

```typescript
test('should display error message on failure', () => {
  const error = new Error('API Error: 500 Internal Server Error');
  
  render(<SummaryCards error={error} />);

  // 驗證警告顯示
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('加載失敗')).toBeInTheDocument();
  expect(screen.getByText(/API Error/)).toBeInTheDocument();
});
```

#### T-011: 數據格式化

```typescript
test('should format values correctly', () => {
  const data: SummaryCardsDTO = {
    monthlyExpense: { value: 1234567.89, trend: 12 },
    activeVendors: { value: 42, trend: -5 },
    pendingPRs: { value: 8, trend: 100 },
    inventoryWarnings: { value: 15, trend: 0 }
  };

  render(<SummaryCards data={data} />);

  // 驗證格式化
  expect(screen.getByText('¥1,234,567.89')).toBeInTheDocument();  // 貨幣
  expect(screen.getByText('42')).toBeInTheDocument();  // 整數
  expect(screen.getByText('+12%')).toBeInTheDocument();  // 趨勢
  expect(screen.getByText('-5%')).toBeInTheDocument();
  expect(screen.getByText('+100%')).toBeInTheDocument();
});
```

---

## 7️⃣ 性能與負載測試

### 性能基準

#### T-012: 響應時間 P99 < 200ms

```typescript
test('should respond within 200ms (P99)', async () => {
  const times: number[] = [];

  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    await dashboardApiClient.getSummaryCards({ organizationId: 999 });
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const p99 = times[Math.floor(times.length * 0.99)];

  expect(p99).toBeLessThan(200);  // P99 < 200ms
});
```

#### T-013: 併發請求處理

```typescript
test('should handle concurrent requests', async () => {
  const promises = [];

  for (let i = 0; i < 10; i++) {
    promises.push(
      dashboardApiClient.getSummaryCards({ organizationId: 999 })
    );
  }

  const results = await Promise.all(promises);

  // 驗證所有請求成功
  expect(results).toHaveLength(10);
  results.forEach(result => {
    expect(result.monthlyExpense).toBeDefined();
  });

  // 驗證只發送 1 個 HTTP 請求 (快取)
  expect(httpSpy).toHaveBeenCalledTimes(1);
});
```

### 負載測試

#### T-014: 大量數據處理

```typescript
test('should handle large dataset', async () => {
  // 模擬大量卡片數據
  const largeData = {
    monthlyExpense: { value: 999999999.99, trend: 99 },
    activeVendors: { value: 9999, trend: -99 },
    pendingPRs: { value: 999, trend: 50 },
    inventoryWarnings: { value: 9999, trend: 0 }
  };

  const start = performance.now();
  render(<SummaryCards data={largeData} />);
  const duration = performance.now() - start;

  // 驗證渲染時間
  expect(duration).toBeLessThan(100);  // < 100ms 渲染時間
});
```

---

## 8️⃣ 錯誤與恢復測試

### 錯誤分類測試

| 狀態碼 | 錯誤類型 | 預期行為 | 用例 |
|--------|---------|--------|------|
| 401 | 未授權 | 顯示錯誤，提示重新登錄 | T-015 |
| 403 | 禁止訪問 | 顯示錯誤，提示無權限 | T-016 |
| 404 | 資源不存在 | 顯示錯誤 | T-017 |
| 422 | 驗證失敗 | 顯示詳細驗證錯誤 | T-018 |
| 429 | 速率限制 | 顯示提示，建議重試 | T-019 |
| 500+ | 服務器錯誤 | 顯示錯誤，提示聯繫支持 | T-020 |
| 超時 | 網絡超時 | 顯示連接錯誤 | T-021 |
| DNS 失敗 | 網絡錯誤 | 顯示網絡不可用 | T-022 |

#### T-015: 401 錯誤恢復

```typescript
test('should handle 401 and redirect to login', async () => {
  // 模擬 401 響應
  const mockError = { response: { status: 401, data: { message: 'Token expired' } } };
  jest.spyOn(axios, 'get').mockRejectedValue(mockError);

  // 執行
  const { result } = renderHook(() => useSummaryCards({ organizationId: 999 }));

  // 等待錯誤
  await waitFor(() => expect(result.current.error).toBeDefined());

  // 驗證錯誤事件發出
  expect(apiErrorEmitter.emit).toHaveBeenCalledWith(
    expect.objectContaining({ status: 401 })
  );

  // 驗證顯示錯誤消息
  expect(result.current.error.message).toContain('401');
});
```

### 網絡故障恢復

#### T-023: 網絡超時自動重試

```typescript
test('should retry on network timeout', async () => {
  // 第一次超時
  jest.spyOn(axios, 'get')
    .mockRejectedValueOnce(new AxiosError('Timeout', 'ECONNABORTED'))
    .mockResolvedValueOnce({ data: mockData });

  // 執行 (應自動重試)
  const result = await dashboardApiClient.getSummaryCards({ organizationId: 999 });

  // 驗證最終成功
  expect(result).toEqual(mockData.data);
  expect(axios.get).toHaveBeenCalledTimes(2);  // 1 次失敗 + 1 次重試
});
```

---

## 9️⃣ 數據驗證測試

### 驗證器測試

#### T-024: isValidSummaryCards 驗證

```typescript
test('isValidSummaryCards should validate correct structure', () => {
  const validData = {
    monthlyExpense: { value: 100000, trend: 10 },
    activeVendors: { value: 5, trend: -2 },
    pendingPRs: { value: 3, trend: 5 },
    inventoryWarnings: { value: 2, trend: 0 }
  };

  expect(validators.isValidSummaryCards(validData)).toBe(true);
});

test('isValidSummaryCards should reject invalid structure', () => {
  const invalidData = {
    monthlyExpense: { value: '100000', trend: 10 }  // 類型錯誤
  };

  expect(validators.isValidSummaryCards(invalidData)).toBe(false);
});
```

#### T-025: 邊界值驗證

```typescript
test('should handle edge cases', () => {
  const edgeCases = [
    { value: 0, trend: 0 },  // 最小值
    { value: Number.MAX_SAFE_INTEGER, trend: 100 },  // 最大值
    { value: -1, trend: -100 },  // 負值
    { value: 0.01, trend: 0.1 }  // 小數
  ];

  edgeCases.forEach(testCase => {
    expect(validators.isValidSummaryCards(testCase)).toBe(true);
  });
});
```

---

## 🔟 需求-測試映射

### FR-D1.1 月度總支出卡片

| 需求描述 | 測試用例 | 驗證點 |
|---------|---------|------|
| 顯示月度支出數值 | T-001 | ✅ 值正確格式化為貨幣 |
| 顯示支出趨勢 | T-001 | ✅ 趨勢指示器顯示正確 (↑/↓) |
| 支持實時更新 | T-012 | ✅ P99 響應時間 < 200ms |
| 快取優化 | T-005 | ✅ 5 分鐘內使用快取 |
| 錯誤時顯示提示 | T-002, T-020 | ✅ 錯誤消息清晰可見 |

### FR-D1.2 活躍供應商數卡片

| 需求描述 | 測試用例 | 驗證點 |
|---------|---------|------|
| 顯示供應商計數 | T-001 | ✅ 計數正確 |
| 顯示數量變化趨勢 | T-001 | ✅ 趨勢指示正確 |
| 多組織隔離 | T-001 | ✅ 參數包含 organizationId |

### FR-D1.3 待處理 PR 數卡片

| 需求描述 | 測試用例 | 驗證點 |
|---------|---------|------|
| 顯示 PENDING 狀態 PR 計數 | T-001 | ✅ 計數正確 |
| 實時更新 | T-012 | ✅ 響應時間達標 |
| 按組織過濾 | T-001 | ✅ 參數正確傳遞 |

### FR-D1.4 庫存預警數卡片

| 需求描述 | 測試用例 | 驗證點 |
|---------|---------|------|
| 顯示預警計數 | T-001 | ✅ 計數正確 |
| 支持動態計算 | T-001 | ✅ 值來自服務器計算 |

---

## 1️⃣1️⃣ 測試執行計畫

### 執行時間表

| 階段 | 任務 | 時間 | 狀態 |
|------|------|------|------|
| **準備** | 環境設置、依賴安裝 | 30 分鐘 | ⏳ 待執行 |
| **API 層** | T-006 ~ T-008 API 單元測試 | 45 分鐘 | ⏳ 待執行 |
| **Hook 層** | T-003, T-005 內存和快取測試 | 30 分鐘 | ⏳ 待執行 |
| **UI 層** | T-009 ~ T-011 組件測試 | 30 分鐘 | ⏳ 待執行 |
| **集成** | T-001 ~ T-004 端到端測試 | 30 分鐘 | ⏳ 待執行 |
| **性能** | T-012 ~ T-014 性能測試 | 45 分鐘 | ⏳ 待執行 |
| **錯誤** | T-015 ~ T-023 錯誤恢復測試 | 60 分鐘 | ⏳ 待執行 |
| **驗證** | T-024 ~ T-025 數據驗證 | 20 分鐘 | ⏳ 待執行 |
| **報告** | 生成測試報告、覆蓋率分析 | 30 分鐘 | ⏳ 待執行 |
| **總計** | | **~360 分鐘 (6 小時)** | |

### 執行命令

```bash
# 1. 啟動測試環境
bash scripts/setup-test-env.sh

# 2. 執行所有單元測試
npm run test:unit

# 3. 執行集成測試
npm run test:integration

# 4. 執行 E2E 測試
npm run test:e2e

# 5. 生成覆蓋率報告
npm run test:coverage

# 6. 執行性能測試
npm run test:performance
```

### 成功標準

✅ 所有測試用例通過 (25/25)  
✅ 代碼覆蓋率 ≥ 80%  
✅ 性能指標達標 (P99 < 200ms)  
✅ 無內存洩漏警告  
✅ 無未捕捉的異常  

---

## 風險與緩解

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| 後端服務不穩定 | 測試失敗 | 使用 Mock 服務，本地 DB |
| 網絡延遲高 | 性能測試失敗 | 在本地環境執行 |
| 快取時間不準確 | 快取測試失敗 | 使用 Jest fake timers |
| 內存洩漏檢測困難 | 遺漏問題 | 使用多種工具監控 |

---

## 文檔與報告

### 生成物

1. **測試執行報告**
   - 測試開始/結束時間
   - 通過/失敗計數
   - 失敗原因分析
   - 性能指標

2. **覆蓋率報告**
   - 語句覆蓋率
   - 分支覆蓋率
   - 函數覆蓋率
   - 未覆蓋的行

3. **性能報告**
   - 響應時間分佈
   - 慢查詢分析
   - 緩存命中率

4. **缺陷報告**
   - 優先級分類
   - 根本原因分析
   - 修復建議

---

## 相關文檔

- [CODE-REVIEW-FR-D-Frontend-Fixes-v2.md](../../review/code-reviews/CODE-REVIEW-FR-D-Frontend-Fixes-v2.md)
- [CODE-RECORD-FR-D-Frontend-Fixes-v1.md](../code-records/CODE-RECORD-FR-D-Frontend-Fixes-v1.md)
- [FR-D Overview](../../design/requirements/FR-D/overview.md)
- [API Response Codes](../../reference/guidelines/GUIDELINES-API-ResponseCodes-v1.md)

---

**文檔完成時間**: 2026-05-08 15:45 UTC  
**測試計畫狀態**: ✅ 就緒執行

