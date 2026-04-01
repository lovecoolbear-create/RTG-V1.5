/**
 * UniApp 全局 API Mock
 * 用于测试环境模拟微信小程序/uni-app API
 */

// 存储 Mock
const mockStorage = new Map()

export const uni = {
  // 存储相关
  setStorageSync(key, value) {
    mockStorage.set(key, value)
  },
  
  getStorageSync(key) {
    return mockStorage.get(key)
  },
  
  removeStorageSync(key) {
    mockStorage.delete(key)
  },
  
  getStorageInfoSync() {
    return {
      keys: Array.from(mockStorage.keys()),
      currentSize: JSON.stringify(Object.fromEntries(mockStorage)).length,
      limitSize: 10 * 1024 * 1024
    }
  },
  
  clearStorageSync() {
    mockStorage.clear()
  },
  
  // 导航相关
  navigateTo(options) {
    console.log('[Mock] navigateTo:', options.url)
    options?.success?.({ errMsg: 'navigateTo:ok' })
  },
  
  navigateBack(options) {
    console.log('[Mock] navigateBack')
    options?.success?.({ errMsg: 'navigateBack:ok' })
  },
  
  redirectTo(options) {
    console.log('[Mock] redirectTo:', options.url)
    options?.success?.({ errMsg: 'redirectTo:ok' })
  },
  
  // 交互相关
  showToast(options) {
    console.log('[Mock] showToast:', options.title)
    options?.success?.({ errMsg: 'showToast:ok' })
  },
  
  showModal(options) {
    console.log('[Mock] showModal:', options.title)
    // 模拟用户点击确认
    setTimeout(() => {
      options?.success?.({ confirm: true, cancel: false })
    }, 10)
  },
  
  showActionSheet(options) {
    console.log('[Mock] showActionSheet:', options.title)
    // 模拟用户选择第一个
    setTimeout(() => {
      options?.success?.({ tapIndex: 0 })
    }, 10)
  },
  
  // 系统信息
  getSystemInfoSync() {
    return {
      platform: 'devtools',
      system: 'iOS 16.0',
      brand: 'Apple',
      model: 'iPhone 14',
      screenWidth: 375,
      screenHeight: 812,
      windowWidth: 375,
      windowHeight: 812,
      pixelRatio: 2
    }
  },
  
  getAppBaseInfo() {
    return {
      appId: '__UNI__C101DD7',
      appName: 'ReadyToGo',
      appVersion: '1.0.0',
      appLanguage: 'zh-CN'
    }
  },
  
  // 网络请求
  request(options) {
    console.log('[Mock] request:', options.url)
    // 返回模拟数据
    setTimeout(() => {
      options?.success?.({
        data: { code: 200, data: null },
        statusCode: 200,
        header: {}
      })
    }, 100)
  },
  
  // 文件操作
  saveImageToPhotosAlbum(options) {
    console.log('[Mock] saveImageToPhotosAlbum:', options.filePath)
    options?.success?.({ errMsg: 'saveImageToPhotosAlbum:ok' })
  },
  
  // Canvas
  createCanvasContext(canvasId) {
    return {
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      drawImage: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      rect: () => {},
      setFillStyle: () => {},
      setStrokeStyle: () => {},
      setLineWidth: () => {},
      setFontSize: () => {},
      setTextAlign: () => {},
      setTextBaseline: () => {},
      draw: (reserve, callback) => {
        callback?.()
      }
    }
  },
  
  canvasToTempFilePath(options) {
    setTimeout(() => {
      options?.success?.({
        tempFilePath: `wxfile://temp/test_${Date.now()}.png`,
        errMsg: 'canvasToTempFilePath:ok'
      })
    }, 50)
  },
  
  // 剪贴板
  setClipboardData(options) {
    console.log('[Mock] setClipboardData')
    options?.success?.({ errMsg: 'setClipboardData:ok' })
  },
  
  getClipboardData(options) {
    console.log('[Mock] getClipboardData')
    options?.success?.({
      data: '',
      errMsg: 'getClipboardData:ok'
    })
  },
  
  // 其他
  onError(callback) {
    // 模拟错误监听
  },
  
  onUnhandledRejection(callback) {
    // 模拟 Promise 错误监听
  },
  
  getRealtimeLogManager() {
    return {
      info: (...args) => console.log('[RealtimeLog]', ...args),
      warn: (...args) => console.warn('[RealtimeLog]', ...args),
      error: (...args) => console.error('[RealtimeLog]', ...args)
    }
  },
  
  // 分享
  shareAppMessage(options) {
    console.log('[Mock] shareAppMessage:', options.title)
    options?.success?.({ errMsg: 'shareAppMessage:ok' })
  },
  
  // 登录
  login(options) {
    setTimeout(() => {
      options?.success?.({
        code: 'mock_code_' + Date.now(),
        errMsg: 'login:ok'
      })
    }, 100)
  },
  
  // 获取用户信息
  getUserInfo(options) {
    setTimeout(() => {
      options?.success?.({
        userInfo: {
          nickName: 'TestUser',
          avatarUrl: 'https://example.com/avatar.png'
        },
        errMsg: 'getUserInfo:ok'
      })
    }, 100)
  }
}

// 全局挂载
global.uni = uni
global.wx = uni

export default uni
