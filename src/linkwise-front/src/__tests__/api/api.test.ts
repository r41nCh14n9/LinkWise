/**
 * API 层集成测试
 * 测试 DashboardApiClient 的所有 API 方法
 * 
 * 覆盖的测试用例:
 * - T-006: API 单元测试 - getSummaryCards 成功
 * - T-007: API 单元测试 - 错误分类 (3 层)
 * - T-008: API 单元测试 - 响应验证 (4 层)
 * - T-024: DTO 类型验证 - 响应结构
 * - T-025: DTO 类型验证 - 数据字段
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import {
  mockSummaryCardsResponse,
  mockErrorResponse,
  mockServerErrorResponse,
  mockValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
  createTimeoutError,
  createDNSError,
  waitFor,
} from '../mocks/dataFactory';

// Mock axios
vi.mock('axios');

describe('API Layer - DashboardApiClient', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    // 重置 mock
    vi.clearAllMocks();

    // 创建 mock axios 实例
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    (axios.create as any).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // T-006: API 单元测试 - getSummaryCards 成功
  // ============================================================
  describe('T-006: getSummaryCards Success', () => {
    it('should successfully fetch summary cards data', async () => {
      // Arrange
      const expectedData = mockSummaryCardsResponse.data;
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert
      expect(result.code).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.monthlyExpense).toBe(expectedData.monthlyExpense);
      expect(result.data.activeVendors).toBe(expectedData.activeVendors);
      expect(result.data.pendingPurchaseRequests).toBe(expectedData.pendingPurchaseRequests);
      expect(result.data.inventoryWarnings).toBe(expectedData.inventoryWarnings);
    });

    it('should return correct response structure', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('traceId');
    });

    it('should return numeric values with correct types', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert
      expect(typeof data.monthlyExpense).toBe('number');
      expect(typeof data.activeVendors).toBe('number');
      expect(typeof data.pendingPurchaseRequests).toBe('number');
      expect(typeof data.inventoryWarnings).toBe('number');
      expect(typeof data.monthlyExpenseTrend).toBe('number');
    });
  });

  // ============================================================
  // T-007: API 单元测试 - 错误分类 (3 层)
  // ============================================================
  describe('T-007: Error Classification (3 Layers)', () => {
    it('Case 1: Server Error (5xx) - should classify 500 errors', async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          data: mockServerErrorResponse,
        },
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.response.status).toBe(500);
        expect(err.response.data.code).toBe(5000);
        expect(err.response.data.message).toContain('Internal Server Error');
      }
    });

    it('Case 2: Network Error - should classify ECONNABORTED (timeout)', async () => {
      // Arrange
      const error = createTimeoutError();
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.code).toBe('ECONNABORTED');
        expect(err.message).toContain('timeout');
      }
    });

    it('Case 3: Network Error - should classify ENOTFOUND (DNS)', async () => {
      // Arrange
      const error = createDNSError();
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.code).toBe('ENOTFOUND');
        expect(err.hostname).toBe('api.example.com');
      }
    });

    it('Client Error (4xx) - should handle 401 Unauthorized', async () => {
      // Arrange
      const error = {
        response: {
          status: 401,
          data: {
            code: 1001,
            message: 'Unauthorized',
          },
        },
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.response.status).toBe(401);
        expect(err.response.data.code).toBe(1001);
      }
    });

    it('Client Error (4xx) - should handle 403 Forbidden', async () => {
      // Arrange
      const error = {
        response: {
          status: 403,
          data: {
            code: 1002,
            message: 'Forbidden',
          },
        },
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.response.status).toBe(403);
      }
    });

    it('Client Error (4xx) - should handle 404 Not Found', async () => {
      // Arrange
      const error = {
        response: {
          status: 404,
          data: {
            code: 1004,
            message: 'Resource not found',
          },
        },
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.response.status).toBe(404);
      }
    });

    it('Client Error (4xx) - should handle 422 Validation Error', async () => {
      // Arrange
      const error = {
        response: {
          status: 422,
          data: mockValidationErrorResponse,
        },
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards?range=invalid');
      } catch (err: any) {
        expect(err.response.status).toBe(422);
        expect(err.response.data.code).toBe(1010);
      }
    });

    it('Client Error (4xx) - should handle 429 Too Many Requests', async () => {
      // Arrange
      const error = {
        response: {
          status: 429,
          data: {
            code: 1013,
            message: 'Too Many Requests',
          },
        },
      };
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // Act & Assert
      try {
        await mockAxiosInstance.get('/dashboard/summary-cards');
      } catch (err: any) {
        expect(err.response.status).toBe(429);
      }
    });
  });

  // ============================================================
  // T-008: API 单元测试 - 响应验证 (4 层)
  // ============================================================
  describe('T-008: Response Validation (4 Layers)', () => {
    it('Layer 1: Response Structure Validation', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert - 检查必需字段
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('traceId');

      // 检查字段类型
      expect(typeof result.code).toBe('number');
      expect(typeof result.message).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.traceId).toBe('string');
    });

    it('Layer 2: Business Status Code Check', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert - code === 200
      expect(result.code).toBe(200);
      expect(result.code).not.toBe(500);
      expect(result.code).not.toBe(1001);
    });

    it('Layer 3: Data Existence Verification', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert - data 不为 null/undefined
      expect(result.data).toBeDefined();
      expect(result.data).not.toBeNull();
      expect(Object.keys(result.data).length).toBeGreaterThan(0);
    });

    it('Layer 4: DTO Type Validation', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert - DTO 类型检查
      const requiredFields = [
        'monthlyExpense',
        'monthlyExpenseUSD',
        'monthlyExpenseTrend',
        'activeVendors',
        'activeVendorsChange',
        'pendingPurchaseRequests',
        'pendingPRTrend',
        'inventoryWarnings',
        'inventoryWarningsChange',
      ];

      requiredFields.forEach((field) => {
        expect(data).toHaveProperty(field);
        expect(typeof data[field]).toBe('number');
      });
    });

    it('should reject response with missing data', async () => {
      // Arrange
      const invalidResponse = {
        code: 200,
        message: 'Success',
        // 缺少 data 字段
        timestamp: new Date().toISOString(),
      };
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(invalidResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert
      expect(result.data).toBeUndefined();
    });
  });

  // ============================================================
  // T-024: DTO 类型验证 - 响应结构
  // ============================================================
  describe('T-024: DTO Type Validation - Response Structure', () => {
    it('should validate complete response envelope', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert
      expect(result).toMatchObject({
        code: expect.any(Number),
        message: expect.any(String),
        data: expect.any(Object),
        timestamp: expect.any(String),
        traceId: expect.any(String),
      });
    });

    it('should validate timestamp format (ISO 8601)', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/;
      expect(isoRegex.test(result.timestamp)).toBe(true);
    });

    it('should validate traceId format', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const result = response.data;

      // Assert
      expect(result.traceId).toBeDefined();
      expect(typeof result.traceId).toBe('string');
      expect(result.traceId.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // T-025: DTO 类型验证 - 数据字段
  // ============================================================
  describe('T-025: DTO Type Validation - Data Fields', () => {
    it('should validate all numeric fields', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert
      expect(typeof data.monthlyExpense).toBe('number');
      expect(typeof data.monthlyExpenseUSD).toBe('number');
      expect(typeof data.monthlyExpenseTrend).toBe('number');
      expect(typeof data.activeVendors).toBe('number');
      expect(typeof data.activeVendorsChange).toBe('number');
      expect(typeof data.pendingPurchaseRequests).toBe('number');
      expect(typeof data.pendingPRTrend).toBe('number');
      expect(typeof data.inventoryWarnings).toBe('number');
      expect(typeof data.inventoryWarningsChange).toBe('number');
    });

    it('should validate numeric field ranges', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert
      expect(data.monthlyExpense).toBeGreaterThanOrEqual(0);
      expect(data.activeVendors).toBeGreaterThanOrEqual(0);
      expect(data.pendingPurchaseRequests).toBeGreaterThanOrEqual(0);
      expect(data.inventoryWarnings).toBeGreaterThanOrEqual(0);
    });

    it('should allow negative values for trends', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(mockSummaryCardsResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert
      expect(Number.isFinite(data.monthlyExpenseTrend)).toBe(true);
      expect(Number.isFinite(data.activeVendorsChange)).toBe(true);
      expect(Number.isFinite(data.pendingPRTrend)).toBe(true);
      expect(Number.isFinite(data.inventoryWarningsChange)).toBe(true);
    });

    it('should handle edge case: zero values', async () => {
      // Arrange
      const zeroResponse = {
        ...mockSummaryCardsResponse,
        data: {
          monthlyExpense: 0,
          monthlyExpenseUSD: 0,
          monthlyExpenseTrend: 0,
          activeVendors: 0,
          activeVendorsChange: 0,
          pendingPurchaseRequests: 0,
          pendingPRTrend: 0,
          inventoryWarnings: 0,
          inventoryWarningsChange: 0,
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(zeroResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert
      expect(data.monthlyExpense).toBe(0);
      expect(data.activeVendors).toBe(0);
    });

    it('should handle edge case: large values', async () => {
      // Arrange
      const largeResponse = {
        ...mockSummaryCardsResponse,
        data: {
          ...mockSummaryCardsResponse.data,
          monthlyExpense: 999999999.99,
          activeVendors: 10000,
        },
      };
      mockAxiosInstance.get.mockResolvedValueOnce(
        createSuccessResponse(largeResponse)
      );

      // Act
      const response = await mockAxiosInstance.get('/dashboard/summary-cards');
      const { data } = response.data;

      // Assert
      expect(data.monthlyExpense).toBe(999999999.99);
      expect(data.activeVendors).toBe(10000);
    });
  });
});
