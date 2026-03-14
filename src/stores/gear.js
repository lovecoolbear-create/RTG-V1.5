import { defineStore } from 'pinia'

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

const CONSUMABLE_GROUPS = new Set(['个人护理', '补给', '药品'])
const NON_CONSUMABLE_GROUPS = new Set(['证件', '电子'])
const CONSUMABLE_KEYWORDS = ['纸巾', '湿巾', '防晒', '洗漱', '牙刷', '牙膏', '面膜', '药', '创可贴', '零食']
const NON_CONSUMABLE_KEYWORDS = ['身份证', '护照', '电脑', '笔记本电脑', '充电器', '相机', '钥匙', '钱包']

function inferConsumable(name, group) {
  const n = String(name || '').trim()
  const g = String(group || '').trim() || '其他'
  if (NON_CONSUMABLE_GROUPS.has(g)) return false
  if (CONSUMABLE_GROUPS.has(g)) return true
  if (NON_CONSUMABLE_KEYWORDS.some((kw) => n.includes(kw))) return false
  if (CONSUMABLE_KEYWORDS.some((kw) => n.includes(kw))) return true
  return false
}

function normalizeItem(item) {
  return {
    id: item.id || uid(),
    name: item.name || '未命名装备',
    group: item.group || '其他',
    isConsumable: !!item.isConsumable,
    isImportant: !!item.isImportant,
  }
}

const DEFAULTS = [
  { id: uid(), name: '身份证', group: '证件', isConsumable: false },
  { id: uid(), name: '笔记本电脑', group: '电子', isConsumable: false },
  { id: uid(), name: '充电器+适配器', group: '电子', isConsumable: false },
  { id: uid(), name: '防晒霜', group: '个人护理', isConsumable: true, isImportant: false },
]
const DEFAULT_BAGS = [
  { id: uid(), name: '行李箱' },
  { id: uid(), name: '单肩包' },
  { id: uid(), name: '双肩包' },
  { id: uid(), name: '化妆包' },
  { id: uid(), name: '钱包' },
]

export const useGearStore = defineStore('gear', {
  state: () => ({
    items: get('gear', DEFAULTS).map(normalizeItem),
    bags: get('gear_bags', DEFAULT_BAGS),
  }),
  actions: {
    save() {
      set('gear', this.items)
      set('gear_bags', this.bags)
    },
    inferConsumable(name, group = '其他') {
      return inferConsumable(name, group)
    },
    add(name, group = '其他', options = {}) {
      const normalizedName = String(name || '').trim()
      const normalizedGroup = String(group || '').trim() || '其他'
      if (!normalizedName) return null
      let payload = options
      if (typeof options === 'boolean') payload = { isConsumable: options }
      const hasConsumable = Object.prototype.hasOwnProperty.call(payload, 'isConsumable')
      const next = normalizeItem({
        id: uid(),
        name: normalizedName,
        group: normalizedGroup,
        isConsumable: hasConsumable ? !!payload.isConsumable : inferConsumable(normalizedName, normalizedGroup),
        isImportant: !!payload.isImportant,
      })
      this.items.unshift(next)
      this.save()
      return next
    },
    remove(id) {
      this.items = this.items.filter((i) => i.id !== id)
      this.save()
    },
    toggleConsumable(id) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx >= 0) {
        this.items[idx].isConsumable = !this.items[idx].isConsumable
        this.save()
      }
    },
    setConsumable(id, isConsumable) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx >= 0) {
        this.items[idx].isConsumable = !!isConsumable
        this.save()
      }
    },
    toggleImportant(id) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx >= 0) {
        this.items[idx].isImportant = !this.items[idx].isImportant
        this.save()
      }
    },
    updateItem(id, payload = {}) {
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx < 0) return null
      const nextName = String(payload.name ?? this.items[idx].name).trim()
      const nextGroup = String(payload.group ?? this.items[idx].group).trim() || '其他'
      if (!nextName) return null
      this.items[idx] = {
        ...this.items[idx],
        name: nextName,
        group: nextGroup,
      }
      this.save()
      return this.items[idx]
    },
    addBag(name) {
      const val = String(name || '').trim()
      if (!val) return null
      if (this.bags.some((b) => b.name === val)) return null
      const bag = { id: uid(), name: val }
      this.bags.unshift(bag)
      this.save()
      return bag
    },
    removeBag(id) {
      this.bags = this.bags.filter((b) => b.id !== id)
      this.save()
    },
    exportData() {
      return {
        items: this.items,
        bags: this.bags,
      }
    },
    importData(data) {
      if (Array.isArray(data)) {
        this.items = data.map(normalizeItem)
        if (!this.bags?.length) this.bags = DEFAULT_BAGS
        this.save()
        return
      }
      if (data && typeof data === 'object') {
        if (Array.isArray(data.items)) this.items = data.items.map(normalizeItem)
        if (Array.isArray(data.bags)) this.bags = data.bags
        if (!this.bags?.length) this.bags = DEFAULT_BAGS
        this.save()
      }
    }
  },
})
