/**
 * 本地存储错误处理封装
 * 统一处理 uni.storage 相关操作，提供错误捕获和优雅降级
 */

import { captureError, ErrorTypes, withErrorHandling } from './error-handler.js'

// 存储配额估算（微信小程序限制 10MB）
const MAX_STORAGE_SIZE = 10 * 1024 * 1024 // 10MB
const WARNING_THRESHOLD = 0.8 // 80% 警告线

/**
 * 安全存储类
 */
class SafeStorage {
  constructor() {
    this.prefix = 'rtg_' // 前缀避免冲突
    this.fallbackStorage = new Map() // 内存回退存储
  }

  /**
   * 设置存储项
   */
  async set(key, value, options = {}) {
    const fullKey = this.prefix + key
    
    return withErrorHandling(
      async () => {
        // 序列化数据
        let dataToStore = value
        let dataSize = 0
        
        try {
          const serialized = JSON.stringify(value)
          dataToStore = serialized
          dataSize = new Blob([serialized]).size
        } catch (e) {
          // 无法序列化的数据（如循环引用）
          captureError(ErrorTypes.STORAGE, 'serialize-failed', e, {
            key,
            valueType: typeof value
          })
          throw new Error('数据格式不支持存储')
        }
        
        // 检查存储空间
        const usage = await this.getStorageInfo()
        if (usage.currentSize + dataSize > MAX_STORAGE_SIZE) {
          const error = new Error('存储空间不足')
          captureError(ErrorTypes.STORAGE, 'quota-exceeded', error, {
            key,
            dataSize,
            currentSize: usage.currentSize,
            limit: MAX_STORAGE_SIZE
          })
          
          // 尝试清理旧数据
          await this.cleanupOldData()
          
          // 再次尝试
          const usageAfter = await this.getStorageInfo()
          if (usageAfter.currentSize + dataSize > MAX_STORAGE_SIZE) {
            // 使用内存回退
            this.fallbackStorage.set(fullKey, value)
            console.warn(`[Storage] Using fallback memory for key: ${key}`)
            return true
          }
        }
        
        // 执行存储
        uni.setStorageSync(fullKey, dataToStore)
        
        // 记录元数据（用于清理策略）
        this.updateMeta(key, dataSize)
        
        return true
      },
      {
        errorType: ErrorTypes.STORAGE,
        errorCode: 'write-failed',
        showToast: options.showError !== false,
        fallbackValue: false
      }
    )
  }

  /**
   * 获取存储项
   */
  async get(key, defaultValue = null, options = {}) {
    const fullKey = this.prefix + key
    
    return withErrorHandling(
      async () => {
        // 优先从本地存储读取
        try {
          const data = uni.getStorageSync(fullKey)
          if (data !== undefined && data !== null) {
            // 尝试解析 JSON
            try {
              return JSON.parse(data)
            } catch {
              // 非 JSON 数据直接返回
              return data
            }
          }
        } catch (e) {
          // 读取失败，尝试回退存储
        }
        
        // 从回退存储读取
        if (this.fallbackStorage.has(fullKey)) {
          return this.fallbackStorage.get(fullKey)
        }
        
        return defaultValue
      },
      {
        errorType: ErrorTypes.STORAGE,
        errorCode: 'read-failed',
        showToast: false, // 读取失败静默处理
        fallbackValue: defaultValue
      }
    )
  }

  /**
   * 移除存储项
   */
  async remove(key, options = {}) {
    const fullKey = this.prefix + key
    
    return withErrorHandling(
      async () => {
        uni.removeStorageSync(fullKey)
        this.fallbackStorage.delete(fullKey)
        this.removeMeta(key)
        return true
      },
      {
        errorType: ErrorTypes.STORAGE,
        errorCode: 'remove-failed',
        showToast: options.showError !== false,
        fallbackValue: false
      }
    )
  }

  /**
   * 清空存储
   */
  async clear(options = {}) {
    return withErrorHandling(
      async () => {
        // 只清除带前缀的数据
        const keys = uni.getStorageInfoSync().keys
        const ourKeys = keys.filter(k => k.startsWith(this.prefix))
        
        ourKeys.forEach(key => {
          uni.removeStorageSync(key)
        })
        
        this.fallbackStorage.clear()
        return true
      },
      {
        errorType: ErrorTypes.STORAGE,
        errorCode: 'clear-failed',
        showToast: options.showError !== false,
        fallbackValue: false
      }
    )
  }

