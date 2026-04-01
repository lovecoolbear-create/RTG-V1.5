/**
 * API 请求错误处理封装
 * 统一处理天气 API、云开发 API 等请求的错误
 */

import { captureError, ErrorTypes, ErrorLevels, withErrorHandling } from './error-handler.js'

// API 错误码映射
const APIErrorCodes = {
  // HTTP 状态码
  400: 'bad-request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not-found',
  408: 'timeout',
  429: 'rate-limit',
  500: 'server-error',
  502: 'bad-gateway',
  503: 'service-unavailable',
  504: 'gateway-timeout',
  
  // 业务错误码（和风天气）
  'weather/401': '无效的 API Key',
  'weather/404': '查询城市不存在',
  'weather/429': '请求过于频繁',
  'weather/500': '天气服务暂时不可用',
  
  // 云开发错误码
  'cloud/-501001': '云开发环境未初始化',
  'cloud/-501002': '数据库查询失败',
  'cloud/-501003': '网络请求失败',
  'cloud/-501005': '无权限操作',
}

/**
 * 带错误处理的 uni.request 封装
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    const { 
      url, 
      method = 'GET', 
      data,
      timeout = 10000,
      errorType = ErrorTypes.API,
      showErrorToast = true
    } = options
    
    const startTime = Date.now()
    
    uni.request({
      url,
      method,
      data,
      timeout,
      success: (res) => {
        const duration = Date.now() - startTime
        
        // 记录慢请求（>3秒）
        if (duration > 3000) {
          console.warn(`[Slow Request] ${url} took ${duration}ms`)
        }
        
        // HTTP 错误
        if (res.statusCode >= 400) {
          const errorCode = APIErrorCodes[res.statusCode] || `http-${res.statusCode}`
          const error = new Error(`Request failed with status ${res.statusCode}`)
          
          captureError(errorType, errorCode, error, {
            url,
            statusCode: res.statusCode,
            response: res.data,
            duration
          })
          
          if (showErrorToast) {
            showApiErrorToast(errorCode, res.statusCode)
          }
          
          reject(error)
          return
        }
        
        // 业务逻辑错误（根据具体 API 定义）
        if (res.data && res.data.code !== undefined && res.data.code !== 200 && res.data.code !== 0) {
          const bizErrorCode = `${errorType}/${res.data.code}`
          const error = new Error(res.data.message || 'Business logic error')
          
          captureError(errorType, bizErrorCode, error, {
            url,
            bizCode: res.data.code,
            response: res.data
          })
          
          if (showErrorToast) {
            const message = res.data.message || getDefaultErrorMessage(bizErrorCode)
            uni.showToast({ title: message, icon: 'none', duration: 3000 })
          }
          
          reject(error)
          return
        }
        
        resolve(res.data)
      },
      fail: (err) => {
        const errorCode = getNetworkErrorCode(err)
        const error = new Error(err.errMsg || 'Network request failed')
        
        captureError(ErrorTypes.NETWORK, errorCode, error, {
          url,
          errMsg: err.errMsg
        })
        
        if (showErrorToast) {
          showNetworkErrorToast(errorCode)
        }
        
        reject(error)
      }
    })
  })
}

/**
 * 天气 API 专用请求
 */
export function requestWeather(location) {
  return withErrorHandling(
    async () => {
      // 这里替换为实际的风和天气 API 调用
      const result = await request({
        url: 'https://devapi.qweather.com/v7/weather/now',
        data: {
          location,
          key: 'YOUR_API_KEY' // 从环境变量或配置读取
        },
        timeout: 8000,
        errorType: 'weather'
      })
      
      return result
    },
    {
      errorType: ErrorTypes.API,
      errorCode: 'weather/request-failed',
      showToast: true,
      fallbackValue: null
    }
  )
}

/**
 * 云开发数据库操作封装
 */
