/**
 * API 服務層
 * 封裝所有 HTTP 請求邏輯，提供統一的 API 調用接口
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  DashboardDTO,
  SummaryCardsDTO,
  ExpenseTrendDTO,
  VendorScoringDTO,
  PRPOFunnelDTO,
  RecentOperationsDTO,
  DashboardQueryParams,
  SpendingTrendParams,
  VendorScoringParams,
  RecentOperationsParams,
} from '../types/dashboard';
import * as validators from '../utils/validators';

// ============================================================================
// API 客戶端配置
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';
const DASHBOARD_ENDPOINT = `${API_BASE_URL}${API_VERSION}/dashboard`;

// 創建 Axios 實例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: DASHBOARD_ENDPOINT,
  timeout: 30000, // 30 秒超時
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// 攔截器
// ============================================================================

// 請求攔截器 - 添加認證令牌
axiosInstance.interceptors.request.use(
  (config) => {
    // TODO: 添加認證令牌邏輯
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 全局錯誤處理事件發射器
 * 用於與 React 組件層通信錯誤
 */
type ErrorListener = (error: ApiErrorEvent) => void;
interface ApiErrorEvent {
  status: number;
  message: string;
  code?: number;
  traceId?: string;
  timestamp: string;
}
const errorListeners: Set<ErrorListener> = new Set();

export const apiErrorEmitter = {
  on: (listener: ErrorListener) => {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
  },
  emit: (error: ApiErrorEvent) => {
    errorListeners.forEach((listener) => listener(error));
  },
};

// 響應攔截器 - 統一結構化錯誤處理
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 將 Axios 錯誤轉換為結構化錯誤事件
    const errorEvent: ApiErrorEvent = {
      status: error.response?.status || 0,
      message: error.message,
      timestamp: new Date().toISOString(),
    };

    // 提取自定義錯誤碼和追蹤 ID (如果由後端提供)
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      if (typeof data.code === 'number') {
        errorEvent.code = data.code;
      }
      if (typeof data.message === 'string') {
        errorEvent.message = data.message;
      }
      if (typeof data.traceId === 'string') {
        errorEvent.traceId = data.traceId;
      }
    }

    // 詳細的錯誤分類和日誌記錄
    if (error.response) {
      // 情況 1: 服務器返回錯誤響應 (4xx, 5xx)
      const status = error.response.status;
      
      if (status === 401) {
        // 未授權 - 可能令牌已過期
        console.error(
          '[API] 401 Unauthorized - Redirecting to login',
          { message: errorEvent.message, traceId: errorEvent.traceId }
        );
        // TODO: 觸發登出或令牌重新整理
        // window.location.href = '/login';
      } else if (status === 403) {
        // 禁止 - 權限不足
        console.error('[API] 403 Forbidden', {
          message: errorEvent.message,
          traceId: errorEvent.traceId,
        });
      } else if (status === 404) {
        // 不存在
        console.error('[API] 404 Not Found', {
          url: error.config?.url,
          message: errorEvent.message,
        });
      } else if (status === 422) {
        // 無法處理的實體 - 驗證錯誤
        console.error('[API] 422 Validation Error', {
          message: errorEvent.message,
          details: error.response.data,
        });
      } else if (status === 429) {
        // 速率限制
        console.warn('[API] 429 Rate Limited - Please wait before retrying');
      } else if (status >= 500) {
        // 服務器錯誤
        console.error('[API] 5xx Server Error', {
          status: status,
          message: errorEvent.message,
          traceId: errorEvent.traceId,
        });
      } else if (status >= 400) {
        // 其他 4xx 錯誤
        console.error('[API] 4xx Client Error', {
          status: status,
          message: errorEvent.message,
        });
      }
    } else if (error.request) {
      // 情況 2: 請求已發送但沒有收到響應 (網絡錯誤、超時等)
      console.error('[API] Network Error - No response from server', {
        message: error.message,
        code: error.code, // 可能是 'ECONNABORTED' (超時), 'ENOTFOUND' (DNS 失敗) 等
      });
      errorEvent.message =
        error.code === 'ECONNABORTED'
          ? 'Request timeout - please check your connection'
          : 'Network error - unable to reach server';
    } else {
      // 情況 3: 請求配置或其他錯誤
      console.error('[API] Request Configuration Error', {
        message: error.message,
      });
      errorEvent.message = 'Request configuration error';
    }

    // 發送全局錯誤事件
    apiErrorEmitter.emit(errorEvent);

    return Promise.reject(error);
  }
);

