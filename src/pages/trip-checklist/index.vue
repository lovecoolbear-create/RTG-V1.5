<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <!-- 简化版顶部卡片 -->
    <view class="meta-card" :class="{ compact: !showDetails, expanded: showDetails }">
      <view class="meta-top">
        <text class="badge">{{ isReturn ? '返程清点' : '出发清点' }}</text>
        <view class="meta-actions">
          <text class="mode-toggle" @tap="toggleReturnMode">{{ isReturn ? '切换出发' : '切换返程' }}</text>
          <text class="share-btn" @tap="openSharePoster">分享</text>
          <text class="detail-toggle" @tap="toggleDetails">{{ showDetails ? '收起' : '展开' }}</text>
        </view>
      </view>
      
      <!-- 紧凑模式：只显示核心信息 -->
      <view v-if="!showDetails" class="compact-info">
        <view class="compact-main">
          <text class="title">{{ trip?.title || '当前行程' }}</text>
          <text class="schedule">{{ scheduleLabel }}</text>
        </view>
        <view class="compact-progress">
          <text class="progress-text">{{ checkedCount }}/{{ totalCount }}</text>
          <view class="progress-ring" :style="{ '--progress': (totalCount > 0 ? checkedCount / totalCount : 0) }">
            <view class="progress-circle"></view>
          </view>
        </view>
      </view>
      
      <!-- 展开模式：显示完整详情 -->
      <template v-else>
        <view class="title-line">
          <text class="title">{{ trip?.title || '当前行程' }}</text>
          <text class="progress-detail">已勾选 {{ checkedCount }}/{{ totalCount }}</text>
        </view>
        <view class="detail-panel">
          <view class="meta-grid">
            <view class="meta-item" v-if="trip?.source">
              <text class="meta-label">来源</text>
              <text class="meta-value">{{ sourceLabel }}</text>
            </view>
            <view class="meta-item" v-if="trip?.templateCategory">
              <text class="meta-label">模板</text>
              <text class="meta-value">{{ templateCategoryLabel }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-label">时间</text>
              <text class="meta-value">{{ scheduleLabel || '未设置' }}</text>
            </view>
            <view class="meta-item" v-if="trip?.destination">
              <text class="meta-label">地点</text>
              <text class="meta-value">{{ destinationLabel }}</text>
            </view>
            <view class="meta-item" v-if="trip?.keyTime">
              <text class="meta-label">关键时间</text>
              <text class="meta-value">{{ keyTimeLabel }}</text>
            </view>
            <view class="meta-item" v-if="trip?.idType">
              <text class="meta-label">证件</text>
              <text class="meta-value">{{ idTypeLabel }}</text>
            </view>
          </view>
        </view>
        <view class="bag-bar">
          <view class="bag-header">
            <text class="bag-label">本次箱包</text>
            <button size="mini" class="bag-btn" @tap="openBagPicker">{{ activeTripBags.length > 0 ? '修改' : '选择' }}</button>
          </view>
          <view class="bag-values">
            <text v-if="activeTripBags.length === 0" class="bag-empty">未选择箱包</text>
            <text v-for="bag in activeTripBags" :key="bag.id" class="bag-pill">{{ bag.name }}</text>
          </view>
        </view>
        <view class="weight-bar" v-if="estimatedWeightLabel !== '0g'">
          <text class="weight-text">{{ estimatedWeightLabel }}</text>
          <text v-if="unweightedCount > 0" class="weight-sub">{{ unweightedCount }}件未估重</text>
        </view>
      </template>
      
      <!-- 分组进度（紧凑和展开模式都显示）-->
      <view v-if="groupProgressList.length" class="group-progress-wrap">
        <scroll-view scroll-x class="group-progress-scroll" :show-scrollbar="false">
          <view class="group-progress-list">
            <view
              v-for="gp in groupProgressList"
              :key="gp.anchorId"
              class="group-progress-pill"
              :class="{ done: gp.done, 'in-progress': gp.checked > 0 && !gp.done }"
              @tap="jumpToGroup(gp.anchorId)"
            >
              <text class="group-progress-name">{{ gp.name }}</text>
              <text class="group-progress-value" :class="{ 'is-done': gp.done }">{{ gp.checked }}/{{ gp.total }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

    <view class="item-pane">
      <scroll-view scroll-y class="item-scroll" :scroll-into-view="activeGroupAnchor" :scroll-with-animation="true">
        <view v-if="items.length === 0" class="empty">暂无物品</view>
        <view v-for="(g, gi) in groups" :id="`group-anchor-${gi}`" :key="g" class="group">
          <view class="g-title">{{ g }}</view>
          <view
            v-for="it in itemsByGroup[g]"
            :key="it.id"
            class="row"
            :class="{ checked: it.isChecked, disabled: !isTrackableItem(it) }"
            @tap="onRowTap(it)"
            @longpress.stop.prevent="onRowLongPress(it)"
          >
            <view class="check-indicator">
              <text v-if="it.isChecked" class="check-icon">✓</text>
              <text v-else-if="!isTrackableItem(it)" class="skip-icon">—</text>
              <text v-else class="uncheck-icon">○</text>
            </view>
            <view class="name-wrap">
              <text class="name" :class="{ 'is-checked': it.isChecked }">{{ it.name }}</text>
              <text v-if="itemBagName(it)" class="bag-tag">{{ itemBagName(it) }}</text>
            </view>
            <view class="r">
              <text class="qty-tag">x{{ itemQty(it) }}</text>
              <text class="more-tag" @tap.stop="openItemActions(it)">更多</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="footer">
      <view class="quick-actions">
        <text class="quick-btn" @tap="checkAll">全部勾选</text>
        <text class="quick-btn" @tap="uncheckAll">全部取消</text>
      </view>
      <view v-if="quickItemPicks.length" class="quick-add">
        <text class="quick-label">常用快捷添加</text>
        <scroll-view scroll-x class="quick-scroll">
          <view class="quick-list">
            <text v-for="pick in quickItemPicks" :key="pick.id" class="quick-pill" @tap="addQuickItem(pick)">
              + {{ pick.name }}
            </text>
          </view>
        </scroll-view>
      </view>
      <view class="btns">
        <button class="ghost" @tap="addCustomItem">添加物品</button>
        <button class="ghost" @tap="openGearPicker">从装备库添加</button>
        <button class="ghost" @tap="saveAsTemplate">另存为模板</button>
      </view>
      <button class="primary" :disabled="!canFinish" @tap="finish">清点完成</button>
    </view>
    <view v-if="showGearPicker" class="mask" @tap="showGearPicker = false">
      <view class="sheet gear-picker-sheet" @tap.stop>
        <text class="sheet-title">从装备库添加物品</text>
        <view class="gear-search">
          <input v-model="gearSearchKeyword" class="search-input" placeholder="搜索装备..." />
        </view>
        <scroll-view scroll-y class="sheet-list gear-list">
          <view v-if="filteredGearItems.length === 0" class="empty-gear">暂无匹配装备</view>
          <view 
            v-for="item in filteredGearItems" 
            :key="item.id" 
            class="gear-item"
            :class="{ selected: selectedGearIds.includes(item.id) }"
            @tap="toggleGearSelection(item.id)"
          >
            <view class="gear-info">
              <text class="gear-name">{{ item.name }}</text>
              <text class="gear-category">{{ item.category }}</text>
            </view>
            <text class="gear-check">{{ selectedGearIds.includes(item.id) ? '✓' : '' }}</text>
          </view>
        </scroll-view>
        <view class="gear-actions">
          <button class="sheet-btn secondary" @tap="showGearPicker = false">取消</button>
          <button class="sheet-btn primary" @tap="addSelectedGearItems">添加选中 ({{ selectedGearIds.length }})</button>
        </view>
      </view>
    </view>
      <view class="sheet" @tap.stop>
        <text class="sheet-title">选择本次携带箱包</text>
        <scroll-view scroll-y class="sheet-list">
          <view v-for="bag in bags" :key="bag.id" class="sheet-item" @tap="toggleDraftBag(bag.id)">
            <text>{{ bag.name }}</text>
            <text class="sheet-check" :class="{ checked: draftBagIds.includes(bag.id) }">
              {{ draftBagIds.includes(bag.id) ? '已选' : '未选' }}
            </text>
          </view>
        </scroll-view>
        <button class="sheet-btn" @tap="saveTripBags">保存</button>
      </view>
    </view>
    <DarkDialog
      v-model="dialogState.visible"
      :mode="dialogState.mode"
      :title="dialogState.title"
      :message="dialogState.message"
      :confirmText="dialogState.confirmText"
      :cancelText="dialogState.cancelText"
      :placeholder="dialogState.placeholder"
      :modelValue="dialogState.modelValue"
      :danger="dialogState.danger"
      :closeOnMask="dialogState.closeOnMask"
      :actions="dialogState.actions"
      @update:modelValue="(v) => dialogState.modelValue = v"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />
    <SharePoster
      :trip="trip"
      :visible="showSharePoster"
      @close="closeSharePoster"
    />
  </view>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTripStore } from '../../stores/trip'
import { useTemplateStore } from '../../stores/templates'
import { useGearStore } from '../../stores/gear'
import DarkDialog from '../../components/DarkDialog.vue'
import SharePoster from '../../components/SharePoster.vue'
import { useAutoThemeClass } from '../../services/theme'

const tripId = ref('')
const mode = ref('departure')
const isReturn = computed(() => mode.value === 'return')

const store = useTripStore()
const tplStore = useTemplateStore()
const gearStore = useGearStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const list = ref([])
const showBagPicker = ref(false)
const draftBagIds = ref([])
const showGearPicker = ref(false)
const gearSearchKeyword = ref('')
const selectedGearIds = ref([])
const showSharePoster = ref(false)

const trip = computed(() => store.trips.find((t) => t.id === tripId.value) || null)
const HOME_AUTO_TAB_KEY = 'home_auto_tab'
const RULES_STORAGE_KEY = 'departure_rules_v1'
const defaultDepartureRules = {
  businessRequired: true,
  outdoorCarry: true,
  importantUnchecked: true,
}
const showDetails = ref(false)
const activeGroupAnchor = ref('')
const suppressTapUntil = ref(0)
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

onLoad((options) => {
  tripId.value = options?.id || ''
  mode.value = options?.mode || 'departure'
  if (!isReturn.value) {
    store.beginPacking(tripId.value)
  } else {
    // 返程模式：确保返程物品列表已初始化
    store.startReturnIfNeeded(tripId.value)
  }
  refreshList()
})

const bags = computed(() => gearStore.bags || [])
const tripBagIds = computed(() => (Array.isArray(trip.value?.tripBags) ? trip.value.tripBags : []))
const activeTripBags = computed(() =>
  tripBagIds.value.map((id) => bags.value.find((bag) => bag.id === id) || { id, name: '已删除箱包' }),
)
const items = computed(() => list.value)
const groups = computed(() => {
  const s = new Set(items.value.map((it) => it.group || '其他'))
  return Array.from(s)
})
const itemsByGroup = computed(() => {
  const map = {}
  groups.value.forEach((g) => (map[g] = items.value.filter((it) => (it.group || '其他') === g)))
  return map
})

// 装备库物品列表（过滤已添加的）
const filteredGearItems = computed(() => {
  const keyword = gearSearchKeyword.value.trim().toLowerCase()
  const existingNames = items.value.map(it => it.name.toLowerCase())
  
  return gearStore.items.filter(item => {
    // 过滤已添加的装备
    if (existingNames.includes(item.name.toLowerCase())) return false
    
    // 搜索过滤
    if (!keyword) return true
    return item.name.toLowerCase().includes(keyword) || 
           item.category.toLowerCase().includes(keyword)
  })
})

// 快速选择物品（最近添加/常用）
const quickItemPicks = computed(() => {
  return gearStore.items.slice(0, 5)
})

const totalCount = computed(() => items.value.filter((it) => isTrackableItem(it)).length)
const checkedCount = computed(() => items.value.filter((it) => isTrackableItem(it) && it.isChecked).length)
const groupProgressList = computed(() =>
  groups.value
    .map((name, index) => {
      const source = itemsByGroup.value[name] || []
      const trackable = source.filter((it) => isTrackableItem(it))
      const total = trackable.length
      const checked = trackable.filter((it) => it.isChecked).length
      return {
        name,
        anchorId: `group-anchor-${index}`,
        total,
        checked,
        done: total > 0 && checked === total,
      }
    })
    .filter((it) => it.total > 0),
)
const canFinish = computed(() => isReturn.value || checkedCount.value === totalCount.value)
const sourceLabel = computed(() => {
  const value = String(trip.value?.source || '').toLowerCase()
  return value === 'calendar' ? '计划出行' : '快速出发'
})
const templateCategoryLabel = computed(() => {
  const category = String(trip.value?.templateCategory || '').toLowerCase()
  if (category === 'outdoor') return '户外'
  if (category === 'business') return '商务'
  return '通用'
})
const scheduleLabel = computed(() => {
  const date = String(trip.value?.date || '').trim()
  const time = String(trip.value?.scheduleTime || '').trim()
  if (date && time) return `${date} ${time}`
  if (date) return date
  if (time) return time
  return '未设置'
})
const destinationLabel = computed(() => String(trip.value?.destination || trip.value?.location || '').trim() || '未填写')
const keyTimeLabel = computed(() => String(trip.value?.keyTime || '').trim() || '未填写')
const idTypeLabel = computed(() => String(trip.value?.idType || '').trim() || '未填写')
const estimatedWeightKg = computed(() =>
  items.value
    .filter((it) => it.isChecked && typeof it.weight === 'number' && it.weight >= 0)
    .reduce((sum, it) => sum + Number(it.weight) * itemQty(it), 0),
)
const unweightedCount = computed(
  () => items.value.filter((it) => it.isChecked && (typeof it.weight !== 'number' || it.weight < 0)).length,
)
const estimatedWeightLabel = computed(() => `${estimatedWeightKg.value.toFixed(1)} kg`)
const quickItemPicks = computed(() => {
  const source = Array.isArray(gearStore.items) ? gearStore.items : []
  if (!source.length) return []
  const sorted = source
    .filter((it) => String(it?.name || '').trim())
    .slice()
    .sort((a, b) => Number(!!b.isImportant) - Number(!!a.isImportant))
  return sorted.slice(0, 8)
})

function toggle(it) {
  store.toggleItem(tripId.value, isReturn.value, it.id)
  refreshList()
}
function checkAll() {
  // 只勾选当前模式下的物品（出发/返程）
  const currentItems = items.value
  currentItems.forEach((item) => {
    if (isTrackableItem(item) && !item.isChecked) {
      store.toggleItem(tripId.value, isReturn.value, item.id)
    }
  })
  refreshList()
  uni.showToast({ title: '已全部勾选', icon: 'none' })
}
function uncheckAll() {
  // 取消当前模式下所有已勾选的物品
  const currentItems = items.value
  currentItems.forEach((item) => {
    if (item.isChecked) {
      store.toggleItem(tripId.value, isReturn.value, item.id)
    }
  })
  refreshList()
  uni.showToast({ title: '已取消全部勾选', icon: 'none' })
}
function isTrackableItem(item) {
  // 消耗品仅在出发模式时可勾选，返程时不可勾选
  if (isReturn.value && item.isConsumable) return false
  return true
}
function toggleDetails() {
  showDetails.value = !showDetails.value
}
function toggleReturnMode() {
  // 切换出发/返程模式
  const newMode = isReturn.value ? 'departure' : 'return'
  mode.value = newMode
  
  // 如果是切换到返程模式，确保返程物品列表已初始化
  if (newMode === 'return') {
    store.startReturnIfNeeded(tripId.value)
  }
  
  // 刷新列表
  refreshList()
  
  // 提示用户
  uni.showToast({ 
    title: isReturn.value ? '已切换到返程清点' : '已切换到出发清点', 
    icon: 'none',
    duration: 1500
  })
}
async function jumpToGroup(anchorId) {
  const target = String(anchorId || '')
  if (!target) return
  activeGroupAnchor.value = ''
  await nextTick()
  activeGroupAnchor.value = target
}
function onRowTap(it) {
  if (Date.now() < suppressTapUntil.value) return
  toggle(it)
}
async function onRowLongPress(it) {
  suppressTapUntil.value = Date.now() + 500
  try {
    uni.vibrateShort({ type: 'medium' })
  } catch {}
  await openBagAssignActions(it)
}

async function finish() {
  if (isReturn.value) {
    const res = await openConfirm({
      title: '确认返程清点完成',
      message: '确认已完成返程清点并进入待归档吗？',
      confirmText: '确认完成',
    })
    if (!res.confirm) return
    store.finishReturnCheck(tripId.value)
    uni.setStorageSync(HOME_AUTO_TAB_KEY, 'archive')
    uni.showToast({ title: '返程清点完成', icon: 'none' })
    uni.navigateBack()
    return
  }
  store.finishDepartureCheck(tripId.value)
  const tips = departureTips()
  if (!tips.length) {
    await askDepartureDecision()
    return
  }
  const confirm = await openConfirm({
    title: '出发前提醒',
    message: tips.join('；'),
    confirmText: '继续',
    cancelText: '取消',
  })
  if (!confirm.confirm) return
  await askDepartureDecision()
}

function departureTips() {
  const departureRules = getDepartureRules()
  const tips = []
  if (departureRules.outdoorCarry && trip.value?.templateCategory === 'outdoor') {
    tips.push('请确认已携带身份证、应急药品和充电设备')
  }
  if (departureRules.businessRequired && trip.value?.templateCategory === 'business') {
    const missing = []
    if (!destinationLabel.value || destinationLabel.value === '未填写') missing.push('目的地')
    if (!keyTimeLabel.value || keyTimeLabel.value === '未填写') missing.push('关键时间')
    if (!idTypeLabel.value || idTypeLabel.value === '未填写') missing.push('证件类型')
    if (missing.length) {
      tips.push(`商务字段未填写：${missing.join('、')}`)
    }
  }
  if (departureRules.importantUnchecked) {
    const missingImportant = items.value.filter((it) => !!it.isImportant && !it.isChecked)
    if (missingImportant.length) {
      const names = missingImportant
        .slice(0, 3)
        .map((it) => it.name)
        .join('、')
      tips.push(`重要物品未勾选：${names}${missingImportant.length > 3 ? ' 等' : ''}`)
    }
  }
  return tips
}
function getDepartureRules() {
  try {
    const raw = uni.getStorageSync(RULES_STORAGE_KEY)
    if (!raw) return { ...defaultDepartureRules }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return {
      ...defaultDepartureRules,
      ...parsed,
    }
  } catch {
    return { ...defaultDepartureRules }
  }
}

async function askDepartureDecision() {
  const res = await openAction({
    title: '选择出发状态',
    actions: ['现在出发', '稍后出发'],
  })
  if (res.index < 0) return
  if (res.index === 0) {
    store.depart(tripId.value)
    uni.showToast({ title: '已出发', icon: 'none' })
  } else {
    store.markPacked(tripId.value)
    uni.showToast({ title: '已打包', icon: 'none' })
  }
  backToHomeAction()
}
function backToHomeAction() {
  uni.switchTab({
    url: '/pages/tab-home/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/tab-home/index' })
    },
  })
}

