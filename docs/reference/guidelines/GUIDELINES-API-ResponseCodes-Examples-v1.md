# API 響應碼 - 整合和示例

**文檔**: `docs/reference/guidelines/GUIDELINES-API-ResponseCodes-Examples-v1.md`  
**版本**: v1.0  
**日期**: 2026-05-08  

---

## 1️⃣ 完整的代碼示例

### 後端完整實現

#### Step 1: 定義異常類

```java
// com/linkwise/common/exception/ApiException.java
package com.linkwise.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import java.util.HashMap;
import java.util.Map;

@Getter
public class ApiException extends RuntimeException {
    private final String code;
    private final HttpStatus httpStatus;
    private final Map<String, Object> details;
    
    public ApiException(String code, String message, HttpStatus httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = new HashMap<>();
    }
    
    public ApiException addDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }
}

// com/linkwise/common/exception/ResourceNotFoundException.java
package com.linkwise.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String type, Object id) {
        super(
            "RESOURCE_NOT_FOUND",
            "請求的資源不存在",
            HttpStatus.NOT_FOUND
        );
        addDetail("resourceType", type);
        addDetail("resourceId", id);
    }
}

// com/linkwise/common/exception/BusinessRuleException.java
package com.linkwise.common.exception;

import org.springframework.http.HttpStatus;

public class BusinessRuleException extends ApiException {
    public BusinessRuleException(String rule, String message) {
        super(
            "BUSINESS_RULE_VIOLATION",
            message,
            HttpStatus.UNPROCESSABLE_ENTITY
        );
        addDetail("rule", rule);
    }
}

// com/linkwise/common/exception/ValidationException.java
package com.linkwise.common.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends ApiException {
    public ValidationException(String field, String error) {
        super(
            "INVALID_REQUEST",
            "請求參數不正確",
            HttpStatus.BAD_REQUEST
        );
        addDetail("field", field);
        addDetail("error", error);
    }
}
```

#### Step 2: 定義響應類

```java
// com/linkwise/common/api/ApiResponse.java
package com.linkwise.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

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
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .code("SUCCESS")
            .message("操作成功")
            .data(data)
            .timestamp(Instant.now().toString())
            .traceId(UUID.randomUUID().toString())
            .build();
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .code("SUCCESS")
            .message(message)
            .data(data)
            .timestamp(Instant.now().toString())
            .traceId(UUID.randomUUID().toString())
            .build();
    }
}

// com/linkwise/common/api/ApiErrorResponse.java
package com.linkwise.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

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
    
    public static ApiErrorResponse error(String code, String message) {
        return ApiErrorResponse.builder()
            .code(code)
            .message(message)
            .timestamp(Instant.now().toString())
            .traceId(UUID.randomUUID().toString())
            .build();
    }
    
    public static ApiErrorResponse error(String code, String message, Map<String, Object> details) {
        return ApiErrorResponse.builder()
            .code(code)
            .message(message)
            .details(details)
            .timestamp(Instant.now().toString())
            .traceId(UUID.randomUUID().toString())
            .build();
    }
}
```

#### Step 3: 全局異常處理器

```java
// com/linkwise/common/api/GlobalExceptionHandler.java
package com.linkwise.common.api;

import com.linkwise.common.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(
        ApiException ex,
        WebRequest request
    ) {
        log.warn("API Exception: code={}, message={}", ex.getCode(), ex.getMessage());
        
        ApiErrorResponse response = ApiErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .details(ex.getDetails())
            .timestamp(java.time.Instant.now().toString())
            .traceId(MDC.get("traceId"))
            .build();
        
        return ResponseEntity
            .status(ex.getHttpStatus())
            .body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
        MethodArgumentNotValidException ex,
        WebRequest request
    ) {
        log.warn("Validation exception: {}", ex.getMessage());
        
        var fieldError = ex.getBindingResult().getFieldError();
        Map<String, Object> details = new HashMap<>();
        
        if (fieldError != null) {
            details.put("field", fieldError.getField());
            details.put("error", fieldError.getDefaultMessage());
        }
        
        ApiErrorResponse response = ApiErrorResponse.error(
            "INVALID_REQUEST",
            "請求參數不正確",
            details
        );
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
        Exception ex,
        WebRequest request
    ) {
        log.error("Unexpected exception", ex);
        
        ApiErrorResponse response = ApiErrorResponse.builder()
            .code("INTERNAL_SERVER_ERROR")
            .message("服務器內部錯誤，請稍候重試")
            .timestamp(java.time.Instant.now().toString())
            .traceId(MDC.get("traceId"))
            .support("support@linkwise.com")
            .build();
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
    }
}
```

#### Step 4: 在 Controller 中使用

