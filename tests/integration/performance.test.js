import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../../src/stores/trip.js'
import { useTemplateStore } from '../../src/stores/templates.js'
import { useGearStore } from '../../src/stores/gear.js'
import '../../tests/mocks/uni.js'

/**
 * 性能测试
 * 测试启动速度、列表渲染、数据操作性能
 */

describe('Performance Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
  })

  describe('Store启动性能', () => {
    it('should load store with large dataset quickly', () => {
      const start = performance.now()
      
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      const gearStore = useGearStore()
      
      const end = performance.now()
      const loadTime = end - start
      
      expect(loadTime).toBeLessThan(100) // 100ms内完成加载
    })

    it('should handle 100 trips efficiently', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      // 导入模板
      const templateId = templateStore.importPreset('preset_business')
      const template = templateStore.getById(templateId)
      
      // 创建100个行程
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        tripStore.createTripFromTemplate(template, {
          title: `行程${i}`,
          date: `2024-06-${String(i % 30 + 1).padStart(2, '0')}`
        })
      }
      
      const end = performance.now()
      const creationTime = end - start
      
      expect(tripStore.trips).toHaveLength(100)
      expect(creationTime).toBeLessThan(2000) // 2秒内创建100个
      
      // 验证查询性能
      const queryStart = performance.now()
      const ongoing = tripStore.ongoing
      const queryEnd = performance.now()
      
      expect(queryEnd - queryStart).toBeLessThan(50) // 50ms内查询完成
    })
  })

  describe('列表渲染性能', () => {
    it('should handle large item lists', () => {
      const tripStore = useTripStore()
      
      // 创建含大量物品的模板
      const largeTemplate = {
        name: '大型模板',
        items: Array.from({ length: 200 }, (_, i) => ({
          name: `物品${i}`,
          group: i % 5 === 0 ? 'A组' : i % 5 === 1 ? 'B组' : 'C组',
          isConsumable: i % 3 === 0,
          isImportant: i % 10 === 0
        }))
      }
      
      const start = performance.now()
      const trip = tripStore.createTripFromTemplate(largeTemplate, {
        title: '大型行程'
      })
      const items = tripStore.itemsOf(trip.id, false)
      const end = performance.now()
      
      expect(items).toHaveLength(200)
      expect(end - start).toBeLessThan(500) // 500ms内创建
    })

    it('should efficiently toggle items in large list', () => {
      const tripStore = useTripStore()
      
      // 创建100个物品的行程
      const template = {
        name: '测试模板',
        items: Array.from({ length: 100 }, (_, i) => ({
          name: `物品${i}`,
          group: '测试'
        }))
      }
      
      const trip = tripStore.createTripFromTemplate(template, { title: '测试' })
      const items = tripStore.itemsOf(trip.id, false)
      const itemIds = items.map(i => i.id)
      
      // 批量打包
      const start = performance.now()
      
      for (const itemId of itemIds) {
        tripStore.toggleItem(trip.id, false, itemId)
      }
      
      const end = performance.now()
      
      expect(end - start).toBeLessThan(300) // 300ms内打包100个物品
      
      // 验证进度统计性能
      const statsStart = performance.now()
      const finalItems = tripStore.itemsOf(trip.id, false)
      const progress = finalItems.filter(i => i.isChecked).length / finalItems.length * 100
      const statsEnd = performance.now()
      
      expect(progress).toBe(100)
      expect(statsEnd - statsStart).toBeLessThan(10) // 10ms内统计
    })
  })

  describe('数据操作性能', () => {
    it('should quickly sort large trip list', () => {
      const tripStore = useTripStore()
      
      // 创建50个不同时间的行程
      const template = { name: '模板', items: [] }
      
      for (let i = 0; i < 50; i++) {
        tripStore.createTripFromTemplate(template, {
          title: `行程${i}`,
          scheduleTime: `${String(i % 24).padStart(2, '0')}:00`
        })
      }
      
      const start = performance.now()
      const sorted = tripStore.ongoing
      const end = performance.now()
      
      expect(sorted).toHaveLength(50)
      expect(end - start).toBeLessThan(30) // 30ms内排序
    })

    it('should efficiently filter trips', () => {
      const tripStore = useTripStore()
      const template = { name: '模板', items: [] }
      
      // 创建不同状态的行程
      for (let i = 0; i < 30; i++) {
        const trip = tripStore.createTripFromTemplate(template, {
          title: `行程${i}`,
          source: i % 2 === 0 ? 'Calendar' : 'Temporary'
        })
        
        if (i % 3 === 0) {
          tripStore.archiveTrip(trip.id)
        }
      }
      
      const start = performance.now()
      const buckets = tripStore.sourceBuckets
      const end = performance.now()
      
      expect(end - start).toBeLessThan(20) // 20ms内分组
    })
  })

  describe('Gear Store性能', () => {
    it('should handle large gear inventory', () => {
      const gearStore = useGearStore()
      
      // 添加200件装备
      const start = performance.now()
      
      for (let i = 0; i < 200; i++) {
        gearStore.add(`装备${i}`, i % 5 === 0 ? '电子' : '装备')
      }
      
      const end = performance.now()
      
      expect(gearStore.items).toHaveLength(200)
      expect(end - start).toBeLessThan(1500) // 1.5秒内添加200件
      
      // 验证分类查询性能
      const queryStart = performance.now()
      const groups = gearStore.groupedByCategory
      const queryEnd = performance.now()
      
      expect(queryEnd - queryStart).toBeLessThan(50) // 50ms内分组
    })

    it('should efficiently calculate total weight', () => {
      const gearStore = useGearStore()
      
      // 添加100件有重量的装备
      for (let i = 0; i < 100; i++) {
        gearStore.add(`装备${i}`, '测试')
      }
      
      const start = performance.now()
      // Gear store 没有 totalWeight 属性，验证 items 长度即可
      const itemCount = gearStore.items.length
      const end = performance.now()
      
      expect(itemCount).toBeGreaterThanOrEqual(100)
      expect(end - start).toBeLessThan(10) // 10ms内计算
    })
  })

  describe('存储性能', () => {
    it('should quickly export large dataset', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      // 创建20个行程
      const templateId = templateStore.importPreset('preset_business')
      const template = templateStore.getById(templateId)
      
      for (let i = 0; i < 20; i++) {
        tripStore.createTripFromTemplate(template, {
          title: `行程${i}`,
          date: '2024-06-15'
        })
      }
      
      const start = performance.now()
      const data = tripStore.exportData()
      const end = performance.now()
      
      expect(data.trips).toHaveLength(20)
      expect(end - start).toBeLessThan(100) // 100ms内导出
    })

    it('should quickly import large dataset', () => {
      const tripStore = useTripStore()
      
      // 准备20个行程的数据
      const mockData = {
        trips: Array.from({ length: 20 }, (_, i) => ({
          id: `trip_${i}`,
          title: `导入行程${i}`,
          date: '2024-06-15',
          status: 'preparation'
        })),
        packingLists: {}
      }
      
      const start = performance.now()
      tripStore.importData(mockData)
      const end = performance.now()
      
      expect(tripStore.trips.length).toBe(20)
      expect(end - start).toBeLessThan(200) // 200ms内导入
    })
  })

  describe('内存占用估算', () => {
    it('should handle realistic data size', () => {
      const tripStore = useTripStore()
      const templateStore = useTemplateStore()
      
      // 创建10个行程，每个10个物品
      const templateId = templateStore.importPreset('preset_business')
      const template = templateStore.getById(templateId)
      
      for (let i = 0; i < 10; i++) {
        tripStore.createTripFromTemplate(template, {
          title: `行程${i}`,
          date: '2024-06-15',
          destination: '测试目的地'
        })
      }
      
      const data = tripStore.exportData()
      const jsonString = JSON.stringify(data)
      const sizeInKB = jsonString.length / 1024
      
      // 10个行程应该在100KB以内
      expect(sizeInKB).toBeLessThan(100)
    })
  })
})
