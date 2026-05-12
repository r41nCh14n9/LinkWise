# API 響應碼實現檢查清單

**文檔**: `docs/reference/guidelines/GUIDELINES-API-ResponseCodes-Implementation-Checklist-v1.md`  
**版本**: v1.0  
**日期**: 2026-05-08  

---

## 後端實現檢查清單

### Phase 1: 異常類和全局處理器

- [ ] 創建 `ApiResponse<T>` 成功響應類
- [ ] 創建 `ApiErrorResponse` 錯誤響應類
- [ ] 創建 `BusinessException` 基類
- [ ] 創建 `ResourceNotFoundException`
- [ ] 創建 `BusinessRuleViolationException`
- [ ] 創建 `AuthenticationException`
- [ ] 創建 `AuthorizationException`
- [ ] 創建全局異常處理器 `GlobalExceptionHandler`
- [ ] 添加 MDC (Mapped Diagnostic Context) 用於追蹤 ID
- [ ] 配置日誌級別（warn/error）

### Phase 2: 控制器實現

- [ ] 更新所有 Controller 返回 `ResponseEntity<ApiResponse<T>>`
- [ ] 在每個端點添加輸入驗證
- [ ] 拋出適當的業務異常而不是返回錯誤狀態碼
- [ ] 添加 JavaDoc 說明可能拋出的異常
- [ ] 測試所有異常場景

### Phase 3: 服務層完善

- [ ] 在服務層添加業務規則驗證
- [ ] 使用自定義異常類而非通用 Exception
- [ ] 添加詳細的錯誤信息和上下文

### Phase 4: 測試

- [ ] 單元測試覆蓋所有異常類
- [ ] 集成測試覆蓋異常處理器
- [ ] 端到端測試所有 HTTP 狀態碼
- [ ] 驗證響應格式一致性

### Phase 5: 文檔和監控

- [ ] 更新 API 文檔，列出所有可能的錯誤碼
- [ ] 配置日誌監控告警
- [ ] 設置 TraceId 搜索功能
- [ ] 創建錯誤碼參考表給支持團隊

---

## 前端實現檢查清單

### Phase 1: 類型定義

- [ ] 創建 `ApiResponse<T>` 類型
- [ ] 創建 `ApiErrorResponse` 類型
- [ ] 創建 `ErrorCode` 枚舉
- [ ] 添加響應類型文檔

### Phase 2: HTTP 客戶端

- [ ] 創建 Axios 實例
- [ ] 配置基本 URL
- [ ] 添加請求攔截器（認證令牌）
- [ ] 添加響應攔截器（錯誤處理）
- [ ] 為所有 HTTP 狀態碼添加處理器

### Phase 3: 錯誤處理函數

- [ ] 實現 `handleAuthenticationError()`
- [ ] 實現 `handleAuthorizationError()`
- [ ] 實現 `handleNotFoundError()`
- [ ] 實現 `handleConflictError()`
- [ ] 實現 `handleValidationError()`
- [ ] 實現 `handleRateLimitError()`
- [ ] 實現 `handleServerError()`
- [ ] 實現 `handleServiceUnavailable()`

### Phase 4: 通知系統集成

- [ ] 集成通知組件（Toast/Alert）
- [ ] 為不同錯誤類型配置不同的通知樣式
- [ ] 實現可關閉的通知
- [ ] 添加 TraceId 複製功能

### Phase 5: Hook 和組件

- [ ] 更新所有 API Hooks 處理新錯誤格式
- [ ] 添加全局錯誤邊界組件
- [ ] 在頁面級別顯示 5xx 錯誤
- [ ] 實現自動重試邏輯

### Phase 6: 測試

- [ ] 單元測試 HTTP 客戶端
- [ ] 測試所有錯誤處理場景
- [ ] 集成測試通知系統
- [ ] 測試 500 錯誤時的備選 UI

---

## 整合檢查清單

### API 契約一致性

- [ ] 後端和前端使用相同的錯誤碼定義
- [ ] 響應格式在所有端點保持一致
- [ ] HTTP 狀態碼使用遵循 RFC 標準
- [ ] 錯誤消息在業務層與展示層分離

### 跨功能測試

