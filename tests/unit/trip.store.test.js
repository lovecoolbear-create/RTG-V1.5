import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../../src/stores/trip.js'
import '../../tests/mocks/uni.js'

describe('Trip Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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
      expect(trip.status).toBe('preparation')
      
      // 验证物品存储在单独的key中
      const items = store.itemsOf(trip.id, false)
      expect(items).toHaveLength(2)
    })

    it('should find trip by id', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, {
        title: '行程A',
        date: '2024-01-15'
      })
      
      const found = store.trips.find(t => t.id === trip.id)
      expect(found).toBeDefined()
      expect(found.title).toBe('行程A')
    })

    it('should delete trip', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.deleteTrip(trip.id)
      
      const found = store.trips.find(t => t.id === trip.id)
      expect(found).toBeUndefined()
    })
  })

  describe('行程状态管理', () => {
    it('should update trip status via updateTripMeta', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.updateTripMeta(trip.id, { status: 'packing' })
      
      const updated = store.trips.find(t => t.id === trip.id)
      expect(updated.status).toBe('packing')
    })

    it('should use beginPacking to start packing', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.beginPacking(trip.id)
      
      const updated = store.trips.find(t => t.id === trip.id)
      expect(updated.status).toBe('packing')
    })

    it('should mark trip as packed', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.markPacked(trip.id)
      
      const updated = store.trips.find(t => t.id === trip.id)
      expect(updated.status).toBe('packed')
    })

    it('should archive completed trip', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      store.archiveTrip(trip.id)
      
      const updated = store.trips.find(t => t.id === trip.id)
      expect(updated.status).toBe('archived')
    })
  })

  describe('物品管理', () => {
    it('should toggle item checked status', () => {
      const store = useTripStore()
      const template = {
        name: '模板',
        items: [{ name: '物品1', group: '测试' }]
      }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      const items = store.itemsOf(trip.id, false)
      const itemId = items[0].id
      
      store.toggleItem(trip.id, false, itemId)
      
      const updatedItems = store.itemsOf(trip.id, false)
      expect(updatedItems[0].isChecked).toBe(true)
    })

    it('should calculate progress manually', () => {
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
      const itemIds = store.itemsOf(trip.id, false).map(i => i.id)
      
      // 打包2个物品
      store.toggleItem(trip.id, false, itemIds[0])
      store.toggleItem(trip.id, false, itemIds[1])
      
      const items = store.itemsOf(trip.id, false)
      const packed = items.filter(i => i.isChecked).length
      const total = items.length
      
      expect(total).toBe(3)
      expect(packed).toBe(2)
    })
  })

  describe('筛选和排序', () => {
    it('should filter ongoing trips via computed property', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [] }
      
      // 创建3个行程，不同状态
      const trip1 = store.createTripFromTemplate(template, { title: '进行中' })
      const trip2 = store.createTripFromTemplate(template, { title: '归档的' })
      const trip3 = store.createTripFromTemplate(template, { title: '返程中' })
      
      store.archiveTrip(trip2.id)
      store.startReturnIfNeeded(trip3.id)
      
      // ongoing 计算属性排除 archived
      const ongoing = store.ongoing
      expect(ongoing.length).toBeGreaterThanOrEqual(1)
      expect(ongoing.some(t => t.title === '进行中')).toBe(true)
    })

    it('should have source buckets computed property', () => {
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
      expect(buckets).toBeDefined()
      expect(buckets.all).toBeDefined()
    })
  })

  describe('数据导入导出', () => {
    it('should export data with packing lists', () => {
      const store = useTripStore()
      const template = { name: '模板', items: [{ name: '物品', group: '测试' }] }
      
      const trip = store.createTripFromTemplate(template, { title: '测试' })
      
      const data = store.exportData()
      
      expect(data.trips).toBeDefined()
      expect(data.packingLists).toBeDefined()
      expect(data.trips.length).toBeGreaterThan(0)
    })

    it('should import data', () => {
      const store = useTripStore()
      const mockData = {
        trips: [
          { id: 'test1', title: '导入行程', status: 'preparation', returnCompleted: false }
        ],
        packingLists: {}
      }
      
      store.importData(mockData)
      
      expect(store.trips.length).toBe(1)
      expect(store.trips[0].title).toBe('导入行程')
    })
  })
})
