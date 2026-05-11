# API 響應碼設計標準 v1

**文件**: `docs/reference/guidelines/GUIDELINES-API-ResponseCodes-v1.md`  
**版本**: v1.0  
**最後更新**: 2026-05-08  
**作者**: System Design Agent  
**狀態**: ✅ 已批准 (基於代碼審查建議)  

---

## 📋 概述

本文檔定義了 LinkWise 系統的統一 API 響應碼標準，涵蓋 HTTP 狀態碼、業務錯誤碼、錯誤消息格式和客戶端處理方案。

**適用範圍**: 所有後端 API (SpringBoot REST endpoints) 和前端客戶端 (React + Axios)

---

## 🎯 設計目標

1. **清晰性**: 客戶端能快速識別錯誤類型
2. **可操作性**: 提供足夠的信息供客戶端採取行動
3. **可擴展性**: 支持新增錯誤碼而無需修改現有代碼
4. **標準化**: 遵循 REST API 最佳實踐
5. **國際化**: 支持多語言錯誤消息

---

## 1️⃣ HTTP 狀態碼標準

### 成功響應 (2xx)

#### 200 OK ✅
**用途**: 請求成功，返回請求的數據

**適用場景**:
- GET 請求成功
- POST 請求成功並返回創建的資源
- PUT 請求成功

**響應格式**:
```json
{
  "code": "SUCCESS",
  "message": "請求成功",
  "data": { /* 實際數據 */ },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "abc-123-def-456"
}
```

**前端處理**:
```typescript
if (response.status === 200) {
  // 処理成功邏輯
  console.log('Success:', response.data);
}
```

---

#### 201 Created 🆕
**用途**: 資源成功創建

**適用場景**:
- 新建資源 (POST)
- 應該返回 Location header 指向新資源

**響應格式**:
```json
{
  "code": "CREATED",
  "message": "資源已創建",
  "data": {
    "id": "resource-123",
    "url": "/api/v1/resources/resource-123"
  }
}
```

---

#### 204 No Content 📭
**用途**: 請求成功但沒有返回內容

**適用場景**:
- DELETE 請求成功
- 狀態更新成功但無需返回新數據

**響應格式**: 無 body

---

### 重定向 (3xx)

#### 301 Moved Permanently 🔄
**用途**: 資源永久移動

**適用場景**:
- API 版本遷移 (/api/v1/resource → /api/v2/resource)
- 域名變更

**響應格式**:
```
Location: /api/v2/resource
```

---

#### 304 Not Modified ⚡
**用途**: 資源未修改，可使用快取

**適用場景**:
- 使用 ETag 進行條件請求
- 客戶端快取驗證

**請求示例**:
```
GET /api/v1/resource
If-None-Match: "abc-123"
```

**響應**: 204 或 304 (無 body)

---

### 客戶端錯誤 (4xx)

#### 400 Bad Request ❌
**用途**: 請求格式錯誤或參數不正確

**適用場景**:
- JSON 解析失敗
- 缺少必需參數
- 參數類型不符
- 參數值超出範圍

**業務錯誤碼**:
- `INVALID_REQUEST` - 請求格式不正確
- `MISSING_PARAMETER` - 缺少必需參數
- `INVALID_PARAMETER` - 參數值無效
- `INVALID_JSON` - JSON 解析失敗

**響應格式**:
```json
{
  "code": "INVALID_REQUEST",
  "message": "請求參數不正確",
  "details": {
    "field": "organizationId",
    "error": "organizationId must be a positive integer"
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "xyz-789-abc"
}
```

**前端處理**:
```typescript
if (error.response?.status === 400) {
  const errorCode = error.response.data.code;
  
  if (errorCode === 'INVALID_REQUEST') {
    // 顯示輸入驗證錯誤給用戶
    showError('請輸入有效的值');
  } else if (errorCode === 'MISSING_PARAMETER') {
    showError('缺少必需字段');
  }
}
```

---

#### 401 Unauthorized 🔐
**用途**: 認證失敗或未提供認證

**適用場景**:
- 未提供認證令牌
- 令牌已過期
- 令牌簽名無效
- 認證方案不支持

**業務錯誤碼**:
- `MISSING_AUTH_TOKEN` - 未提供認證令牌
- `INVALID_AUTH_TOKEN` - 令牌格式不正確
- `EXPIRED_AUTH_TOKEN` - 令牌已過期
- `INVALID_CREDENTIALS` - 認證信息無效

