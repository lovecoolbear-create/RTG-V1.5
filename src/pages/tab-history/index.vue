<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="summary">
      <view class="summary-top">
        <text class="summary-title">归档历史</text>
        <button size="mini" class="manage-btn" @tap="toggleManage">
          {{ manageMode ? '完成' : '批量管理' }}
        </button>
      </view>
      <view class="summary-stats">
        <text class="chip">归档 {{ archived.length }}</text>
        <text class="chip">平均找回率 {{ avgRecoveryRate }}%</text>
      </view>
    </view>
    <view v-if="manageMode && archived.length" class="bulk-bar">
      <button size="mini" class="bulk-btn" @tap="toggleSelectAll">
        {{ allSelected ? '取消全选' : '全选' }}
      </button>
      <button size="mini" class="bulk-btn" :disabled="!selectedCount" @tap="exportSelected">
        导出已选 {{ selectedCount }}
      </button>
      <button size="mini" class="danger-btn" :disabled="!selectedCount" @tap="deleteSelected">
        删除已选 {{ selectedCount }}
      </button>
    </view>
    <view v-if="archived.length === 0" class="empty">暂无历史归档</view>

    <!-- 旅行档案统计卡片 -->
    <view v-if="archived.length > 0" class="travel-profile">
      <view class="profile-header">
        <text class="profile-title">旅行档案</text>
        <text class="profile-subtitle">{{ archived.length }} 次出行记录</text>
      </view>
      <view class="profile-grid">
        <view class="profile-item">
          <text class="profile-value">{{ mostUsedTemplate || '暂无' }}</text>
          <text class="profile-label">最常用模板</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ avgItemsPerTrip }}</text>
          <text class="profile-label">平均物品数</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ totalItemsPacked }}</text>
          <text class="profile-label">累计打包</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ bestRecoveryRate }}%</text>
          <text class="profile-label">最佳找回率</text>
        </view>
      </view>
      <view v-if="frequentItems.length" class="frequent-section">
        <text class="frequent-title">常用物品</text>
        <view class="frequent-tags">
          <text v-for="item in frequentItems" :key="item.name" class="frequent-tag">
            {{ item.name }} ({{ item.count }}次)
          </text>
        </view>
      </view>
    </view>
    <view v-for="t in archivedSorted" :key="t.id" class="card" @tap="onCardTap(t)">
      <view class="row">
        <view class="row-left">
          <view v-if="manageMode" class="checkbox" :class="{ checked: isSelected(t.id) }" @tap.stop="toggleSelect(t.id)">
            <text>{{ isSelected(t.id) ? '✓' : '' }}</text>
          </view>
          <text class="title">{{ t.title }}</text>
        </view>
        <text v-if="typeof t.recoveryRate === 'number'" class="rate">找回率 {{ int(t.recoveryRate * 100) }}%</text>
      </view>
      <view class="sub">
        <text class="time">{{ t.time || '时间未设置' }}</text>
        <text v-if="t.completionDate" class="time">归档 {{ dateText(t.completionDate) }}</text>
      </view>
      <view class="actions">
        <button size="mini" class="detail-btn" @tap.stop="open(t)">查看详情</button>
      </view>
    </view>
    <DarkDialog
      :visible="dialogState.visible"
      :mode="dialogState.mode"
      :title="dialogState.title"
      :message="dialogState.message"
      :confirm-text="dialogState.confirmText"
      :cancel-text="dialogState.cancelText"
      :placeholder="dialogState.placeholder"
      :model-value="dialogState.modelValue"
      :danger="dialogState.danger"
      :actions="dialogState.actions"
      :close-on-mask="dialogState.closeOnMask"
      @cancel="onDialogCancel"
      @confirm="onDialogConfirm"
      @action="onDialogAction"
    />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTripStore } from '../../stores/trip'
import DarkDialog from '../../components/DarkDialog.vue'
import { useAutoThemeClass } from '../../services/theme'

