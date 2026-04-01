import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../../src/stores/trip.js'
import { useTemplateStore } from '../../src/stores/templates.js'
import '../../tests/mocks/uni.js'

/**
 * 集成测试 - 核心业务流程
 * 测试完整的用户场景：创建行程 → 打包清单 → 返程清点 → 归档
 */

describe('Integration Tests - Core Workflows', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
  })

  describe('完整出行流程', () => {
    it('should complete full trip lifecycle', async () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      // 1. 导入预设模板
      const templateId = templateStore.importPreset('preset_business')
      expect(templateId).toBeDefined()
      
      const template = templateStore.templates.find(t => t.id === templateId)
      expect(template.name).toBe('商务出差')
      
      // 2. 从模板创建行程
      const trip = tripStore.createTripFromTemplate(template, {
        title: '上海出差',
        date: '2024-06-15',
        destination: '上海',
        scheduleTime: '09:00'
      })
      
      expect(trip).toBeDefined()
      expect(trip.title).toBe('上海出差')
      expect(trip.status).toBe('preparation')
      expect(trip.items.length).toBeGreaterThan(0)
      
      // 3. 更新状态为打包中
      tripStore.updateTripMeta(trip.id, { status: 'packing' })
      let updatedTrip = tripStore.trips.find(t => t.id === trip.id)
      expect(updatedTrip.status).toBe('packing')
      
      // 4. 打包物品（使用 itemsOf 获取物品列表）
      const items = tripStore.itemsOf(trip.id, false)
      const itemIds = items.map(i => i.id)
      for (const itemId of itemIds) {
        tripStore.toggleItem(trip.id, false, itemId)
      }
      
      // 验证所有物品已打包
      const updatedItems = tripStore.itemsOf(trip.id, false)
      const packedCount = updatedItems.filter(i => i.isChecked).length
      expect(packedCount).toBe(itemIds.length)
      
      // 5. 更新状态为已打包
      tripStore.updateTripMeta(trip.id, { status: 'packed' })
      updatedTrip = tripStore.trips.find(t => t.id === trip.id)
      expect(updatedTrip.status).toBe('packed')
      
      // 6. 出发
      tripStore.updateTripMeta(trip.id, { status: 'departed' })
      updatedTrip = tripStore.trips.find(t => t.id === trip.id)
      expect(updatedTrip.status).toBe('departed')
      
      // 7. 进入返程阶段
      tripStore.updateTripMeta(trip.id, { status: 'returnPhase' })
      updatedTrip = tripStore.trips.find(t => t.id === trip.id)
      expect(updatedTrip.status).toBe('returnPhase')
      
      // 8. 返程清点物品
      const returnItems = tripStore.itemsOf(trip.id, true)
      for (const item of returnItems) {
        tripStore.toggleItem(trip.id, true, item.id)
      }
      
      // 9. 完成返程
      tripStore.archiveTrip(trip.id)
      updatedTrip = tripStore.trips.find(t => t.id === trip.id)
      expect(updatedTrip.status).toBe('archived')
      
      // 10. 验证归档
      const archived = tripStore.trips.filter(t => t.status === 'archived')
      expect(archived).toHaveLength(1)
      expect(archived[0].id).toBe(trip.id)
    })
  })

  describe('多行程管理', () => {
    it('should manage multiple trips correctly', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      // 导入多个模板
      const businessId = templateStore.importPreset('preset_business')
      const campingId = templateStore.importPreset('preset_camping')
      
      // 创建多个行程
      const trip1 = tripStore.createTripFromTemplate(
        templateStore.getById(businessId),
        { title: '商务A', date: '2024-06-01' }
      )
      const trip2 = tripStore.createTripFromTemplate(
        templateStore.getById(campingId),
        { title: '露营B', date: '2024-06-02' }
      )
      const trip3 = tripStore.createTripFromTemplate(
        templateStore.getById(businessId),
        { title: '商务C', date: '2024-06-03' }
      )
      
      // 归档一个行程
      tripStore.archiveTrip(trip1.id)
      
      // 验证进行中的行程（使用 ongoing getter）
      const ongoing = tripStore.ongoing
      expect(ongoing.length).toBeGreaterThanOrEqual(2)
      expect(ongoing.some(t => t.title === '露营B')).toBe(true)
      expect(ongoing.some(t => t.title === '商务C')).toBe(true)
      
      // 验证总行程数
      expect(tripStore.trips).toHaveLength(3)
    })

    it('should sort trips by schedule time', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      const templateId = templateStore.importPreset('preset_business')
      const template = templateStore.getById(templateId)
      
      // 创建不同时间的行程
      const afternoon = tripStore.createTripFromTemplate(template, {
        title: '下午行程',
        date: '2024-06-15',
        scheduleTime: '14:00'
      })
      
      const morning = tripStore.createTripFromTemplate(template, {
        title: '早上行程',
        date: '2024-06-15',
        scheduleTime: '08:00'
      })
      
      const evening = tripStore.createTripFromTemplate(template, {
        title: '晚上行程',
        date: '2024-06-15',
        scheduleTime: '20:00'
      })
      
      const ongoing = tripStore.ongoing
      
      // 按时间排序验证
      expect(ongoing[0].title).toBe('早上行程')
      expect(ongoing[1].title).toBe('下午行程')
      expect(ongoing[2].title).toBe('晚上行程')
    })
  })

  describe('模板到行程数据流转', () => {
    it('should correctly transfer template items to trip', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      // 导入露营模板（物品较多）
      const templateId = templateStore.importPreset('preset_camping')
      const template = templateStore.getById(templateId)
      
      // 验证模板物品
      expect(template.items.length).toBeGreaterThan(10)
      expect(template.items.some(i => i.name === '帐篷')).toBe(true)
      expect(template.items.some(i => i.name === '身份证')).toBe(true)
      
      // 创建行程
      const trip = tripStore.createTripFromTemplate(template, {
        title: '周末露营',
        date: '2024-07-01'
      })
      
      // 验证物品被正确复制
      const items = tripStore.itemsOf(trip.id, false)
      expect(items.length).toBe(template.items.length)
      expect(items.every(i => i.id)).toBe(true) // 每个物品都有ID
      expect(items.some(i => i.name === '帐篷')).toBe(true)
      
      // 验证物品独立（修改行程不影响模板）
      items[0].name = '修改后的名称'
      expect(template.items[0].name).not.toBe('修改后的名称')
    })
  })

  describe('数据源分组统计', () => {
    it('should categorize trips by source correctly', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      const templateId = templateStore.importPreset('preset_business')
      const template = templateStore.getById(templateId)
      
      // 创建不同来源的行程
      tripStore.createTripFromTemplate(template, {
        title: '日历行程1',
        date: '2024-06-01',
        source: 'Calendar'
      })
      
      tripStore.createTripFromTemplate(template, {
        title: '日历行程2',
        date: '2024-06-02',
        source: 'Calendar'
      })
      
      tripStore.createTripFromTemplate(template, {
        title: '临时行程',
        date: '2024-06-03',
        source: 'Temporary'
      })
      
      const buckets = tripStore.sourceBuckets
      
      expect(buckets.calendar).toHaveLength(2)
      expect(buckets.temporary).toHaveLength(1)
      expect(buckets.all).toHaveLength(3)
    })
  })

  describe('进度统计一致性', () => {
    it('should maintain consistent progress across operations', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      const templateId = templateStore.importPreset('preset_business')
      const trip = tripStore.createTripFromTemplate(
        templateStore.getById(templateId),
        { title: '测试行程' }
      )
      
      const items = tripStore.itemsOf(trip.id, false)
      const itemIds = items.map(i => i.id)
      
      // 初始状态
      let checkedCount = items.filter(i => i.isChecked).length
      expect(checkedCount).toBe(0)
      
      // 打包一半
      const halfCount = Math.floor(itemIds.length / 2)
      for (let i = 0; i < halfCount; i++) {
        tripStore.toggleItem(trip.id, false, itemIds[i])
      }
      
      const updatedItems = tripStore.itemsOf(trip.id, false)
      checkedCount = updatedItems.filter(i => i.isChecked).length
      expect(checkedCount).toBe(halfCount)
      
      // 取消打包一个
      tripStore.toggleItem(trip.id, false, itemIds[0])
      
      const finalItems = tripStore.itemsOf(trip.id, false)
      checkedCount = finalItems.filter(i => i.isChecked).length
      expect(checkedCount).toBe(halfCount - 1)
      
      // 全部打包
      for (const item of finalItems) {
        if (!item.isChecked) {
          tripStore.toggleItem(trip.id, false, item.id)
        }
      }
      
      const allItems = tripStore.itemsOf(trip.id, false)
      const allPacked = allItems.every(i => i.isChecked)
      expect(allPacked).toBe(true)
    })
  })
})
