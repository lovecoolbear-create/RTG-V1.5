/**
 * 错误监控与追踪系统
 * 线上错误捕获、上报、分析
 */

// 错误配置
const ERROR_CONFIG = {
  // 是否开启调试模式
  debug: false,
  
  // 采样率
  sampleRate: 1.0,
  
  // 最大错误数（防止内存泄漏）
  maxErrors: 100,
  
  // 重复错误抑制时间（毫秒）
  dedupeInterval: 5000,
  
  // 上报阈值
  reportThreshold: 5,
  
  // 存储键
  storageKey: 'rtg_error_logs',
  
  // 忽略的错误模式
  ignorePatterns: [
    /^Script error\.?$/,
    /^ResizeObserver loop limit exceeded$/,
    /network/i,
    /timeout/i
  ]
}

// 错误队列
let errorQueue = []

// 已上报的错误（用于去重）
const reportedErrors = new Set()

// 错误统计
const errorStats = {
  total: 0,
  byType: {},
  byPage: {},
  recent: []
}

/**
 * 初始化错误监控
 */
export function initErrorMonitoring(config = {}) {
  Object.assign(ERROR_CONFIG, config)
  
  // 加载缓存的错误
  loadCachedErrors()
  
  // 设置全局错误捕获
  setupGlobalErrorHandlers()
  
  // 设置Promise错误捕获
  setupUnhandledRejectionHandler()
  
  // 设置Vue错误处理（如果使用Vue）
  setupVueErrorHandler()
  
  // 启动定时上报
  startReportTimer()
  
  console.log('[ErrorMonitor] Initialized')
}

/**
 * 加载缓存的错误
 */
function loadCachedErrors() {
  try {
    const cached = uni.getStorageSync(ERROR_CONFIG.storageKey)
    if (cached && Array.isArray(cached)) {
      errorQueue = cached.slice(-ERROR_CONFIG.maxErrors)
    }
  } catch {
    errorQueue = []
  }
}

/**
 * 保存错误到缓存
 */
function saveErrorsToCache() {
  try {
    uni.setStorageSync(ERROR_CONFIG.storageKey, errorQueue.slice(-ERROR_CONFIG.maxErrors))
  } catch (e) {
    console.error('[ErrorMonitor] Failed to cache errors:', e)
  }
}

/**
 * 设置全局错误捕获
 */
function setupGlobalErrorHandlers() {
  // 微信小程序错误监听
  uni.onError((error) => {
    captureError({
      type: 'js_error',
      message: error.message || String(error),
      stack: error.stack,
      source: 'onError'
    })
  })
  
  // 页面错误监听
  uni.onPageNotFound((res) => {
    captureError({
      type: 'page_not_found',
      message: `Page not found: ${res.path}`,
      path: res.path,
      isEntryPage: res.isEntryPage,
      source: 'onPageNotFound'
    })
  })
}

/**
 * 设置未处理的Promise错误捕获
 */
function setupUnhandledRejectionHandler() {
  // 小程序环境可能不支持，使用全局监听
  if (typeof global !== 'undefined') {
    global.onunhandledrejection = (event) => {
      captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        reason: event.reason,
        source: 'unhandledrejection'
      })
    }
  }
}

/**
 * 设置Vue错误处理
 */
function setupVueErrorHandler() {
  // 如果使用Vue，可以通过app.config.errorHandler设置
  // 这里提供一个手动设置的方法
  return {
    install(app) {
      app.config.errorHandler = (err, vm, info) => {
        captureError({
          type: 'vue_error',
          message: err.message || String(err),
          stack: err.stack,
          component: vm?.$options?.name || 'unknown',
          info,
          source: 'vue'
        })
      }
    }
  }
}

/**
 * 捕获错误
 * @param {Object} errorInfo - 错误信息
 */
export function captureError(errorInfo) {
  // 采样检查
  if (Math.random() > ERROR_CONFIG.sampleRate) {
    return
  }
  
  // 检查是否应该忽略
  if (shouldIgnoreError(errorInfo.message)) {
    return
  }
  
  const error = {
    id: generateErrorId(),
    timestamp: Date.now(),
    ...errorInfo,
    context: getErrorContext()
  }
  
  // 检查重复错误
  const errorKey = generateErrorKey(error)
  if (reportedErrors.has(errorKey)) {
    // 更新重复计数
    const existing = errorQueue.find(e => generateErrorKey(e) === errorKey)
    if (existing) {
      existing.count = (existing.count || 1) + 1
      existing.lastOccurrence = error.timestamp
    }
    return
  }
  
  // 添加到已上报集合
  reportedErrors.add(errorKey)
  
  // 定时清理已上报集合
  setTimeout(() => {
    reportedErrors.delete(errorKey)
  }, ERROR_CONFIG.dedupeInterval)
  
  // 添加到队列
  errorQueue.push(error)
  
  // 更新统计
  updateErrorStats(error)
  
  // 调试输出
  if (ERROR_CONFIG.debug) {
    console.error('[ErrorMonitor]', error)
  }
  
  // 保存到缓存
  saveErrorsToCache()
  
  // 检查是否需要立即上报
  if (errorQueue.length >= ERROR_CONFIG.reportThreshold) {
    reportErrors()
  }
  
  // 触发错误事件
  uni.$emit('errorCaptured', error)
}

/**
 * 生成错误ID
 */
