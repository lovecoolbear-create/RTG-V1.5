import { defineStore } from 'pinia'
import { PRESET_TEMPLATES, generateUserTemplate, getTemplatesByCategory, TEMPLATE_CATEGORIES } from './preset-templates.js'

function get(key, def) {
  try {
    const raw = uni.getStorageSync(key)
    return raw ? JSON.parse(raw) : def
  } catch {
    return def
  }
}

function set(key, val) {
  try {
    uni.setStorageSync(key, JSON.stringify(val))
  } catch {}
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 获取已导入的预设模板ID列表
const IMPORTED_PRESETS_KEY = 'rtg_imported_presets'

function getImportedPresets() {
  return get(IMPORTED_PRESETS_KEY, [])
}

function markPresetImported(presetId) {
  const imported = getImportedPresets()
  if (!imported.includes(presetId)) {
    imported.push(presetId)
    set(IMPORTED_PRESETS_KEY, imported)
  }
}

const DEFAULTS = [
  {
    id: uid(),
    name: '商务出差',
    category: 'business',
    reminderRules: ['id-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件' },
      { id: uid(), name: '笔记本电脑', group: '电子' },
      { id: uid(), name: '充电器+适配器', group: '电子' },
      { id: uid(), name: '商务衬衫/正装', group: '服装' },
    ],
  },
  {
    id: uid(),
    name: '户外滑雪',
    category: 'outdoor',
    reminderRules: ['id-check', 'medicine-check', 'power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件' },
      { id: uid(), name: '雪镜', group: '装备' },
      { id: uid(), name: '保暖手套', group: '服装' },
      { id: uid(), name: '护膝护具', group: '安全' },
      { id: uid(), name: '移动电源', group: '电子' },
    ],
  },
  {
    id: uid(),
    name: '户外徒步',
    category: 'outdoor',
    reminderRules: ['id-check', 'medicine-check', 'power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件' },
      { id: uid(), name: '徒步鞋', group: '装备' },
      { id: uid(), name: '冲锋衣', group: '服装' },
      { id: uid(), name: '应急药品', group: '安全' },
      { id: uid(), name: '头灯', group: '电子' },
    ],
  },
  {
    id: uid(),
    name: '户外骑行',
    category: 'outdoor',
    reminderRules: ['id-check', 'medicine-check', 'power-check'],
    items: [
      { id: uid(), name: '身份证', group: '证件' },
      { id: uid(), name: '头盔', group: '安全' },
      { id: uid(), name: '骑行手套', group: '装备' },
      { id: uid(), name: '补水壶', group: '补给' },
      { id: uid(), name: '车灯与充电线', group: '电子' },
    ],
  },
  {
    id: uid(),
    name: '短途度假',
    category: 'general',
    reminderRules: [],
    items: [
      { id: uid(), name: '身份证', group: '证件' },
      { id: uid(), name: '防晒霜', group: '个人护理' },
      { id: uid(), name: '泳衣/拖鞋', group: '服装' },
      { id: uid(), name: '充电宝', group: '电子' },
    ],
  },
]

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    templates: get('templates', DEFAULTS),
  }),
  actions: {
    save() {
      set('templates', this.templates)
    },
    addTemplate(name) {
      const t = { id: uid(), name, category: 'general', reminderRules: [], items: [] }
      this.templates.unshift(t)
      this.save()
      return t
    },
    removeTemplate(id) {
      this.templates = this.templates.filter((t) => t.id !== id)
      this.save()
    },
    renameTemplate(id, name) {
      const idx = this.templates.findIndex((t) => t.id === id)
      if (idx >= 0) {
        this.templates[idx].name = name
        this.save()
      }
    },
    updateTemplate(id, payload = {}) {
      const idx = this.templates.findIndex((t) => t.id === id)
      if (idx < 0) return
      this.templates[idx] = {
        ...this.templates[idx],
        ...payload,
      }
      this.save()
    },
    addItem(id, item) {
      const idx = this.templates.findIndex((t) => t.id === id)
      if (idx >= 0) {
        this.templates[idx].items.push({
          id: uid(),
          name: item.name,
          group: item.group || '其他',
          isConsumable: !!item.isConsumable,
          isImportant: !!item.isImportant,
        })
        this.save()
      }
    },
    removeItem(id, itemId) {
      const idx = this.templates.findIndex((t) => t.id === id)
      if (idx >= 0) {
        this.templates[idx].items = this.templates[idx].items.filter((i) => i.id !== itemId)
        this.save()
      }
    },
    getById(id) {
      return this.templates.find((t) => t.id === id)
    },
    exportData() {
      return this.templates
    },
    importData(data) {
      if (Array.isArray(data)) {
        this.templates = data
        this.save()
      }
    },
    // 从预设库导入模板
    importPreset(presetId) {
      const preset = PRESET_TEMPLATES.find(p => p.id === presetId)
      if (!preset) return null
      
      // 检查是否已导入
      const imported = getImportedPresets()
      if (imported.includes(presetId)) {
        // 已导入过，查找现有模板
        const existing = this.templates.find(t => t.presetId === presetId)
        return existing?.id || null
      }
      
      // 生成用户模板
      const userTemplate = generateUserTemplate(preset)
      this.templates.unshift(userTemplate)
      this.save()
      
      // 标记为已导入
      markPresetImported(presetId)
      
      return userTemplate.id
    },
    
    // 批量导入预设模板
    importPresets(presetIds) {
      const results = []
      presetIds.forEach(id => {
        const templateId = this.importPreset(id)
        if (templateId) {
          results.push({ presetId: id, templateId })
        }
      })
      return results
    },
    
    // 自动导入常用预设模板（首次使用）
    autoImportCommonPresets() {
      const commonPresets = [
        'preset_business',    // 商务出差
        'preset_daily',       // 日常通勤
        'preset_short_trip'  // 短途旅行
      ]
      return this.importPresets(commonPresets)
    },
    
    // 一键导入全部预设模板
    importAllPresets() {
      const allPresetIds = PRESET_TEMPLATES.map(p => p.id)
      return this.importPresets(allPresetIds)
    },
    
    // 获取预设模板库（带导入状态）
    getPresetLibrary(category = 'all') {
      const templates = getTemplatesByCategory(category)
      const imported = getImportedPresets()
      
      return templates.map(t => ({
        ...t,
        isImported: imported.includes(t.id)
      }))
    },
    
    // 获取模板分类
    getCategories() {
      return TEMPLATE_CATEGORIES
    }
  }
})
