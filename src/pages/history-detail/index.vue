<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="header">
      <view class="title">{{ trip?.title }}</view>
      <view class="meta-row">
        <text class="time">{{ trip?.time || '时间未设置' }}</text>
        <text v-if="trip?.location" class="loc"> @{{ trip.location }}</text>
      </view>
      <view class="meta-sub">
        <text v-if="trip?.completionDate">归档于 {{ dateText(trip.completionDate) }}</text>
        <text v-if="typeof trip?.recoveryRate === 'number'" class="rate"> · 找回率 {{ int(trip.recoveryRate * 100) }}%</text>
      </view>
    </view>

    <view class="section">
      <view class="sec-head">
        <text class="sec-title">按分组统计</text>
        <button size="mini" type="default" @tap="copyMissed" v-if="missedList.length > 0">复制缺失清单</button>
      </view>
      <view v-if="groupStats.length === 0" class="empty">暂无统计数据</view>
      <view v-for="g in groupStats" :key="g.group" class="stat-row">
        <text class="g-name">{{ g.group }}</text>
        <text class="stat-text">应带 {{ g.expected }} · 已带回 {{ g.returned }} · 缺失 {{ g.missed }}</text>
      </view>
    </view>

    <view class="section">
      <view class="sec-title">缺失清单（未带回）</view>
      <view v-if="missedList.length === 0" class="empty">无缺失物品，完美！</view>
      <view v-for="g in missedGroups" :key="g" class="group">
        <view class="g-title">{{ g }}</view>
        <view v-for="it in missedByGroup[g]" :key="it.key" class="row missed">
          <text class="name">{{ it.name }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="sec-title">已带回清单</view>
      <view v-if="returning.length === 0" class="empty">暂无带回物品</view>
      <view v-for="g in groups" :key="g" class="group">
        <view class="g-title">{{ g }}</view>
        <view v-for="it in itemsByGroup[g]" :key="it.id" class="row">
          <text class="name">{{ it.name }}</text>
          <text v-if="it.isConsumable" class="tag">消耗品</text>
        </view>
      </view>
    </view>
    <view class="section">
      <view class="sec-title">按箱包查看（本次行程）</view>
      <view v-if="returnedBagKeys.length === 0" class="empty">暂无箱包映射</view>
      <view v-for="bagKey in returnedBagKeys" :key="bagKey" class="group">
        <view class="g-title">{{ bagLabelOf(bagKey) }} · {{ returnedByBag[bagKey].length }} 件</view>
        <view v-for="it in returnedByBag[bagKey]" :key="it.id" class="row">
          <text class="name">{{ it.name }}</text>
          <text v-if="it.isConsumable" class="tag">消耗品</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTripStore } from '../../stores/trip'
import { useGearStore } from '../../stores/gear'
import { useAutoThemeClass } from '../../services/theme'

const tripId = ref('')
const store = useTripStore()
const gearStore = useGearStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const trip = ref(null)
const returning = ref([])

onLoad((options) => {
  tripId.value = options?.id || ''
  const found = store.trips.find((t) => t.id === tripId.value)
  if (found) {
    trip.value = found
    // Load returned items (checked in return list)
    returning.value = store.itemsOf(tripId.value, true).filter((i) => i.isChecked)
  }
})

const itemsByGroup = computed(() => {
  const map = {}
  for (const it of returning.value) {
    const g = it.group || '其他'
    if (!map[g]) map[g] = []
    map[g].push(it)
  }
  return map
})
const groups = computed(() => Object.keys(itemsByGroup.value))
const bagNameMap = computed(() => {
  const map = {}
  const currentMap = new Map((gearStore.bags || []).map((b) => [b.id, b.name]))
  const ids = Array.isArray(trip.value?.tripBags) ? trip.value.tripBags : []
  ids.forEach((id) => {
    map[id] = currentMap.get(id) || '已删除箱包'
  })
  return map
})
const returnedByBag = computed(() => {
  const map = {}
  for (const it of returning.value) {
    const key = it.bagId || '__unassigned__'
    if (!map[key]) map[key] = []
    map[key].push(it)
  }
  return map
})
const returnedBagKeys = computed(() => {
  const keys = Object.keys(returnedByBag.value)
  return keys.sort((a, b) => {
    if (a === '__unassigned__') return 1
    if (b === '__unassigned__') return -1
    return bagLabelOf(a).localeCompare(bagLabelOf(b))
  })
})

