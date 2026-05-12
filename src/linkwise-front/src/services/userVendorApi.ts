/**
 * User & Vendor API 服務層
 * 封裝 User 和 Vendor 相關的 HTTP 請求邏輯
 */

import axios, { AxiosInstance } from 'axios';
import type { User, Vendor } from '../types.ts';

// ============================================================================
// API 客戶端配置
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:8080');
const API_VERSION = '/api/v1';

// 創建 Axios 實例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 秒超時
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// API 客戶端類
// ============================================================================

class UserVendorApiClient {
  /**
   * 獲取所有用戶
   * @returns 用戶列表
   * @throws Error 如果網絡錯誤或後端返回錯誤
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>(
        `${API_VERSION}/users`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取活躍用戶
   * @returns 活躍用戶列表
   * @throws Error 如果網絡錯誤或後端返回錯誤
   */
  async getActiveUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>(
        `${API_VERSION}/users/active`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 根據 ID 獲取用戶
   * @param id 用戶 ID
   * @returns 用戶信息
   * @throws Error 如果網絡錯誤或後端返回錯誤
   */
  async getUserById(id: string | number): Promise<User> {
    try {
      const response = await axiosInstance.get<User>(
        `${API_VERSION}/users/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 獲取所有供應商
   * @returns 供應商列表
   * @throws Error 如果網絡錯誤或後端返回錯誤
   */
  async getAllVendors(): Promise<Vendor[]> {
    try {
      const response = await axiosInstance.get<Vendor[]>(
        `${API_VERSION}/vendors`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 根據 ID 獲取供應商
   * @param id 供應商 ID
   * @returns 供應商信息
   * @throws Error 如果網絡錯誤或後端返回錯誤
   */
  async getVendorById(id: string): Promise<Vendor> {
    try {
      const response = await axiosInstance.get<Vendor>(
        `${API_VERSION}/vendors/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 根據狀態獲取供應商
   * @param status 供應商狀態
   * @returns 供應商列表
   * @throws Error 如果網絡錯誤或後端返回錯誤
   */
  async getVendorsByStatus(status: string): Promise<Vendor[]> {
    try {
      const response = await axiosInstance.get<Vendor[]>(
        `${API_VERSION}/vendors`,
        { params: { status } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ========================================================================
  // 私有方法
  // ========================================================================

  /**
   * 處理 API 錯誤
   * @param error 原始錯誤對象
   * @returns 包含錯誤信息的 Error 對象
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 情況 1: 服務器返回錯誤響應 (4xx, 5xx)
        const status = error.response.status;
        const data = error.response.data as any;
        const message = data?.message || `HTTP Error ${status}`;

        let errorMessage = `[${status}] ${message}`;
        
        if (status === 401) {
          errorMessage = 'Unauthorized - Please login';
        } else if (status === 403) {
          errorMessage = 'Forbidden - No permission';
        } else if (status === 404) {
          errorMessage = 'Not found';
        } else if (status >= 500) {
          errorMessage = 'Server error - Please try again later';
        }

        const apiError = new Error(errorMessage);
        (apiError as any).status = status;
        return apiError;
      } else if (error.request) {
        // 情況 2: 請求已發送但沒有收到響應 (網絡錯誤、超時等)
        const errorMessage = error.code === 'ECONNABORTED'
          ? 'Request timeout - please check your connection'
          : 'Network error - unable to reach server';
        
        const apiError = new Error(errorMessage);
        (apiError as any).code = error.code;
        return apiError;
      }
    }

    // 其他錯誤
    return new Error(error?.message || 'Unknown error occurred');
  }
}

// ============================================================================
// 導出單例
// ============================================================================

export const userVendorApiClient = new UserVendorApiClient();

// ============================================================================
// 導出類型
// ============================================================================

export type { User, Vendor };