**響應格式**:
```json
{
  "code": "EXPIRED_AUTH_TOKEN",
  "message": "認證令牌已過期，請重新登錄",
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "auth-err-001"
}
```

**前端處理**:
```typescript
if (error.response?.status === 401) {
  const errorCode = error.response.data.code;
  
  if (errorCode === 'EXPIRED_AUTH_TOKEN') {
    // 清除令牌並重定向到登錄
    localStorage.removeItem('auth_token');
    window.location.href = '/login?redirectFrom=' + window.location.pathname;
  } else if (errorCode === 'MISSING_AUTH_TOKEN') {
    window.location.href = '/login';
  }
}
```

---

#### 403 Forbidden 🚫
**用途**: 已認證但無權限訪問

**適用場景**:
- 用戶無權限訪問資源
- 用戶無權限執行操作
- 組織隔離限制

**業務錯誤碼**:
- `INSUFFICIENT_PERMISSION` - 權限不足
- `RESOURCE_ACCESS_DENIED` - 資源訪問被拒絕
- `ORGANIZATION_ISOLATION_VIOLATION` - 跨組織訪問被拒絕
- `RATE_LIMIT_EXCEEDED` - 速率限制被超過

**響應格式**:
```json
{
  "code": "INSUFFICIENT_PERMISSION",
  "message": "你沒有權限執行此操作",
  "details": {
    "requiredRole": "ADMIN",
    "currentRole": "USER"
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "perm-err-001"
}
```

**前端處理**:
```typescript
if (error.response?.status === 403) {
  const errorCode = error.response.data.code;
  
  if (errorCode === 'RATE_LIMIT_EXCEEDED') {
    showError('請求過於頻繁，請稍候再試');
    // 可選: 禁用按鈕，顯示倒計時
  } else {
    showError('你沒有權限執行此操作');
  }
}
```

---

#### 404 Not Found 🔍
**用途**: 請求的資源不存在

**適用場景**:
- 資源 ID 不存在
- API 端點不存在
- 資源已被刪除

**業務錯誤碼**:
- `RESOURCE_NOT_FOUND` - 資源不存在
- `ENDPOINT_NOT_FOUND` - 端點不存在
- `RECORD_NOT_FOUND` - 記錄不存在

**響應格式**:
```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "請求的資源不存在",
  "details": {
    "resourceId": "user-999",
    "resourceType": "User"
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "not-found-001"
}
```

**前端處理**:
```typescript
if (error.response?.status === 404) {
  showError('請求的資源不存在，可能已被刪除');
  // 可選: 導航回上一頁或首頁
}
```

---

#### 409 Conflict ⚠️
**用途**: 請求與當前資源狀態衝突

**適用場景**:
- 資源版本衝突 (樂觀鎖)
- 重複創建資源
- 狀態轉移不允許
- 業務規則衝突

**業務錯誤碼**:
- `RESOURCE_CONFLICT` - 資源衝突
- `VERSION_CONFLICT` - 版本不匹配 (樂觀鎖)
- `DUPLICATE_RESOURCE` - 資源已存在
- `INVALID_STATE_TRANSITION` - 無效的狀態轉移

**響應格式**:
```json
{
  "code": "VERSION_CONFLICT",
  "message": "資源已被其他用戶修改，請重新加載",
  "details": {
    "currentVersion": 2,
    "requestedVersion": 1
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "conflict-001"
}
```

**前端處理**:
```typescript
if (error.response?.status === 409) {
  const errorCode = error.response.data.code;
  
  if (errorCode === 'VERSION_CONFLICT') {
    showError('資源已被其他用戶修改，請刷新頁面');
    // 自動重新加載數據
    fetchData();
  } else if (errorCode === 'DUPLICATE_RESOURCE') {
    showError('該資源已存在，無法重複創建');
  }
}
```

---

#### 422 Unprocessable Entity 📝
**用途**: 請求格式正確但業務邏輯驗證失敗

**適用場景**:
- 業務規則驗證失敗
- 數據約束違反
- 業務邏輯錯誤 (如預算超額)

