/**
 * 数据分析 - 用户行为统计埋点系统
 * 支持页面浏览、事件追踪、用户路径分析
 */

// 埋点配置
const TRACKING_CONFIG = {
  // 是否开启调试模式
  debug: false,
  
  // 采样率（0-1）
  sampleRate: 1.0,
  
  // 批量上报阈值
  batchSize: 10,
  
  // 上报间隔（毫秒）
  flushInterval: 30000,
  
  // 最大缓存事件数
  maxCacheSize: 100,
  
  // 存储键
  storageKey: 'rtg_analytics_events',
  
  // 用户ID键
  userIdKey: 'rtg_analytics_user_id'
}

// 事件队列
let eventQueue = []

// 用户ID
let userId = null

// 会话ID
let sessionId = null

// 页面开始时间
let pageStartTime = Date.now()

// 当前页面
let currentPage = ''

/**
 * 初始化数据分析
 */
export function initAnalytics(config = {}) {
  Object.assign(TRACKING_CONFIG, config)
  
  // 生成或获取用户ID
  userId = getOrCreateUserId()
  
  // 生成会话ID
  sessionId = generateSessionId()
  
  // 加载缓存的事件
  loadCachedEvents()
  
  // 启动定时上报
  startFlushTimer()
  
  // 监听应用生命周期
  setupLifecycleTracking()
  
  console.log('[Analytics] Initialized, userId:', userId)
}

/**
 * 获取或创建用户ID
 */
function getOrCreateUserId() {
  try {
    let id = uni.getStorageSync(TRACKING_CONFIG.userIdKey)
    if (!id) {
      id = generateUserId()
      uni.setStorageSync(TRACKING_CONFIG.userIdKey, id)
    }
    return id
  } catch {
    return generateUserId()
  }
}

/**
 * 生成用户ID
 */
function generateUserId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 生成会话ID
 */
function generateSessionId() {
  return 's_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * 生成唯一事件ID
 */
function generateEventId() {
  return 'e_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * 加载缓存的事件
 */
function loadCachedEvents() {
  try {
    const cached = uni.getStorageSync(TRACKING_CONFIG.storageKey)
    if (cached && Array.isArray(cached)) {
      eventQueue = cached
    }
  } catch {
    eventQueue = []
  }
}

/**
 * 保存事件到缓存
 */
function saveEventsToCache() {
  try {
    uni.setStorageSync(TRACKING_CONFIG.storageKey, eventQueue)
  } catch (e) {
    console.error('[Analytics] Failed to cache events:', e)
  }
}

/**
 * 启动定时上报
 */
function startFlushTimer() {
  setInterval(() => {
    if (eventQueue.length >= TRACKING_CONFIG.batchSize) {
      flushEvents()
    }
  }, TRACKING_CONFIG.flushInterval)
}

/**
 * 设置生命周期追踪
 */
function setupLifecycleTracking() {
  // 应用显示
  uni.onAppShow(() => {
    trackEvent('app_show', {
      timestamp: Date.now()
    })
  })
  
  // 应用隐藏
  uni.onAppHide(() => {
    trackEvent('app_hide', {
      timestamp: Date.now(),
      duration: Date.now() - pageStartTime
    })
    // 立即上报
    flushEvents()
  })
  
  // 页面切换
  uni.$on('pageSwitch', (data) => {
    if (currentPage) {
      // 记录上一页面停留时间
      trackEvent('page_exit', {
        page: currentPage,
        duration: Date.now() - pageStartTime
      })
    }
    
    currentPage = data.page
    pageStartTime = Date.now()
    
    trackEvent('page_enter', {
      page: data.page,
      from: data.from
    })
  })
}

/**
 * 追踪事件
 * @param {string} eventName - 事件名称
 * @param {Object} properties - 事件属性
 * @param {string} eventType - 事件类型 (track, page, identify)
 */
export function trackEvent(eventName, properties = {}, eventType = 'track') {
  // 采样检查
  if (Math.random() > TRACKING_CONFIG.sampleRate) {
    return
  }
  
  const event = {
    id: generateEventId(),
    type: eventType,
    name: eventName,
    properties: {
      ...properties,
      timestamp: Date.now()
    },
    context: getContext(),
    userId,
    sessionId
  }
  
  eventQueue.push(event)
  
  // 调试模式输出
  if (TRACKING_CONFIG.debug) {
    console.log('[Analytics Track]', event)
  }
  
  // 检查是否需要立即上报
  if (eventQueue.length >= TRACKING_CONFIG.maxCacheSize) {
    flushEvents()
  } else {
    saveEventsToCache()
  }
}

/**
 * 获取上下文信息
 */
function getContext() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return {
      platform: systemInfo.platform,
      system: systemInfo.system,
      version: systemInfo.version,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      deviceModel: systemInfo.model,
      language: systemInfo.language
    }
  } catch {
    return {}
  }
}

