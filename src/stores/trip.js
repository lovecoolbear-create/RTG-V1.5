import { defineStore } from 'pinia'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

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
function del(key) {
  try {
    uni.removeStorageSync(key)
  } catch {}
}

function packingKey(id, isReturn) {
  return (isReturn ? 'PackingList_Return_' : 'PackingList_') + id
}

function normalizeDate(raw) {
  const value = String(raw || '').trim()
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return ''
  return `${match[1]}-${match[2]}-${match[3]}`
}

function normalizeScheduleTime(raw) {
  const value = String(raw || '').trim()
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return ''
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`
}

function scheduleRank(trip) {
  const time = normalizeScheduleTime(trip?.scheduleTime)
  if (!time) return Number.MAX_SAFE_INTEGER
  const [h, m] = time.split(':').map((n) => Number(n))
  return h * 60 + m
}

function extractDateFromTime(raw) {
  const value = String(raw || '').trim()
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

const DEFAULT_TEMPLATE = {
  name: '商务出差',
  items: [
    { name: '身份证', group: '证件' },
    { name: '笔记本电脑', group: '电子' },
    { name: '充电器', group: '电子' },
  ],
}

export const useTripStore = defineStore('trip', {
  state: () => ({
    trips: get('trips', []),
  }),
  getters: {
    ongoing(state) {
      return state.trips
        .filter((t) => {
        if (t.status === 'archived') return false
        if (t.status === 'returnPhase') return !t.returnCompleted
        return true
      })
        .slice()
        .sort((a, b) => scheduleRank(a) - scheduleRank(b))
    },
    toArchive(state) {
      return state.trips
        .filter((t) => t.status === 'returnPhase' && !!t.returnCompleted)
        .slice()
        .sort((a, b) => scheduleRank(a) - scheduleRank(b))
    },
    sourceBuckets(state) {
      const list = state.trips.filter((t) => t.status !== 'archived')
      const map = {
        all: list,
        calendar: [],
        temporary: [],
      }
      for (const t of list) {
        const src = (t.source || '').toLowerCase()
        if (src === 'calendar' || src === '日历') {
          map.calendar.push(t)
        } else {
          map.temporary.push(t)
        }
      }
      return map
    },
  },
  actions: {
    saveTrips() {
      set('trips', this.trips)
      // 自动备份（保留最近10个版本）
      this.autoBackup()
    },
    autoBackup() {
      try {
        const backup = {
          timestamp: Date.now(),
          trips: this.trips,
          date: new Date().toISOString()
        }
        
        // 获取现有备份
        let backups = get('rtg_auto_backups', [])
        
        // 添加新备份到开头
        backups.unshift(backup)
        
        // 保留最近10个版本
        if (backups.length > 10) {
          backups = backups.slice(0, 10)
        }
        
        set('rtg_auto_backups', backups)
      } catch (e) {
        console.error('Auto backup failed:', e)
      }
    },
    getAutoBackups() {
      return get('rtg_auto_backups', [])
    },
    restoreFromBackup(index) {
      const backups = this.getAutoBackups()
      if (index >= 0 && index < backups.length) {
        const backup = backups[index]
        this.trips = backup.trips
        this.saveTrips()
        return true
      }
      return false
    },
    progress(trip) {
      if (trip.status === 'archived') return 1
      const isReturn = trip.status === 'returnPhase'
      const key = packingKey(trip.id, isReturn)
      const items = get(key, [])
      if (!items.length) return 0
      const total = isReturn ? items.filter((i) => !i.isConsumable).length : items.length
      if (total === 0) return 1
      const checked = items.filter((i) => i.isChecked && (isReturn ? !i.isConsumable : true)).length
      return Math.min(1, checked / total)
    },
    createTemporaryTrip(title) {
      const id = uid()
      const trip = {
        id,
        title: title || '临时行程',
        time: '立即出发',
        date: '',
        scheduleTime: '',
        location: '未设置',
        destination: '',
        keyTime: '',
        idType: '',
        templateId: '',
        templateCategory: 'general',
        source: 'Temporary',
        status: 'preparation',
        tripBags: [],
        returnCompleted: false,
      }
      this.trips.unshift(trip)
      this.saveTrips()
      set(packingKey(id, false), [])
      return trip
    },
    createCalendarTrip(title) {
      const id = uid()
      const trip = {
        id,
        title: title || '日历行程',
        time: '来自日历',
        date: '',
        scheduleTime: '',
        location: '未设置',
        destination: '',
        keyTime: '',
        idType: '',
        templateId: '',
        templateCategory: 'general',
        source: 'Calendar',
        status: 'preparation',
        tripBags: [],
        returnCompleted: false,
      }
      this.trips.unshift(trip)
      this.saveTrips()
      set(packingKey(id, false), [])
      return trip
    },
    createTripFromTemplate(tpl = DEFAULT_TEMPLATE, options = {}) {
      const id = uid()
      const src = options.source === 'Calendar' ? 'Calendar' : 'Temporary'
      const defaultTitle = options.title?.trim() || tpl.name
      const date = normalizeDate(options.date || extractDateFromTime(options.time))
      const scheduleTime = normalizeScheduleTime(options.scheduleTime || options.time)
      const defaultTime = date ? `${date}${scheduleTime ? ` ${scheduleTime}` : ''}` : options.time?.trim() || '立即出发'
      const trip = {
        id,
        title: defaultTitle,
        time: defaultTime,
        date,
        scheduleTime,
        location: options.location?.trim() || options.destination?.trim() || '未设置',
        destination: options.destination?.trim() || '',
        keyTime: options.keyTime?.trim() || '',
        idType: options.idType?.trim() || '',
        templateId: options.templateId || tpl.id || '',
        templateCategory: options.templateCategory || tpl.category || 'general',
        source: src,
        status: 'preparation',
        tripBags: [],
        returnCompleted: false,
      }
      this.trips.unshift(trip)
      this.saveTrips()
      const base = tpl.items.map((i) => ({
        id: uid(),
        name: i.name,
        group: i.group || '其他',
        isChecked: false,
        isConsumable: !!i.isConsumable,
        isImportant: !!i.isImportant,
        weight: i.weight || null,
        quantity: i.quantity || 1,
        bagId: '',
      }))
      set(packingKey(id, false), base)
      return trip
    },
    updateTripMeta(tripId, payload) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx < 0) return
      this.trips[idx] = {
        ...this.trips[idx],
        ...payload,
      }
      this.saveTrips()
    },
    markPacked(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx >= 0) {
        this.trips[idx].status = 'packed'
        this.saveTrips()
      }
    },
    beginPacking(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx >= 0 && this.trips[idx].status === 'preparation') {
        this.trips[idx].status = 'packing'
        this.saveTrips()
      }
    },
    startReturnIfNeeded(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx < 0) return
      const trip = this.trips[idx]
      const dep = get(packingKey(tripId, false), [])
      const retKey = packingKey(tripId, true)
      if (!get(retKey, null)) {
        const cloned = dep.map((i) => ({ ...i, id: uid(), isChecked: false }))
        set(retKey, cloned)
      }
      this.trips[idx].status = 'returnPhase'
      this.trips[idx].returnCompleted = false
      this.saveTrips()
    },
    toggleItem(tripId, isReturn, itemId) {
      const key = packingKey(tripId, isReturn)
      const items = get(key, [])
      const idx = items.findIndex((i) => i.id === itemId)
      if (idx >= 0) {
        items[idx].isChecked = !items[idx].isChecked
        set(key, items)
      }
    },
    finishDepartureCheck(tripId) {
      this.markPacked(tripId)
    },
    finishReturnCheck(tripId) {
      const key = packingKey(tripId, true)
      let items = get(key, [])
      items = items.filter((i) => i.isChecked)
      set(key, items)
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx >= 0) {
        this.trips[idx].status = 'returnPhase'
        this.trips[idx].returnCompleted = true
        this.saveTrips()
      }
    },
    depart(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx >= 0) {
        this.trips[idx].status = 'departed'
        this.trips[idx].returnCompleted = false
        this.saveTrips()
      }
    },
    updateItemMeta(tripId, isReturn, itemId, payload = {}) {
      const key = packingKey(tripId, isReturn)
      const cur = get(key, [])
      const idx = cur.findIndex((i) => i.id === itemId)
      if (idx < 0) return
      const next = { ...cur[idx] }
      if (Object.prototype.hasOwnProperty.call(payload, 'quantity')) {
        const qty = Number(payload.quantity)
        next.quantity = Number.isFinite(qty) && qty > 0 ? Math.round(qty) : 1
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'weight')) {
        const val = payload.weight
        if (val === null || val === '' || typeof val === 'undefined') {
          next.weight = null
        } else {
          const num = Number(val)
          next.weight = Number.isFinite(num) && num >= 0 ? num : null
        }
      }
      cur[idx] = next
      set(key, cur)
    },
    addItemsToTrip(tripId, isReturn, items) {
      const key = packingKey(tripId, isReturn)
      const cur = get(key, [])
      const exists = new Set(cur.map((i) => `${i.name}|${i.group || '其他'}`))
      for (const it of items) {
        const k = `${it.name}|${it.group || '其他'}`
        if (!exists.has(k)) {
          cur.push({
            id: uid(),
            name: it.name,
            group: it.group || '其他',
            isConsumable: !!it.isConsumable,
            isImportant: !!it.isImportant,
            isChecked: false,
            weight: null,
            quantity: 1,
            bagId: '',
          })
        }
      }
      set(key, cur)
    },
    addCustomItemToTrip(tripId, isReturn, payload) {
      const key = packingKey(tripId, isReturn)
      const cur = get(key, [])
      cur.push({
        id: uid(),
        name: payload.name,
        group: payload.group || '其他',
        isConsumable: !!payload.isConsumable,
        isImportant: !!payload.isImportant,
        isChecked: false,
        weight: null,
        quantity: 1,
        bagId: '',
      })
      set(key, cur)
    },
    setTripBags(tripId, bagIds = []) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx < 0) return
      const normalized = Array.from(new Set((bagIds || []).filter(Boolean)))
      this.trips[idx].tripBags = normalized
      this.saveTrips()
      const depKey = packingKey(tripId, false)
      const retKey = packingKey(tripId, true)
      const dep = get(depKey, [])
      set(
        depKey,
        dep.map((item) => (item.bagId && !normalized.includes(item.bagId) ? { ...item, bagId: '' } : item)),
      )
      const ret = get(retKey, null)
      if (ret) {
        set(
          retKey,
          ret.map((item) => (item.bagId && !normalized.includes(item.bagId) ? { ...item, bagId: '' } : item)),
        )
      }
    },
    assignBagForItems(tripId, isReturn, itemIds = [], bagId = '') {
      const key = packingKey(tripId, isReturn)
      const cur = get(key, [])
      if (!cur.length || !itemIds.length) return
      const setIds = new Set(itemIds)
      const next = cur.map((item) => (setIds.has(item.id) ? { ...item, bagId: bagId || '' } : item))
      set(key, next)
    },
    removeItemFromTrip(tripId, isReturn, itemId) {
      const key = packingKey(tripId, isReturn)
      const cur = get(key, [])
      set(
        key,
        cur.filter((i) => i.id !== itemId),
      )
    },
    archiveTrip(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx < 0) return
      const trip = this.trips[idx]
      // compute recoveryRate
      const dep = get(packingKey(tripId, false), [])
      const ret = get(packingKey(tripId, true), [])
      const depKeys = new Set(dep.filter((i) => i.isChecked && !i.isConsumable).map((i) => `${i.name}|${i.group}`))
      const returned = ret.filter((i) => depKeys.has(`${i.name}|${i.group}`)).length
      const rate = depKeys.size ? returned / depKeys.size : null
      this.trips[idx] = {
        ...trip,
        status: 'archived',
        recoveryRate: rate,
        completionDate: Date.now(),
      }
      this.saveTrips()
    },
    deleteTrip(tripId) {
      const idx = this.trips.findIndex((t) => t.id === tripId)
      if (idx < 0) return null
      const trip = this.trips[idx]
      this.trips.splice(idx, 1)
      this.saveTrips()
      del(packingKey(tripId, false))
      del(packingKey(tripId, true))
      return trip
    },
    itemsOf(tripId, isReturn) {
      return get(packingKey(tripId, isReturn), [])
    },
    exportData() {
      // Collect all trips and their packing lists
      const data = {
        trips: this.trips,
        packingLists: {}
      }
      for (const t of this.trips) {
        data.packingLists[packingKey(t.id, false)] = get(packingKey(t.id, false), [])
        if (t.status === 'returnPhase' || t.status === 'archived') {
          data.packingLists[packingKey(t.id, true)] = get(packingKey(t.id, true), [])
        }
      }
      return data
    },
    importData(data) {
      if (!data || !data.trips) return
      this.trips = data.trips.map((trip) => ({
        ...trip,
        returnCompleted: !!trip.returnCompleted,
      }))
      this.saveTrips()
      if (data.packingLists) {
        for (const k in data.packingLists) {
          set(k, data.packingLists[k])
        }
      }
    }
  },
})