**業務錯誤碼**:
- `BUSINESS_RULE_VIOLATION` - 業務規則違反
- `VALIDATION_FAILED` - 驗證失敗
- `BUDGET_EXCEEDED` - 預算超額
- `INSUFFICIENT_FUNDS` - 資金不足

**響應格式**:
```json
{
  "code": "BUSINESS_RULE_VIOLATION",
  "message": "無法完成操作：月度預算即將超額",
  "details": {
    "field": "expenseAmount",
    "rule": "monthly_budget_limit",
    "limit": 100000,
    "current": 95000,
    "requested": 10000
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "validation-err-001"
}
```

**前端處理**:
```typescript
if (error.response?.status === 422) {
  const errorCode = error.response.data.code;
  const details = error.response.data.details;
  
  if (errorCode === 'BUDGET_EXCEEDED') {
    showError(`預算超額：還有 ${details.limit - details.current} 元可用`);
  } else {
    showError('輸入的數據不符合業務規則');
  }
}
```

---

#### 429 Too Many Requests 🚦
**用途**: 超過速率限制

**適用場景**:
- 短時間內請求過多
- API 調用配額已用盡

**業務錯誤碼**:
- `RATE_LIMIT_EXCEEDED` - 超過速率限制

**響應格式**:
```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "請求過於頻繁，請稍候",
  "details": {
    "limit": 100,
    "window": "1 minute",
    "retryAfter": 30
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "rate-limit-001"
}
```

**響應頭**:
```
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1652004660
```

**前端處理**:
```typescript
if (error.response?.status === 429) {
  const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
  showError(`請求過於頻繁，請在 ${retryAfter} 秒後重試`);
  
  // 禁用按鈕，顯示倒計時
  disableButton();
  startCountdown(retryAfter);
}
```

---

### 服務器錯誤 (5xx)

#### 500 Internal Server Error 💥
**用途**: 服務器內部錯誤

**適用場景**:
- 未捕獲的異常
- 數據庫連接錯誤
- 業務邏輯異常
- 系統配置錯誤

**業務錯誤碼**:
- `INTERNAL_SERVER_ERROR` - 內部服務器錯誤
- `DATABASE_ERROR` - 數據庫錯誤
- `EXTERNAL_SERVICE_ERROR` - 外部服務錯誤

