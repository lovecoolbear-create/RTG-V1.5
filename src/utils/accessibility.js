/**
 * 可访问性工具函数
 */

// 检查是否启用了减少动画
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 检查是否为深色模式
export const prefersDarkMode = () => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 检查字体大小偏好
export const getFontSizePreference = () => {
  if (typeof window === 'undefined') return 'medium'
  
  if (window.matchMedia('(min-resolution: 120dpi)').matches) {
    return 'large'
  }
  
  return 'medium'
}

// 生成无障碍ID
export const generateAriaId = (prefix = 'element') => {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

// 检查触摸设备
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

// 获取安全区域
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }
  
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
  }
}

// 设置焦点管理
export class FocusManager {
  constructor() {
    this.focusableElements = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')
    
    this.previousFocus = null
    this.trapElement = null
  }
  
  // 获取可聚焦元素
  getFocusableElements(container = document) {
    return Array.from(
      container.querySelectorAll(this.focusableElements)
    ).filter(el => {
      return !el.disabled && 
             !el.getAttribute('aria-hidden') &&
             el.offsetWidth > 0 && 
             el.offsetHeight > 0
    })
  }
  
  // 保存当前焦点
  saveFocus() {
    this.previousFocus = document.activeElement
  }
  
  // 恢复焦点
  restoreFocus() {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus()
    }
  }
  
  // 焦点陷阱
  trapFocus(element) {
    this.trapElement = element
    const focusableElements = this.getFocusableElements(element)
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    element.addEventListener('keydown', handleTabKey)
    firstElement.focus()
    
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }
  
  // 释放焦点陷阱
  releaseTrap() {
    this.trapElement = null
  }
}

// 屏幕阅读器通知
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.style.position = 'absolute'
  announcement.style.left = '-10000px'
  announcement.style.width = '1px'
  announcement.style.height = '1px'
  announcement.style.overflow = 'hidden'
  
  document.body.appendChild(announcement)
  announcement.textContent = message
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// 键盘导航支持
export const setupKeyboardNavigation = (element, handlers = {}) => {
  const defaultHandlers = {
    Enter: () => element.click(),
    Space: () => element.click(),
    Escape: () => {},
    ArrowUp: () => {},
    ArrowDown: () => {},
    ArrowLeft: () => {},
    ArrowRight: () => {},
    Home: () => {},
    End: () => {},
    PageUp: () => {},
    PageDown: () => {}
  }
  
  const handleKeyDown = (e) => {
    const handler = handlers[e.key] || defaultHandlers[e.key]
    if (handler) {
      e.preventDefault()
      handler(e)
    }
  }
  
  element.addEventListener('keydown', handleKeyDown)
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

// 触摸反馈增强
export const enhanceTouchFeedback = (element, options = {}) => {
  const {
    scale = 0.95,
    opacity = 0.7,
    duration = 150
  } = options
  
  let timeoutId = null
  
  const handleTouchStart = () => {
    element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`
    element.style.transform = `scale(${scale})`
    element.style.opacity = opacity
  }
  
  const handleTouchEnd = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      element.style.transform = 'scale(1)'
      element.style.opacity = '1'
    }, duration)
  }
  
  const handleTouchCancel = () => {
    clearTimeout(timeoutId)
    element.style.transform = 'scale(1)'
    element.style.opacity = '1'
  }
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })
  element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
  
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchCancel)
  }
}

// 响应式断点检测
export const getBreakpoint = () => {
  if (typeof window === 'undefined') return 'mobile'
  
  const width = window.innerWidth
  
  if (width < 375) return 'mobile-small'
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  if (width < 1440) return 'desktop'
  return 'desktop-large'
}

// 监听断点变化
export const watchBreakpoint = (callback) => {
  if (typeof window === 'undefined') return () => {}
  
  let currentBreakpoint = getBreakpoint()
  
  const handleResize = () => {
    const newBreakpoint = getBreakpoint()
    if (newBreakpoint !== currentBreakpoint) {
      callback(newBreakpoint, currentBreakpoint)
      currentBreakpoint = newBreakpoint
    }
  }
  
  window.addEventListener('resize', handleResize, { passive: true })
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

// 检查高对比度模式
export const isHighContrast = () => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-contrast: high)').matches
}

// 检查强制颜色模式
export const isForcedColors = () => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(forced-colors: active)').matches
}

// 获取设备像素比
export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1
  
  return window.devicePixelRatio || 1
}

// 检查是否为移动设备
export const isMobile = () => {
  if (typeof navigator === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
    'windows phone', 'mobile', 'webos', 'opera mini'
  ]
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

// 可访问性工具类
export class AccessibilityHelper {
  constructor() {
    this.focusManager = new FocusManager()
    this.announcements = []
  }
  
  // 初始化可访问性功能
  init() {
    this.setupGlobalHandlers()
    this.setupAriaLiveRegions()
  }
  
  // 设置全局处理器
  setupGlobalHandlers() {
    // 键盘导航增强
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    })
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation')
    })
    
    // 跳转到主内容
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = '跳转到主内容'
    skipLink.className = 'skip-link'
    document.body.insertBefore(skipLink, document.body.firstChild)
  }
  
  // 设置实时区域
  setupAriaLiveRegions() {
    const regions = ['polite', 'assertive', 'off']
    
    regions.forEach(politeness => {
      const region = document.createElement('div')
      region.setAttribute('aria-live', politeness)
      region.setAttribute('aria-atomic', 'true')
      region.className = `sr-only aria-live-${politeness}`
      region.style.position = 'absolute'
      region.style.left = '-10000px'
      region.style.width = '1px'
      region.style.height = '1px'
      region.style.overflow = 'hidden'
      
      document.body.appendChild(region)
    })
  }
  
  // 通知屏幕阅读器
  announce(message, priority = 'polite') {
    const region = document.querySelector(`.aria-live-${priority}`)
    if (region) {
      region.textContent = message
      setTimeout(() => {
        region.textContent = ''
      }, 1000)
    }
  }
  
  // 设置焦点陷阱
  trapFocus(element) {
    return this.focusManager.trapFocus(element)
  }
  
  // 释放焦点陷阱
  releaseFocus() {
    this.focusManager.releaseTrap()
  }
  
  // 保存和恢复焦点
  saveFocus() {
    this.focusManager.saveFocus()
  }
  
  restoreFocus() {
    this.focusManager.restoreFocus()
  }
}

// 导出单例实例
export const accessibility = new AccessibilityHelper()
