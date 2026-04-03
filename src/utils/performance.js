/**
 * 性能优化工具库
 * 包含图片懒加载、防抖节流、虚拟列表等性能优化方案
 */

// ========== 图片懒加载 ==========

/**
 * 创建图片懒加载观察器
 * @param {Object} options - 配置选项
 * @returns {IntersectionObserver} 观察器实例
 */
export function createImageLazyLoader(options = {}) {
  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    placeholder: '/static/images/placeholder.png',
    onLoad: null,
    onError: null
  }

  const config = { ...defaultOptions, ...options }

  const imageObserver = uni.createIntersectionObserver({
    thresholds: [config.threshold]
  })

  return {
    observe(selector) {
      imageObserver.relativeToViewport({ bottom: config.rootMargin })
        .observe(selector, (res) => {
          if (res.intersectionRatio > 0) {
            const img = res.dataset
            if (img.src && img.src !== config.placeholder) {
              // 实际加载图片
              uni.getImageInfo({
                src: img.src,
                success: () => {
                  if (config.onLoad) config.onLoad(img.src)
                },
                fail: () => {
                  if (config.onError) config.onError(img.src)
                }
              })
            }
            // 停止观察已加载的图片
            imageObserver.disconnect()
          }
        })
    },
    disconnect() {
      imageObserver.disconnect()
    }
  }
}

// ========== 防抖节流 ==========

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function}
 */
export function debounce(fn, delay = 300, immediate = false) {
  let timer = null
  return function (...args) {
    const context = this
    if (timer) clearTimeout(timer)
    
    if (immediate) {
      const callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)
      if (callNow) fn.apply(context, args)
    } else {
      timer = setTimeout(() => {
        fn.apply(context, args)
      }, delay)
    }
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const context = this
    const now = Date.now()
    
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(context, args)
    }
  }
}

// ========== 数据分片加载 ==========

/**
 * 大数据分片加载（用于长列表）
 * @param {Array} data - 原始数据
 * @param {number} chunkSize - 每片大小
 * @param {Function} callback - 每片加载回调
 * @param {number} delay - 片间延迟（毫秒）
 */
export function chunkedLoad(data, chunkSize = 20, callback, delay = 16) {
  const total = data.length
  let index = 0

  function loadChunk() {
    const chunk = data.slice(index, index + chunkSize)
    callback(chunk, index, total)
    index += chunkSize

    if (index < total) {
      setTimeout(loadChunk, delay)
    }
  }

  loadChunk()
}

// ========== 缓存优化 ==========

/**
 * 内存缓存（带LRU淘汰）
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (this.cache.has(key)) {
      // 移动到末尾（最新使用）
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear() {
    this.cache.clear()
  }

  has(key) {
    return this.cache.has(key)
  }
}

// 全局缓存实例
export const globalCache = new LRUCache(50)

// ========== 计算缓存（ memorize ） ==========

/**
 * 函数结果缓存
 * @param {Function} fn - 要缓存的函数
 * @param {Function} keyGenerator - 缓存键生成器
 * @returns {Function}
 */
export function memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  
  return function (...args) {
    const key = keyGenerator(...args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// ========== 性能监控 ==========

/**
 * 性能监控工具
 */
export const performanceMonitor = {
  marks: {},

  start(label) {
    this.marks[label] = Date.now()
  },

  end(label) {
    if (this.marks[label]) {
      const duration = Date.now() - this.marks[label]
      console.log(`[Performance] ${label}: ${duration}ms`)
      delete this.marks[label]
      return duration
    }
    return 0
  },

  // 页面性能数据
  getPagePerformance() {
    if (typeof __GLOBAL__ !== 'undefined' && __GLOBAL__.performance) {
      const timing = __GLOBAL__.performance.timing
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      }
    }
    return null
  }
}

// ========== 资源预加载 ==========

/**
 * 预加载图片资源
 * @param {string[]} urls - 图片URL列表
 * @returns {Promise}
 */
export function preloadImages(urls) {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      uni.getImageInfo({
        src: url,
        success: resolve,
        fail: reject
      })
    })
  })
  
  return Promise.allSettled(promises)
}

/**
 * 预加载分包
 * @param {string} packageName - 分包名称
 */
export function preloadSubpackage(packageName) {
  if (uni.preloadSubpackage) {
    uni.preloadSubpackage({
      root: packageName,
      success: () => {
        console.log(`[Preload] 分包 ${packageName} 预加载成功`)
      },
      fail: (err) => {
        console.warn(`[Preload] 分包 ${packageName} 预加载失败`, err)
      }
    })
  }
}

// ========== 骨架屏工具 ==========

/**
 * 生成骨架屏样式
 * @param {Object} options - 配置
 * @returns {string} CSS样式
 */
export function generateSkeletonStyle(options = {}) {
  const {
    backgroundColor = '#f0f0f0',
    shimmerColor = '#e0e0e0',
    animationDuration = '1.5s'
  } = options

  return `
    .skeleton {
      background: linear-gradient(90deg, 
        ${backgroundColor} 25%, 
        ${shimmerColor} 50%, 
        ${backgroundColor} 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading ${animationDuration} infinite;
    }
    
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
}

// ========== 虚拟列表（简化版） ==========

/**
 * 虚拟列表计算
 * @param {Object} params - 参数
 * @returns {Object} 可见范围数据
 */
export function calculateVisibleRange(params) {
  const {
    totalCount,
    itemHeight,
    scrollTop,
    containerHeight,
    overscan = 5 // 缓冲区
  } = params

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
  const endIndex = Math.min(totalCount, startIndex + visibleCount)

  return {
    startIndex,
    endIndex,
    visibleCount: endIndex - startIndex,
    offsetY: startIndex * itemHeight,
    totalHeight: totalCount * itemHeight
  }
}