async function saveAsTemplate() {
  const depItems = store.itemsOf(tripId.value, false)
  const base = depItems.filter((i) => i.isChecked).map((i) => ({ name: i.name, group: i.group }))
  if (base.length === 0) {
    uni.showToast({ title: '请先勾选出发清单', icon: 'none' })
    return
  }
  const res = await openPrompt({
    title: '保存为模板',
    placeholder: '输入模板名称',
    modelValue: '我的模板',
    confirmText: '保存',
  })
  if (!res.confirm) return
  const t = tplStore.addTemplate(res.value.trim() || '我的模板')
  for (const it of base) tplStore.addItem(t.id, it)
  uni.showToast({ title: '已保存到模板库', icon: 'none' })
}

function addQuickItem(pick) {
  const name = String(pick?.name || '').trim()
  const group = String(pick?.group || '').trim() || '其他'
  if (!name) return
  const existed = items.value.find((it) => it.name === name && String(it.group || '其他') === group)
  if (existed) {
    store.updateItemMeta(tripId.value, isReturn.value, existed.id, { quantity: itemQty(existed) + 1 })
    refreshList()
    uni.showToast({ title: `已增加 ${name} 数量`, icon: 'none' })
    return
  }
  store.addCustomItemToTrip(tripId.value, isReturn.value, {
    name,
    group,
    isConsumable: !!pick?.isConsumable,
    isImportant: !!pick?.isImportant,
  })
  ensureGearItem(name, group, !!pick?.isConsumable, !!pick?.isImportant)
  refreshList()
  uni.showToast({ title: `已添加 ${name}`, icon: 'none' })
}

