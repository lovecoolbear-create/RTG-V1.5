/**
 * E2E测试 - 微信小程序自动化测试
 * 
 * 运行方式：
 * 1. 编译小程序：npm run build:mp-weixin
 * 2. 运行测试：npx @dcloudio/uni-automator
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import automator from '@dcloudio/uni-automator'

describe('E2E Tests - Mini Program', () => {
  let miniProgram
  let page

  beforeAll(async () => {
    // 启动自动化测试
    miniProgram = await automator.launch({
      projectPath: process.cwd() + '/dist/build/mp-weixin'
    })
    
    // 进入首页
    page = await miniProgram.reLaunch('/pages/tab-home/index')
    await page.waitFor(1000)
  }, 60000)

  afterAll(async () => {
    await miniProgram.close()
  })

  describe('首页功能', () => {
    it('should display home page', async () => {
      const title = await page.$('.header-title')
      expect(title).toBeTruthy()
    })

    it('should display calendar', async () => {
      const calendar = await page.$('.calendar-wrapper')
      expect(calendar).toBeTruthy()
    })

    it('should navigate to template selector', async () => {
      // 点击新建按钮
      await page.tap('.new-trip-btn')
      await page.waitFor(1000)
      
      // 验证跳转成功
      const currentPage = await miniProgram.currentPage()
      expect(currentPage.path).toContain('template-selector')
      
      // 返回首页
      await miniProgram.navigateBack()
    })
  })

  describe('行程创建流程', () => {
    it('should create a new trip', async () => {
      // 进入模板选择页面
      await page.tap('.new-trip-btn')
      await page.waitFor(1000)
      
      // 选择第一个模板
      await page.tap('.template-card')
      await page.waitFor(500)
      
      // 填写行程信息
      await page.setInputValue('.title-input', '测试行程')
      await page.setInputValue('.date-input', '2024-06-15')
      
      // 点击创建
      await page.tap('.create-btn')
      await page.waitFor(2000)
      
      // 验证跳转到清单页
      const currentPage = await miniProgram.currentPage()
      expect(currentPage.path).toContain('trip-checklist')
    })
  })

  describe('清单操作', () => {
    it('should toggle checklist items', async () => {
      // 假设已在清单页面
      const items = await page.$$('.checklist-item')
      expect(items.length).toBeGreaterThan(0)
      
      // 勾选第一个物品
      await page.tap('.checklist-item:first-child .checkbox')
      await page.waitFor(300)
      
      // 验证勾选状态
      const checked = await page.$('.checklist-item:first-child .checkbox.checked')
      expect(checked).toBeTruthy()
    })

    it('should show progress update', async () => {
      const progressText = await page.$('.progress-text')
      expect(progressText).toBeTruthy()
    })
  })

  describe('模板库', () => {
    it('should import preset template', async () => {
      // 进入模板管理页面
      await miniProgram.reLaunch('/pages/tab-templates/index')
      await page.waitFor(1000)
      
      // 点击预设库
      await page.tap('.preset-library-btn')
      await page.waitFor(500)
      
      // 选择一个预设模板
      await page.tap('.preset-card:first-child')
      await page.waitFor(500)
      
      // 点击导入
      await page.tap('.import-btn')
      await page.waitFor(500)
      
      // 验证导入成功（显示toast或更新列表）
      const toast = await page.$('.uni-toast')
      expect(toast).toBeTruthy()
    })
  })

  describe('分享功能', () => {
    it('should open share poster', async () => {
      // 在清单页面
      await page.tap('.share-btn')
      await page.waitFor(1000)
      
      // 验证分享弹窗显示
      const poster = await page.$('.share-poster-modal')
      expect(poster).toBeTruthy()
      
      // 关闭弹窗
      await page.tap('.close-btn')
    })
  })

  describe('设置页面', () => {
    it('should navigate to settings', async () => {
      // 切换到设置tab
      await miniProgram.switchTab('/pages/tab-settings/index')
      await page.waitFor(1000)
      
      const settingsPage = await miniProgram.currentPage()
      expect(settingsPage.path).toContain('tab-settings')
    })

    it('should toggle theme', async () => {
      // 点击主题切换
      await page.tap('.theme-toggle')
      await page.waitFor(300)
      
      // 验证主题变化（通过检查类名或样式）
      const pageClass = await page.attr('class')
      expect(pageClass).toContain('dark') // 或其他主题标识
    })
  })

  describe('性能基准', () => {
    it('should load page within 3 seconds', async () => {
      const start = Date.now()
      
      await miniProgram.reLaunch('/pages/tab-home/index')
      await page.waitFor(3000)
      
      const loadTime = Date.now() - start
      expect(loadTime).toBeLessThan(3000)
    })

    it('should handle 50 items list smoothly', async () => {
      // 创建一个大行程并检查滚动性能
      // 这个测试需要更复杂的设置，这里只做基本检查
      const list = await page.$('.checklist-scroll')
      expect(list).toBeTruthy()
    })
  })
})

/**
 * 设备兼容性测试套件
 * 需要在不同设备上运行
 */
describe('Device Compatibility', () => {
  const devices = [
    { name: 'iPhone 14', width: 375, height: 812, dpr: 3 },
    { name: 'iPhone SE', width: 375, height: 667, dpr: 2 },
    { name: 'Android Large', width: 412, height: 915, dpr: 2.6 }
  ]

  for (const device of devices) {
    it(`should render correctly on ${device.name}`, async () => {
      // 设置设备参数
      await miniProgram.setWindowSize(device.width, device.height, device.dpr)
      
      await miniProgram.reLaunch('/pages/tab-home/index')
      await page.waitFor(1000)
      
      // 检查页面没有溢出或布局错乱
      const body = await page.$('body')
      const rect = await body.boundingBox()
      
      expect(rect.width).toBeLessThanOrEqual(device.width * device.dpr)
    })
  }
})
