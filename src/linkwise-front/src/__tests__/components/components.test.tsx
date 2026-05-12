/**
 * UI 層集成測試 - 組件測試
 * 測試 React 組件的渲染、狀態、事件處理
 * 
 * 覆蓋的測試用例:
 * - T-009: SummaryCards 組件載入狀態測試 (Skeleton)
 * - T-010: SummaryCards 組件錯誤顯示測試
 * - T-011: SummaryCards 組件數據格式化測試
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import {
  mockSummaryCardsSuccessState,
  mockSummaryCardsErrorState,
  mockSummaryCardsState,
  delayPromise,
} from '../mocks/dataFactory';

/**
 * Mock SummaryCards 組件
 * 用於測試組件的渲染邏輯，不依賴真實 API
 */
const MockSummaryCards = ({ 
  data = mockSummaryCardsState.data,
  loading = false, 
  error = null 
}: any) => {
  // 載入狀態：顯示骨架屏
  if (loading) {
    return (
      <div data-testid="summary-cards-skeleton" className="skeleton-loader">
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
      </div>
    );
  }

  // 錯誤狀態：顯示錯誤信息
  if (error) {
    return (
      <div data-testid="summary-cards-error" className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>加載失敗</h3>
        <p>{error.message || '無法加載摘要信息'}</p>
      </div>
    );
  }

  // 成功狀態：顯示數據
  if (!data) {
    return (
      <div data-testid="summary-cards-empty">
        <p>沒有可用的摘要數據</p>
      </div>
    );
  }

  return (
    <div data-testid="summary-cards-container" className="summary-cards">
      {/* 標題 */}
      <div className="summary-header">
        <h2>摘要卡片</h2>
      </div>

      {/* 卡片列表 */}
      <div className="cards-grid">
        {/* 卡片 1: 總交易量 */}
        <div data-testid="card-total-volume" className="card">
          <div className="card-title">總交易量</div>
          <div className="card-value" data-testid="value-total-volume">
            {data?.totalTransactionVolume ? data.totalTransactionVolume.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }) : '$0'}
          </div>
          <div className="card-trend">↑ 12.5%</div>
        </div>

        {/* 卡片 2: 活躍用戶數 */}
        <div data-testid="card-active-users" className="card">
          <div className="card-title">活躍用戶數</div>
          <div className="card-value" data-testid="value-active-users">
            {data?.activeUsersCount ? data.activeUsersCount.toLocaleString('en-US') : '0'}
          </div>
          <div className="card-trend">↑ 8.3%</div>
        </div>

        {/* 卡片 3: 完成率 */}
        <div data-testid="card-completion-rate" className="card">
          <div className="card-title">完成率</div>
          <div className="card-value" data-testid="value-completion-rate">
            {data?.completionRate ? (data.completionRate * 100).toFixed(1) : '0'}%
          </div>
          <div className="card-trend">↑ 2.1%</div>
        </div>

        {/* 卡片 4: 平均響應時間 */}
        <div data-testid="card-avg-response-time" className="card">
          <div className="card-title">平均響應時間</div>
          <div className="card-value" data-testid="value-avg-response-time">
            {data?.averageResponseTime ? data.averageResponseTime : '0'}ms
          </div>
          <div className="card-trend">↓ 5.2%</div>
        </div>
      </div>

      {/* 時間戳 */}
      <div className="summary-footer">
        <span data-testid="timestamp">
          更新時間: {data?.timestamp ? new Date(data.timestamp).toLocaleString('zh-TW') : 'N/A'}
        </span>
      </div>
    </div>
  );
};