**響應格式**:
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "服務器內部錯誤，請稍候重試",
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "server-err-123456",
  "support": "support@linkwise.com"
}
```

**前端處理**:
```typescript
if (error.response?.status === 500) {
  showError('服務器出現錯誤，我們已記錄此問題，請聯繫支持');
  
  // 記錄錯誤追蹤 ID 供支持人員查詢
  console.error('TraceId:', error.response.data.traceId);
  
  // 可選: 自動重試
  setTimeout(() => {
    retryRequest();
  }, 5000);
}
```

---

#### 502 Bad Gateway 🔗
**用途**: 無效的網關響應

**適用場景**:
- 後端服務不可用
- 代理/負載均衡器錯誤

**業務錯誤碼**:
- `BAD_GATEWAY` - 網關錯誤
- `SERVICE_UNAVAILABLE` - 服務暫時不可用

---

#### 503 Service Unavailable 🔧
**用途**: 服務暫時不可用

**適用場景**:
- 服務維護中
- 服務過載
- 數據庫維護

**響應頭**:
```
Retry-After: 3600
```

---

#### 504 Gateway Timeout ⏱️
**用途**: 網關超時

**適用場景**:
- 請求超時
- 後端服務響應緩慢

---

## 2️⃣ 統一的響應格式

### 成功響應格式

```typescript
interface ApiSuccessResponse<T> {
  code: "SUCCESS" | "CREATED";
  message: string;
  data: T;
  timestamp: string; // ISO 8601 格式
  traceId: string;
}
```

**示例**:
```json
{
  "code": "SUCCESS",
  "message": "Dashboard 數據獲取成功",
  "data": {
    "monthlyExpense": 125000,
    "activeVendors": 45,
    "pendingPRs": 12,
    "inventoryWarnings": 3
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "req-abc-123-def-456"
}
```

### 錯誤響應格式

```typescript
interface ApiErrorResponse {
  code: string; // 業務錯誤碼
  message: string; // 用戶友好的錯誤消息
  details?: {
    [key: string]: any; // 額外的錯誤詳情
  };
  timestamp: string; // ISO 8601 格式
  traceId: string; // 用於追蹤和調試
  support?: string; // 支持聯繫方式 (5xx 錯誤時)
}
```

**示例**:
```json
{
  "code": "INVALID_REQUEST",
  "message": "請求參數不正確",
  "details": {
    "field": "organizationId",
    "error": "organizationId must be a positive integer",
    "receivedValue": -1
  },
  "timestamp": "2026-05-08T10:30:00Z",
  "traceId": "req-xyz-789-abc"
}
```

---

## 3️⃣ 業務錯誤碼列表

### 認證和授權類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `MISSING_AUTH_TOKEN` | 401 | 缺少認證令牌 | 請先登錄 |
| `INVALID_AUTH_TOKEN` | 401 | 令牌格式不正確 | 認證信息無效，請重新登錄 |
| `EXPIRED_AUTH_TOKEN` | 401 | 令牌已過期 | 登錄已過期，請重新登錄 |
| `INVALID_CREDENTIALS` | 401 | 用戶名或密碼錯誤 | 用戶名或密碼錯誤 |
| `INSUFFICIENT_PERMISSION` | 403 | 用戶無權限 | 你沒有權限執行此操作 |
| `ORGANIZATION_ISOLATION_VIOLATION` | 403 | 跨組織訪問被拒絕 | 無法訪問其他組織的數據 |

### 驗證類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `INVALID_REQUEST` | 400 | 請求格式錯誤 | 請求格式不正確 |
| `MISSING_PARAMETER` | 400 | 缺少必需參數 | 缺少必需字段 |
| `INVALID_PARAMETER` | 400 | 參數值無效 | 輸入的值不符合要求 |
| `INVALID_JSON` | 400 | JSON 解析失敗 | 請求格式不正確 |

### 資源類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `RESOURCE_NOT_FOUND` | 404 | 資源不存在 | 請求的資源不存在 |
| `ENDPOINT_NOT_FOUND` | 404 | API 端點不存在 | 該功能暫不可用 |
| `RESOURCE_CONFLICT` | 409 | 資源衝突 | 操作衝突，請重試 |
| `VERSION_CONFLICT` | 409 | 版本不匹配 | 資源已被修改，請重新加載 |
| `DUPLICATE_RESOURCE` | 409 | 資源已存在 | 該資源已存在，無法重複創建 |

### 業務規則類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `BUSINESS_RULE_VIOLATION` | 422 | 業務規則違反 | 無法完成操作：違反業務規則 |
| `VALIDATION_FAILED` | 422 | 驗證失敗 | 輸入的數據不符合要求 |
| `BUDGET_EXCEEDED` | 422 | 預算超額 | 月度預算即將超額，無法完成此操作 |
| `INSUFFICIENT_FUNDS` | 422 | 資金不足 | 餘額不足，無法完成此交易 |
| `INVALID_STATE_TRANSITION` | 422 | 無效的狀態轉移 | 無法執行此操作，資源狀態不符 |

### 速率限制類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `RATE_LIMIT_EXCEEDED` | 429 | 超過速率限制 | 請求過於頻繁，請稍候 |

### 服務器類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `INTERNAL_SERVER_ERROR` | 500 | 內部服務器錯誤 | 服務器出現錯誤，請稍候重試 |
| `DATABASE_ERROR` | 500 | 數據庫錯誤 | 數據庫操作失敗，請重試 |
| `EXTERNAL_SERVICE_ERROR` | 500 | 外部服務錯誤 | 依賴的服務暫時不可用 |
| `SERVICE_UNAVAILABLE` | 503 | 服務不可用 | 服務維護中，請稍候 |

---

## 4️⃣ 後端實現指南 (Spring Boot)

### 創建統一的響應類

```java
package com.linkwise.common.api.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * 統一的 API 成功響應
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String code;
    private String message;
    private T data;
    private String timestamp;
    private String traceId;
    
    /**
     * 創建成功響應
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .code("SUCCESS")
            .message("操作成功")
            .data(data)
            .timestamp(Instant.now().toString())
            .traceId(generateTraceId())
            .build();
    }
    
    /**
     * 創建成功響應（帶自定義消息）
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .code("SUCCESS")
            .message(message)
            .data(data)
            .timestamp(Instant.now().toString())
            .traceId(generateTraceId())
            .build();
    }
    
    private static String generateTraceId() {
        return UUID.randomUUID().toString();
    }
}

/**
 * 統一的 API 錯誤響應
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {
    private String code;
    private String message;
    private Map<String, Object> details;
    private String timestamp;
    private String traceId;
    private String support;
    
    /**
     * 創建錯誤響應
     */
    public static ApiErrorResponse error(String code, String message) {
        return ApiErrorResponse.builder()
            .code(code)
            .message(message)
            .timestamp(Instant.now().toString())
            .traceId(generateTraceId())
            .build();
    }
    
    /**
     * 創建錯誤響應（帶詳情）
     */
    public static ApiErrorResponse error(
        String code, 
        String message, 
        Map<String, Object> details
    ) {
        return ApiErrorResponse.builder()
            .code(code)
            .message(message)
            .details(details)
            .timestamp(Instant.now().toString())
            .traceId(generateTraceId())
            .build();
    }
    
    private static String generateTraceId() {
        return UUID.randomUUID().toString();
    }
}
```

### 創建全局異常處理器

```java
package com.linkwise.common.api.exception;