- [ ] 認證流程 (401/403 錯誤)
- [ ] 資源操作 (404/409 錯誤)
- [ ] 數據驗證 (400/422 錯誤)
- [ ] 服務故障 (500/503 錯誤)
- [ ] 速率限制 (429 錯誤)

### 監控和告警

- [ ] 5xx 錯誤實時告警
- [ ] TraceId 日誌集成
- [ ] 錯誤率儀表板
- [ ] 支持人員告警路由

---

## 驗證和測試場景

### 認證相關

```javascript
// 測試場景 1: 缺少令牌
GET /api/v1/dashboard
// 期望: 401 MISSING_AUTH_TOKEN

// 測試場景 2: 令牌過期
GET /api/v1/dashboard
Authorization: Bearer expired-token
// 期望: 401 EXPIRED_AUTH_TOKEN

// 測試場景 3: 無效令牌
GET /api/v1/dashboard
Authorization: Bearer invalid
// 期望: 401 INVALID_AUTH_TOKEN
```

### 驗證相關

```javascript
// 測試場景 1: 缺少必需參數
GET /api/v1/dashboard
// 期望: 400 MISSING_PARAMETER

// 測試場景 2: 參數類型錯誤
GET /api/v1/dashboard?organizationId=abc
// 期望: 400 INVALID_PARAMETER

// 測試場景 3: 參數超出範圍
GET /api/v1/dashboard?organizationId=-1
// 期望: 400 INVALID_PARAMETER
```

### 資源相關

```javascript
// 測試場景 1: 資源不存在
GET /api/v1/dashboard/999
// 期望: 404 RESOURCE_NOT_FOUND

// 測試場景 2: 版本衝突
PUT /api/v1/resource/123
Content: { version: 1, ... }
// 如果當前版本是 2
// 期望: 409 VERSION_CONFLICT
```

### 業務規則相關

```javascript
// 測試場景 1: 預算超額
POST /api/v1/expense
Content: { amount: 50000, ... }
// 當月已支出 95000，預算 100000
// 期望: 422 BUDGET_EXCEEDED

// 測試場景 2: 無效狀態轉移
PUT /api/v1/pr/123
Content: { status: 'APPROVED', ... }
// 當前狀態是 'REJECTED'
// 期望: 422 INVALID_STATE_TRANSITION
```

### 速率限制

```javascript
// 測試場景: 超過限制
// 在 1 分鐘內發送 101 個請求（限制 100）
// 期望: 429 RATE_LIMIT_EXCEEDED
// 響應頭: Retry-After: 30
```

### 服務器錯誤

```javascript
// 測試場景 1: 數據庫連接失敗
GET /api/v1/dashboard
// 數據庫離線
// 期望: 500 DATABASE_ERROR

// 測試場景 2: 服務維護中
GET /api/v1/dashboard
// 服務正在維護
// 期望: 503 SERVICE_UNAVAILABLE
// 響應頭: Retry-After: 3600
```

---

## 代碼審查檢查點

審查 API 端點時，確保：

- [ ] 所有端點都使用 `ApiResponse<T>` 格式返回成功響應
- [ ] 異常都被適當的業務異常類包裝
- [ ] 每個異常都包含有意義的消息和詳情
- [ ] 使用正確的 HTTP 狀態碼
- [ ] 沒有直接返回錯誤狀態碼（應拋出異常）
- [ ] 驗證邏輯在控制器層實現
- [ ] 業務規則驗證在服務層實現
- [ ] 有追蹤 ID 用於調試

---

## 部署前檢查

部署到生產環境前：

- [ ] 所有錯誤碼已文檔化
- [ ] 支持團隊培訓完成
- [ ] 監控和告警配置完成
- [ ] 日誌搜索功能可用
- [ ] 前端錯誤處理已測試
- [ ] API 文檔已更新
- [ ] 性能基準測試通過
- [ ] 安全審計已完成

---

## 維護檢查清單

每週審查：

- [ ] 5xx 錯誤率
- [ ] 最常見的錯誤碼
- [ ] 平均響應時間
- [ ] TraceId 搜索功能

每月審查：

- [ ] 錯誤碼使用情況統計
- [ ] 支持團隊的反饋
- [ ] 是否需要添加新錯誤碼
- [ ] 性能優化機會

---

## 版本管理

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-05-08 | 初版發布 |

