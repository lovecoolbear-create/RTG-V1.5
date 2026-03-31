<template>
  <view class="page" :class="[themeClass, { navigating: isNavigating }]" :style="pageThemeStyle">
    <view class="home-shell" :class="shellClass" :style="shellMotionStyle">
      <view class="upper-pane" :style="upperPaneStyle">
        <view class="hero-top" :style="heroTopStyle">
          <text class="hello">{{ helloText }}</text>
          <text class="date-en">{{ dateEN }}</text>
        </view>
        <view class="brand-row" :style="brandRowStyle">
          <text class="brand">ReadyToGo</text>
          <text class="slogan">轻松准备 立即出发</text>
        </view>
        <view class="calendar-pane" :style="calendarPaneStyle">
          <view class="month-wrap">
            <view class="month-main">
              <text class="month-title">{{ monthName }}</text>
              <text class="month-year">{{ year }}</text>
            </view>
            <view class="month-nav">
              <text class="month-arrow" @tap="switchMonth(-1)">‹</text>
              <text class="month-arrow" @tap="switchMonth(1)">›</text>
            </view>
          </view>
          <view class="week-row">
            <text v-for="w in weekLabels" :key="w" class="week-item">{{ w }}</text>
          </view>
          <scroll-view scroll-y class="calendar-scroll">
            <view class="days-grid">
              <view
                v-for="d in calendarDays"
                :key="d.key"
                class="day-cell"
                :class="{ muted: !d.inMonth, active: d.inMonth && d.day === selectedDay }"
                @tap="selectDay(d)"
              >
                <text>{{ d.day }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
      <view
        class="divider"
        :style="dividerStyle"
        @tap="toggleInfoLayer"
        @touchstart="onDividerTouchStart"
        @touchmove="onDividerTouchMove"
        @touchend="onDividerTouchEnd"
        @touchcancel="onDividerTouchCancel"
      >
        <view class="divider-line"></view>
        <text class="divider-text">{{ dividerHint }}</text>
      </view>
      <view class="lower-pane" :style="lowerPaneStyle">
        <view class="action-row">
          <button 
            class="cta quick" 
            :class="{ busy: isNavigating }" 
            :disabled="isNavigating" 
            @tap="quickDepart"
          >
            <text class="cta-title">快速出发</text>
            <text class="cta-desc">一键清点</text>
          </button>
          <button 
            class="cta create" 
            :class="{ busy: isNavigating }" 
            :disabled="isNavigating" 
            @tap="onCreate"
          >
            <text class="cta-title">新建日程</text>
            <text class="cta-desc">先建卡片</text>
          </button>
        </view>
        <view class="action-hints">
          <text class="action-hint">快速出发：点按一键清点，长按可换模板</text>
          <text class="action-hint">新建日程：只创建卡片，稍后再清点</text>
          <text class="action-link" @tap="syncFromSystemCalendar">读取系统日历（可用时）</text>
        </view>
        <view class="weather-card" :class="weather.code">
          <view class="weather-main">
            <view class="weather-anim">
              <view v-if="weather.code === 'sunny'" class="sun-core"></view>
              <view v-else-if="weather.code === 'cloudy'" class="cloud-core"></view>
              <view v-else class="rain-core"></view>
            </view>
            <view class="weather-text">
              <text class="weather-date">{{ todayText }}</text>
              <text class="weather-temp">{{ weather.low }}° / {{ weather.high }}°</text>
            </view>
          </view>
          <view class="weather-sub">
            <text>{{ weather.label }} · {{ weather.place }}</text>
            <text>日出 {{ weather.sunrise }}</text>
            <text>日落 {{ weather.sunset }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="chip-row">
      <button class="chip" :class="{ active: tab === 0 }" @tap="tab = 0">计划中的行程</button>
      <button class="chip" :class="{ active: tab === 1 }" @tap="tab = 1">待归档的行程</button>
    </view>
    
    <!-- 统计卡片区域 -->
    <view class="stats-row">
      <SimpleStatCard 
        :value="ongoing.length"
        label="计划行程"
        variant="primary"
        :clickable="true"
        @tap="tab = 0"
      />
      <SimpleStatCard 
        :value="toArchive.length"
        label="待归档"
        variant="warning"
        :clickable="true"
        @tap="tab = 1"
      />
      <SimpleStatCard 
        :value="completedThisMonth"
        label="本月完成"
        variant="success"
        :trend="monthlyTrend"
        :trend-value="monthlyTrendValue"
      />
    </view>
    <view class="list-region">
      <scroll-view scroll-y class="trip-scroll">
        <view v-if="tab === 0">
          <view v-if="filteredOngoing.length === 0" class="empty">暂无行程，点击上方新建</view>
          <view v-for="t in filteredOngoing" :key="t.id" class="trip-card">
            <view class="status-strip">
              <view
                v-for="i in 6"
                :key="`${t.id}-s-${i}`"
                class="status-segment"
                :class="segmentClass(i, statusStep(t))"
                :style="segmentStyle(i, statusStep(t))"
              ></view>
            </view>
            <view class="trip-body" hover-class="trip-body-active" hover-stay-time="80" @tap="onTripTap(t)" @longpress="onTripLongPress(t)">
              <view class="trip-left">
                <view class="title-row">
                  <text class="trip-title">{{ t.title }}</text>
                  <text class="source-pill">{{ sourceLabel(t) }}</text>
                </view>
                <view class="trip-line">{{ departTimeText(t) }}</view>
                <view class="trip-line">{{ keyTimeText(t) }}</view>
                <view class="trip-line location-line" :class="{ missing: isLocationMissing(t) }">{{ locationText(t) }}</view>
              </view>
              <view class="trip-right">
                <StatusIndicator 
                  :status="t.status === 'returnPhase' && t.returnCompleted ? 'archived' : t.status"
                  :size="'small'"
                  :animated="true"
                />
                <text class="status-pill" :style="statusTextStyle(t)">{{ statusText(t) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else>
          <view v-if="filteredToArchive.length === 0" class="empty">暂无待归档行程</view>
          <view class="tip" v-else>有 {{ filteredToArchive.length }} 个已完成行程待归档</view>
          <uni-swipe-action>
            <uni-swipe-action-item
              v-for="t in filteredToArchive"
              :key="t.id"
              :right-options="rightOptions"
              @tap="onSwipeClick(t)"
            >
              <view class="trip-card">
                <view class="status-strip">
                  <view
                    v-for="i in 6"
                    :key="`${t.id}-s-${i}`"
                    class="status-segment"
                    :class="segmentClass(i, statusStep(t))"
                    :style="segmentStyle(i, statusStep(t))"
                  ></view>
                </view>
                <view class="trip-body" hover-class="trip-body-active" hover-stay-time="80" @tap="onTripTap(t)" @longpress="onTripLongPress(t)">
                  <view class="trip-left">
                    <view class="title-row">
                      <text class="trip-title">{{ t.title }}</text>
                      <text class="source-pill">{{ sourceLabel(t) }}</text>
                    </view>
                    <view class="trip-line">{{ departTimeText(t) }}</view>
                    <view class="trip-line">{{ keyTimeText(t) }}</view>
                    <view class="trip-line location-line" :class="{ missing: isLocationMissing(t) }">{{ locationText(t) }}</view>
                  </view>
                  <view class="trip-right">
                    <StatusIndicator 
                      :status="t.status === 'returnPhase' && t.returnCompleted ? 'archived' : t.status"
                      :size="'small'"
                      :animated="true"
                    />
                    <text class="status-pill" :style="statusTextStyle(t)">{{ statusText(t) }}</text>
                  </view>
                </view>
              </view>
            </uni-swipe-action-item>
          </uni-swipe-action>
        </view>
      </scroll-view>
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
import { computed, ref, watch } from 'vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useTripStore } from '../../stores/trip'
import { useTemplateStore } from '../../stores/templates'
import DarkDialog from '../../components/DarkDialog.vue'
import { useAutoThemeClass } from '../../services/theme'
import EnhancedButton from '../../components/EnhancedButton.vue'
import StatusIndicator from '../../components/StatusIndicator.vue'
import ProgressRing from '../../components/ProgressRing.vue'
import SimpleStatCard from '../../components/SimpleStatCard.vue'

const store = useTripStore()
const templateStore = useTemplateStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const { ongoing, toArchive } = storeToRefs(store)
const tab = ref(0)
const today = new Date()
const displayedMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDay = ref(today.getDate())
const collapseLevel = ref(0)
const touchStartY = ref(0)
const isNavigating = ref(false)
const suppressTapTripId = ref('')
const suppressTapUntil = ref(0)
const suppressQuickTapUntil = ref(0)
const LAST_TEMPLATE_KEY = 'last_template_id'
const WEATHER_CACHE_KEY = 'home_weather_cache_v1'
const WEATHER_REFRESH_MS = 30 * 60 * 1000
const LIVE_CONTEXT_REFRESH_MS = 5 * 60 * 1000
const CLOCK_REFRESH_MS = 30 * 1000
const HOME_AUTO_TAB_KEY = 'home_auto_tab'
const DIVIDER_DRAG_DISTANCE = 140
const DIVIDER_TAP_GUARD_MS = 220
const DAY_STATUS_COLORS = ['#34d399', '#2fc596', '#2ab78a', '#26a97f', '#229b73', '#1d8d68']
const NIGHT_STATUS_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#16a34a']
const nowTick = ref(Date.now())
const gpsPlaceName = ref('')
const gpsLatitude = ref(NaN)
const gpsLongitude = ref(NaN)
const gpsUpdatedAt = ref(0)
const dividerDragOffsetY = ref(0)
const isDividerDragging = ref(false)
const suppressDividerTapUntil = ref(0)
let clockTimer = null
let liveContextTimer = null
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

const shellClass = computed(() => ({
  actionFull: collapseLevel.value === 2,
  dragging: isDividerDragging.value,
}))
const baseCollapseProgress = computed(() => (collapseLevel.value === 2 ? 1 : 0))
const collapseProgress = computed(() => {
  if (!isDividerDragging.value) return baseCollapseProgress.value
  const raw = baseCollapseProgress.value + (-dividerDragOffsetY.value / DIVIDER_DRAG_DISTANCE)
  return clampCollapseProgress(raw)
})
const shellMotionStyle = computed(() => ({
  '--collapse-progress': String(collapseProgress.value),
  '--expand-progress': String(1 - collapseProgress.value),
}))
const upperPaneStyle = computed(() => ({
  transform: `translateY(${(-4 * collapseProgress.value).toFixed(2)}rpx)`,
}))
const lowerPaneStyle = computed(() => ({
  transform: `translateY(${(-6 * collapseProgress.value).toFixed(2)}rpx)`,
}))
const heroTopStyle = computed(() => ({
  opacity: (1 - 0.1 * collapseProgress.value).toFixed(3),
  transform: `translateY(${(-2 * collapseProgress.value).toFixed(2)}rpx)`,
}))
const brandRowStyle = computed(() => ({
  opacity: (1 - 0.1 * collapseProgress.value).toFixed(3),
  transform: `translateY(${(-2 * collapseProgress.value).toFixed(2)}rpx)`,
}))
const dividerStyle = computed(() => ({
  marginTop: `${(10 - 4 * collapseProgress.value).toFixed(2)}px`,
  marginBottom: `${(10 - 4 * collapseProgress.value).toFixed(2)}px`,
  transform: `translateY(${(-4 * collapseProgress.value).toFixed(2)}rpx)`,
}))
const calendarPaneStyle = computed(() => {
  const p = collapseProgress.value
  const expand = 1 - p
  return {
    maxHeight: `${Math.max(0, Math.round(520 * expand))}rpx`,
    opacity: expand.toFixed(3),
    transform: `translateY(${(-10 * p).toFixed(2)}rpx) scaleY(${(1 - 0.02 * p).toFixed(3)})`,
    paddingTop: `${(10 * expand).toFixed(2)}px`,
    paddingBottom: `${(8 * expand).toFixed(2)}px`,
    borderColor: `rgba(118, 171, 255, ${(0.16 * expand).toFixed(3)})`,
    pointerEvents: p > 0.95 ? 'none' : 'auto',
  }
})
const dividerHint = computed(() => {
  return collapseProgress.value >= 0.5 ? '下滑显示日历' : '上滑聚焦操作区'
})
const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const monthName = computed(() => `${displayedMonth.value.getMonth() + 1} 月`)
const year = computed(() => displayedMonth.value.getFullYear())
const dateEN = computed(() => {
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const activeDate = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth(), selectedDay.value)
  return `${week[activeDate.getDay()]}，${activeDate.getMonth() + 1} 月 ${activeDate.getDate()} 日`
})
const todayText = computed(() => {
  const d = new Date(nowTick.value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})
const weather = ref(defaultWeather())
const helloText = ref('晚上好')
const weatherLocationLabel = computed(() => {
  if (gpsPlaceName.value) return gpsPlaceName.value
  const fromOngoing = filteredOngoing.value.find((t) => currentTripLocation(t))
  if (fromOngoing) return currentTripLocation(fromOngoing)
  const fromArchive = filteredToArchive.value.find((t) => currentTripLocation(t))
  if (fromArchive) return currentTripLocation(fromArchive)
  return ''
})
const weatherLocationQuery = computed(() => simplifyLocation(weatherLocationLabel.value))
const calendarDays = computed(() => {
  const y = displayedMonth.value.getFullYear()
  const m = displayedMonth.value.getMonth()
  const first = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  const prevTotal = new Date(y, m, 0).getDate()
  const arr = []
  for (let i = 0; i < first; i += 1) {
    const day = prevTotal - first + i + 1
    arr.push({ key: `p-${day}`, day, inMonth: false, monthOffset: -1 })
  }
  for (let day = 1; day <= total; day += 1) {
    arr.push({ key: `d-${day}`, day, inMonth: true, monthOffset: 0 })
  }
  let nextDay = 1
  while (arr.length < 42) {
    arr.push({ key: `n-${nextDay}`, day: nextDay, inMonth: false, monthOffset: 1 })
    nextDay += 1
  }
  return arr
})

const rightOptions = [
  {
    text: '归档',
    style: {
      backgroundColor: '#f43f5e',
      color: '#fff',
    },
  },
]

const filteredOngoing = computed(() => {
  const selected = currentSelectedDate()
  return ongoing.value
    .filter((t) => tripDateValue(t) === selected)
    .slice()
    .sort((a, b) => scheduleOrder(a) - scheduleOrder(b))
})
const filteredToArchive = computed(() => {
  const selected = currentSelectedDate()
  return toArchive.value
    .filter((t) => tripDateValue(t) === selected)
    .slice()
    .sort((a, b) => scheduleOrder(a) - scheduleOrder(b))
})

// 统计数据计算
const completedThisMonth = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  return store.allTrips?.filter(trip => {
    if (trip.status !== 'archived') return false
    const tripDate = new Date(tripDateValue(trip))
    return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear
  }).length || 0
})

const monthlyTrend = computed(() => {
  // 简单的趋势计算，实际应用中可以基于历史数据
  const lastMonth = completedThisMonth.value - 2
  if (completedThisMonth.value > lastMonth) return 'up'
  if (completedThisMonth.value < lastMonth) return 'down'
  return ''
})

const monthlyTrendValue = computed(() => {
  const lastMonth = completedThisMonth.value - 2
  if (lastMonth === 0) return 100
  return Math.round(((completedThisMonth.value - lastMonth) / lastMonth) * 100)
})

function progress(t) {
  return store.progress(t)
}
function onCreate() {
  if (isNavigating.value) return
  isNavigating.value = true
  const date = currentSelectedDate()
  uni.navigateTo({
    url: `/pages/template-selector/index?source=Calendar&date=${encodeURIComponent(date)}&postCreate=cardOnly`,
    complete: () => {
      setTimeout(() => {
        isNavigating.value = false
      }, 220)
    },
  })
}
function openChecklist(t, isReturn) {
  const mode = isReturn ? 'return' : 'departure'
  uni.navigateTo({ url: `/pages/trip-checklist/index?id=${t.id}&mode=${mode}` })
}
function startReturn(t) {
  store.startReturnIfNeeded(t.id)
  uni.navigateTo({ url: `/pages/trip-checklist/index?id=${t.id}&mode=return` })
}
function depart(t) {
  store.depart(t.id)
  uni.showToast({ title: '已出发', icon: 'none' })
}
function archive(t) {
  store.archiveTrip(t.id)
  uni.showToast({ title: '已归档', icon: 'none' })
}
function onSwipeClick(t) {
  archive(t)
}
async function onTripTap(t) {
  if (suppressTapTripId.value === t.id && Date.now() < suppressTapUntil.value) {
    return
  }
  if (t.status === 'packed') {
    uni.showToast({
      title: '已打包完成，可修改清单或直接出发',
      icon: 'none',
    })
    const act = await openAction({
      title: '请选择下一步',
      actions: ['修改清单', '出发'],
    })
    if (act.index === 0) {
      openChecklist(t, false)
      return
    }
    if (act.index === 1) {
      depart(t)
    }
    return
  }
  if (t.status === 'departed') {
    startReturn(t)
    return
  }
  if (t.status === 'returnPhase') {
    openChecklist(t, true)
    return
  }
  openChecklist(t, false)
}
function onTripLongPress(t) {
  suppressTapTripId.value = t.id
  suppressTapUntil.value = Date.now() + 800
  const isCalendar = isCalendarSource(t?.source)
  const content = isCalendar
    ? '删除后将同步从计划日历和行程列表移除，是否继续？'
    : '删除后将从行程列表移除，是否继续？'
  openConfirm({
    title: '删除行程',
    message: content,
    confirmText: '删除',
    danger: true,
  })
    .then((res) => {
      if (!res.confirm) return
      const removed = store.deleteTrip(t.id)
      if (!removed) {
        uni.showToast({ title: '删除失败，请重试', icon: 'none' })
        return
      }
      uni.showToast({
        title: isCalendar ? '已删除并同步移除日历' : '已删除行程',
        icon: 'none',
      })
    })
    .catch(() => {})
}
function quickDepart() {
  if (Date.now() < suppressQuickTapUntil.value) return
  if (isNavigating.value) return
  isNavigating.value = true
  const date = currentSelectedDate()
  const templates = Array.isArray(templateStore.templates) ? templateStore.templates : []
  if (!templates.length) {
    uni.navigateTo({
      url: `/pages/template-selector/index?source=Temporary&date=${encodeURIComponent(date)}&postCreate=checklist`,
      complete: () => {
        setTimeout(() => {
          isNavigating.value = false
        }, 220)
      },
    })
    return
  }
  const lastTemplateId = String(uni.getStorageSync(LAST_TEMPLATE_KEY) || '').trim()
  const selected = templates.find((tpl) => tpl.id === lastTemplateId) || templates[0]
  const trip = store.createTripFromTemplate(selected, {
    source: 'Temporary',
    title: selected.name,
    date,
    scheduleTime: '',
    destination: '',
    keyTime: '',
    idType: '',
    templateId: selected.id,
    templateCategory: selected.category || 'general',
  })
  uni.setStorageSync(LAST_TEMPLATE_KEY, selected.id)
  uni.showToast({
    title: `已用「${selected.name}」创建，进入清点`,
    icon: 'none',
  })
  uni.navigateTo({
    url: `/pages/trip-checklist/index?id=${trip.id}&mode=departure`,
    complete: () => {
      setTimeout(() => {
        isNavigating.value = false
      }, 220)
    },
  })
}
function quickDepartPickTemplate() {
  if (isNavigating.value) return
  suppressQuickTapUntil.value = Date.now() + 700
  isNavigating.value = true
  const date = currentSelectedDate()
  uni.navigateTo({
    url: `/pages/template-selector/index?source=Temporary&date=${encodeURIComponent(date)}&postCreate=checklist`,
    complete: () => {
      setTimeout(() => {
        isNavigating.value = false
      }, 220)
    },
  })
}
function selectDay(cell) {
  if (!cell) return
  if (cell.inMonth) {
    selectedDay.value = cell.day
    return
  }
  if (cell.monthOffset === -1) {
    switchMonth(-1)
    selectedDay.value = cell.day
    return
  }
  if (cell.monthOffset === 1) {
    switchMonth(1)
    selectedDay.value = cell.day
  }
}
function switchMonth(step) {
  const next = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth() + step, 1)
  displayedMonth.value = next
  const daysInTarget = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  if (selectedDay.value > daysInTarget) {
    selectedDay.value = daysInTarget
  }
}
function sourceText(src) {
  if (!src) return ''
  const value = String(src).toLowerCase()
  return value === 'calendar' || value === '日历' ? 'Calendar' : 'Temporary'
}
function isCalendarSource(src) {
  const value = String(src || '').toLowerCase()
  return value === 'calendar' || value === '日历'
}
function sourceLabel(t) {
  return isCalendarSource(t?.source) ? '来源：日历' : '来源：临时'
}
function departTimeText(t) {
  const datePart = String(t?.date || '').trim() || extractDate(t?.time)
  const zhDate = toZhDate(datePart)
  const segment = String(t?.scheduleTime || '').trim() || extractClock(t?.time)
  const key = String(t?.keyTime || '').trim()
  if (zhDate && segment && key) return `时间：${zhDate} ${segment}｜${key}`
  if (zhDate && segment) return `时间：${zhDate} ${segment}`
  if (zhDate && key) return `时间：${zhDate}｜${key}`
  if (zhDate) return `时间：${zhDate}`
  if (segment && key) return `时间：${segment}｜${key}`
  if (segment) return `时间：${segment}`
  if (key) return `时间：${key}`
  return '时间：立即出发'
}
function toZhDate(dateText) {
  const match = String(dateText || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return ''
  const y = match[1]
  const m = Number(match[2])
  const d = Number(match[3])
  return `${y} 年 ${m}月 ${d}日`
}
function locationText(t) {
  const raw = String(t?.destination || '').trim() || String(t?.location || '').trim()
  if (!raw || raw === '未设置') return '地点：未填写'
  return `地点：${raw}`
}
function isLocationMissing(t) {
  const raw = String(t?.destination || '').trim() || String(t?.location || '').trim()
  return !raw || raw === '未设置'
}
function currentTripLocation(t) {
  const raw = String(t?.destination || '').trim() || String(t?.location || '').trim()
  if (!raw || raw === '未设置' || raw === '未填写') return ''
  return raw
}
function keyTimeText(t) {
  const key = String(t?.keyTime || '').trim()
  if (!key) return '关键时间：未填写'
  return `关键时间：${key}`
}
function extractDate(raw) {
  const match = String(raw || '').match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}
function extractClock(raw) {
  const match = String(raw || '').match(/([01]?\d|2[0-3]):([0-5]\d)/)
  if (!match) return ''
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`
}
function tripDateValue(t) {
  const direct = String(t?.date || '').trim()
  return direct || extractDate(t?.time)
}
function scheduleOrder(t) {
  const v = String(t?.scheduleTime || '').trim() || extractClock(t?.time)
  const match = v.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[1]) * 60 + Number(match[2])
}
function statusText(t) {
  if (t.status === 'preparation') return '准备中'
  if (t.status === 'packing') return '清点中'
  if (t.status === 'packed') return '已打包'
  if (t.status === 'departed') return '已出发'
  if (t.status === 'returnPhase') return t.returnCompleted ? '待归档' : '返程清点中'
  return '准备中'
}
function statusStep(t) {
  if (t.status === 'preparation') return 1
  if (t.status === 'packing') return 2
  if (t.status === 'packed') return 3
  if (t.status === 'departed') return 4
  if (t.status === 'returnPhase') return t.returnCompleted ? 6 : 5
  return 1
}
function statusColor(step) {
  const colors = themeClass.value === 'theme-day' ? DAY_STATUS_COLORS : NIGHT_STATUS_COLORS
  return colors[step - 1] || colors[0]
}
function segmentStyle(index, step) {
  const colors = themeClass.value === 'theme-day' ? DAY_STATUS_COLORS : NIGHT_STATUS_COLORS
  const active = index <= step
  return {
    background: colors[index - 1] || colors[0],
    opacity: active ? (themeClass.value === 'theme-day' ? 0.9 : 0.95) : (themeClass.value === 'theme-day' ? 0.35 : 0.22),
  }
}
function segmentClass(index, step) {
  return {
    active: index <= step,
    current: index === step,
  }
}
function statusTextStyle(t) {
  const color = statusColor(statusStep(t))
  return {
    color,
    borderColor: `${color}${themeClass.value === 'theme-day' ? '88' : '66'}`,
  }
}
function isAlarmEnabled(t) {
  return !!t?.alarmEnabled
}
function alarmTimeValue(t) {
  const value = String(t?.alarmTime || '').trim()
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return '09:00'
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`
}
function setAlarmEnabled(t, enabled) {
  store.updateTripMeta(t.id, {
    alarmEnabled: enabled,
    alarmTime: alarmTimeValue(t),
  })
  uni.showToast({
    title: enabled ? '已开启本地提醒' : '已关闭本地提醒',
    icon: 'none',
  })
}
async function setAlarmTime(t) {
  const res = await openPrompt({
    title: `设置提醒时间（当前 ${alarmTimeValue(t)}）`,
    placeholder: '输入 HH:mm，例如 08:30',
    modelValue: alarmTimeValue(t),
    confirmText: '保存',
  })
  if (!res.confirm) return
  const value = String(res.value || '').trim()
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) {
    uni.showToast({ title: '时间格式错误，应为 HH:mm', icon: 'none' })
    return
  }
  const next = `${String(match[1]).padStart(2, '0')}:${match[2]}`
  store.updateTripMeta(t.id, {
    alarmTime: next,
    alarmEnabled: true,
  })
  uni.showToast({ title: `提醒时间已设为 ${next}`, icon: 'none' })
}
async function onAlarmTap(t) {
  const enabled = isAlarmEnabled(t)
  const res = await openAction({
    title: '本地提醒',
    actions: [enabled ? '关闭本地提醒' : '开启本地提醒', `设置提醒时间（当前 ${alarmTimeValue(t)}）`, '同步到系统日历并提醒'],
  })
  if (res.index === 0) {
    setAlarmEnabled(t, !enabled)
    return
  }
  if (res.index === 1) {
    await setAlarmTime(t)
    return
  }
  if (res.index === 2) {
    await syncTripToSystemCalendar(t)
  }
}
function currentSelectedDate() {
  const y = displayedMonth.value.getFullYear()
  const m = String(displayedMonth.value.getMonth() + 1).padStart(2, '0')
  const d = String(selectedDay.value).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function applyCalendarCollapsePolicy() {
  collapseLevel.value = 0
}
function clampCollapseProgress(value) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}
function toggleInfoLayer() {
  if (Date.now() < suppressDividerTapUntil.value) return
  isDividerDragging.value = false
  dividerDragOffsetY.value = 0
  collapseLevel.value = collapseLevel.value === 2 ? 0 : 2
}
function onDividerTouchStart(e) {
  touchStartY.value = e?.changedTouches?.[0]?.clientY || 0
  dividerDragOffsetY.value = 0
  isDividerDragging.value = true
}
function onDividerTouchMove(e) {
  if (!isDividerDragging.value) return
  const currentY = e?.changedTouches?.[0]?.clientY || touchStartY.value
  dividerDragOffsetY.value = currentY - touchStartY.value
}
function onDividerTouchEnd(e) {
  if (!isDividerDragging.value) return
  const endY = e?.changedTouches?.[0]?.clientY || 0
  const delta = endY - touchStartY.value
  dividerDragOffsetY.value = delta
  const nextProgress = clampCollapseProgress(baseCollapseProgress.value + (-delta / DIVIDER_DRAG_DISTANCE))
  const shouldToggleByGesture = Math.abs(delta) >= 8
  if (shouldToggleByGesture) {
    suppressDividerTapUntil.value = Date.now() + DIVIDER_TAP_GUARD_MS
    collapseLevel.value = nextProgress >= 0.5 ? 2 : 0
  }
  isDividerDragging.value = false
  dividerDragOffsetY.value = 0
}
function onDividerTouchCancel() {
  isDividerDragging.value = false
  dividerDragOffsetY.value = 0
}
function defaultWeather() {
  return {
    code: 'sunny',
    label: '晴',
    low: 13,
    high: 24,
    sunrise: '06:21',
    sunset: '18:07',
    place: '北京',
    updatedAt: 0,
  }
}
function simplifyLocation(raw) {
  return String(raw || '')
    .replace(/[·•]/g, ' ')
    .replace(/[()（）]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
function parseHHMM(raw) {
  if (!raw) return '--:--'
  const at = String(raw)
  const parts = at.split('T')
  const timePart = (parts[1] || '').slice(0, 5)
  if (timePart.length === 5) return timePart
  return '--:--'
}
function mapWeatherType(code) {
  if ([0, 1].includes(code)) return { code: 'sunny', label: '晴' }
  if ([2, 3, 45, 48].includes(code)) return { code: 'cloudy', label: '多云' }
  return { code: 'rainy', label: '降水' }
}
function weatherStorageKey(locationKey) {
  return `${WEATHER_CACHE_KEY}:${encodeURIComponent(locationKey || 'default')}`
}
function readCachedWeather(locationKey) {
  try {
    const cached = uni.getStorageSync(weatherStorageKey(locationKey))
    if (!cached) return null
    const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
    if (!parsed || typeof parsed !== 'object') return null
    return { ...defaultWeather(), ...parsed }
  } catch {
    return null
  }
}
function writeCachedWeather(locationKey, payload) {
  try {
    uni.setStorageSync(weatherStorageKey(locationKey), payload)
  } catch {}
}
function requestWeather(latitude, longitude) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://api.open-meteo.com/v1/forecast',
      method: 'GET',
      timeout: 6000,
      data: {
        latitude,
        longitude,
        timezone: 'Asia/Shanghai',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
      },
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })
  })
}
function geocodeLocation(name) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://geocoding-api.open-meteo.com/v1/search',
      method: 'GET',
      timeout: 5000,
      data: {
        name,
        count: 1,
        language: 'zh',
        format: 'json',
      },
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })
  })
}
function reverseGeocode(latitude, longitude) {
  return Promise.resolve({
    data: {
      results: [],
      latitude,
      longitude,
    },
  })
}
function geoPlaceName(geo) {
  const city = String(geo?.city || '').trim()
  const district = String(geo?.district || '').trim()
  const county = String(geo?.county || '').trim()
  const name = String(geo?.name || '').trim()
  const admin2 = String(geo?.admin2 || '').trim()
  const admin1 = String(geo?.admin1 || '').trim()
  if (city && district) return `${city} ${district}`
  if (city && county) return `${city} ${county}`
  if (city) return city
  if (name && admin1 && !name.includes(admin1)) return `${admin1} ${name}`
  if (name) return name
  if (admin2 && admin1 && admin2 !== admin1) return `${admin1} ${admin2}`
  return admin2 || admin1 || ''
}
function requestCurrentLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })
  })
}
async function refreshLiveContext(force = false) {
  const now = Date.now()
  if (!force && now - gpsUpdatedAt.value < LIVE_CONTEXT_REFRESH_MS) return
  try {
    const pos = await requestCurrentLocation()
    const latitude = Number(pos?.latitude)
    const longitude = Number(pos?.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
    gpsLatitude.value = latitude
    gpsLongitude.value = longitude
    gpsUpdatedAt.value = now
    let place = '当前位置'
    try {
      const geo = await reverseGeocode(latitude, longitude)
      const first = geo?.data?.results?.[0]
      place = geoPlaceName(first) || place
    } catch {}
    gpsPlaceName.value = place
  } catch {
    gpsPlaceName.value = ''
  }
}
async function refreshWeather(force = false) {
  const locationKey = weatherLocationQuery.value
  const hasGps = Number.isFinite(gpsLatitude.value) && Number.isFinite(gpsLongitude.value)
  const cacheKey = hasGps
    ? `gps:${gpsLatitude.value.toFixed(2)},${gpsLongitude.value.toFixed(2)}`
    : locationKey ? `name:${locationKey}` : 'gps'
  const cached = readCachedWeather(cacheKey)
  if (cached) weather.value = cached
  const now = Date.now()
  if (!force && cached && now - (cached.updatedAt || 0) < WEATHER_REFRESH_MS) return
  try {
    let latitude = 39.9042
    let longitude = 116.4074
    let place = '北京'
    if (hasGps) {
      latitude = gpsLatitude.value
      longitude = gpsLongitude.value
      place = gpsPlaceName.value || '当前位置'
    } else if (locationKey) {
      place = weatherLocationLabel.value || locationKey
      try {
        const geo = await geocodeLocation(locationKey)
        const first = geo?.data?.results?.[0]
        if (first && Number.isFinite(Number(first.latitude)) && Number.isFinite(Number(first.longitude))) {
          latitude = Number(first.latitude)
          longitude = Number(first.longitude)
          place = geoPlaceName(first) || place
        }
      } catch {}
    } else {
      try {
        const pos = await requestCurrentLocation()
        if (Number.isFinite(Number(pos?.latitude)) && Number.isFinite(Number(pos?.longitude))) {
          latitude = Number(pos.latitude)
          longitude = Number(pos.longitude)
          place = '当前位置'
          try {
            const geo = await reverseGeocode(latitude, longitude)
            const first = geo?.data?.results?.[0]
            place = geoPlaceName(first) || place
          } catch {}
        }
      } catch {}
    }
    const res = await requestWeather(latitude, longitude)
    const daily = res?.data?.daily || {}
    const weatherCodes = daily.weather_code || daily.weathercode || []
    const highs = daily.temperature_2m_max || []
    const lows = daily.temperature_2m_min || []
    const sunrises = daily.sunrise || []
    const sunsets = daily.sunset || []
    if (!highs.length || !lows.length) return
    const info = mapWeatherType(Number(weatherCodes[0] || 0))
    const next = {
      code: info.code,
      label: info.label,
      low: Math.round(Number(lows[0] || 0)),
      high: Math.round(Number(highs[0] || 0)),
      sunrise: parseHHMM(sunrises[0]),
      sunset: parseHHMM(sunsets[0]),
      place,
      updatedAt: now,
    }
    weather.value = next
    writeCachedWeather(cacheKey, next)
  } catch {}
}
function clearRealtimeTimers() {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
  if (liveContextTimer) {
    clearInterval(liveContextTimer)
    liveContextTimer = null
  }
}
function startRealtimeSync() {
  clearRealtimeTimers()
  nowTick.value = Date.now()
  updateHelloText()
  refreshLiveContext(true).finally(() => {
    refreshWeather(true)
  })
  clockTimer = setInterval(() => {
    nowTick.value = Date.now()
    updateHelloText()
  }, CLOCK_REFRESH_MS)
  liveContextTimer = setInterval(() => {
    refreshLiveContext(true).finally(() => {
      refreshWeather(true)
    })
  }, LIVE_CONTEXT_REFRESH_MS)
}
function callWxApi(apiName, payload = {}) {
  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined' || typeof wx[apiName] !== 'function') {
      reject(new Error('unsupported'))
      return
    }
    wx[apiName]({
      ...payload,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })
  })
}
async function ensureAddPhoneCalendarPermission() {
  try {
    const setting = await callWxApi('getSetting')
    if (setting?.authSetting?.['scope.addPhoneCalendar']) return true
    await callWxApi('authorize', { scope: 'scope.addPhoneCalendar' })
    return true
  } catch {
    try {
      await callWxApi('openSetting')
      const setting = await callWxApi('getSetting')
      return !!setting?.authSetting?.['scope.addPhoneCalendar']
    } catch {
      return false
    }
  }
}
function parseDateParts(dateText) {
  const raw = String(dateText || '').trim()
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}
function normalizeHHMM(raw, fallback = '09:00') {
  const value = String(raw || '').trim()
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!match) return fallback
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`
}
function hhmmToSeconds(raw) {
  const [h, m] = normalizeHHMM(raw).split(':').map((n) => Number(n))
  return h * 3600 + m * 60
}
function tripCalendarPayload(t) {
  const datePart = String(t?.date || '').trim() || extractDate(t?.time)
  const parts = parseDateParts(datePart)
  if (!parts) return null
  const eventHHMM = normalizeHHMM(String(t?.scheduleTime || '').trim() || extractClock(t?.time), '09:00')
  const [eventHour, eventMinute] = eventHHMM.split(':').map((n) => Number(n))
  const startMs = new Date(parts.year, parts.month - 1, parts.day, eventHour, eventMinute, 0).getTime()
  if (!Number.isFinite(startMs)) return null
  const endMs = startMs + 60 * 60 * 1000
  const alarmHHMM = normalizeHHMM(alarmTimeValue(t), eventHHMM)
  const alarmOffset = Math.max(0, hhmmToSeconds(eventHHMM) - hhmmToSeconds(alarmHHMM))
  return {
    title: String(t?.title || 'ReadyToGo 行程').trim() || 'ReadyToGo 行程',
    startTime: Math.floor(startMs / 1000),
    endTime: Math.floor(endMs / 1000),
    location: String(t?.destination || t?.location || '').trim(),
    description: String(t?.keyTime || '').trim() ? `关键时间：${String(t.keyTime).trim()}` : '由 ReadyToGo 创建',
    alarmOffset,
  }
}
async function syncTripToSystemCalendar(t) {
  const payload = tripCalendarPayload(t)
  if (!payload) {
    uni.showToast({ title: '请先完善行程日期和时段', icon: 'none' })
    return
  }
  if (typeof wx === 'undefined' || typeof wx.addPhoneCalendar !== 'function') {
    uni.showToast({ title: '当前环境不支持系统日历写入', icon: 'none' })
    return
  }
  const granted = await ensureAddPhoneCalendarPermission()
  if (!granted) {
    uni.showToast({ title: '未获得日历权限', icon: 'none' })
    return
  }
  try {
    await callWxApi('addPhoneCalendar', {
      ...payload,
      alarm: true,
    })
    store.updateTripMeta(t.id, {
      alarmEnabled: true,
      calendarSyncedAt: Date.now(),
    })
    uni.showToast({ title: '已同步到系统日历', icon: 'none' })
  } catch {
    uni.showToast({ title: '同步失败，请稍后重试', icon: 'none' })
  }
}
async function syncFromSystemCalendar() {
  if (typeof wx === 'undefined' || typeof wx.chooseCalendar !== 'function') {
    uni.showToast({ title: '当前微信环境不支持读取系统日历', icon: 'none' })
    return
  }
  try {
    const picked = await callWxApi('chooseCalendar')
    const title = String(picked?.title || picked?.summary || '系统日历行程').trim()
    const startTime = Number(picked?.startTime || picked?.startDate || 0)
    if (!Number.isFinite(startTime) || startTime <= 0) {
      uni.showToast({ title: '读取失败：未获取到时间', icon: 'none' })
      return
    }
    const startMs = startTime < 1000000000000 ? startTime * 1000 : startTime
    const dt = new Date(startMs)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    const hh = String(dt.getHours()).padStart(2, '0')
    const min = String(dt.getMinutes()).padStart(2, '0')
    const created = store.createCalendarTrip(title)
    if (created?.id) {
      store.updateTripMeta(created.id, {
        date: `${yyyy}-${mm}-${dd}`,
        scheduleTime: `${hh}:${min}`,
        destination: String(picked?.location || '').trim(),
        location: String(picked?.location || '').trim() || '未设置',
        keyTime: '',
        time: `${yyyy}-${mm}-${dd} ${hh}:${min}`,
      })
    }
    uni.showToast({ title: '已读取系统日历事项', icon: 'none' })
  } catch {
    uni.showToast({ title: '读取已取消或暂不可用', icon: 'none' })
  }
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
watch(weatherLocationQuery, (next, prev) => {
  if (next === prev) return
  refreshWeather(true)
})
onShow(() => {
  isNavigating.value = false
  nowTick.value = Date.now()
  updateHelloText()
  applyCalendarCollapsePolicy()
  try {
    const autoTab = uni.getStorageSync(HOME_AUTO_TAB_KEY)
    if (autoTab === 'archive') {
      tab.value = 1
      uni.removeStorageSync(HOME_AUTO_TAB_KEY)
    }
  } catch {}
  startRealtimeSync()
})
onHide(() => {
  isNavigating.value = false
  clearRealtimeTimers()
})
onUnload(() => {
  clearRealtimeTimers()
})
applyCalendarCollapsePolicy()
nowTick.value = Date.now()
updateHelloText()
function updateHelloText() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) {
    helloText.value = '早上好'
    return
  }
  if (hour >= 11 && hour < 14) {
    helloText.value = '中午好'
    return
  }
  if (hour >= 14 && hour < 18) {
    helloText.value = '下午好'
    return
  }
  helloText.value = '晚上好'
}
</script>

<style scoped>
/* @import '../../styles/variables.scss'; */

.page {
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xl);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.theme-day {
  background: linear-gradient(180deg, var(--bg-primary-light) 0%, var(--bg-secondary-light) 100%);
}

.home-shell {
  min-height: auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.upper-pane {
  min-height: auto;
  transition: all var(--transition-normal);
  overflow: hidden;
}

.lower-pane {
  min-height: auto;
  transition: all var(--transition-normal);
}

.hero-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-normal);
}

.hello {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--primary-light);
  letter-spacing: -0.02em;
}

.date-en {
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}

.brand-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-normal);
}

.calendar-pane {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
  max-height: 520rpx;
  opacity: 1;
  transform: translateY(0) scaleY(1);
  transform-origin: top center;
  overflow: hidden;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
}

.brand {
  font-size: var(--text-4xl);
  line-height: 1;
  font-weight: var(--font-bold);
  color: var(--primary-color);
  letter-spacing: -0.03em;
}

.slogan {
  margin-left: var(--spacing-xs);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.weather-card {
  margin-top: var(--spacing-md);
  margin-bottom: 0;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.weather-card::before {
  content: '';
  position: absolute;
  inset: -15% -10%;
  pointer-events: none;
}

.weather-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.weather-card.sunny {
  background: linear-gradient(135deg, rgba(22, 70, 131, 0.72), rgba(208, 129, 36, 0.22));
  border-color: rgba(255, 198, 92, 0.35);
}

.weather-card.sunny::before {
  background: radial-gradient(circle at 85% 18%, rgba(255, 214, 117, 0.28), rgba(255, 214, 117, 0) 45%);
  animation: sunshine 7s ease-in-out infinite;
}

.weather-card.sunny::after {
  background: radial-gradient(circle at 20% 80%, rgba(131, 200, 255, 0.2), rgba(131, 200, 255, 0) 42%);
}

.weather-card.cloudy {
  background: linear-gradient(145deg, rgba(27, 50, 84, 0.74), rgba(78, 104, 136, 0.26));
  border-color: rgba(161, 188, 224, 0.33);
}

.weather-card.cloudy::before {
  background: linear-gradient(90deg, rgba(198, 214, 242, 0) 0%, rgba(198, 214, 242, 0.16) 42%, rgba(198, 214, 242, 0) 100%);
  animation: cloudShift 8s ease-in-out infinite;
}

.weather-card.rainy {
  background: linear-gradient(145deg, rgba(9, 24, 47, 0.84), rgba(25, 57, 103, 0.5));
  border-color: rgba(122, 175, 255, 0.34);
}

.weather-card.rainy::before {
  background: repeating-linear-gradient(
    105deg,
    rgba(123, 181, 255, 0.2) 0 2rpx,
    rgba(123, 181, 255, 0) 2rpx 16rpx
  );
  animation: rainfall 6s linear infinite;
  opacity: 0.65;
}

.weather-card.rainy::after {
  background: radial-gradient(circle at 18% 18%, rgba(122, 176, 255, 0.24), rgba(122, 176, 255, 0) 55%);
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.weather-anim {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sun-core {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff8cc, #ffc940);
  box-shadow: 0 0 20rpx rgba(255, 208, 74, 0.65);
  animation: pulse 2.2s ease-in-out infinite;
}

.cloud-core {
  width: 42rpx;
  height: 22rpx;
  border-radius: 999px;
  background: linear-gradient(90deg, #d3def3, #f4f7ff);
  box-shadow: 0 6rpx 16rpx rgba(154, 177, 224, 0.45);
  animation: drift 2.4s ease-in-out infinite;
}

.rain-core {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 35%, #dbeafe, #93c5fd);
  box-shadow: 0 0 16rpx rgba(76, 143, 255, 0.45);
  position: relative;
  animation: drift 1.9s ease-in-out infinite;
}

.rain-core::after {
  content: '';
  position: absolute;
  left: 8rpx;
  bottom: -10rpx;
  width: 18rpx;
  height: 12rpx;
  background: repeating-linear-gradient(
    90deg,
    rgba(147, 197, 253, 0.9) 0 2rpx,
    rgba(147, 197, 253, 0) 2rpx 6rpx
  );
}

.weather-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
}

.weather-date {
  color: rgba(214, 230, 255, 0.72);
  font-size: 23rpx;
}

.weather-temp {
  color: #eff7ff;
  font-size: 32rpx;
  font-weight: 700;
}

.weather-sub {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  color: rgba(179, 215, 255, 0.84);
  font-size: 23rpx;
  position: relative;
  z-index: 1;
}

.month-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.month-title {
  display: block;
  font-size: var(--text-3xl);
  line-height: 1;
  color: var(--primary-color);
  font-weight: var(--font-bold);
}

.month-year {
  display: block;
  margin-top: var(--spacing-xs);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.month-nav {
  display: flex;
  gap: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 32rpx;
}

.month-arrow {
  width: 56rpx;
  text-align: center;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.week-row {
  margin-top: var(--spacing-sm);
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.calendar-scroll {
  margin-top: var(--spacing-sm);
  height: 344rpx;
}

.week-item {
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--spacing-xs) 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs) 0;
  padding-bottom: var(--spacing-xs);
}

.day-cell {
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  cursor: pointer;
  position: relative;
  
  &:hover:not(.muted) {
    background: var(--bg-secondary);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.day-cell.muted {
  color: var(--text-disabled);
  opacity: 0.6;
}

.day-cell.active {
  background: var(--primary-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  transform: scale(1.1);
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: var(--radius-full);
    background: var(--primary-color);
    opacity: 0.2;
    z-index: -1;
  }
}

.divider {
  margin: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  cursor: pointer;
  padding: var(--spacing-sm) 0;
  
  &:hover .divider-line {
    background: var(--primary-color);
    transform: scaleX(1.1);
  }
}

.home-shell.dragging .upper-pane,
.home-shell.dragging .lower-pane,
.home-shell.dragging .hero-top,
.home-shell.dragging .brand-row,
.home-shell.dragging .calendar-pane,
.home-shell.dragging .divider {
  transition-duration: 0s;
}

.divider-line {
  width: 92px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--border-primary);
  transition: all var(--transition-fast);
}

.divider-text {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: 0;
}

.action-hints {
  margin-top: var(--spacing-sm);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.action-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  opacity: 0.8;
}

.action-link {
  font-size: var(--text-xs);
  color: var(--primary-color);
  line-height: var(--leading-relaxed);
  font-weight: var(--font-medium);
  text-decoration: underline;
  text-underline-offset: 2px;
  
  &:hover {
    color: var(--primary-light);
  }
}

.cta {
  border: 0;
  border-radius: var(--radius-lg);
  width: 100%;
  color: var(--text-inverse);
  height: 90rpx;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rpx;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.cta-title {
  display: block;
  line-height: 1.1;
  font-weight: var(--font-bold);
}

.cta-desc {
  display: block;
  font-size: var(--text-xs);
  line-height: 1.1;
  opacity: 0.9;
  font-weight: var(--font-medium);
}

.cta.busy {
  opacity: 0.7;
  cursor: not-allowed;
  
  &:hover {
    transform: none;
    box-shadow: none;
  }
}

.page.navigating .sun-core,
.page.navigating .cloud-core,
.page.navigating .rain-core,
.page.navigating .weather-card.sunny::before,
.page.navigating .weather-card.cloudy::before,
.page.navigating .weather-card.rainy::before,
.page.navigating .status-segment.current {
  animation: none !important;
}

.cta.quick {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.cta.create {
  background: linear-gradient(135deg, var(--warning-color), var(--error-color));
}

.chip-row {
  margin-top: var(--spacing-md);
  display: flex;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.chip-row.second {
  margin-top: var(--spacing-md);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
  padding: 0 var(--spacing-xs);
}

.chip {
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  line-height: 64rpx;
  padding: 0 var(--spacing-md);
  transition: all var(--transition-fast);
  font-weight: var(--font-medium);
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.chip.small {
  line-height: 58rpx;
  font-size: var(--text-xs);
  padding: 0 var(--spacing-sm);
}

.chip.active {
  background: var(--primary-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: var(--radius-full);
    background: var(--primary-color);
    opacity: 0.2;
    z-index: -1;
  }
}

.list-region {
  flex: 1;
  min-height: 0;
  margin-top: var(--spacing-sm);
}

.trip-scroll {
  height: 100%;
}

.list-title {
  margin-top: var(--spacing-md);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.empty {
  text-align: center;
  color: var(--text-tertiary);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  font-size: var(--text-sm);
  opacity: 0.8;
}

.tip {
  margin-top: var(--spacing-sm);
  color: var(--primary-light);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.trip-card {
  margin-top: var(--spacing-md);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-secondary);
  }
}

.status-strip {
  margin-bottom: var(--spacing-sm);
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-xs);
}

.status-segment {
  height: 8rpx;
  border-radius: var(--radius-full);
  transform-origin: center;
  transition: all var(--transition-fast);
}

.status-segment.active {
  box-shadow: 0 0 12rpx currentColor;
  transform: scaleY(1.2);
}

.status-segment.current {
  transform: scaleY(1.4);
  animation: pulse 1.8s ease-in-out infinite;
}

.status-step-row {
  margin-bottom: var(--spacing-sm);
}

.status-step-text {
  font-size: var(--text-xs);
  color: var(--warning-color);
  font-weight: var(--font-medium);
}

.trip-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.trip-body-active {
  transform: scale(0.992);
  opacity: 0.95;
  background: var(--bg-secondary);
}

.trip-left {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.trip-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.1;
}

.source-pill {
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-full);
  padding: 2px var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  display: inline-block;
  font-weight: var(--font-medium);
  background: var(--bg-tertiary);
}

.trip-line {
  margin-top: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
  display: block;
}

.trip-line.location-line {
  color: var(--text-tertiary);
}

.trip-line.location-line.missing {
  color: var(--error-color);
  font-weight: var(--font-medium);
}

.trip-right {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
}

.alarm-btn {
  width: 78rpx;
  height: 78rpx;
  border-radius: var(--radius-full);
  border: 1px solid var(--error-color);
  background: transparent;
  color: var(--error-color);
  font-size: 32rpx;
  line-height: 74rpx;
  text-align: center;
  padding: 0;
  transition: all var(--transition-fast);
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
    background: var(--error-color);
    color: var(--text-inverse);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.alarm-btn.enabled {
  color: var(--success-color);
  border-color: var(--success-color);
  
  &:hover {
    background: var(--success-color);
    color: var(--text-inverse);
  }
}

.status-pill {
  min-width: 112rpx;
  border-radius: var(--radius-full);
  padding: var(--spacing-xs) var(--spacing-sm);
  text-align: center;
  font-size: var(--text-xs);
  border: 1px solid var(--border-secondary);
  background: var(--bg-tertiary);
  margin-top: var(--spacing-xs);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
}

// 浅色主题适配
.theme-day {
  font-family: 'Inter', 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(180deg, var(--bg-primary-light) 0%, var(--bg-secondary-light) 100%);
  color: var(--text-primary-light);
}

.theme-day .calendar-pane,
.theme-day .weather-card,
.theme-day .trip-card {
  background: var(--bg-card-light);
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.theme-day .cta {
  border: 1px solid var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.theme-day .cta.quick {
  background: linear-gradient(135deg, var(--success-color), var(--success-dark));
  color: var(--text-inverse);
  border-color: var(--success-color);
}

.theme-day .cta.create {
  background: linear-gradient(135deg, var(--bg-card-light), var(--bg-secondary-light));
  color: var(--text-primary-light);
}

.theme-day .chip,
.theme-day .status-pill,
.theme-day .source-pill,
.theme-day .trip-body-active,
.theme-day .alarm-btn {
  background: var(--bg-secondary-light);
  border-color: var(--border-secondary);
  box-shadow: none;
}

.theme-day .chip.active,
.theme-day .day-cell.active,
.theme-day .alarm-btn.enabled {
  background: var(--success-color);
  color: var(--text-inverse);
  border-color: var(--success-color);
  box-shadow: var(--shadow-md);
}

.theme-day .weather-card::before,
.theme-day .weather-card::after {
  opacity: 0.04;
}

.theme-day .divider-line {
  background: var(--border-secondary);
  box-shadow: none;
}

.theme-day .action-hints {
  grid-template-columns: 1fr;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-xs) 0;
}

.theme-day .hello,
.theme-day .brand,
.theme-day .trip-title,
.theme-day .month-title,
.theme-day .weather-temp,
.theme-day .day-cell,
.theme-day .cta-title {
  color: var(--text-primary-light);
  font-family: 'Inter', 'PingFang SC', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  font-weight: var(--font-bold);
}

.theme-day .date-en,
.theme-day .slogan,
.theme-day .month-year,
.theme-day .week-item,
.theme-day .trip-line,
.theme-day .trip-line.location-line,
.theme-day .weather-date,
.theme-day .weather-sub,
.theme-day .source-pill,
.theme-day .chip,
.theme-day .empty,
.theme-day .tip,
.theme-day .action-hint,
.theme-day .cta-desc,
.theme-day .divider-text,
.theme-day .status-pill,
.theme-day .status-step-text {
  color: var(--text-secondary-light);
}

.theme-day .action-link {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}

.theme-day .day-cell.muted {
  color: var(--text-disabled-light);
  opacity: 0.6;
}

.theme-day .month-arrow {
  color: var(--text-secondary-light);
}

.theme-day .status-segment.active {
  box-shadow: 0 0 10rpx var(--warning-color);
}

.theme-day .status-segment.current {
  transform: scaleY(1.1);
  animation: none;
}

// 动画优化
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

@keyframes drift {
  0% { transform: translateX(0); }
  50% { transform: translateX(5rpx); }
  100% { transform: translateX(0); }
}

@keyframes sunshine {
  0% { transform: translateX(-2%) scale(0.98); opacity: 0.75; }
  50% { transform: translateX(2%) scale(1.03); opacity: 1; }
  100% { transform: translateX(-2%) scale(0.98); opacity: 0.75; }
}

@keyframes cloudShift {
  0% { transform: translateX(-24%); opacity: 0.4; }
  50% { transform: translateX(8%); opacity: 0.75; }
  100% { transform: translateX(-24%); opacity: 0.4; }
}

@keyframes rainfall {
  0% { transform: translateY(-20%); }
  100% { transform: translateY(20%); }
}

@keyframes scan {
  0% { box-shadow: 0 0 0 var(--warning-color); opacity: 0.9; }
  50% { box-shadow: 0 0 24rpx var(--warning-color); opacity: 1; }
  100% { box-shadow: 0 0 0 var(--warning-color); opacity: 0.9; }
}

button::after {
  border: none;
}

// 响应式适配
@media (max-width: 375px) {
  .action-hints {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
  
  .brand {
    font-size: var(--text-3xl);
  }
  
  .hello {
    font-size: var(--text-xl);
  }
  
  .stats-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
}

@media (min-width: 768px) {
  .page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