import com.linkwise.common.api.response.ApiErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * 全局異常處理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * 處理業務異常
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(
        BusinessException ex,
        WebRequest request
    ) {
        log.warn("Business exception: code={}, message={}", ex.getCode(), ex.getMessage());
        
        ApiErrorResponse response = ApiErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .details(ex.getDetails())
            .timestamp(Instant.now().toString())
            .traceId(MDC.get("traceId")) // 從 MDC 獲取追蹤 ID
            .build();
        
        return ResponseEntity
            .status(ex.getHttpStatus())
            .body(response);
    }
    
    /**
     * 處理驗證異常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex,
        WebRequest request
    ) {
        log.warn("Validation exception: {}", ex.getMessage());
        
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String fieldName = fieldError != null ? fieldError.getField() : "unknown";
        String errorMessage = fieldError != null ? fieldError.getDefaultMessage() : ex.getMessage();
        
        Map<String, Object> details = new HashMap<>();
        details.put("field", fieldName);
        details.put("error", errorMessage);
        
        ApiErrorResponse response = ApiErrorResponse.builder()
            .code("INVALID_REQUEST")
            .message("請求參數不正確")
            .details(details)
            .timestamp(Instant.now().toString())
            .traceId(MDC.get("traceId"))
            .build();
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
    }
    
    /**
     * 處理資源不存在異常
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
        ResourceNotFoundException ex,
        WebRequest request
    ) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        ApiErrorResponse response = ApiErrorResponse.builder()
            .code("RESOURCE_NOT_FOUND")
            .message("請求的資源不存在")
            .details(ex.getDetails())
            .timestamp(Instant.now().toString())
            .traceId(MDC.get("traceId"))
            .build();
        
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(response);
    }
    
    /**
     * 處理所有未捕獲的異常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
        Exception ex,
        WebRequest request
    ) {
        log.error("Unexpected exception", ex);
        
        ApiErrorResponse response = ApiErrorResponse.builder()
            .code("INTERNAL_SERVER_ERROR")
            .message("服務器內部錯誤，請稍候重試")
            .timestamp(Instant.now().toString())
            .traceId(MDC.get("traceId"))
            .support("support@linkwise.com")
            .build();
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
    }
}
```

### 自定義異常類

```java
package com.linkwise.common.api.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * 業務異常基類
 */
@Getter
public class BusinessException extends RuntimeException {
    private final String code;
    private final HttpStatus httpStatus;
    private final Map<String, Object> details;
    
    public BusinessException(String code, String message, HttpStatus httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = new HashMap<>();
    }
    
    public BusinessException(String code, String message, HttpStatus httpStatus, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details;
    }
    
    /**
     * 添加詳情
     */
    public BusinessException withDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }
}

/**
 * 資源不存在異常
 */
public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(
            "RESOURCE_NOT_FOUND",
            "請求的資源不存在",
            HttpStatus.NOT_FOUND
        );
        withDetail("resourceType", resourceType);
        withDetail("resourceId", resourceId);
    }
}

/**
 * 業務規則違反異常
 */
public class BusinessRuleViolationException extends BusinessException {
    public BusinessRuleViolationException(String rule, String message) {
        super(
            "BUSINESS_RULE_VIOLATION",
            message,
            HttpStatus.UNPROCESSABLE_ENTITY
        );
        withDetail("rule", rule);
    }
}

