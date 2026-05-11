/**
 * 测试数据工厂
 * 为集成测试提供真实数据结构的 mock 数据
 * 
 * 使用场景:
 * - API 响应 mock
 * - 组件 props mock
 * - 数据库查询结果 mock
 */

import { vi } from 'vitest';

// ============================================================
// API 响应数据工厂
// ============================================================

/**
 * SummaryCards API 响应数据
 */
export const mockSummaryCardsResponse = {
  code: 200,
  message: 'Success',
  data: {
    monthlyExpense: 1234567.89,
    monthlyExpenseUSD: 170000.00,
    monthlyExpenseTrend: 12.5,
    activeVendors: 45,
    activeVendorsChange: 3,
    pendingPurchaseRequests: 8,
    pendingPRTrend: -2,
    inventoryWarnings: 23,
    inventoryWarningsChange: 5,
  },
  timestamp: '2026-05-08T16:00:00Z',
  traceId: 'trace-001-mock',
};

/**
 * API 错误响应数据
 */
export const mockErrorResponse = {
  code: 1001,
  message: 'Unauthorized',
  timestamp: '2026-05-08T16:00:00Z',
  traceId: 'trace-error-001',
};

/**
 * 服务器错误响应（5xx）
 */
export const mockServerErrorResponse = {
  code: 5000,
  message: 'Internal Server Error',
  timestamp: '2026-05-08T16:00:00Z',
  traceId: 'trace-error-500',
};

/**
 * 验证错误响应（422）
 */
export const mockValidationErrorResponse = {
  code: 1010,
  message: 'Validation Error: Invalid time range',
  timestamp: '2026-05-08T16:00:00Z',
  traceId: 'trace-error-validation',
};

// ============================================================
// Axios Mock 配置
// ============================================================

/**
 * 创建 mock axios 实例
 */
export const createMockAxios = () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  const mockRequest = vi.fn();

  return {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    request: mockRequest,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
};

/**
 * 创建成功的 axios 响应
 */
export const createSuccessResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

/**
 * 创建错误的 axios 响应
 */
export const createErrorResponse = (
  status: number,
  message: string,
  code?: number
) => ({
  response: {
    status,
    data: {
      code: code || status,
      message,
      timestamp: new Date().toISOString(),
      traceId: `trace-${Date.now()}`,
    },
    headers: {},
  },
});

// ============================================================
// 网络错误 Mock
// ============================================================

/**
 * 网络超时错误
 */
export const createTimeoutError = () => ({
  code: 'ECONNABORTED',
  message: 'Request timeout',
  config: {
    timeout: 30000,
  },
});

/**
 * DNS 解析失败
 */
export const createDNSError = () => ({
  code: 'ENOTFOUND',
  message: 'getaddrinfo ENOTFOUND api.example.com',
  hostname: 'api.example.com',
});

/**
 * 网络连接失败
 */
export const createNetworkError = () => ({
  code: 'ECONNREFUSED',
  message: 'Connection refused',
});

// ============================================================
// Hook 状态 Mock
// ============================================================

/**
 * useSummaryCards Hook 初始状态
 */
export const mockSummaryCardsState = {
  data: null,
  loading: true,
  error: null,
};

/**
 * useSummaryCards Hook 成功状态
 */
export const mockSummaryCardsSuccessState = {
  data: mockSummaryCardsResponse.data,
  loading: false,
  error: null,
};

/**
 * useSummaryCards Hook 错误状态
 */
export const mockSummaryCardsErrorState = {
  data: null,
  loading: false,
  error: {
    status: 500,
    message: 'Server Error',
    code: 5000,
  },
};

// ============================================================
// 时间和日期 Mock
// ============================================================

/**
 * Mock 当前时间
 */
export const mockCurrentTime = new Date('2026-05-08T16:00:00Z');

/**
 * Mock 上个月时间
 */
export const mockLastMonthTime = new Date('2026-04-08T16:00:00Z');

/**
 * Mock 上个季度时间
 */
export const mockLastQuarterTime = new Date('2026-02-08T16:00:00Z');

/**
 * Mock 上个年度时间
 */
export const mockLastYearTime = new Date('2025-05-08T16:00:00Z');

// ============================================================
// 性能测试 Mock
// ============================================================

/**
 * 创建性能测试的 Promise
 */
export const createPerformancePromise = (
  result: any,
  delay: number
): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), delay);
  });
};

/**
 * 模拟缓存命中
 */
export const createCacheHit = (data: any, hitTime = 5) => ({
  isCached: true,
  data,
  cacheAge: hitTime,
});

/**
 * 模拟缓存未命中
 */
export const createCacheMiss = () => ({
  isCached: false,
  data: null,
  cacheAge: 0,
});

// ============================================================
// 事件和事件发射器 Mock
// ============================================================

/**
 * 创建 mock 事件发射器
 */
export const createMockEventEmitter = () => {
  const listeners = new Map<string, Function[]>();

  return {
    on: (event: string, callback: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(callback);
      return () => {
        const cbs = listeners.get(event);
        if (cbs) {
          const index = cbs.indexOf(callback);
          if (index > -1) {
            cbs.splice(index, 1);
          }
        }
      };
    },
    emit: (event: string, data?: any) => {
      const cbs = listeners.get(event);
      if (cbs) {
        cbs.forEach((cb) => cb(data));
      }
    },
    off: (event: string, callback: Function) => {
      const cbs = listeners.get(event);
      if (cbs) {
        const index = cbs.indexOf(callback);
        if (index > -1) {
          cbs.splice(index, 1);
        }
      }
    },
    clear: () => {
      listeners.clear();
    },
  };
};

// ============================================================
// 浏览器 API Mock
// ============================================================

/**
 * Mock localStorage
 */
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
};

/**
 * Mock sessionStorage
 */
export const createMockSessionStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
};

// ============================================================
// 测试工具函数
// ============================================================

/**
 * 等待 Promise 完成
 */
export const waitFor = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 创建延迟 Promise
 */
export const delayPromise = <T,>(value: T, ms: number): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
};

/**
 * 生成唯一 ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
