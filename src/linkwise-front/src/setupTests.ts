/**
 * 测试环境配置文件
 * 为所有测试用例初始化全局测试环境
 * 
 * 初始化项:
 * 1. @testing-library/jest-dom matchers
 * 2. 全局 mock 配置
 * 3. 测试前/后清理
 */

import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';

/**
 * 清理 DOM 和 mock
 * 每个测试用例后执行
 */
afterEach(() => {
  // 清理所有 mock
  vi.clearAllMocks();
  
  // 清理 DOM
  document.body.innerHTML = '';
  
  // 清理所有计时器
  vi.clearAllTimers();
});

/**
 * 测试前初始化
 */
beforeEach(() => {
  // 重置 localStorage
  localStorage.clear();
  
  // 重置 sessionStorage
  sessionStorage.clear();
});

/**
 * Mock console 以避免测试输出污染
 * 只在不是 DEBUG 模式下生效
 */
if (process.env.DEBUG !== 'true') {
  global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  };
}

/**
 * 全局 fetch mock
 * 避免真实 HTTP 请求
 */
global.fetch = vi.fn();

/**
 * 配置 vitest 全局变量
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