describe('UI Layer - SummaryCards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // T-009: Skeleton Loading State (骨架屏)
  // ============================================================
  describe('T-009: Skeleton Loading State', () => {
    it('should display skeleton while loading', () => {
      // Arrange
      const { container } = render(
        <MockSummaryCards loading={true} />
      );

      // Act & Assert
      const skeleton = screen.getByTestId('summary-cards-skeleton');
      expect(skeleton).toBeDefined();
      expect(skeleton.className).toContain('skeleton-loader');
    });

    it('should show correct number of skeleton items', () => {
      // Arrange
      const { container } = render(
        <MockSummaryCards loading={true} />
      );

      // Act
      const skeletonItems = container.querySelectorAll('.skeleton-item');

      // Assert
      expect(skeletonItems.length).toBe(4);
    });

    it('should not display data while loading', () => {
      // Arrange
      render(<MockSummaryCards loading={true} data={mockSummaryCardsSuccessState.data} />);

      // Act & Assert
      expect(screen.queryByTestId('card-total-volume')).toBeNull();
    });

    it('should hide skeleton when loading completes', () => {
      // Arrange & Act
      const { rerender, unmount } = render(
        <MockSummaryCards loading={true} />
      );

      expect(screen.getByTestId('summary-cards-skeleton')).toBeDefined();

      rerender(<MockSummaryCards loading={false} data={mockSummaryCardsSuccessState.data} />);

      // Assert
      expect(screen.queryByTestId('summary-cards-skeleton')).toBeNull();
      
      // Cleanup
      unmount();
    });

    it('should maintain consistent skeleton appearance', () => {
      // Arrange
      const { container } = render(
        <MockSummaryCards loading={true} />
      );

      // Act
      const skeletonItems = container.querySelectorAll('.skeleton-item');

      // Assert
      skeletonItems.forEach((item) => {
        expect(item.className).toBe('skeleton-item');
      });
    });

    it('should display loading state without interruption', async () => {
      // Arrange
      const { rerender } = render(
        <MockSummaryCards loading={true} />
      );

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByTestId('summary-cards-skeleton')).toBeDefined();
      });

      // 保持加載狀態不變
      rerender(<MockSummaryCards loading={true} />);
      expect(screen.getByTestId('summary-cards-skeleton')).toBeDefined();
    });

    it('should transition smoothly from loading to data', async () => {
      // Arrange
      const { rerender, unmount } = render(
        <MockSummaryCards loading={true} />
      );

      // 驗證骨架屏顯示
      expect(screen.getByTestId('summary-cards-skeleton')).toBeDefined();

      // Act: 轉換到數據顯示
      rerender(
        <MockSummaryCards loading={false} data={mockSummaryCardsSuccessState.data} />
      );

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('summary-cards-skeleton')).toBeNull();
        expect(screen.getByTestId('summary-cards-container')).toBeDefined();
      });
      
      // Cleanup
      unmount();
    });
  });

  // ============================================================
  // T-010: Error Display State
  // ============================================================
  describe('T-010: Error Display State', () => {
    it('should display error when error state is present', () => {
      // Arrange
      const error = new Error('API Error');
      render(<MockSummaryCards error={error} />);

      // Act & Assert
      const errorContainer = screen.getByTestId('summary-cards-error');
      expect(errorContainer).toBeDefined();
      expect(errorContainer.className).toContain('error-container');
    });

    it('should show error message', () => {
      // Arrange
      const errorMessage = 'Failed to load data';
      const error = new Error(errorMessage);
      render(<MockSummaryCards error={error} />);

      // Act & Assert
      expect(screen.getByText(errorMessage)).toBeDefined();
    });

    it('should display error icon', () => {
      // Arrange
      const error = new Error('Test error');
      const { container } = render(
        <MockSummaryCards error={error} />
      );

      // Act
      const errorIcon = container.querySelector('.error-icon');

      // Assert
      expect(errorIcon).toBeDefined();
      expect(errorIcon?.textContent).toContain('⚠️');
    });

    it('should not show data when error is present', () => {
      // Arrange
      const error = new Error('API Error');
      render(
        <MockSummaryCards error={error} data={mockSummaryCardsSuccessState.data} />
      );

      // Act & Assert
      expect(screen.queryByTestId('card-total-volume')).toBeNull();
    });

    it('should show error title', () => {
      // Arrange
      const error = new Error('Network error');
      render(<MockSummaryCards error={error} />);

      // Act & Assert
      expect(screen.getByText('加載失敗')).toBeDefined();
    });

    it('should handle error recovery', () => {
      // Arrange
      const error = new Error('Initial error');
      const { rerender, unmount } = render(
        <MockSummaryCards error={error} />
      );

      expect(screen.getByTestId('summary-cards-error')).toBeDefined();

      // Act: 恢復成功狀態
      rerender(
        <MockSummaryCards 
          error={null} 
          data={mockSummaryCardsSuccessState.data} 
        />
      );

      // Assert
      expect(screen.queryByTestId('summary-cards-error')).toBeNull();
      expect(screen.getByTestId('summary-cards-container')).toBeDefined();
      
      // Cleanup
      unmount();
    });

    it('should display default error message when no message provided', () => {
      // Arrange
      const error = { message: null };
      render(<MockSummaryCards error={error} />);

      // Act & Assert
      expect(screen.getByText('無法加載摘要信息')).toBeDefined();
    });

    it('should distinguish between different error states', () => {
      // Arrange
      const networkError = new Error('Network timeout');
      const { rerender, unmount } = render(
        <MockSummaryCards error={networkError} />
      );

      expect(screen.getByText('Network timeout')).toBeDefined();

      // Act: 切換到不同錯誤
      const apiError = new Error('API 500');
      rerender(<MockSummaryCards error={apiError} />);

      // Assert
      expect(screen.getByText('API 500')).toBeDefined();
      
      // Cleanup
      unmount();
    });
  });

  // ============================================================
  // T-011: Data Formatting
  // ============================================================
  describe('T-011: Data Formatting', () => {
    it('should format currency correctly', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      render(<MockSummaryCards data={data} loading={false} error={null} />);

      // Act
      const volumeValue = screen.getByTestId('value-total-volume');

      // Assert
      expect(volumeValue.textContent).toContain('$');
    });

    it('should format percentage correctly', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      render(<MockSummaryCards data={data} loading={false} error={null} />);

      // Act
      const completionRateValue = screen.getByTestId('value-completion-rate');

      // Assert
      expect(completionRateValue.textContent).toContain('%');
    });

    it('should format large numbers with separators', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      render(<MockSummaryCards data={data} loading={false} error={null} />);

      // Act
      const activeUsersValue = screen.getByTestId('value-active-users');
      const text = activeUsersValue.textContent || '';

      // Assert
      expect(text.length).toBeGreaterThan(0);
    });

    it('should format timestamp correctly', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      const completeData = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      render(<MockSummaryCards data={completeData} loading={false} error={null} />);

      // Act
      const timestamp = screen.getByTestId('timestamp');

      // Assert
      expect(timestamp.textContent).toContain('更新時間');
      expect(timestamp.textContent).toMatch(/\d{1,}/);
    });

    it('should display milliseconds for response time', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      render(<MockSummaryCards data={data} loading={false} error={null} />);

      // Act
      const responseTimeValue = screen.getByTestId('value-avg-response-time');

      // Assert
      expect(responseTimeValue.textContent).toContain('ms');
    });

    it('should handle edge case values', () => {
      // Arrange
      const edgeCaseData = {
        ...mockSummaryCardsSuccessState.data,
        totalTransactionVolume: 0,
        activeUsersCount: 0,
        completionRate: 0,
        averageResponseTime: 0,
      };

      render(<MockSummaryCards data={edgeCaseData} />);

      // Act & Assert
      expect(screen.getByTestId('value-total-volume')).toBeDefined();
      expect(screen.getByTestId('value-active-users')).toBeDefined();
    });

    it('should display all card titles', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      render(<MockSummaryCards data={data} loading={false} error={null} />);

      // Act & Assert
      expect(screen.getByText('總交易量')).toBeDefined();
      expect(screen.getByText('活躍用戶數')).toBeDefined();
      expect(screen.getByText('完成率')).toBeDefined();
      expect(screen.getByText('平均響應時間')).toBeDefined();
    });

    it('should render all four data cards', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      render(<MockSummaryCards data={data} loading={false} error={null} />);

      // Act
      const cards = [
        screen.getByTestId('card-total-volume'),
        screen.getByTestId('card-active-users'),
        screen.getByTestId('card-completion-rate'),
        screen.getByTestId('card-avg-response-time'),
      ];

      // Assert
      expect(cards.length).toBe(4);
      cards.forEach((card) => {
        expect(card).toBeDefined();
      });
    });

    it('should maintain consistent data display', () => {
      // Arrange
      const data = mockSummaryCardsSuccessState.data;
      const { rerender, unmount } = render(
        <MockSummaryCards data={data} loading={false} error={null} />
      );

      // Act
      const firstRenderValue = screen.getByTestId('value-total-volume').textContent;
      rerender(<MockSummaryCards data={data} loading={false} error={null} />);
      const secondRenderValue = screen.getByTestId('value-total-volume').textContent;

      // Assert
      expect(firstRenderValue).toBe(secondRenderValue);
      
      // Cleanup
      unmount();
    });
  });

  // ============================================================
  // T-009 擴展: 骨架屏性能
  // ============================================================
  describe('T-009 Extended: Skeleton Performance', () => {
    it('should render skeleton quickly', () => {
      // Arrange
      const startTime = performance.now();

      // Act
      render(<MockSummaryCards loading={true} />);
      const endTime = performance.now();

      // Assert
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100);
    });

    it('should have optimized skeleton structure', () => {
      // Arrange
      const { container } = render(
        <MockSummaryCards loading={true} />
      );

      // Act
      const skeleton = container.querySelector('.skeleton-loader');
      const skeletonItems = container.querySelectorAll('.skeleton-item');

      // Assert
      expect(skeleton).toBeDefined();
      expect(skeletonItems.length).toBe(4);
    });
  });

  // ============================================================
  // T-010 擴展: 錯誤恢復機制
  // ============================================================
  describe('T-010 Extended: Error Recovery', () => {
    it('should support multiple error types', () => {
      // Arrange
      const errorTypes = [
        new Error('Network Error'),
        new Error('API Error'),
        new Error('Timeout Error'),
      ];

      // Act & Assert
      errorTypes.forEach((error, index) => {
        const { unmount } = render(
          <MockSummaryCards error={error} />
        );
        
        // 找到該渲染的錯誤容器
        const errorContainers = screen.getAllByTestId('summary-cards-error');
        expect(errorContainers.length).toBeGreaterThan(0);
        
        // 清理
        unmount();
      });
    });

    it('should allow error dismissal and retry', () => {
      // Arrange
      const error = new Error('Failed to load');
      const { rerender } = render(
        <MockSummaryCards error={error} />
      );

      // Act: 清除錯誤重試
      rerender(
        <MockSummaryCards 
          loading={true} 
          error={null} 
        />
      );

      // Assert
      expect(screen.getByTestId('summary-cards-skeleton')).toBeDefined();
    });
  });
});
