/**
 * 全局错误处理工具
 * 捕获并处理各类错误，提供用户友好的错误提示
 */

// 错误类型枚举
export const ErrorTypes = {
  NETWORK: 'network',           // 网络错误
  API: 'api',                   // API请求错误
  STORAGE: 'storage',           // 本地存储错误
  PERMISSION: 'permission',     // 权限错误
  RENDER: 'render',             // 渲染错误
  VALIDATION: 'validation',     // 数据验证错误
  UNKNOWN: 'unknown'            // 未知错误
}

// 错误等级
export const ErrorLevels = {
  INFO: 'info',         // 提示信息
  WARNING: 'warning',   // 警告，可继续
  ERROR: 'error',       // 错误，功能受阻
  FATAL: 'fatal'        // 致命错误，需要重启
}

// 错误信息映射（中文用户友好提示）
const ErrorMessages = {
  // 网络错误
  'network/offline': '网络连接已断开，请检查网络设置',
  'network/timeout': '请求超时，请稍后重试',
  'network/dns': '无法连接到服务器，请检查网络',
  
  // API 错误
  'api/404': '请求的资源不存在',
  'api/500': '服务器繁忙，请稍后重试',
  'api/503': '服务暂时不可用',
  'api/rate-limit': '请求过于频繁，请稍后再试',
  
  // 存储错误
  'storage/quota': '存储空间不足，请清理后重试',
  'storage/write': '数据保存失败，请重试',
  'storage/read': '数据读取失败',
  'storage/corrupt': '数据损坏，已尝试恢复',
  
  // 权限错误
  'permission/location': '需要位置权限才能使用天气功能',
  'permission/camera': '需要相机权限才能使用此功能',
  'permission/storage': '需要存储权限才能保存数据',
  'permission/reject': '您拒绝了权限申请，部分功能可能无法使用',
  
  // 渲染错误
  'render/null': '数据加载异常，请刷新页面',
  'render/undefined': '页面显示错误，请重新进入',
  
  // 验证错误
  'validation/required': '请填写必填项',
  'validation/format': '格式不正确，请检查后重新输入',
  'validation/date': '日期格式错误',
  
  // 通用
  'unknown/default': '出现未知错误，请稍后重试',
  'retry': '点击重试'
}

// 错误上报日志
class ErrorLogger {
  constructor() {
    this.logQueue = []
    this.maxQueueSize = 50
    this.flushInterval = 30000 // 30秒批量上报
    this.init()
  }

  init() {
    // 启动定时上报
    setInterval(() => this.flush(), this.flushInterval)
    
    // 页面卸载前上报剩余日志
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  // 添加错误日志
  log(errorInfo) {
    const logEntry = {
      ...errorInfo,
      timestamp: Date.now(),
      userAgent: uni.getSystemInfoSync?.().model || 'unknown',
      platform: uni.getSystemInfoSync?.().platform || 'unknown',
      appVersion: '1.0.0'
    }
    
    this.logQueue.push(logEntry)
    
    // 队列满时立即上报
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flush()
    }
    
    // 致命错误立即上报
    if (errorInfo.level === ErrorLevels.FATAL) {
      this.flush()
    }
  }

  // 批量上报日志
  flush() {
    if (this.logQueue.length === 0) return
    
    const logsToSend = [...this.logQueue]
    this.logQueue = []
    
    // 使用微信实时日志（如果在微信环境）
    if (uni.canIUse('getRealtimeLogManager')) {
      const logger = uni.getRealtimeLogManager()
      logsToSend.forEach(log => {
        logger.warn(JSON.stringify(log))
      })
    }
    
    // 开发环境输出到控制台
    // #ifdef DEBUG
    console.warn('[ErrorLogger]', logsToSend)
    // #endif
  }
}

// 全局错误处理器
class ErrorHandler {
  constructor() {
    this.logger = new ErrorLogger()
    this.errorListeners = []
    this.init()
  }

  init() {
    // 监听 Vue 错误
    if (typeof uni !== 'undefined' && uni.onError) {
      uni.onError((err) => this.handleVueError(err))
    }
    
    // 监听未处理的 Promise 错误
    if (typeof uni !== 'undefined' && uni.onUnhandledRejection) {
      uni.onUnhandledRejection((res) => {
        this.handlePromiseError(res.reason)
      })
    }
  }

  // 处理 Vue 渲染错误
  handleVueError(err) {
    const errorInfo = {
      type: ErrorTypes.RENDER,
      level: ErrorLevels.ERROR,
      message: err.message || '渲染错误',
      stack: err.stack,
      component: err.component
    }
    
    this.handle(errorInfo)
  }

  // 处理 Promise 错误
  handlePromiseError(reason) {
    const errorInfo = {
      type: ErrorTypes.UNKNOWN,
      level: ErrorLevels.WARNING,
      message: reason?.message || '异步操作失败',
      stack: reason?.stack
    }
    
    this.handle(errorInfo)
  }

  // 通用错误处理入口
  handle(errorInfo) {
    // 补充错误码对应的中文提示
    if (!errorInfo.userMessage) {
      errorInfo.userMessage = this.getUserMessage(errorInfo)
    }
    
    // 记录日志
    this.logger.log(errorInfo)
    
    // 通知所有监听器
    this.notifyListeners(errorInfo)
    
    // 根据等级决定是否阻断操作
    if (errorInfo.level === ErrorLevels.FATAL) {
      this.showFatalError(errorInfo)
    }
    
    return errorInfo
  }

  // 获取用户友好的错误提示
  getUserMessage(errorInfo) {
    const key = `${errorInfo.type}/${errorInfo.code || 'default'}`
    return ErrorMessages[key] || ErrorMessages['unknown/default']
  }

  // 添加错误监听器
  onError(listener) {
    this.errorListeners.push(listener)
    return () => {
      const index = this.errorListeners.indexOf(listener)
      if (index > -1) {
        this.errorListeners.splice(index, 1)
      }
    }
  }

  // 通知监听器
  notifyListeners(errorInfo) {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorInfo)
      } catch (e) {
        console.error('Error listener failed:', e)
      }
    })
  }

  // 显示致命错误
  showFatalError(errorInfo) {
    uni.showModal({
      title: '出现严重错误',
      content: errorInfo.userMessage || '应用遇到严重问题，请重启小程序',
      showCancel: false,
      confirmText: '知道了'
    })
  }
}

// 创建单例
const errorHandler = new ErrorHandler()

// 便捷的错误捕获函数
export function captureError(type, code, originalError, extra = {}) {
  const errorInfo = {
    type,
    code,
    message: originalError?.message || 'Unknown error',
    stack: originalError?.stack,
    level: extra.level || ErrorLevels.ERROR,
    ...extra
  }
  
  return errorHandler.handle(errorInfo)
}

// 带错误处理的包装函数
export async function withErrorHandling(asyncFn, options = {}) {
  const { 
    errorType = ErrorTypes.UNKNOWN,
    errorCode = 'default',
    showToast = true,
    fallbackValue = null
  } = options
  
  try {
    return await asyncFn()
  } catch (error) {
    const errorInfo = captureError(errorType, errorCode, error, {
      showToast
    })
    
    if (showToast) {
      uni.showToast({
        title: errorInfo.userMessage,
        icon: 'none',
        duration: 3000
      })
    }
    
    return fallbackValue
  }
}

// 导出实例和方法
export { errorHandler, ErrorLogger }
export default errorHandler