/**
 * 認證異常
 */
public class AuthenticationException extends BusinessException {
    public AuthenticationException(String code, String message) {
        super(code, message, HttpStatus.UNAUTHORIZED);
    }
}

/**
 * 授權異常
 */
public class AuthorizationException extends BusinessException {
    public AuthorizationException(String message) {
        super(
            "INSUFFICIENT_PERMISSION",
            message,
            HttpStatus.FORBIDDEN
        );
    }
}
```

### 在 Controller 中使用

```java
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    
    @GetMapping("/{organizationId}")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard(
        @PathVariable Long organizationId,
        @RequestParam(required = false) String timeRange
    ) {
        try {
            // 驗證 organizationId
            if (organizationId <= 0) {
                throw new BusinessException(
                    "INVALID_PARAMETER",
                    "organizationId 必須是正整數",
                    HttpStatus.BAD_REQUEST
                ).withDetail("field", "organizationId");
            }
            
            // 業務邏輯
            DashboardDTO dashboard = dashboardService.getDashboard(organizationId, timeRange);
            
            // 檢查資源是否存在
            if (dashboard == null) {
                throw new ResourceNotFoundException("Dashboard", organizationId.toString());
            }
            
            return ResponseEntity.ok(ApiResponse.success(dashboard));
            
        } catch (BusinessException ex) {
            // 重新拋出，由全局異常處理器處理
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error", ex);
            throw new BusinessException(
                "INTERNAL_SERVER_ERROR",
                "獲取 Dashboard 失敗",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
```

---

## 5️⃣ 前端實現指南 (React + Axios)

### 創建 HTTP 客戶端

```typescript
// src/services/http-client.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '../types/api';

// 業務錯誤碼
export enum ErrorCode {
  // 認證
  MISSING_AUTH_TOKEN = 'MISSING_AUTH_TOKEN',
  INVALID_AUTH_TOKEN = 'INVALID_AUTH_TOKEN',
  EXPIRED_AUTH_TOKEN = 'EXPIRED_AUTH_TOKEN',
  
  // 驗證
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  
  // 資源
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // 業務規則
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  
  // 速率限制
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // 服務器
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 請求攔截器 - 添加認證令牌
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 響應攔截器 - 統一錯誤處理
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const response = error.response;
    
    if (!response) {
      // 網絡錯誤
      console.error('Network error:', error.message);
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '網絡連接失敗',
        traceId: 'network-error',
      });
    }
    
    const errorData = response.data;
    const status = response.status;
    
    // 處理不同的 HTTP 狀態碼
    switch (status) {
      case 401:
        // 認證失敗
        handleAuthenticationError(errorData);
        break;
        
      case 403:
        // 授權失敗
        handleAuthorizationError(errorData);
        break;
        
      case 404:
        // 資源不存在
        handleNotFoundError(errorData);
        break;
        
      case 409:
        // 衝突 (版本/重複)
        handleConflictError(errorData);
        break;
        
      case 422:
        // 驗證/業務規則失敗
        handleValidationError(errorData);
        break;
        
      case 429:
        // 速率限制
        handleRateLimitError(error);
        break;
        
      case 500:
        // 服務器錯誤
        handleServerError(errorData);
        break;
        
      case 503:
        // 服務不可用
        handleServiceUnavailable(errorData);
        break;
        
      default:
        console.error(`HTTP ${status}:`, errorData.message);
    }
    
    return Promise.reject(errorData);
  }
);

/**
 * 認證錯誤處理
 */
function handleAuthenticationError(errorData: ApiErrorResponse) {
  console.error('Authentication error:', errorData.message);
  
  // 清除令牌
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  // 重定向到登錄
  window.location.href = `/login?redirectFrom=${window.location.pathname}`;
}

/**
 * 授權錯誤處理
 */
function handleAuthorizationError(errorData: ApiErrorResponse) {
  console.warn('Authorization error:', errorData.message);
  
  if (errorData.code === 'RATE_LIMIT_EXCEEDED') {
    const retryAfter = (errorData.details?.retryAfter || 60) as number;
    showNotification('error', `請求過於頻繁，請在 ${retryAfter} 秒後重試`);
  } else {
    showNotification('error', '你沒有權限執行此操作');
  }
}

