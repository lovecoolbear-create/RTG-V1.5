import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTemplateStore } from '../../src/stores/templates.js'
import '../../tests/mocks/uni.js'

describe('Template Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
    // 清除预设模板导入记录
    uni.setStorageSync('rtg_imported_presets', JSON.stringify([]))
  })

  describe('基本CRUD', () => {
    it('should create template', () => {
      const store = useTemplateStore()
      
      const template = store.addTemplate('测试模板')
      
      expect(template).toBeDefined()
      expect(template.name).toBe('测试模板')
      expect(template.items).toHaveLength(0)
      expect(store.templates.length).toBeGreaterThan(0)
    })

    it('should find template by id', () => {
      const store = useTemplateStore()
      const created = store.addTemplate('测试')
      
      const found = store.templates.find(t => t.id === created.id)
      expect(found).toBeDefined()
      expect(found.name).toBe('测试')
    })

    it('should rename template', () => {
      const store = useTemplateStore()
      const template = store.addTemplate('旧名称')
      
      store.renameTemplate(template.id, '新名称')
      
      const updated = store.templates.find(t => t.id === template.id)
      expect(updated.name).toBe('新名称')
    })

    it('should remove template', () => {
      const store = useTemplateStore()
      const template = store.addTemplate('待删除')
      
      store.removeTemplate(template.id)
      
      const found = store.templates.find(t => t.id === template.id)
      expect(found).toBeUndefined()
    })
  })

  describe('模板物品管理', () => {
    it('should add item to template', () => {
      const store = useTemplateStore()
      const template = store.addTemplate('测试')
      
      store.addItem(template.id, {
        name: '新物品',
        group: '测试组',
        isConsumable: true
      })
      
      const updated = store.templates.find(t => t.id === template.id)
      expect(updated.items).toHaveLength(1)
      expect(updated.items[0].name).toBe('新物品')
      expect(updated.items[0].isConsumable).toBe(true)
    })

    it('should remove item from template', () => {
      const store = useTemplateStore()
      const template = store.addTemplate('测试')
      
      store.addItem(template.id, { name: '物品1', group: '测试' })
      
      const itemId = template.items[0].id
      store.removeItem(template.id, itemId)
      
      const updated = store.templates.find(t => t.id === template.id)
      expect(updated.items).toHaveLength(0)
    })
  })

  describe('预设模板导入', () => {
    it('should import preset template', () => {
      const store = useTemplateStore()
      
      const templateId = store.importPreset('preset_camping')
      
      expect(templateId).toBeDefined()
      
      const template = store.templates.find(t => t.presetId === 'preset_camping')
      expect(template).toBeDefined()
      expect(template.name).toBe('露营野餐')
    })

    it('should not import same preset twice', () => {
      const store = useTemplateStore()
      
      // 清除所有模板，确保干净的测试环境
      store.templates = []
      uni.setStorageSync('rtg_templates', JSON.stringify([]))
      
      const id1 = store.importPreset('preset_camping')
      const id2 = store.importPreset('preset_camping')
      
      expect(id1).toBe(id2)
      const count = store.templates.filter(t => t.presetId === 'preset_camping').length
      expect(count).toBe(1)
    })

    it('should batch import presets', () => {
      const store = useTemplateStore()
      
      const results = store.importPresets([
        'preset_camping',
        'preset_business',
        'preset_mountain'
      ])
      
      expect(results).toHaveLength(3)
      
      const importedCount = store.templates.filter(t => t.source === 'preset').length
      expect(importedCount).toBeGreaterThanOrEqual(3)
    })
  })

  describe('预设库查询', () => {
    it('should get preset library with import status', () => {
      const store = useTemplateStore()
      
      // 先导入一个
      store.importPreset('preset_camping')
      
      const library = store.getPresetLibrary('all')
      const campingTemplate = library.find(t => t.id === 'preset_camping')
      
      expect(campingTemplate.isImported).toBe(true)
    })

    it('should filter presets by category', () => {
      const store = useTemplateStore()
      
      const outdoorTemplates = store.getPresetLibrary('outdoor')
      expect(outdoorTemplates.length).toBeGreaterThan(0)
      expect(outdoorTemplates.every(t => t.category === 'outdoor')).toBe(true)
    })

    it('should get all categories', () => {
      const store = useTemplateStore()
      
      const categories = store.getCategories()
      expect(categories.length).toBeGreaterThanOrEqual(6)
      expect(categories[0].id).toBe('all')
    })
  })

  describe('数据导入导出', () => {
    it('should export template data', () => {
      const store = useTemplateStore()
      store.addTemplate('模板1')
      store.addTemplate('模板2')
      
      const data = store.exportData()
      
      expect(data.length).toBeGreaterThanOrEqual(2)
    })

    it('should import template data', () => {
      const store = useTemplateStore()
      const mockData = [
        { id: 'test1', name: '导入模板1', items: [] },
        { id: 'test2', name: '导入模板2', items: [] }
      ]
      
      store.importData(mockData)
      
      const count = store.templates.filter(t => t.id === 'test1' || t.id === 'test2').length
      expect(count).toBe(2)
    })
  })
})