export const cloudDB = {
  // 查询
  async query(collection, where = {}) {
    return withErrorHandling(
      async () => {
        const db = uniCloud.database()
        const result = await db.collection(collection).where(where).get()
        return result.data
      },
      {
        errorType: ErrorTypes.API,
        errorCode: 'cloud/query-failed',
        showToast: false, // 后台查询失败不打扰用户
        fallbackValue: []
      }
    )
  },
  
  // 添加
  async add(collection, data) {
    return withErrorHandling(
      async () => {
        const db = uniCloud.database()
        const result = await db.collection(collection).add(data)
        return result
      },
      {
        errorType: ErrorTypes.API,
        errorCode: 'cloud/add-failed',
        showToast: true,
        fallbackValue: null
      }
    )
  },
  
  // 更新
  async update(collection, id, data) {
    return withErrorHandling(
      async () => {
        const db = uniCloud.database()
        const result = await db.collection(collection).doc(id).update(data)
        return result
      },
      {
        errorType: ErrorTypes.API,
        errorCode: 'cloud/update-failed',
        showToast: true,
        fallbackValue: null
      }
    )
  },
  
  // 删除
  async remove(collection, id) {
    return withErrorHandling(
      async () => {
        const db = uniCloud.database()
        const result = await db.collection(collection).doc(id).remove()
        return result
      },
      {
        errorType: ErrorTypes.API,
        errorCode: 'cloud/remove-failed',
        showToast: true,
        fallbackValue: null
      }
    )
  }
}

/**
 * 网络错误码识别
 */
function getNetworkErrorCode(err) {
  const errMsg = err.errMsg || err.message || ''
  
  if (errMsg.includes('timeout') || errMsg.includes('超时')) {
    return 'timeout'
  }
  if (errMsg.includes('fail') && errMsg.includes('ssl')) {
    return 'ssl-error'
  }
  if (errMsg.includes('fail') && errMsg.includes('dns')) {
    return 'dns-error'
  }
  if (errMsg.includes('offline') || errMsg.includes('network')) {
    return 'offline'
  }
  
  return 'unknown'
}

/**
 * 显示 API 错误提示
 */
function showApiErrorToast(errorCode, statusCode) {
  const messages = {
    'timeout': '请求超时，请检查网络',
    'rate-limit': '请求过于频繁，请稍后再试',
    'server-error': '服务器繁忙，请稍后重试',
    'not-found': '请求的资源不存在',
    'unauthorized': '访问权限不足'
  }
  
  const message = messages[errorCode] || `请求失败 (${statusCode})`
  uni.showToast({ title: message, icon: 'none', duration: 3000 })
}

/**
 * 显示网络错误提示
 */
function showNetworkErrorToast(errorCode) {
  const messages = {
    'timeout': '网络连接超时，请稍后重试',
    'offline': '网络已断开，请检查网络设置',
    'dns-error': '无法连接到服务器',
    'ssl-error': '安全连接失败'
  }
  
  const message = messages[errorCode] || '网络请求失败，请重试'
  uni.showToast({ title: message, icon: 'none', duration: 3000 })
}

/**
 * 获取默认错误信息
 */
function getDefaultErrorMessage(errorCode) {
  return APIErrorCodes[errorCode] || '请求失败，请重试'
}

/**
 * 检查网络状态
 */
export function checkNetwork() {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => {
        const isConnected = res.networkType !== 'none'
        resolve({
          isConnected,
          networkType: res.networkType // wifi, 4g, 3g, 2g, none
        })
      },
      fail: () => {
        resolve({ isConnected: false, networkType: 'unknown' })
      }
    })
  })
}

/**
 * 监听网络状态变化
 */
export function onNetworkStatusChange(callback) {
  uni.onNetworkStatusChange((res) => {
    callback({
      isConnected: res.isConnected,
      networkType: res.networkType
    })
    
    // 网络恢复时提示
    if (res.isConnected) {
      // 可选：显示网络恢复提示
      // uni.showToast({ title: '网络已恢复', icon: 'success', duration: 1500 })
    }
  })
}