function generateErrorId() {
  return 'err_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * 生成错误键（用于去重）
 */
function generateErrorKey(error) {
  return `${error.type}:${error.message}:${error.stack?.split('\n')[0] || ''}`
}

/**
 * 检查是否应该忽略错误
 */
function shouldIgnoreError(message) {
  if (!message) return true
  
  return ERROR_CONFIG.ignorePatterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(message)
    }
    return message.includes(pattern)
  })
}

/**
 * 获取错误上下文
 */
function getErrorContext() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    return {
      platform: systemInfo.platform,
      system: systemInfo.system,
      version: systemInfo.version,
      appVersion: systemInfo.appVersion,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      deviceModel: systemInfo.model,
      language: systemInfo.language,
      currentPage: currentPage?.route || 'unknown',
      pageStack: pages.map(p => p.route)
    }
  } catch {
    return {}
  }
}

/**
 * 更新错误统计
 */
function updateErrorStats(error) {
  errorStats.total++
  
  // 按类型统计
  errorStats.byType[error.type] = (errorStats.byType[error.type] || 0) + 1
  
  // 按页面统计
  const page = error.context?.currentPage || 'unknown'
  errorStats.byPage[page] = (errorStats.byPage[page] || 0) + 1
  
  // 最近错误
  errorStats.recent.unshift(error)
  if (errorStats.recent.length > 10) {
    errorStats.recent.pop()
  }
}

/**
 * 手动上报错误
 * @param {Error} error - 错误对象
 * @param {Object} context - 上下文信息
 */
export function reportError(error, context = {}) {
  captureError({
    type: 'manual_report',
    message: error.message || String(error),
    stack: error.stack,
    ...context
  })
}

/**
 * 上报错误
 */
function reportErrors() {
  if (errorQueue.length === 0) return
  
  const errors = [...errorQueue]
  errorQueue = []
  
  // 这里可以实现实际上报逻辑
  // 例如发送到服务器或使用微信分析
  
  if (ERROR_CONFIG.debug) {
    console.log('[ErrorMonitor] Reporting errors:', errors)
  }
  
  // 实际上报（示例）
  // sendToServer(errors)
  
  // 清空缓存
  saveErrorsToCache()
}

/**
 * 启动定时上报
 */
function startReportTimer() {
  setInterval(() => {
    if (errorQueue.length > 0) {
      reportErrors()
    }
  }, 30000) // 每30秒上报一次
}

/**
 * 获取错误统计
 */
export function getErrorStats() {
  return {
    ...errorStats,
    queueSize: errorQueue.length,
    recentErrors: errorQueue.slice(-10)
  }
}

/**
 * 获取错误报告
 */
export function generateErrorReport() {
  const stats = getErrorStats()
  
  return {
    summary: {
      totalErrors: stats.total,
      uniqueTypes: Object.keys(stats.byType).length,
      affectedPages: Object.keys(stats.byPage).length,
      queuedErrors: stats.queueSize
    },
    distribution: {
      byType: stats.byType,
      byPage: stats.byPage
    },
    recent: stats.recent.map(e => ({
      type: e.type,
      message: e.message,
      page: e.context?.currentPage,
      time: new Date(e.timestamp).toISOString()
    })),
    generatedAt: new Date().toISOString()
  }
}

/**
 * 清空错误队列
 */
export function clearErrors() {
  errorQueue = []
  reportedErrors.clear()
  errorStats.total = 0
  errorStats.byType = {}
  errorStats.byPage = {}
  errorStats.recent = []
  saveErrorsToCache()
}

/**
 * 错误边界组件（用于Vue/React）
 */
export const ErrorBoundary = {
  data() {
    return {
      hasError: false,
      error: null
    }
  },
  
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.error = err
    
    captureError({
      type: 'component_error',
      message: err.message || String(err),
      stack: err.stack,
      component: vm?.$options?.name || 'unknown',
      info,
      source: 'errorBoundary'
    })
    
    return false // 阻止错误继续传播
  },
  
  render() {
    if (this.hasError) {
      // 渲染错误回退UI
      return h('view', { class: 'error-fallback' }, [
        h('text', 'Something went wrong'),
        h('button', {
          onClick: () => {
            this.hasError = false
            this.error = null
          }
        }, 'Retry')
      ])
    }
    
    // 正常渲染子组件
    return this.$slots.default?.()
  }
}

/**
 * 性能监控（与错误监控结合）
 */
export function monitorPerformance() {
  // 监听性能指标
  const observer = uni.createPerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    
    entries.forEach(entry => {
      // 长任务检测
      if (entry.entryType === 'longtask' && entry.duration > 50) {
        captureError({
          type: 'performance_longtask',
          message: `Long task detected: ${entry.duration}ms`,
          duration: entry.duration,
          source: 'performance'
        })
      }
      
      // 内存泄漏检测
      if (entry.entryType === 'memory') {
        const usedJSHeapSize = entry.usedJSHeapSize
        const totalJSHeapSize = entry.totalJSHeapSize
        
        if (usedJSHeapSize / totalJSHeapSize > 0.9) {
          captureError({
            type: 'performance_memory_warning',
            message: `High memory usage: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            memory: {
              used: usedJSHeapSize,
              total: totalJSHeapSize
            },
            source: 'performance'
          })
        }
      }
    })
  })
  
  observer.observe({ entryTypes: ['longtask', 'memory'] })
  
  return observer
}

// 默认导出
export default {
  init: initErrorMonitoring,
  capture: captureError,
  report: reportError,
  getStats: getErrorStats,
  generateReport: generateErrorReport,
  clear: clearErrors,
  monitorPerformance,
  ErrorBoundary
}