/**
 * 追踪页面浏览
 * @param {string} pageName - 页面名称
 * @param {Object} properties - 页面属性
 */
export function trackPageView(pageName, properties = {}) {
  trackEvent(pageName, properties, 'page')
}

/**
 * 追踪点击事件
 * @param {string} element - 元素标识
 * @param {Object} properties - 附加属性
 */
export function trackClick(element, properties = {}) {
  trackEvent('click', {
    element,
    page: currentPage,
    ...properties
  })
}

/**
 * 追踪表单提交
 * @param {string} formName - 表单名称
 * @param {Object} properties - 表单数据
 */
export function trackFormSubmit(formName, properties = {}) {
  trackEvent('form_submit', {
    form: formName,
    page: currentPage,
    ...properties
  })
}

/**
 * 追踪错误
 * @param {Error} error - 错误对象
 * @param {Object} context - 上下文信息
 */
export function trackError(error, context = {}) {
  trackEvent('error', {
    message: error.message,
    stack: error.stack,
    page: currentPage,
    ...context
  })
}

/**
 * 追踪性能指标
 * @param {string} metric - 指标名称
 * @param {number} value - 指标值
 * @param {Object} properties - 附加属性
 */
export function trackPerformance(metric, value, properties = {}) {
  trackEvent('performance', {
    metric,
    value,
    page: currentPage,
    ...properties
  })
}

/**
 * 追踪业务事件
 */
export const businessTracker = {
  // 创建行程
  tripCreated(tripData) {
    trackEvent('trip_created', {
      templateId: tripData.templateId,
      itemCount: tripData.itemCount,
      source: tripData.source
    })
  },
  
  // 完成打包
  tripPacked(tripData) {
    trackEvent('trip_packed', {
      tripId: tripData.id,
      itemCount: tripData.itemCount,
      packedCount: tripData.packedCount,
      duration: tripData.duration
    })
  },
  
  // 行程归档
  tripArchived(tripData) {
    trackEvent('trip_archived', {
      tripId: tripData.id,
      recoveryRate: tripData.recoveryRate,
      duration: tripData.duration
    })
  },
  
  // 添加装备
  gearAdded(gearData) {
    trackEvent('gear_added', {
      category: gearData.category,
      isConsumable: gearData.isConsumable,
      isImportant: gearData.isImportant
    })
  },
  
  // 使用消耗品
  consumableUsed(usageData) {
    trackEvent('consumable_used', {
      gearId: usageData.gearId,
      quantity: usageData.quantity
    })
  },
  
  // 导出数据
  dataExported(exportData) {
    trackEvent('data_exported', {
      tripCount: exportData.tripCount,
      gearCount: exportData.gearCount,
      templateCount: exportData.templateCount
    })
  },
  
  // 导入数据
  dataImported(importData) {
    trackEvent('data_imported', {
      source: importData.source,
      success: importData.success
    })
  },
  
  // 云同步
  cloudSync(syncData) {
    trackEvent('cloud_sync', {
      type: syncData.type,
      success: syncData.success,
      duration: syncData.duration
    })
  }
}

/**
 * 上报事件
 */
function flushEvents() {
  if (eventQueue.length === 0) return
  
  const events = [...eventQueue]
  eventQueue = []
  
  // 这里可以实现实际上报逻辑
  // 例如发送到服务器或使用微信分析
  
  if (TRACKING_CONFIG.debug) {
    console.log('[Analytics Flush]', events)
  }
  
  // 清空缓存
  try {
    uni.removeStorageSync(TRACKING_CONFIG.storageKey)
  } catch {}
  
  // 实际上报（示例）
  // reportToServer(events)
}

/**
 * 手动触发上报
 */
export function flush() {
  flushEvents()
}

/**
 * 获取统计摘要
 */
export function getAnalyticsSummary() {
  return {
    userId,
    sessionId,
    queuedEvents: eventQueue.length,
    currentPage,
    pageDuration: Date.now() - pageStartTime
  }
}

/**
 * 设置用户属性
 * @param {Object} properties - 用户属性
 */
export function identifyUser(properties) {
  trackEvent('user_identify', properties, 'identify')
}

/**
 * 重置会话
 */
export function resetSession() {
  sessionId = generateSessionId()
  pageStartTime = Date.now()
}

// 默认导出
export default {
  init: initAnalytics,
  track: trackEvent,
  trackPageView,
  trackClick,
  trackFormSubmit,
  trackError,
  trackPerformance,
  business: businessTracker,
  flush,
  getSummary: getAnalyticsSummary,
  identify: identifyUser,
  resetSession
}