/**
 * 資源不存在錯誤
 */
function handleNotFoundError(errorData: ApiErrorResponse) {
  console.warn('Resource not found:', errorData.message);
  showNotification('warning', '請求的資源不存在，可能已被刪除');
}

/**
 * 衝突錯誤 (版本/重複)
 */
function handleConflictError(errorData: ApiErrorResponse) {
  console.warn('Conflict error:', errorData.code, errorData.message);
  
  if (errorData.code === 'VERSION_CONFLICT') {
    showNotification('warning', '資源已被其他用戶修改，請重新加載');
  } else if (errorData.code === 'DUPLICATE_RESOURCE') {
    showNotification('error', '該資源已存在，無法重複創建');
  }
}

/**
 * 驗證/業務規則錯誤
 */
function handleValidationError(errorData: ApiErrorResponse) {
  console.warn('Validation error:', errorData.code, errorData.message);
  
  if (errorData.code === 'BUSINESS_RULE_VIOLATION') {
    if (errorData.details?.rule === 'monthly_budget_limit') {
      const remaining = (errorData.details?.limit || 0) - (errorData.details?.current || 0);
      showNotification('error', `預算超額：還有 ¥${remaining} 可用`);
      return;
    }
  }
  
  showNotification('error', errorData.message);
}

/**
 * 速率限制錯誤
 */
function handleRateLimitError(error: AxiosError) {
  const retryAfter = parseInt(
    error.response?.headers['retry-after'] || '60'
  );
  
  console.warn(`Rate limited. Retry after ${retryAfter}s`);
  showNotification('warning', `請求過於頻繁，請在 ${retryAfter} 秒後重試`);
}

/**
 * 服務器錯誤
 */
function handleServerError(errorData: ApiErrorResponse) {
  console.error('Server error:', errorData.code, errorData.traceId);
  
  showNotification(
    'error',
    `服務器出現錯誤 (ID: ${errorData.traceId})`
  );
}

/**
 * 服務不可用
 */
function handleServiceUnavailable(errorData: ApiErrorResponse) {
  console.error('Service unavailable:', errorData.message);
  showNotification('error', '服務維護中，請稍候');
}

/**
 * 顯示通知 (需實現具體的通知組件)
 */
function showNotification(type: 'error' | 'warning' | 'info' | 'success', message: string) {
  // TODO: 集成通知系統
  console.log(`[${type.toUpperCase()}] ${message}`);
}

export { httpClient, ErrorCode };
```

### 使用 HTTP 客戶端

```typescript
// src/services/api.ts

import { httpClient, ErrorCode } from './http-client';
import type { DashboardDTO, SummaryCardsDTO } from '../types/dashboard';
import type { ApiResponse } from '../types/api';

export const dashboardApi = {
  async getDashboard(organizationId: number): Promise<DashboardDTO> {
    try {
      const response = await httpClient.get<ApiResponse<DashboardDTO>>(
        '/api/v1/dashboard',
        {
          params: { organizationId },
        }
      );
      
      // 驗證響應格式
      if (!response.data.data) {
        throw new Error('Invalid response format');
      }
      
      return response.data.data;
      
    } catch (error) {
      // 錯誤已由攔截器處理
      console.error('Failed to fetch dashboard:', error);
      throw error;
    }
  },
  
  async getSummaryCards(organizationId: number): Promise<SummaryCardsDTO> {
    const response = await httpClient.get<ApiResponse<SummaryCardsDTO>>(
      '/api/v1/dashboard/summary',
      { params: { organizationId } }
    );
    return response.data.data;
  },
};
```

### 使用 React Hook

```typescript
// src/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api';
import type { DashboardDTO } from '../types/dashboard';

interface UseDashboardState {
  data: DashboardDTO | null;
  loading: boolean;
  error: any | null;
}

export const useDashboard = (organizationId: number) => {
  const [state, setState] = useState<UseDashboardState>({
    data: null,
    loading: false,
    error: null,
  });
  
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await dashboardApi.getDashboard(organizationId);
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error,
      });
    }
  }, [organizationId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    ...state,
    refetch: fetchData,
  };
};
```

---

## 6️⃣ 擴展指南

### 添加新的業務錯誤碼

**步驟 1**: 在此文檔中添加錯誤碼定義

```markdown
### 新功能類

