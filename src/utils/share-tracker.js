/**
 * 分享追踪埋点系统
 * 记录用户分享行为，用于数据分析和增长优化
 */

import { storage } from './storage.js'

const SHARE_LOG_KEY = 'rtg_share_logs'
const SHARE_STATS_KEY = 'rtg_share_stats'
const MAX_LOGS = 100 // 最多保留100条分享记录

// 分享类型
export const ShareTypes = {
  TRIP: 'trip',           // 行程分享
  TEMPLATE: 'template',   // 模板分享
  ACHIEVEMENT: 'achievement', // 成就分享
  INVITE: 'invite'        // 邀请分享
}

// 分享渠道
export const ShareChannels = {
  WECHAT_FRIEND: 'wechat_friend',    // 微信好友
  WECHAT_MOMENTS: 'wechat_moments',  // 朋友圈
  SAVE_ALBUM: 'save_album',          // 保存相册
  COPY_LINK: 'copy_link'             // 复制链接
}

/**
 * 记录一次分享行为
 */
export async function trackShare(options) {
  const {
    type,           // ShareTypes 之一
    channel,        // ShareChannels 之一
    contentId,      // 内容ID（行程ID/模板ID等）
    contentTitle,   // 内容标题
    success = true, // 是否成功
    errorMsg = '',  // 错误信息
    extra = {}      // 额外数据
  } = options
  
  const logEntry = {
    id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    channel,
    contentId,
    contentTitle,
    success,
    errorMsg,
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
    platform: uni.getSystemInfoSync().platform,
    appVersion: uni.getAppBaseInfo?.().appVersion || '1.0.0',
    ...extra
  }
  
  try {
    // 保存到日志
    await saveShareLog(logEntry)
    
    // 更新统计数据
    await updateShareStats(logEntry)
    
    // 发送到微信实时日志（如果配置了）
    sendToRealtimeLog(logEntry)
    
    return logEntry
  } catch (error) {
    console.error('Failed to track share:', error)
    return null
  }
}

/**
 * 保存分享日志
 */
async function saveShareLog(logEntry) {
  try {
    const logs = await storage.get(SHARE_LOG_KEY, [])
    logs.unshift(logEntry)
    
    // 限制日志数量
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS)
    }
    
    await storage.set(SHARE_LOG_KEY, logs)
  } catch (error) {
    console.error('Failed to save share log:', error)
  }
}

/**
 * 更新分享统计数据
 */
async function updateShareStats(logEntry) {
  try {
    const stats = await storage.get(SHARE_STATS_KEY, {
      totalShares: 0,
      byType: {},
      byChannel: {},
      byDate: {},
      successCount: 0,
      failCount: 0
    })
    
    // 总分享数
    stats.totalShares++
    
    // 按类型统计
    stats.byType[logEntry.type] = (stats.byType[logEntry.type] || 0) + 1
    
    // 按渠道统计
    stats.byChannel[logEntry.channel] = (stats.byChannel[logEntry.channel] || 0) + 1
    
    // 按日期统计
    const date = logEntry.date
    if (!stats.byDate[date]) {
      stats.byDate[date] = { count: 0, types: {}, channels: {} }
    }
    stats.byDate[date].count++
    stats.byDate[date].types[logEntry.type] = (stats.byDate[date].types[logEntry.type] || 0) + 1
    stats.byDate[date].channels[logEntry.channel] = (stats.byDate[date].channels[logEntry.channel] || 0) + 1
    
    // 成功/失败统计
    if (logEntry.success) {
      stats.successCount++
    } else {
      stats.failCount++
    }
    
    // 最后更新时间
    stats.lastUpdated = Date.now()
    
    await storage.set(SHARE_STATS_KEY, stats)
  } catch (error) {
    console.error('Failed to update share stats:', error)
  }
}

/**
 * 发送到微信实时日志
 */
function sendToRealtimeLog(logEntry) {
  try {
    if (typeof uni !== 'undefined' && uni.getRealtimeLogManager) {
      const logger = uni.getRealtimeLogManager()
      if (logger) {
        logger.info('ShareEvent', logEntry)
      }
    }
  } catch (error) {
    // 静默失败，不影响主流程
  }
}

/**
 * 获取分享统计
 */
export async function getShareStats() {
  return await storage.get(SHARE_STATS_KEY, {
    totalShares: 0,
    byType: {},
    byChannel: {},
    byDate: {},
    successCount: 0,
    failCount: 0
  })
}

/**
 * 获取分享日志
 */
export async function getShareLogs(limit = 50) {
  const logs = await storage.get(SHARE_LOG_KEY, [])
  return logs.slice(0, limit)
}

/**
 * 获取分享排行榜（最常被分享的内容）
 */
export async function getTopSharedContent(type = null, limit = 10) {
  const logs = await getShareLogs(100)
  const contentMap = new Map()
  
  logs.forEach(log => {
    if (type && log.type !== type) return
    
    const key = `${log.type}_${log.contentId}`
    if (!contentMap.has(key)) {
      contentMap.set(key, {
        contentId: log.contentId,
        contentTitle: log.contentTitle,
        type: log.type,
        count: 0,
        lastShared: log.timestamp
      })
    }
    
    const item = contentMap.get(key)
    item.count++
    if (log.timestamp > item.lastShared) {
      item.lastShared = log.timestamp
    }
  })
  
  return Array.from(contentMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * 导出分享数据（用于分析）
 */
export async function exportShareData() {
  const logs = await getShareLogs(100)
  const stats = await getShareStats()
  
  return {
    exportTime: new Date().toISOString(),
    summary: {
      totalShares: stats.totalShares,
      successRate: stats.totalShares > 0 
        ? ((stats.successCount / stats.totalShares) * 100).toFixed(1) + '%'
        : '0%',
      topChannels: Object.entries(stats.byChannel)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      topTypes: Object.entries(stats.byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    },
    recentLogs: logs.slice(0, 20),
    dailyStats: stats.byDate
  }
}

/**
 * 清空分享数据
 */
export async function clearShareData() {
  await storage.remove(SHARE_LOG_KEY)
  await storage.remove(SHARE_STATS_KEY)
}

/**
 * 分享追踪工具类
 */
export class ShareTracker {
  constructor() {
    this.pendingShares = new Map()
  }
  
  // 开始追踪一次分享（在分享前调用）
  startShare(type, contentId, contentTitle) {
    const shareId = `pending_${Date.now()}`
    this.pendingShares.set(shareId, {
      type,
      contentId,
      contentTitle,
      startTime: Date.now()
    })
    return shareId
  }
  
  // 完成分享（分享成功后调用）
  async completeShare(shareId, channel, extra = {}) {
    const pending = this.pendingShares.get(shareId)
    if (!pending) return null
    
    this.pendingShares.delete(shareId)
    
    return await trackShare({
      type: pending.type,
      channel,
      contentId: pending.contentId,
      contentTitle: pending.contentTitle,
      success: true,
      extra: {
        duration: Date.now() - pending.startTime,
        ...extra
      }
    })
  }
  
  // 分享失败
  async failShare(shareId, channel, errorMsg) {
    const pending = this.pendingShares.get(shareId)
    if (!pending) return null
    
    this.pendingShares.delete(shareId)
    
    return await trackShare({
      type: pending.type,
      channel,
      contentId: pending.contentId,
      contentTitle: pending.contentTitle,
      success: false,
      errorMsg,
      extra: {
        duration: Date.now() - pending.startTime
      }
    })
  }
}

// 创建全局分享追踪器实例
export const shareTracker = new ShareTracker()