  /**
   * 获取存储信息
   */
  async getStorageInfo() {
    return withErrorHandling(
      async () => {
        const info = uni.getStorageInfoSync()
        return {
          keys: info.keys.filter(k => k.startsWith(this.prefix)),
          currentSize: info.currentSize,
          limitSize: info.limitSize,
          usagePercent: info.currentSize / info.limitSize
        }
      },
      {
        errorType: ErrorTypes.STORAGE,
        errorCode: 'info-failed',
        showToast: false,
        fallbackValue: {
          keys: [],
          currentSize: 0,
          limitSize: MAX_STORAGE_SIZE,
          usagePercent: 0
        }
      }
    )
  }

  /**
   * 检查存储空间是否充足
   */
  async checkSpace(requiredSize = 1024) {
    const info = await this.getStorageInfo()
    const available = info.limitSize - info.currentSize
    
    return {
      hasSpace: available >= requiredSize,
      available,
      required: requiredSize,
      usagePercent: info.usagePercent,
      isWarning: info.usagePercent > WARNING_THRESHOLD
    }
  }

  /**
   * 清理旧数据策略
   */
  async cleanupOldData() {
    try {
      // 获取元数据
      const metaKey = this.prefix + '_meta'
      const meta = uni.getStorageSync(metaKey) || {}
      const entries = Object.entries(meta)
      
      if (entries.length === 0) return
      
      // 按最后访问时间排序，删除最旧的 20%
      entries.sort((a, b) => (a[1].lastAccess || 0) - (b[1].lastAccess || 0))
      
      const deleteCount = Math.ceil(entries.length * 0.2)
      const toDelete = entries.slice(0, deleteCount)
      
      toDelete.forEach(([key]) => {
        uni.removeStorageSync(this.prefix + key)
        delete meta[key]
      })
      
      // 保存更新后的元数据
      uni.setStorageSync(metaKey, meta)
      
      console.log(`[Storage] Cleaned up ${deleteCount} old entries`)
    } catch (e) {
      captureError(ErrorTypes.STORAGE, 'cleanup-failed', e)
    }
  }

  /**
   * 更新元数据
   */
  updateMeta(key, size) {
    try {
      const metaKey = this.prefix + '_meta'
      const meta = uni.getStorageSync(metaKey) || {}
      
      meta[key] = {
        size,
        lastAccess: Date.now(),
        createdAt: meta[key]?.createdAt || Date.now()
      }
      
      uni.setStorageSync(metaKey, meta)
    } catch (e) {
      // 元数据更新失败不影响主流程
      console.warn('[Storage] Failed to update meta:', e)
    }
  }

  /**
   * 移除元数据
   */
  removeMeta(key) {
    try {
      const metaKey = this.prefix + '_meta'
      const meta = uni.getStorageSync(metaKey) || {}
      delete meta[key]
      uni.setStorageSync(metaKey, meta)
    } catch (e) {
      console.warn('[Storage] Failed to remove meta:', e)
    }
  }

  /**
   * 数据导出（用于备份）
   */
  async exportAll() {
    const result = {}
    const keys = (await this.getStorageInfo()).keys
    
    for (const key of keys) {
      if (key === '_meta') continue
      const cleanKey = key.replace(this.prefix, '')
      result[cleanKey] = await this.get(cleanKey)
    }
    
    return result
  }

  /**
   * 数据导入（用于恢复）
   */
  async importAll(data, options = {}) {
    const { overwrite = true } = options
    
    for (const [key, value] of Object.entries(data)) {
      if (!overwrite) {
        const existing = await this.get(key)
        if (existing !== null) continue
      }
      await this.set(key, value)
    }
    
    return true
  }
}

// 创建单例
const safeStorage = new SafeStorage()

// 便捷方法导出
export const storage = {
  set: safeStorage.set.bind(safeStorage),
  get: safeStorage.get.bind(safeStorage),
  remove: safeStorage.remove.bind(safeStorage),
  clear: safeStorage.clear.bind(safeStorage),
  getInfo: safeStorage.getStorageInfo.bind(safeStorage),
  checkSpace: safeStorage.checkSpace.bind(safeStorage),
  export: safeStorage.exportAll.bind(safeStorage),
  import: safeStorage.importAll.bind(safeStorage)
}

export default storage
