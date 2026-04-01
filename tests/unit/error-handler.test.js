import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  errorHandler, 
  ErrorTypes, 
  ErrorLevels,
  captureError,
  withErrorHandling
} from '../../src/utils/error-handler.js'
import '../../tests/mocks/uni.js'

describe('Error Handler', () => {
  beforeEach(() => {
    // 清理错误监听
    errorHandler.errorListeners = []
  })

  describe('错误类型和级别', () => {
    it('should have defined error types', () => {
      expect(ErrorTypes.NETWORK).toBe('network')
      expect(ErrorTypes.API).toBe('api')
      expect(ErrorTypes.STORAGE).toBe('storage')
      expect(ErrorTypes.PERMISSION).toBe('permission')
      expect(ErrorTypes.RENDER).toBe('render')
      expect(ErrorTypes.VALIDATION).toBe('validation')
    })

    it('should have defined error levels', () => {
      expect(ErrorLevels.INFO).toBe('info')
      expect(ErrorLevels.WARNING).toBe('warning')
      expect(ErrorLevels.ERROR).toBe('error')
      expect(ErrorLevels.FATAL).toBe('fatal')
    })
  })

  describe('错误捕获', () => {
    it('should capture error with details', () => {
      const error = new Error('Test error')
      
      const captured = captureError(ErrorTypes.API, 'API_001', error, {
        url: '/api/test',
        method: 'GET'
      })
      
      expect(captured).toBeDefined()
      expect(captured.type).toBe('api')
      expect(captured.code).toBe('API_001')
      expect(captured.message).toBe('Test error')
      expect(captured.extra.url).toBe('/api/test')
    })

    it('should handle error without original error', () => {
      const captured = captureError(ErrorTypes.NETWORK, 'NET_001', null)
      
      expect(captured).toBeDefined()
      expect(captured.type).toBe('network')
    })
  })

  describe('错误处理包装器', () => {
    it('should handle successful async function', async () => {
      const asyncFn = async () => 'success'
      
      const result = await withErrorHandling(asyncFn, {
        type: ErrorTypes.API,
        code: 'API_001'
      })
      
      expect(result).toBe('success')
    })

    it('should handle failed async function', async () => {
      const asyncFn = async () => {
        throw new Error('Async error')
      }
      
      const result = await withErrorHandling(asyncFn, {
        type: ErrorTypes.API,
        code: 'API_002',
        defaultValue: 'default'
      })
      
      expect(result).toBe('default')
    })

    it('should call onError callback when function fails', async () => {
      const onErrorMock = vi.fn()
      const asyncFn = async () => {
        throw new Error('Test error')
      }
      
      await withErrorHandling(asyncFn, {
        type: ErrorTypes.API,
        code: 'API_003',
        onError: onErrorMock
      })
      
      expect(onErrorMock).toHaveBeenCalled()
    })
  })

  describe('错误监听', () => {
    it('should notify error listeners', () => {
      const listener = vi.fn()
      errorHandler.onError(listener)
      
      const error = new Error('Test error')
      errorHandler.handle(ErrorTypes.RENDER, 'REN_001', error)
      
      expect(listener).toHaveBeenCalled()
    })

    it('should get user-friendly message', () => {
      const message = errorHandler.getUserMessage(ErrorTypes.NETWORK, 'NETWORK_OFFLINE')
      
      expect(message).toContain('网络')
    })

    it('should return generic message for unknown error', () => {
      const message = errorHandler.getUserMessage('unknown', 'UNKNOWN_001')
      
      expect(message).toBeDefined()
      expect(typeof message).toBe('string')
    })
  })

  describe('全局错误处理', () => {
    it('should handle Vue errors', () => {
      const vueError = {
        message: 'Vue render error',
        stack: 'Error stack'
      }
      
      // 模拟 Vue 错误
      const result = errorHandler.handleVueError(vueError)
      
      // 验证错误被记录
      expect(result).toBeDefined()
    })

    it('should handle Promise errors', () => {
      const promiseError = new Error('Promise rejection')
      
      const result = errorHandler.handlePromiseError(promiseError)
      
      expect(result).toBeDefined()
    })
  })
})