```java
// com/linkwise/dashboard/DashboardController.java
package com.linkwise.dashboard;

import com.linkwise.common.api.ApiResponse;
import com.linkwise.common.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    /**
     * 獲取 Dashboard 完整數據
     * 
     * @param organizationId 組織 ID
     * @return Dashboard DTO
     * @throws ValidationException 如果參數無效
     * @throws ResourceNotFoundException 如果資源不存在
     */
    @GetMapping("/{organizationId}")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard(
        @PathVariable Long organizationId
    ) {
        // 輸入驗證
        if (organizationId == null || organizationId <= 0) {
            throw new ValidationException(
                "organizationId",
                "organizationId must be a positive integer"
            );
        }
        
        // 檢查資源是否存在
        DashboardDTO dashboard = dashboardService.getDashboard(organizationId);
        if (dashboard == null) {
            throw new ResourceNotFoundException("Dashboard", organizationId);
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("Dashboard 數據獲取成功", dashboard)
        );
    }
    
    /**
     * 更新 Dashboard 支出
     * 
     * @param organizationId 組織 ID
     * @param request 更新請求
     * @return 更新後的 DTO
     * @throws ValidationException 如果參數無效
     * @throws BusinessRuleException 如果預算超額
     */
    @PostMapping("/{organizationId}/expense")
    public ResponseEntity<ApiResponse<DashboardDTO>> addExpense(
        @PathVariable Long organizationId,
        @RequestBody AddExpenseRequest request
    ) {
        // 驗證
        if (request.getAmount() <= 0) {
            throw new ValidationException(
                "amount",
                "Amount must be positive"
            );
        }
        
        // 業務規則檢查
        try {
            DashboardDTO result = dashboardService.addExpense(organizationId, request);
            return ResponseEntity.ok(
                ApiResponse.success("支出已添加", result)
            );
        } catch (BudgetExceededException ex) {
            throw new BusinessRuleException(
                "monthly_budget_limit",
                "月度預算即將超額，無法完成此操作"
            ).addDetail("limit", ex.getLimit())
             .addDetail("current", ex.getCurrent())
             .addDetail("requested", ex.getRequested());
        }
    }
}
```

### 前端完整實現

#### Step 1: 類型定義

```typescript
// src/types/api.ts

export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
  timestamp: string;
  traceId: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  traceId: string;
  support?: string;
}

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
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  
  // 業務規則
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  
  // 速率限制
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // 服務器
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

#### Step 2: HTTP 客戶端

```typescript
// src/services/http-client.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { EventEmitter } from 'eventemitter3';
import type { ApiResponse, ApiErrorResponse } from '../types/api';

// 創建事件發射器用於全局錯誤通知
export const errorEventBus = new EventEmitter();

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 請求攔截器
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
    if (!error.response) {
      // 網絡錯誤
      errorEventBus.emit('error', {
        code: 'NETWORK_ERROR',
        message: '網絡連接失敗',
      });
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // 根據狀態碼分類處理
    switch (status) {
      case 401:
        handleAuthenticationError(data);
        break;
      case 403:
        handleAuthorizationError(data);
        break;
      case 404:
        handleNotFoundError(data);
        break;
      case 409:
        handleConflictError(data);
        break;
      case 422:
        handleValidationError(data);
        break;
      case 429:
        handleRateLimitError(error);
        break;
      case 500:
        handleServerError(data);
        break;
      case 503:
        handleServiceUnavailable(data);
        break;
    }
    
    return Promise.reject(data);
  }
);

/**
 * 認證錯誤處理
 */
function handleAuthenticationError(errorData: ApiErrorResponse) {
  console.error('Authentication error:', errorData);
  
  // 清除令牌
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  // 發射事件
  errorEventBus.emit('authentication-error', errorData);
  
  // 重定向到登錄
  const currentPath = window.location.pathname;
  window.location.href = `/login?redirectFrom=${encodeURIComponent(currentPath)}`;
}

/**
 * 授權錯誤處理
 */
function handleAuthorizationError(errorData: ApiErrorResponse) {
  console.warn('Authorization error:', errorData);
  errorEventBus.emit('authorization-error', errorData);
}

/**
 * 資源不存在
 */
function handleNotFoundError(errorData: ApiErrorResponse) {
  console.warn('Resource not found:', errorData);
  errorEventBus.emit('not-found-error', errorData);
}

/**
 * 衝突錯誤
 */
function handleConflictError(errorData: ApiErrorResponse) {
  console.warn('Conflict error:', errorData);
  errorEventBus.emit('conflict-error', errorData);
}

/**
 * 驗證錯誤
 */
function handleValidationError(errorData: ApiErrorResponse) {
  console.warn('Validation error:', errorData);
  errorEventBus.emit('validation-error', errorData);
}

/**
 * 速率限制
 */
