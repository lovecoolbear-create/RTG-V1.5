/**
 * 离线体验优化
 * 弱网环境适配、加载策略、网络状态管理
 */

// 网络状态
const networkState = {
  isConnected: true,
  networkType: 'wifi', // wifi, 4g, 3g, 2g, none
  signalStrength: 'strong', // strong, weak, none
  lastOnlineTime: Date.now()
}

// 请求队列（离线时缓存）
let requestQueue = []

// 最大重试次数
const MAX_RETRIES = 3

// 重试延迟（毫秒）
const RETRY_DELAY = 1000

/**
 * 初始化离线体验
 */
export function initOfflineExperience() {
  // 监听网络状态
  uni.onNetworkStatusChange((res) => {
    networkState.isConnected = res.isConnected
    networkState.networkType = res.networkType
    
    if (res.isConnected) {
      networkState.lastOnlineTime = Date.now()
      networkState.signalStrength = getSignalStrength(res.networkType)
      
      // 网络恢复，处理离线队列
      processOfflineQueue()
      
      uni.$emit('networkOnline', networkState)
    } else {
      networkState.signalStrength = 'none'
      uni.$emit('networkOffline', networkState)
    }
    
    console.log('[Network]', networkState)
  })
  
  // 获取初始网络状态
  uni.getNetworkType({
    success: (res) => {
      networkState.networkType = res.networkType
      networkState.isConnected = res.networkType !== 'none'
      networkState.signalStrength = getSignalStrength(res.networkType)
    }
  })
}

/**
 * 获取信号强度
 */
function getSignalStrength(networkType) {
  const strengthMap = {
    'wifi': 'strong',
    '4g': 'strong',
    '3g': 'weak',
    '2g': 'weak',
    'none': 'none'
  }
  return strengthMap[networkType] || 'weak'
}

/**
 * 检查网络状态
 */
export function checkNetwork() {
  return {
    ...networkState,
    isWeakNetwork: networkState.signalStrength === 'weak',
    isOffline: !networkState.isConnected
  }
}

/**
 * 弱网请求包装器
 * @param {Function} requestFn - 请求函数
 * @param {Object} options - 配置选项
 */
export async function weakNetworkRequest(requestFn, options = {}) {
  const {
    maxRetries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    timeout = 10000,
    offlineCache = true,
    fallback = null
  } = options
  
  // 如果完全离线且有缓存配置
  if (!networkState.isConnected && offlineCache) {
    // 加入离线队列
    const queueItem = {
      id: generateId(),
      fn: requestFn,
      options,
      timestamp: Date.now()
    }
    requestQueue.push(queueItem)
    
    // 尝试返回缓存数据
    if (options.cacheKey) {
      const cached = getCache(options.cacheKey)
      if (cached) {
        return { data: cached, fromCache: true }
      }
    }
    
    if (fallback) {
      return { data: fallback, fromFallback: true }
    }
    
    throw new Error('Network offline, request queued')
  }
  
  // 弱网环境下的特殊处理
  if (networkState.signalStrength === 'weak') {
    // 延长超时时间
    const weakTimeout = timeout * 1.5
    
    try {
      const result = await Promise.race([
        executeWithRetry(requestFn, maxRetries, retryDelay),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), weakTimeout)
        })
      ])
      
      // 缓存结果
      if (options.cacheKey) {
        setCache(options.cacheKey, result, options.cacheTime)
      }
      
      return { data: result, fromCache: false }
    } catch (error) {
      // 尝试返回缓存
      if (options.cacheKey) {
        const cached = getCache(options.cacheKey)
        if (cached) {
          return { data: cached, fromCache: true }
        }
      }
      
      throw error
    }
  }
  
  // 正常网络环境
  try {
    const result = await requestFn()
    
    if (options.cacheKey) {
      setCache(options.cacheKey, result, options.cacheTime)
    }
    
    return { data: result, fromCache: false }
  } catch (error) {
    // 尝试返回缓存
    if (options.cacheKey) {
      const cached = getCache(options.cacheKey)
      if (cached) {
        return { data: cached, fromCache: true }
      }
    }
    
    throw error
  }
}

/**
 * 带重试的请求执行
 */
