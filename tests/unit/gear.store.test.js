import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGearStore } from '../../src/stores/gear.js'
import '../../tests/mocks/uni.js'

describe('Gear Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
  })

  describe('装备管理', () => {
    it('should add gear item', () => {
      const store = useGearStore()
      
      const item = store.addItem({
        name: '测试装备',
        category: '电子',
        weight: 500,
        quantity: 2
      })
      
      expect(item).toBeDefined()
      expect(item.name).toBe('测试装备')
      expect(item.category).toBe('电子')
      expect(item.weight).toBe(500)
      expect(store.items).toHaveLength(1)
    })

    it('should remove gear item', () => {
      const store = useGearStore()
      const item = store.addItem({
        name: '待删除',
        category: '装备'
      })
      
      store.removeItem(item.id)
      
      expect(store.items).toHaveLength(0)
    })

    it('should update gear item', () => {
      const store = useGearStore()
      const item = store.addItem({
        name: '旧名称',
        category: '测试',
        weight: 100
      })
      
      store.updateItem(item.id, {
        name: '新名称',
        weight: 200
      })
      
      const updated = store.items[0]
      expect(updated.name).toBe('新名称')
      expect(updated.weight).toBe(200)
    })
  })

  describe('装备分类', () => {
    it('should group by category', () => {
      const store = useGearStore()
      
      store.addItem({ name: '物品1', category: '电子' })
      store.addItem({ name: '物品2', category: '电子' })
      store.addItem({ name: '物品3', category: '服装' })
      
      const groups = store.groupedByCategory
      expect(Object.keys(groups)).toHaveLength(2)
      expect(groups['电子']).toHaveLength(2)
      expect(groups['服装']).toHaveLength(1)
    })

    it('should get categories', () => {
      const store = useGearStore()
      
      store.addItem({ name: '物品1', category: '电子' })
      store.addItem({ name: '物品2', category: '服装' })
      store.addItem({ name: '物品3', category: '电子' })
      
      const categories = store.categories
      expect(categories).toContain('电子')
      expect(categories).toContain('服装')
    })
  })

  describe('重量统计', () => {
    it('should calculate total weight', () => {
      const store = useGearStore()
      
      store.addItem({ name: '重物品', weight: 1000, quantity: 1 })
      store.addItem({ name: '轻物品', weight: 200, quantity: 2 })
      
      expect(store.totalWeight).toBe(1400) // 1000 + 200*2
    })

    it('should calculate weight by category', () => {
      const store = useGearStore()
      
      store.addItem({ name: '电子设备1', category: '电子', weight: 500 })
      store.addItem({ name: '电子设备2', category: '电子', weight: 300 })
      store.addItem({ name: '服装1', category: '服装', weight: 200 })
      
      const weightByCategory = store.weightByCategory
      expect(weightByCategory['电子']).toBe(800)
      expect(weightByCategory['服装']).toBe(200)
    })
  })

  describe('搜索和筛选', () => {
    it('should search gear items', () => {
      const store = useGearStore()
      
      store.addItem({ name: '苹果手机', category: '电子' })
      store.addItem({ name: '苹果电脑', category: '电子' })
      store.addItem({ name: '充电器', category: '电子' })
      
      const results = store.search('苹果')
      expect(results).toHaveLength(2)
    })

    it('should filter by category', () => {
      const store = useGearStore()
      
      store.addItem({ name: '物品1', category: '电子' })
      store.addItem({ name: '物品2', category: '服装' })
      store.addItem({ name: '物品3', category: '电子' })
      
      const filtered = store.getByCategory('电子')
      expect(filtered).toHaveLength(2)
    })
  })

  describe('数据导入导出', () => {
    it('should export gear data', () => {
      const store = useGearStore()
      store.addItem({ name: '装备1', category: '测试' })
      store.addItem({ name: '装备2', category: '测试' })
      
      const data = store.exportData()
      
      expect(data).toHaveLength(2)
      expect(data[0].name).toBeDefined()
    })

    it('should import gear data', () => {
      const store = useGearStore()
      const mockData = [
        { id: 'g1', name: '导入装备1', category: '测试' },
        { id: 'g2', name: '导入装备2', category: '测试' }
      ]
      
      store.importData(mockData)
      
      expect(store.items).toHaveLength(2)
    })
  })
})
