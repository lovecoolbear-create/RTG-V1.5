<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="top">
      <input class="search" v-model="q" placeholder="搜索装备" />
    </view>
    <view v-if="filtered.length === 0" class="empty">暂无匹配</view>
    <scroll-view scroll-y style="max-height: 60vh">
      <view v-for="i in filtered" :key="i.id" class="row" @tap="toggle(i.id)">
        <text class="name">{{ i.name }}</text>
        <text class="group">{{ i.group || '其他' }}</text>
        <text v-if="i.isConsumable" class="tag">消耗品</text>
        <checkbox :checked="sel.has(i.id)" />
      </view>
    </scroll-view>
    <view class="footer">
      <button class="primary" :disabled="sel.size === 0" @tap="confirm">添加 {{ sel.size }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useGearStore } from '../../stores/gear'
import { useTemplateStore } from '../../stores/templates'
import { useTripStore } from '../../stores/trip'
import { useAutoThemeClass } from '../../services/theme'

const gear = useGearStore()
const templates = useTemplateStore()
const trips = useTripStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()

const target = ref('template')
const id = ref('')
const isReturn = ref(false)
const q = ref('')
const sel = ref(new Set())

onLoad((options) => {
  target.value = options?.target || 'template'
  id.value = options?.id || ''
  isReturn.value = options?.isReturn === '1'
})

const filtered = computed(() => {
  const kw = q.value.trim()
  if (!kw) return gear.items
  return gear.items.filter((i) => i.name.includes(kw) || (i.group || '').includes(kw))
})

function toggle(itemId) {
  if (sel.value.has(itemId)) sel.value.delete(itemId)
  else sel.value.add(itemId)
}

function confirm() {
  const chosen = gear.items.filter((i) => sel.value.has(i.id)).map((i) => ({
    name: i.name,
    group: i.group || '其他',
    isConsumable: !!i.isConsumable,
    isImportant: !!i.isImportant,
  }))
  if (target.value === 'template') {
    for (const it of chosen) templates.addItem(id.value, it)
    uni.showToast({ title: '已添加到模板', icon: 'none' })
    uni.navigateBack()
  } else {
    trips.addItemsToTrip(id.value, isReturn.value, chosen)
    uni.showToast({ title: '已添加到清单', icon: 'none' })
    uni.navigateBack()
  }
}
</script>

<style scoped>
.page { padding: 12px; }
.top { margin-bottom: 10px; }
.search { border: 1px solid #eee; border-radius: 8px; padding: 8px; }
.empty { color: #999; text-align: center; padding: 24px 0; }
.row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; background: #fff; padding: 10px; border-radius: 10px; margin-bottom: 8px; }
.name { font-weight: 600; }
.group { color: #666; font-size: 12px; }
.tag { font-size: 10px; color: #7a5a00; background: #fff3cd; padding: 2px 6px; border-radius: 10px; margin: 0 6px; }
.footer { position: sticky; bottom: 0; padding: 12px 0; background: rgba(255,255,255,0.7); backdrop-filter: saturate(180%) blur(10px); }
.primary { width: 100%; background: #3b82f6; color: #fff; padding: 10px 14px; border-radius: 12px; }
</style>