async function executeWithRetry(fn, maxRetries, retryDelay) {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i < maxRetries) {
        // 指数退避
        const delay = retryDelay * Math.pow(2, i)
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成唯一ID
 */
function generateId() {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * 简易缓存系统
 */
const requestCache = new Map()

function getCache(key) {
  const item = requestCache.get(key)
  if (!item) return null
  
  // 检查是否过期
  if (Date.now() > item.expireTime) {
    requestCache.delete(key)
    return null
  }
  
  return item.data
}

function setCache(key, data, ttl = 5 * 60 * 1000) { // 默认5分钟
  requestCache.set(key, {
    data,
    expireTime: Date.now() + ttl
  })
}

/**
 * 处理离线队列
 */
async function processOfflineQueue() {
  if (requestQueue.length === 0) return
  
  console.log('[Offline] Processing queue:', requestQueue.length)
  
  const queue = [...requestQueue]
  requestQueue = []
  
  for (const item of queue) {
    try {
      await item.fn()
    } catch (error) {
      console.error('[Offline] Failed to process queued request:', error)
    }
  }
}

/**
 * 图片加载优化
 */
export const imageLoader = {
  // 低质量图片占位
  placeholder: '/static/images/placeholder.png',
  
  // 根据网络状态选择图片质量
  getImageUrl(originalUrl, options = {}) {
    const { enableResponsive = true } = options
    
    if (!enableResponsive) return originalUrl
    
    // 弱网环境下使用低质量图片
    if (networkState.signalStrength === 'weak') {
      // 假设有缩略图服务
      return originalUrl.replace(/\.(jpg|png)$/, '_thumb.$1')
    }
    
    return originalUrl
  },
  
  // 预加载关键图片
  preloadCritical(urls) {
    if (networkState.signalStrength === 'none') return
    
    urls.forEach(url => {
      uni.getImageInfo({
        src: url,
        success: () => console.log('[Preload] Image loaded:', url),
        fail: () => console.warn('[Preload] Failed:', url)
      })
    })
  }
}

/**
 * 数据同步策略
 */
export const syncStrategy = {
  // 立即同步（高优先级操作）
  async immediate(data) {
    if (!networkState.isConnected) {
      throw new Error('Network offline')
    }
    
    return weakNetworkRequest(() => {
      // 实际同步逻辑
      return uniCloud.callFunction({
        name: 'syncData',
        data
      })
    }, {
      maxRetries: 3,
      timeout: 10000
    })
  },
  
  // 延迟同步（低优先级操作）
  async deferred(data) {
    // 先保存到本地
    saveToLocalQueue(data)
    
    // 如果在线，尝试同步
    if (networkState.isConnected) {
      try {
        return await this.immediate(data)
      } catch {
        // 失败则保留在队列中
        return { deferred: true }
      }
    }
    
    return { deferred: true }
  },
  
  // 批量同步
  async batch(dataArray) {
    if (!networkState.isConnected) {
      dataArray.forEach(data => saveToLocalQueue(data))
      return { deferred: true, count: dataArray.length }
    }
    
    // 弱网环境下减少批量大小
    const batchSize = networkState.signalStrength === 'weak' ? 5 : 20
    const batches = chunkArray(dataArray, batchSize)
    
    const results = []
    for (const batch of batches) {
      try {
        const result = await weakNetworkRequest(() => {
          return uniCloud.callFunction({
            name: 'batchSync',
            data: { items: batch }
          })
        })
        results.push(result)
      } catch (error) {
        // 保存失败的批次
        batch.forEach(data => saveToLocalQueue(data))
      }
    }
    
    return results
  }
}

/**
 * 保存到本地队列
 */
function saveToLocalQueue(data) {
  try {
    const key = 'rtg_sync_queue'
    let queue = uni.getStorageSync(key) || []
    queue.push({
      ...data,
      queuedAt: Date.now()
    })
    uni.setStorageSync(key, queue)
  } catch (e) {
    console.error('[Sync] Failed to save to queue:', e)
  }
}

/**
 * 分块数组
 */
function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 加载状态管理
 */
export const loadingManager = {
  states: new Map(),
  
  start(key) {
    this.states.set(key, {
      loading: true,
      startTime: Date.now(),
      progress: 0
    })
  },
  
  update(key, progress) {
    const state = this.states.get(key)
    if (state) {
      state.progress = progress
    }
  },
  
  end(key) {
    this.states.delete(key)
  },
  
  isLoading(key) {
    return this.states.has(key) && this.states.get(key).loading
  },
  
  getProgress(key) {
    return this.states.get(key)?.progress || 0
  }
}

/**
 * 智能刷新策略
 */
export function smartRefresh(refreshFn, options = {}) {
  const {
    minInterval = 30000, // 最小刷新间隔
    maxRetries = 3,
    onSuccess = null,
    onError = null
  } = options
  
  let lastRefreshTime = 0
  let retryCount = 0
  
  return async function () {
    const now = Date.now()
    
    // 检查刷新间隔
    if (now - lastRefreshTime < minInterval) {
      console.log('[Smart Refresh] Skipped, too frequent')
      return { skipped: true }
    }
    
    // 检查网络
    if (!networkState.isConnected) {
      console.log('[Smart Refresh] Skipped, offline')
      return { skipped: true, offline: true }
    }
    
    try {
      const result = await weakNetworkRequest(refreshFn, {
        maxRetries,
        timeout: networkState.signalStrength === 'weak' ? 15000 : 10000
      })
      
      lastRefreshTime = now
      retryCount = 0
      
      if (onSuccess) onSuccess(result)
      return result
      
    } catch (error) {
      retryCount++
      
      if (onError) onError(error, retryCount)
      
      throw error
    }
  }
}

// 默认导出
export default {
  init: initOfflineExperience,
  checkNetwork,
  request: weakNetworkRequest,
  imageLoader,
  sync: syncStrategy,
  loading: loadingManager,
  smartRefresh
}