| 錯誤碼 | HTTP 狀態 | 描述 | 用戶看到的消息 |
|--------|---------|------|--------------|
| `NEW_FEATURE_ERROR` | 422 | 新功能錯誤 | 新功能出現錯誤 |
```

**步驟 2**: 在後端添加異常類

```java
// 後端
public class NewFeatureException extends BusinessException {
    public NewFeatureException(String message) {
        super(
            "NEW_FEATURE_ERROR",
            message,
            HttpStatus.UNPROCESSABLE_ENTITY
        );
    }
}
```

**步驟 3**: 在前端添加錯誤處理

```typescript
// 前端
export enum ErrorCode {
  // ... 其他錯誤碼
  NEW_FEATURE_ERROR = 'NEW_FEATURE_ERROR',
}

function handleNewFeatureError(errorData: ApiErrorResponse) {
  console.warn('New feature error:', errorData.message);
  showNotification('error', errorData.message);
}

// 在響應攔截器中調用
if (errorData.code === ErrorCode.NEW_FEATURE_ERROR) {
  handleNewFeatureError(errorData);
}
```

**步驟 4**: 在控制器中使用

```java
// 在 Controller 中
throw new NewFeatureException("具體的錯誤原因");
```

### 添加新的 HTTP 狀態碼

如果需要添加新的 HTTP 狀態碼，請：

1. 確認是否已有相應的標準狀態碼
2. 在此文檔中添加詳細說明
3. 在全局異常處理器中添加對應的處理邏輯
4. 在前端響應攔截器中添加對應的處理函數
5. 更新此文檔的"擴展指南"部分

### 國際化 (i18n)

所有用戶友好的錯誤消息應該支持多語言。

**後端 i18n**:
```properties
# messages_zh_CN.properties
error.invalid.request=請求參數不正確

# messages_en.properties
error.invalid.request=Invalid request parameters
```

**前端 i18n**:
```typescript
// i18n/errors.ts
export const errorMessages = {
  zh_CN: {
    INVALID_REQUEST: '請求參數不正確',
    NETWORK_ERROR: '網絡連接失敗',
  },
  en: {
    INVALID_REQUEST: 'Invalid request parameters',
    NETWORK_ERROR: 'Network connection failed',
  },
};
```

---

## 7️⃣ 最佳實踐

### ✅ 應該做

1. **總是使用正確的 HTTP 狀態碼**
   - 4xx 用於客戶端錯誤
   - 5xx 用於服務器錯誤

2. **提供清晰的錯誤消息**
   ```json
   ✅ "月度預算即將超額"
   ❌ "Error: constraint violation"
   ```

3. **包含追蹤 ID 用於調試**
   ```json
   {
     "traceId": "req-abc-123-def-456"
   }
   ```

4. **區分驗證錯誤和業務規則錯誤**
   - 400: 格式/類型錯誤
   - 422: 業務邏輯錯誤

5. **在 5xx 錯誤中提供支持聯繫方式**
   ```json
   {
     "code": "INTERNAL_SERVER_ERROR",
     "support": "support@linkwise.com"
   }
   ```

### ❌ 不應該做

1. **暴露內部實現細節**
   ```json
   ❌ "NullPointerException at line 123"
   ✅ "服務器出現錯誤"
   ```

2. **使用模糊的錯誤代碼**
   ```json
   ❌ "error_001"
   ✅ "INVALID_REQUEST"
   ```

3. **混合使用不同的響應格式**
   ```json
   ❌ { "status": "error", "msg": "..." }
   ✅ { "code": "ERROR_CODE", "message": "..." }
   ```

4. **忘記記錄追蹤 ID**
   - 會導致難以追蹤和調試

5. **對所有錯誤都返回 500**
   - 應該正確分類錯誤

---

## 📚 參考資料

- [RFC 7231 - HTTP/1.1 Semantics and Content](https://tools.ietf.org/html/rfc7231)
- [RFC 6585 - Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585)
- [REST API Best Practices](https://restfulapi.net/)
- [Problem Details for HTTP APIs (RFC 7807)](https://tools.ietf.org/html/rfc7807)

---

## 📝 變更日誌

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-05-08 | 初版發布 |

---

**文檔維護者**: System Design Team  
**最後審查**: 2026-05-08  
**下次審查**: 2026-06-08
