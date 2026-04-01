import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../../src/stores/trip.js'
import '../../tests/mocks/uni.js'

describe('Trip Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 清理存储
    uni.clearStorageSync()
  })

  describe('基本操作', () => {
    it('should create a trip', () => {
      const store = useTripStore()
      const template = {
        name: '测试模板',
        items: [
          { name: '物品1', group: '测试' },
          { name: '物品2', group: '测试' }
        ]
      }
      
      const trip = store.createTripFromTemplate(template, {
        title: '测试行程',
        date: '2024-01-15'
      })
      
      expect(trip).toBeDefined()
      expect(trip.title).toBe('测试行程')
      expect(trip.date).toBe('2024-01-15')
      expect(trip.items).toHaveLength(2)
      expect(trip.status).toBe('preparation')
    })

    it('should add and retrieve trip', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, {
        title: '行程A',
        date: '2024-01-15'
      })
      
      const found = store.getTripById(trip.id)
      expect(found).toBeDefined()
      expect(found.title).toBe('行程A')
    })

    it('should delete trip', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.deleteTrip(trip.id)
      
      const found = store.getTripById(trip.id)
      expect(found).toBeUndefined()
    })
  })

  describe('行程状态管理', () => {
    it('should update trip status', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.setTripStatus(trip.id, 'packing')
      
      const updated = store.getTripById(trip.id)
      expect(updated.status).toBe('packing')
    })

    it('should archive completed trip', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.setTripStatus(trip.id, 'returnPhase')
      store.completeReturn(trip.id)
      
      const updated = store.getTripById(trip.id)
      expect(updated.status).toBe('archived')
      expect(updated.returnCompleted).toBe(true)
    })
  })

  describe('物品管理', () => {
    it('should toggle item packed status', () => {
      const store = useTripStore()
      const template = {
        name: '模板',
        items: [{ name: '物品1', group: '测试' }]
      }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      const itemId = trip.items[0].id
      
      store.toggleItemPacked(trip.id, false, itemId)
      
      const list = store.itemsOf(trip.id, false)
      expect(list[0].packed).toBe(true)
    })

    it('should calculate progress', () => {
      const store = useTripStore()
      const template = {
        name: '模板',
        items: [
          { name: '物品1', group: '测试' },
          { name: '物品2', group: '测试' },
          { name: '物品3', group: '测试' }
        ]
      }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      const itemIds = trip.items.map(i => i.id)
      
      // 打包2个物品
      store.toggleItemPacked(trip.id, false, itemIds[0])
      store.toggleItemPacked(trip.id, false, itemIds[1])
      
      const stats = store.packingStats(trip.id)
      expect(stats.total).toBe(3)
      expect(stats.packed).toBe(2)
      expect(stats.progress).toBeCloseTo(66.67, 1)
    })
  })

  describe('筛选和排序', () => {
    it('should filter ongoing trips', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      // 创建3个行程，不同状态
      const trip1 = store.createTripFromTemplate(template, { title: '进行中' })
      const trip2 = store.createTripFromTemplate(template, { title: '归档的' })
      const trip3 = store.createTripFromTemplate(template, { title: '返程中' })
      
      store.setTripStatus(trip2.id, 'archived')
      store.setTripStatus(trip3.id, 'returnPhase')
      store.completeReturn(trip3.id)
      
      const ongoing = store.ongoing
      expect(ongoing).toHaveLength(1)
      expect(ongoing[0].title).toBe('进行中')
    })

    it('should sort by schedule time', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip1 = store.createTripFromTemplate(template, { 
        title: '下午',
        scheduleTime: '14:00'
      })
      const trip2 = store.createTripFromTemplate(template, { 
        title: '早上',
        scheduleTime: '08:00'
      })
      const trip3 = store.createTripFromTemplate(template, { 
        title: '晚上',
        scheduleTime: '20:00'
      })
      
      const ongoing = store.ongoing
      expect(ongoing[0].title).toBe('早上')
      expect(ongoing[1].title).toBe('下午')
      expect(ongoing[2].title).toBe('晚上')
    })
  })

  describe('数据源分组', () => {
    it('should categorize by source', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      store.createTripFromTemplate(template, { 
        title: '日历行程',
        source: 'Calendar'
      })
      store.createTripFromTemplate(template, { 
        title: '临时行程',
        source: 'Temporary'
      })
      
      const buckets = store.sourceBuckets
      expect(buckets.calendar).toHaveLength(1)
      expect(buckets.temporary).toHaveLength(1)
    })
  })
})