async function addCustomItem() {
  const nameRes = await openPrompt({
    title: '添加物品',
    placeholder: '输入物品名称',
    confirmText: '下一步',
  })
  if (!nameRes.confirm) return
  const name = nameRes.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入物品名称', icon: 'none' })
    return
  }
  const groupRes = await openPrompt({
    title: '物品分组',
    placeholder: '输入分组，如电子/证件',
    modelValue: '其他',
    confirmText: '确认添加',
  })
  if (!groupRes.confirm) return
  const group = groupRes.value.trim() || '其他'
  store.addCustomItemToTrip(tripId.value, isReturn.value, { name, group, isConsumable: false })
  ensureGearItem(name, group, false, false)
  refreshList()
}

function removeItem(it) {
  store.removeItemFromTrip(tripId.value, isReturn.value, it.id)
  refreshList()
}
function ensureGearItem(name, group = '其他', isConsumable = false, isImportant = false) {
  const normalizedName = String(name || '').trim()
  const normalizedGroup = String(group || '').trim() || '其他'
  if (!normalizedName) return
  const exists = (gearStore.items || []).some(
    (it) => String(it?.name || '').trim() === normalizedName && String(it?.group || '其他').trim() === normalizedGroup,
  )
  if (exists) return
  gearStore.add(normalizedName, normalizedGroup, { isConsumable: !!isConsumable, isImportant: !!isImportant })
}
function itemQty(item) {
  const qty = Number(item?.quantity || 1)
  return Number.isFinite(qty) && qty > 0 ? Math.round(qty) : 1
}
async function openItemActions(item) {
  const consumableLabel = item?.isConsumable ? '取消消耗品' : '标记为消耗品'
  const res = await openAction({
    title: item?.name || '物品操作',
    actions: ['增加数量', '减少数量', '设置估重', consumableLabel, '放入箱包'],
  })
  if (res.index < 0) return
  if (res.index === 0) {
    increaseQty(item)
    return
  }
  if (res.index === 1) {
    decreaseQty(item)
    return
  }
  if (res.index === 2) {
    await pickWeight(item)
    return
  }
  if (res.index === 3) {
    store.updateItemMeta(tripId.value, isReturn.value, item.id, { isConsumable: !item?.isConsumable })
    refreshList()
    return
  }
  if (res.index === 4) {
    await openBagAssignActions(item)
  }
}
function itemBagName(item) {
  const id = String(item?.bagId || '')
  if (!id) return ''
  const bag = activeTripBags.value.find((it) => String(it?.id || '') === id)
  return bag?.name ? `已放入 ${bag.name}` : '已放入已删除箱包'
}
async function openBagAssignActions(item) {
  if (!item?.id) return
  const currentBag = itemBagName(item)
  if (activeTripBags.value.length === 0) {
    const emptyRes = await openAction({
      title: item?.name || '箱包分配',
      message: '请先选择本次携带箱包',
      actions: ['去选择箱包', '删除物品'],
    })
    if (emptyRes.index === 0) {
      openBagPicker()
      return
    }
    if (emptyRes.index === 1) {
      await confirmRemoveItem(item)
    }
    return
  }
  const bagActions = activeTripBags.value.map((bag) => `拖入「${bag.name}」`)
  const actions = [...bagActions]
  if (String(item?.bagId || '')) actions.push('移出箱包')
  actions.push('删除物品')
  const res = await openAction({
    title: item?.name || '箱包分配',
    message: currentBag || '当前未放入箱包',
    actions,
  })
  if (res.index < 0) return
  if (res.index < bagActions.length) {
    const targetBag = activeTripBags.value[res.index]
    if (!targetBag?.id) return
    store.assignBagForItems(tripId.value, isReturn.value, [item.id], targetBag.id)
    refreshList()
    uni.showToast({ title: `已放入${targetBag.name}`, icon: 'none' })
    return
  }
  const removeIndex = bagActions.length
  const deleteIndex = actions.length - 1
  if (String(item?.bagId || '') && res.index === removeIndex) {
    store.assignBagForItems(tripId.value, isReturn.value, [item.id], '')
    refreshList()
    uni.showToast({ title: '已移出箱包', icon: 'none' })
    return
  }
  if (res.index === deleteIndex) {
    await confirmRemoveItem(item)
  }
}
async function confirmRemoveItem(item) {
  const res = await openConfirm({
    title: '删除物品',
    message: `确认删除“${item?.name || '该物品'}”吗？`,
    confirmText: '删除',
    danger: true,
  })
  if (!res.confirm) return
  removeItem(item)
}
function increaseQty(item) {
  const next = itemQty(item) + 1
  store.updateItemMeta(tripId.value, isReturn.value, item.id, { quantity: next })
  refreshList()
}
function decreaseQty(item) {
  const next = Math.max(1, itemQty(item) - 1)
  store.updateItemMeta(tripId.value, isReturn.value, item.id, { quantity: next })
  refreshList()
}
async function pickWeight(item) {
  const options = ['很轻 0.1kg', '轻 0.3kg', '中 0.8kg', '重 1.5kg', '很重 3kg', '清空估重']
  const values = [0.1, 0.3, 0.8, 1.5, 3, null]
  const res = await openAction({
    title: '选择估重',
    actions: options,
  })
  if (res.index < 0) return
  const value = values[res.index]
  store.updateItemMeta(tripId.value, isReturn.value, item.id, { weight: value })
  refreshList()
}
function refreshList() {
  list.value = store.itemsOf(tripId.value, isReturn.value)
}
function openBagPicker() {
  draftBagIds.value = [...tripBagIds.value]
  showBagPicker.value = true
}
function toggleDraftBag(id) {
  if (draftBagIds.value.includes(id)) {
    draftBagIds.value = draftBagIds.value.filter((item) => item !== id)
  } else {
    draftBagIds.value = [...draftBagIds.value, id]
  }
}
function saveTripBags() {
  store.setTripBags(tripId.value, draftBagIds.value)
  showBagPicker.value = false
  refreshList()
}
function openGearPicker() {
  selectedGearIds.value = []
  gearSearchKeyword.value = ''
  showGearPicker.value = true
}
function toggleGearSelection(gearId) {
  const index = selectedGearIds.value.indexOf(gearId)
  if (index > -1) {
    selectedGearIds.value.splice(index, 1)
  } else {
    selectedGearIds.value.push(gearId)
  }
}
function addSelectedGearItems() {
  if (selectedGearIds.value.length === 0) {
    uni.showToast({ title: '请先选择装备', icon: 'none' })
    return
  }
  
  // 将选中的装备添加到清单
  selectedGearIds.value.forEach(gearId => {
    const gearItem = gearStore.items.find(item => item.id === gearId)
    if (gearItem) {
      store.addCustomItemToTrip(tripId.value, {
        name: gearItem.name,
        group: gearItem.category || '装备',
        isImportant: gearItem.isImportant || false,
        isConsumable: gearItem.isConsumable || false,
        weight: gearItem.weight || 0,
        gearId: gearItem.id
      })
    }
  })
  
  uni.showToast({ 
    title: `已添加${selectedGearIds.value.length}件装备`, 
    icon: 'success' 
  })
  
  showGearPicker.value = false
  selectedGearIds.value = []
  refreshList()
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
function openPrompt(options) {
  return openDialog({
    mode: 'prompt',
    title: options?.title || '',
    message: options?.message || '',
    confirmText: options?.confirmText || '确认',
    cancelText: options?.cancelText || '取消',
    placeholder: options?.placeholder || '',
    modelValue: options?.modelValue || '',
    closeOnMask: options?.closeOnMask !== false,
  })
}
function openAction(options) {
  return openDialog({
    mode: 'action',
    title: options?.title || '',
    message: options?.message || '',
    actions: options?.actions || [],
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
  height: 100vh;
  background:
    radial-gradient(circle at 15% 8%, rgba(10, 128, 255, 0.28), transparent 34%),
    linear-gradient(180deg, #040a16 0%, #050d1f 52%, #071020 100%);
  color: #f8fbff;
  padding: 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.meta-card {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.meta-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-line {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.detail-panel {
  margin-top: 8px;
}
.group-progress-wrap {
  margin-top: 8px;
}
.group-progress-scroll {
  width: 100%;
  white-space: nowrap;
}
.group-progress-list {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
}
.group-progress-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #dbeafe;
  border: 1px solid rgba(125, 211, 252, 0.45);
  background: rgba(30, 64, 175, 0.34);
  border-radius: 999px;
  padding: 5px 10px;
  transition: transform 0.15s ease;
}
.group-progress-pill:active {
  transform: scale(0.97);
}
.group-progress-pill.done {
  color: #dcfce7;
  border-color: rgba(74, 222, 128, 0.58);
  background: rgba(21, 128, 61, 0.35);
}
.group-progress-name {
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-progress-value {
  font-weight: 600;
}
.detail-toggle {
  font-size: 12px;
  color: #bae6fd;
  border: 1px solid rgba(125, 211, 252, 0.45);
  background: rgba(14, 116, 144, 0.2);
  border-radius: 999px;
  padding: 3px 10px;
}
.meta-card.compact {
  padding-bottom: 10px;
}

.badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  color: #cde9ff;
  border: 1px solid rgba(56, 189, 248, 0.45);
}

.progress {
  color: rgba(202, 223, 255, 0.72);
  font-size: 12px;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

.meta-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.meta {
  color: rgba(205, 224, 255, 0.82);
  font-size: 12px;
}
.bag-bar {
  margin-top: 10px;
  border-top: 1px solid rgba(118, 171, 255, 0.14);
  padding-top: 10px;
}
.bag-label {
  font-size: 12px;
  color: rgba(205, 224, 255, 0.82);
}
.bag-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.bag-pill {
  font-size: 11px;
  color: rgba(205, 233, 255, 0.92);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.4);
  background: rgba(14, 116, 144, 0.18);
}
.bag-pill.active {
  color: #f8fbff;
  border-color: rgba(56, 189, 248, 0.78);
  background: rgba(14, 116, 144, 0.35);
}
.bag-empty {
  color: rgba(205, 224, 255, 0.62);
  font-size: 12px;
}
.bag-btn {
  margin-top: 8px;
  background: rgba(8, 21, 40, 0.72);
  color: rgba(215, 233, 255, 0.92);
  border: 1px solid rgba(118, 171, 255, 0.28);
  border-radius: 999px;
}
.drag-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #e0f2fe;
  background: rgba(2, 132, 199, 0.2);
  border: 1px solid rgba(125, 211, 252, 0.45);
  border-radius: 10px;
  padding: 8px 10px;
}
.weight-bar {
  margin-top: 10px;
  border-top: 1px solid rgba(118, 171, 255, 0.14);
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.weight-text {
  font-size: 12px;
  color: rgba(205, 224, 255, 0.92);
}
.weight-sub {
  font-size: 11px;
  color: rgba(205, 224, 255, 0.62);
}

.item-pane {
  flex: 1;
  min-height: 0;
}
.item-scroll {
  height: 100%;
}

.empty {
  color: rgba(205, 224, 255, 0.62);
  text-align: center;
  padding: 24px 0;
}

.group {
  margin-top: 12px;
}

.g-title {
  position: sticky;
  top: 0;
  z-index: 2;
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.35);
  background: rgba(7, 19, 38, 0.9);
  backdrop-filter: blur(4px);
  margin-bottom: 6px;
  color: #d8ebff;
}

.row {
  background: rgba(10, 28, 50, 0.52);
  border: 1px solid rgba(118, 171, 255, 0.18);
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pick-dot {
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
.pick-dot.picked {
  color: #f7fbff;
  background: rgba(14, 116, 144, 0.45);
}

.name {
  font-size: 14px;
}
.bag-tag {
  font-size: 10px;
  color: #e0f2fe;
  border: 1px solid rgba(125, 211, 252, 0.42);
  background: rgba(8, 47, 73, 0.55);
  border-radius: 999px;
  padding: 2px 6px;
}

.r {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.qty-tag {
  font-size: 10px;
  color: #bfdbfe;
  background: rgba(30, 58, 138, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
}
.more-tag {
  font-size: 10px;
  color: #bae6fd;
  background: rgba(3, 105, 161, 0.4);
  padding: 2px 6px;
  border-radius: 10px;
}

.footer {
  flex-shrink: 0;
  padding: 12px 0 18px;
  background: linear-gradient(180deg, rgba(7, 16, 32, 0), rgba(7, 16, 32, 0.94) 36%);
}

.quick-add {
  margin-bottom: 8px;
}

.quick-label {
  display: block;
  font-size: 12px;
  color: rgba(186, 230, 253, 0.92);
  margin-bottom: 6px;
}

.quick-scroll {
  width: 100%;
  white-space: nowrap;
}

.quick-list {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
}

.quick-pill {
  flex-shrink: 0;
  font-size: 11px;
  color: #dbeafe;
  background: rgba(30, 64, 175, 0.34);
  border: 1px solid rgba(125, 211, 252, 0.45);
  border-radius: 999px;
  padding: 6px 10px;
}

.btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.primary {
  margin-top: 8px;
  width: 100%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  border: none;
  border-radius: 12px;
}

.ghost {
  width: 100%;
  margin: 0;
  background: rgba(118, 171, 255, 0.18);
  color: #dceeff;
  border: 1px solid rgba(118, 171, 255, 0.28);
  border-radius: 12px;
}
.mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(2, 6, 23, 0.68);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
  box-sizing: border-box;
}
.sheet {
  width: 100%;
  max-width: 560rpx;
  border-radius: 14px;
  padding: 14px 14px 18px;
  border: 1px solid rgba(118, 171, 255, 0.26);
  background:
    radial-gradient(circle at 20% 0%, rgba(14, 165, 233, 0.2), transparent 36%),
    rgba(7, 19, 38, 0.96);
}
.sheet-title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fbff;
}
.sheet-list {
  max-height: 36vh;
  margin-top: 8px;
}
.sheet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(118, 171, 255, 0.16);
  color: rgba(215, 233, 255, 0.92);
}
.sheet-check {
  min-width: 76rpx;
  text-align: center;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid rgba(118, 171, 255, 0.32);
  color: #bae6fd;
  background: rgba(22, 78, 178, 0.28);
  padding: 2px 8px;
}
.sheet-check.checked {
  border-color: rgba(34, 197, 94, 0.34);
  color: #dcfce7;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(22, 163, 74, 0.84));
}
.sheet-btn {
  margin-top: 12px;
  width: 100%;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #f8fbff;
  border: none;
  border-radius: 12px;
}
.page.theme-day .mask {
  background: rgba(151, 183, 220, 0.34);
}
.page.theme-day .sheet {
  border-color: rgba(152, 191, 255, 0.42);
  background:
    radial-gradient(circle at 18% 0%, rgba(147, 197, 253, 0.24), transparent 38%),
    rgba(255, 255, 255, 0.97);
}
.page.theme-day .sheet-title {
  color: #133b74;
}
.page.theme-day .sheet-item {
  border-bottom-color: rgba(152, 191, 255, 0.36);
  color: rgba(30, 58, 138, 0.92);
}
.page.theme-day .sheet-check {
  border-color: rgba(147, 197, 253, 0.66);
  color: #2563eb;
  background: rgba(239, 246, 255, 0.96);
}
.page.theme-day .sheet-check.checked {
  border-color: rgba(59, 130, 246, 0.38);
  color: #f8fbff;
  background: linear-gradient(135deg, #1da1ff, #2563eb);
}
.page.theme-day .sheet-btn {
  background: linear-gradient(135deg, #1da1ff, #2563eb);
}
.page.theme-day {
  background:
    radial-gradient(circle at 14% 8%, rgba(125, 211, 252, 0.26), transparent 34%),
    linear-gradient(180deg, #eff8ff 0%, #f6fbff 58%, #f8fcff 100%);
  color: #133b74;
}
.page.theme-day .meta-card,
.page.theme-day .row {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(191, 219, 254, 0.95);
  box-shadow: 0 8px 20px rgba(148, 163, 184, 0.12);
}
.page.theme-day .badge {
  color: #1d4ed8;
  border-color: rgba(96, 165, 250, 0.68);
  background: rgba(239, 246, 255, 0.92);
}
.page.theme-day .detail-toggle {
  color: #1d4ed8;
  border-color: rgba(147, 197, 253, 0.9);
  background: rgba(239, 246, 255, 0.96);
}
.page.theme-day .group-progress-pill {
  color: #1e40af;
  border-color: rgba(147, 197, 253, 0.9);
  background: rgba(239, 246, 255, 0.96);
}
.page.theme-day .group-progress-pill.done {
  color: #166534;
  border-color: rgba(134, 239, 172, 0.9);
  background: rgba(220, 252, 231, 0.92);
}
.page.theme-day .progress,
.page.theme-day .meta,
.page.theme-day .bag-label,
.page.theme-day .weight-text {
  color: rgba(30, 64, 175, 0.86);
}
.page.theme-day .bag-bar,
.page.theme-day .weight-bar {
  border-top-color: rgba(191, 219, 254, 0.9);
}
.page.theme-day .weight-sub,
.page.theme-day .bag-empty,
.page.theme-day .empty {
  color: rgba(100, 116, 139, 0.9);
}
.page.theme-day .bag-pill {
  color: #1e40af;
  border-color: rgba(147, 197, 253, 0.9);
  background: rgba(239, 246, 255, 0.98);
}
.page.theme-day .bag-pill.active {
  color: #f8fbff;
  border-color: rgba(59, 130, 246, 0.7);
  background: linear-gradient(135deg, #1da1ff, #2563eb);
}
.page.theme-day .bag-btn,
.page.theme-day .ghost {
  color: #1e40af;
  border-color: rgba(147, 197, 253, 0.88);
  background: rgba(239, 246, 255, 0.94);
}
.page.theme-day .drag-tip {
  color: #1e3a8a;
  border-color: rgba(125, 211, 252, 0.72);
  background: rgba(224, 242, 254, 0.8);
}
.page.theme-day .g-title,
.page.theme-day .name {
  color: #1e3a8a;
}
.page.theme-day .bag-tag {
  color: #1d4ed8;
  border-color: rgba(147, 197, 253, 0.88);
  background: rgba(239, 246, 255, 0.98);
}
.page.theme-day .g-title {
  border-color: rgba(147, 197, 253, 0.9);
  background: rgba(255, 255, 255, 0.94);
}
.page.theme-day .qty-tag {
  color: #1e40af;
  background: rgba(224, 231, 255, 0.92);
}
.page.theme-day .more-tag {
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.92);
}
.page.theme-day .quick-label {
  color: #1d4ed8;
}
.page.theme-day .quick-pill {
  color: #1e40af;
  border-color: rgba(147, 197, 253, 0.86);
  background: rgba(239, 246, 255, 0.96);
}
.page.theme-day .primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #f8fbff;
}
.page.theme-day .footer {
  background: linear-gradient(180deg, rgba(248, 252, 255, 0), rgba(248, 252, 255, 0.98) 38%);
}
</style>