function handleRateLimitError(error: AxiosError) {
  const retryAfter = parseInt(error.response?.headers['retry-after'] || '60');
  console.warn(`Rate limited. Retry after ${retryAfter}s`);
  errorEventBus.emit('rate-limit-error', { retryAfter });
}

/**
 * 服務器錯誤
 */
function handleServerError(errorData: ApiErrorResponse) {
  console.error('Server error:', errorData);
  errorEventBus.emit('server-error', errorData);
}

/**
 * 服務不可用
 */
function handleServiceUnavailable(errorData: ApiErrorResponse) {
  console.error('Service unavailable:', errorData);
  errorEventBus.emit('service-unavailable-error', errorData);
}

export default httpClient;
```

#### Step 3: 错误通知组件

```typescript
// src/components/ErrorNotification.tsx

import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { errorEventBus } from '../services/http-client';
import type { ApiErrorResponse } from '../types/api';

type NotificationType = 'error' | 'warning' | 'info' | 'success';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  traceId?: string;
  autoClose?: boolean;
}

export const ErrorNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const handleError = (errorData: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'error',
        message: errorData.message || '發生錯誤',
        traceId: errorData.traceId,
        autoClose: true,
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // 自動關閉
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };
    
    const handleWarning = (errorData: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'warning',
        message: errorData.message || '警告',
        traceId: errorData.traceId,
        autoClose: true,
      };
      
      setNotifications(prev => [...prev, notification]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 4000);
    };
    
    errorEventBus.on('error', handleError);
    errorEventBus.on('authentication-error', handleError);
    errorEventBus.on('authorization-error', handleWarning);
    errorEventBus.on('not-found-error', handleWarning);
    errorEventBus.on('validation-error', handleError);
    errorEventBus.on('conflict-error', handleWarning);
    errorEventBus.on('server-error', handleError);
    errorEventBus.on('service-unavailable-error', handleError);
    
    return () => {
      errorEventBus.off('error', handleError);
      errorEventBus.off('authentication-error', handleError);
      errorEventBus.off('authorization-error', handleWarning);
    };
  }, []);
  
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'success': return <Check className="w-5 h-5" />;
    }
  };
  
  const getColor = (type: NotificationType) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${getColor(
            notification.type
          )} animate-slide-in`}
        >
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <p className="font-medium">{notification.message}</p>
            {notification.traceId && (
              <p className="text-xs opacity-70 mt-1">
                ID: {notification.traceId}
                <button
                  className="ml-2 underline hover:opacity-100"
                  onClick={() => {
                    navigator.clipboard.writeText(notification.traceId!);
                  }}
                >
                  複製
                </button>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### Step 4: 在 Hooks 中使用

```typescript
// src/hooks/useApiCall.ts

import { useState, useCallback } from 'react';
import type { ApiErrorResponse } from '../types/api';

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

export function useApiCall<T>(
  apiCall: () => Promise<T>
): UseApiCallState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error as ApiErrorResponse,
      });
    }
  }, [apiCall]);
  
  return {
    ...state,
    refetch,
  };
}

// 使用示例
export function useDashboard(organizationId: number) {
  return useApiCall(() =>
    dashboardApi.getDashboard(organizationId)
  );
}
```

---

## 2️⃣ 常見使用模式

### 模式 1: 簡單的獲取操作

```typescript
// 前端
const { data, loading, error } = useDashboard(organizationId);

if (loading) return <Loader />;
if (error) return <ErrorMessage error={error} />;
return <Dashboard data={data} />;
```

### 模式 2: 表單提交

```typescript
// 前端
async function handleSubmit(data: FormData) {
  try {
    const result = await dashboardApi.updateExpense(data);
    showSuccess('更新成功');
    refetch(); // 重新加載數據
  } catch (error: any) {
    // 錯誤已由 http 客戶端處理
    // 這裡只需要處理成功情況
  }
}
```

### 模式 3: 自動重試

```typescript
// 前端
async function fetchWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && i < maxRetries - 1) {
        const delay = parseInt(error.details?.retryAfter || '60') * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

---

## 3️⃣ 測試用例

### 後端單元測試

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DashboardControllerTests {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testGetDashboard_Success() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data").exists())
            .andExpect(jsonPath("$.traceId").exists());
    }
    
    @Test
    public void testGetDashboard_InvalidId() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/-1"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }
    
    @Test
    public void testGetDashboard_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }
}
```

### 前端集成測試

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';

describe('useDashboard', () => {
  test('should fetch dashboard successfully', async () => {
    const { result } = renderHook(() => useDashboard(1));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });
  
  test('should handle 404 error', async () => {
    const { result } = renderHook(() => useDashboard(999));
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    
    expect(result.current.error?.code).toBe('RESOURCE_NOT_FOUND');
  });
});
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-05-08 | 初版發布 |