// ============================================================================
// API 客戶端類
// ============================================================================

class DashboardApiClient {
  /**
   * 獲取完整的 Dashboard 數據
   * @param params - Dashboard 查詢參數 (organizationId 必需)
   * @returns Dashboard 聚合數據
   * @throws Error 如果網絡錯誤、驗證失敗或後端返回錯誤
   */
  async getDashboard(params: DashboardQueryParams): Promise<DashboardDTO> {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardDTO>>(
        '/',
        { params }
      );
      // 注意：Dashboard 是複雜的聚合對象，完整驗證較複雜
      // 後續階段可添加完整的 Dashboard 驗證函數
      return this.handleResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取摘要卡片數據
   * @param params - Dashboard 查詢參數 (organizationId 必需)
   * @returns 摘要卡片數據，包含 4 個主要 KPI
   * @throws Error 如果網絡錯誤、驗證失敗或後端返回錯誤
   */
  async getSummaryCards(params: DashboardQueryParams): Promise<SummaryCardsDTO> {
    try {
      const response = await axiosInstance.get<ApiResponse<SummaryCardsDTO>>(
        '/summary',
        { params }
      );
      // 使用驗證函數確保響應結構正確
      return this.handleResponse(response.data, validators.isValidSummaryCards);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取支出趨勢數據
   * @param params - 支出查詢參數 (organizationId 必需, timeRange 可選)
   * @returns 支出趨勢數據，包含月度數據、預算對比等
   * @throws Error 如果網絡錯誤、驗證失敗或後端返回錯誤
   */
  async getSpendingTrend(params: SpendingTrendParams): Promise<ExpenseTrendDTO> {
    try {
      const response = await axiosInstance.get<ApiResponse<ExpenseTrendDTO>>(
        '/spending-trend',
        { params: { organizationId: params.organizationId, timeRange: params.timeRange || '6MONTHS' } }
      );
      return this.handleResponse(response.data, validators.isValidExpenseTrend);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 導出支出趨勢數據
   * @param organizationId 組織 ID
   */
  async exportSpendingTrend(params: DashboardQueryParams): Promise<Blob> {
    try {
      const response = await axiosInstance.get('/spending-trend/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取供應商評分數據
   * @param params - 供應商評分查詢參數
   * @returns 供應商評分數據，包含供應商清單和風險分佈
   * @throws Error 如果網絡錯誤、驗證失敗或後端返回錯誤
   */
  async getVendorScoring(params: VendorScoringParams): Promise<VendorScoringDTO> {
    try {
      const response = await axiosInstance.get<ApiResponse<VendorScoringDTO>>(
        '/vendor-scoring',
        { params }
      );
      return this.handleResponse(response.data, validators.isValidVendorScoring);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取 PR/PO 漏斗數據
   * @param params - Dashboard 查詢參數 (organizationId 必需)
   * @returns 漏斗數據，包含各階段數量和轉化率
   * @throws Error 如果網絡錯誤、驗證失敗或後端返回錯誤
   */
  async getPRPOFunnel(params: DashboardQueryParams): Promise<PRPOFunnelDTO> {
    try {
      const response = await axiosInstance.get<ApiResponse<PRPOFunnelDTO>>(
        '/pipeline-funnel',
        { params }
      );
      return this.handleResponse(response.data, validators.isValidPRPOFunnel);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取最近操作數據
   * @param params - 最近操作查詢參數
   * @returns 最近操作數據，包含最近 PR、供應商和快速操作
   * @throws Error 如果網絡錯誤、驗證失敗或後端返回錯誤
   */
  async getRecentOperations(params: RecentOperationsParams): Promise<RecentOperationsDTO> {
    try {
      const response = await axiosInstance.get<ApiResponse<RecentOperationsDTO>>(
        '/recent-operations',
        { params }
      );
      return this.handleResponse(response.data, validators.isValidRecentOperations);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 健康檢查
   */
  async health(): Promise<{ status: string }> {
    try {
      const response = await axiosInstance.get<{ status: string }>('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ========================================================================
  // 私有方法
  // ========================================================================

  /**
   * 處理 API 響應 - 包含結構化驗證
   * @param response - API 響應對象
   * @param validator - 可選的驗證函數，用於驗證響應數據結構
   * @returns 驗證後的數據
   * @throws Error 如果響應無效或數據驗證失敗
   */
  private handleResponse<T>(
    response: ApiResponse<T>,
    validator?: (data: any) => boolean
  ): T {
    // 步驟 1: 驗證響應結構
    if (!validators.isValidApiResponse(response)) {
      throw new Error(
        `Invalid API response structure: missing required fields (code, message, timestamp)`
      );
    }

    // 步驟 2: 檢查業務邏輯狀態碼
    if (response.code !== 200) {
      // 非成功的業務狀態碼
      throw new Error(
        `API Business Error [${response.code}]: ${response.message || 'Unknown error'}`
      );
    }

    // 步驟 3: 檢查數據存在性
    if (response.data === null || response.data === undefined) {
      throw new Error('Response data is empty or null');
    }

    // 步驟 4: 如果提供了驗證函數，進行數據結構驗證
    if (validator && !validator(response.data)) {
      throw new Error(
        `Response data failed validation: expected structure not found. Received: ${JSON.stringify(
          response.data
        ).substring(0, 200)}`
      );
    }

    return response.data;
  }

  /**
   * 處理 API 錯誤 - 返回結構化錯誤
   * @param error - 原始錯誤對象 (AxiosError 或其他)
   * @returns 包含錯誤信息的 Error 對象
   */
  private handleError(error: any): Error {
    if (error instanceof AxiosError) {
      if (error.response) {
        // 情況 1: 服務器返回錯誤響應 (4xx, 5xx)
        const data = error.response.data as any;
        const status = error.response.status;
        const message = data?.message || `HTTP Error ${status}`;
        const code = data?.code;
        const traceId = data?.traceId;

        // 構建詳細的錯誤消息
        let errorMessage = `[${status}] ${message}`;
        if (traceId) {
          errorMessage += ` (TraceId: ${traceId})`;
        }
        if (code) {
          errorMessage = `[Code ${code}] ${errorMessage}`;
        }

        const error = new Error(errorMessage);
        (error as any).status = status;
        (error as any).code = code;
        (error as any).traceId = traceId;
        return error;
      } else if (error.request) {
        // 情況 2: 請求已發送但沒有收到響應 (網絡錯誤、超時等)
        const errorMessage = error.code === 'ECONNABORTED'
          ? `Network timeout (${(error.config?.timeout || 30000) / 1000}s)`
          : `Network error: ${error.message}`;
        const networkError = new Error(errorMessage);
        (networkError as any).isNetworkError = true;
        (networkError as any).code = error.code;
        return networkError;
      } else {
        // 情況 3: 請求配置或其他 Axios 錯誤
        return new Error(`Request error: ${error.message || 'Unknown error'}`);
      }
    }

    // 非 Axios 錯誤
    return error instanceof Error ? error : new Error('Unknown error');
  }
}

// 導出單例
export const dashboardApiClient = new DashboardApiClient();

// ============================================================================
// 導出類型和工具
// ============================================================================

export type { DashboardApiClient, ApiErrorEvent };
export { axiosInstance, apiErrorEmitter };