// Expected items: from departure list (checked & non-consumable)
const depExpected = computed(() => {
  if (!tripId.value) return []
  const dep = store.itemsOf(tripId.value, false)
  return dep.filter((i) => i.isChecked && !i.isConsumable)
})

// Returned items set (key: name|group)
const retSet = computed(() => {
  if (!tripId.value) return new Set()
  const ret = store.itemsOf(tripId.value, true)
  // Only checked items count as returned
  const list = ret.filter((i) => i.isChecked)
  const set = new Set()
  for (const it of list) {
    set.add(`${it.name}|${it.group || '其他'}`)
  }
  return set
})

const groupStats = computed(() => {
  const map = {}
  // Initialize from expected
  for (const it of depExpected.value) {
    const g = it.group || '其他'
    if (!map[g]) map[g] = { group: g, expected: 0, returned: 0, missed: 0 }
    map[g].expected++
    // Check if returned
    if (retSet.value.has(`${it.name}|${g}`)) {
      map[g].returned++
    }
  }
  // Calculate missed
  for (const k in map) {
    map[k].missed = map[k].expected - map[k].returned
  }
  return Object.values(map)
})

const missedList = computed(() => {
  return depExpected.value.filter((it) => !retSet.value.has(`${it.name}|${it.group || '其他'}`))
})

const missedByGroup = computed(() => {
  const map = {}
  for (const it of missedList.value) {
    const g = it.group || '其他'
    if (!map[g]) map[g] = []
    map[g].push(it)
  }
  return map
})
const missedGroups = computed(() => Object.keys(missedByGroup.value))

const int = (n) => Math.round(n)
const dateText = (ts) => {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

function copyMissed() {
  const t = trip.value
  if (!t) return
  const title = t.title || '行程'
  const time = t.time || ''
  const loc = t.location ? `@${t.location}` : ''
  const lines = []
  
  lines.push(`【缺失清单】${title}`)
  if (time || loc) lines.push(`${time} ${loc}`)
  lines.push('----------------')
  
  if (missedGroups.value.length === 0) {
    lines.push('无缺失物品')
  } else {
    for (const g of missedGroups.value) {
      lines.push(`[${g}]`)
      const items = missedByGroup.value[g].map(it => it.name).join('、')
      lines.push(items)
    }
  }
  
  uni.setClipboardData({
    data: lines.join('\n'),
    success: () => uni.showToast({ title: '已复制', icon: 'success' })
  })
}
function bagLabelOf(key) {
  if (key === '__unassigned__') return '未归位'
  return bagNameMap.value[key] || '已删除箱包'
}
</script>

<style scoped>
.page { padding: 12px; padding-bottom: 40px; }
.header { margin-bottom: 16px; padding: 0 4px; }
.title { font-size: 22px; font-weight: 700; color: #111; margin-bottom: 6px; }
.meta-row { display: flex; flex-direction: row; align-items: center; gap: 8px; margin-bottom: 4px; }
.time { font-size: 14px; color: #333; font-weight: 500; }
.loc { font-size: 14px; color: #666; }
.meta-sub { font-size: 12px; color: #999; display: flex; gap: 8px; }
.rate { color: #3b82f6; font-weight: 500; }

.section { background: #fff; padding: 16px; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
.sec-title { font-size: 16px; font-weight: 600; color: #111; }

.stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
.stat-row:last-child { border-bottom: none; }
.g-name { font-weight: 500; color: #333; }
.stat-text { font-size: 13px; color: #666; }

.empty { text-align: center; color: #999; padding: 20px 0; font-size: 14px; }

.group { margin-top: 12px; }
.g-title { font-size: 14px; font-weight: 600; color: #555; background: #f9f9f9; padding: 4px 8px; border-radius: 6px; margin-bottom: 6px; display: inline-block; }
.row { padding: 6px 0; display: flex; align-items: center; justify-content: space-between; }
.missed .name { color: #ef4444; }
.tag { font-size: 10px; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
</style>