const store = useTripStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const manageMode = ref(false)
const selectedIds = ref([])
const archived = computed(() => store.trips.filter((t) => t.status === 'archived'))
const archivedSorted = computed(() =>
  [...archived.value].sort((a, b) => (b.completionDate || 0) - (a.completionDate || 0))
)
const selectedCount = computed(() => selectedIds.value.length)
const dialogState = ref({
  visible: false,
  mode: 'confirm',
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  placeholder: '',
  modelValue: '',
  danger: false,
  closeOnMask: true,
  actions: [],
})
let dialogResolver = null
const allSelected = computed(
  () => archivedSorted.value.length > 0 && selectedIds.value.length === archivedSorted.value.length,
)
const avgRecoveryRate = computed(() => {
  const rates = archived.value
    .filter((item) => typeof item.recoveryRate === 'number')
    .map((item) => item.recoveryRate)
  if (rates.length === 0) return 0
  const avg = rates.reduce((sum, val) => sum + val, 0) / rates.length
  return Math.round(avg * 100)
})

const mostUsedTemplate = computed(() => {
  const templateCounts = {}
  archived.value.forEach(trip => {
    const tplId = trip.templateId || trip.title
    templateCounts[tplId] = (templateCounts[tplId] || 0) + 1
  })
  
  let maxCount = 0
  let mostUsed = null
  Object.entries(templateCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostUsed = id
    }
  })
  
  return mostUsed && maxCount > 1 ? mostUsed.split('_').pop() : null
})

const avgItemsPerTrip = computed(() => {
  let totalItems = 0
  let tripsWithItems = 0
  
  archived.value.forEach(trip => {
    const items = store.itemsOf(trip.id, false)
    if (items && items.length > 0) {
      totalItems += items.length
      tripsWithItems++
    }
  })
  
  return tripsWithItems > 0 ? Math.round(totalItems / tripsWithItems) : 0
})

const totalItemsPacked = computed(() => {
  let total = 0
  archived.value.forEach(trip => {
    const items = store.itemsOf(trip.id, false)
    total += items ? items.length : 0
  })
  return total
})

const bestRecoveryRate = computed(() => {
  const rates = archived.value
    .filter((t) => typeof t.recoveryRate === 'number')
    .map((t) => t.recoveryRate)
  
  if (rates.length === 0) return 0
  return Math.round(Math.max(...rates) * 100)
})

const frequentItems = computed(() => {
  const itemCounts = {}
  
  archived.value.forEach(trip => {
    const items = store.itemsOf(trip.id, false)
    if (items) {
      items.forEach(item => {
        const key = item.name
        itemCounts[key] = (itemCounts[key] || 0) + 1
      })
    }
  })
  
  return Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .filter(item => item.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})

const int = (n) => Math.round(n)
const dateText = (ts) => {
  try {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}
function open(t) {
  uni.navigateTo({ url: `/pages/history-detail/index?id=${t.id}` })
}
function onCardTap(t) {
  if (manageMode.value) {
    toggleSelect(t.id)
    return
  }
  open(t)
}
function toggleManage() {
  manageMode.value = !manageMode.value
  selectedIds.value = []
}
function isSelected(id) {
  return selectedIds.value.includes(id)
}
function toggleSelect(id) {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}
function toggleSelectAll() {
  selectedIds.value = allSelected.value ? [] : archivedSorted.value.map((item) => item.id)
}
function exportSelected() {
  if (!selectedCount.value) return
  const selected = archivedSorted.value.filter((t) => selectedIds.value.includes(t.id))
  const data = {
    version: 1,
    date: Date.now(),
    trips: selected,
    packingLists: {},
  }
  selected.forEach((t) => {
    data.packingLists[`PackingList_${t.id}`] = store.itemsOf(t.id, false)
    data.packingLists[`PackingList_Return_${t.id}`] = store.itemsOf(t.id, true)
  })
  uni.setClipboardData({
    data: JSON.stringify(data),
    success: () => {
      uni.showToast({ title: '已复制导出数据', icon: 'success' })
    },
  })
}
async function deleteSelected() {
  if (!selectedCount.value) return
  const res = await openConfirm({
    title: '确认删除',
    message: `将删除 ${selectedCount.value} 条归档记录，且不可恢复`,
    confirmText: '删除',
    danger: true,
  })
  if (!res.confirm) return
  selectedIds.value.forEach((id) => store.deleteTrip(id))
  selectedIds.value = []
  manageMode.value = false
  uni.showToast({ title: '删除完成', icon: 'success' })
}
function openConfirm(options) {
  return openDialog({
    mode: 'confirm',
    title: options?.title || '',
    message: options?.message || '',
    confirmText: options?.confirmText || '确认',
    cancelText: options?.cancelText || '取消',
    danger: !!options?.danger,
    closeOnMask: options?.closeOnMask !== false,
  })
}
function openDialog(payload) {
  return new Promise((resolve) => {
    dialogResolver = resolve
    dialogState.value = {
      visible: true,
      mode: payload.mode || 'confirm',
      title: payload.title || '',
      message: payload.message || '',
      confirmText: payload.confirmText || '确认',
      cancelText: payload.cancelText || '取消',
      placeholder: payload.placeholder || '',
      modelValue: payload.modelValue || '',
      danger: !!payload.danger,
      closeOnMask: payload.closeOnMask !== false,
      actions: Array.isArray(payload.actions) ? payload.actions : [],
    }
  })
}
function closeDialog(result) {
  const resolve = dialogResolver
  dialogResolver = null
  dialogState.value = {
    ...dialogState.value,
    visible: false,
  }
  if (resolve) resolve(result)
}
function onDialogCancel() {
  closeDialog({ confirm: false, index: -1, value: '' })
}
function onDialogConfirm(value) {
  closeDialog({ confirm: true, index: -1, value: String(value || '') })
}
function onDialogAction(index) {
  closeDialog({ confirm: true, index: Number(index), value: '' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgba(10, 128, 255, 0.24), transparent 34%),
    linear-gradient(180deg, #040a16 0%, #050d1f 52%, #071020 100%);
  padding: 16px;
  box-sizing: border-box;
  color: #f7fbff;
}
.summary {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
}
.summary-title {
  font-size: 19px;
  font-weight: 700;
}
.summary-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.manage-btn {
  background: rgba(14, 116, 144, 0.26);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #d8f0ff;
  border-radius: 999px;
  font-size: 12px;
}
.summary-stats {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.bulk-bar {
  background: rgba(10, 28, 50, 0.5);
  border: 1px solid rgba(118, 171, 255, 0.16);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  gap: 8px;
}
.bulk-btn {
  flex: 1;
  background: rgba(8, 21, 40, 0.72);
  color: rgba(215, 233, 255, 0.92);
  border: 1px solid rgba(118, 171, 255, 0.28);
  border-radius: 999px;
  font-size: 12px;
}
.danger-btn {
  flex: 1;
  background: rgba(220, 38, 38, 0.22);
  color: #ffd5da;
  border: 1px solid rgba(248, 113, 113, 0.52);
  border-radius: 999px;
  font-size: 12px;
}
.chip {
  font-size: 11px;
  color: rgba(205, 233, 255, 0.92);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.4);
  background: rgba(14, 116, 144, 0.18);
}
.empty { color: rgba(185, 203, 229, 0.72); text-align: center; padding: 24px 0; }
.card {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.18);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
.row-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(125, 211, 252, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  background: rgba(8, 21, 40, 0.62);
}
.checkbox.checked {
  color: #f7fbff;
  background: rgba(14, 116, 144, 0.45);
}
.title { font-weight: 600; }
.rate { color: #22c55e; font-size: 12px; }
.sub { color: rgba(194, 219, 255, 0.72); font-size: 12px; margin-top: 6px; display: flex; flex-direction: row; gap: 10px; }
.actions { margin-top: 10px; }
.detail-btn {
  background: rgba(14, 116, 144, 0.26);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #d8f0ff;
  border-radius: 999px;
  font-size: 12px;
}
.page.theme-day .summary,
.page.theme-day .bulk-bar,
.page.theme-day .card {
  background: #ffffff;
  border-color: rgba(56, 98, 160, 0.12);
}
.page.theme-day .summary-title,
.page.theme-day .title,
.page.theme-day .sub {
  color: #1f3658;
}
.page.theme-day .chip {
  color: #375176;
  border-color: rgba(76, 121, 182, 0.28);
  background: rgba(224, 235, 249, 0.72);
}
.page.theme-day .manage-btn,
.page.theme-day .detail-btn {
  background: #eaf2ff;
  border-color: rgba(56, 98, 160, 0.2);
  color: #285fba;
}
.page.theme-day .bulk-btn {
  background: #f2f7ff;
  border-color: rgba(56, 98, 160, 0.2);
  color: #1f3658;
}
.page.theme-day .checkbox {
  background: #f2f7ff;
  border-color: rgba(56, 98, 160, 0.34);
}
.page.theme-day .checkbox.checked {
  background: #285fba;
}
.page.theme-day .empty {
  color: #56749e;
}
</style>
