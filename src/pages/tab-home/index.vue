<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <!-- 头部问候区域 -->
    <view class="header-section">
      <view class="greeting">
        <text class="hello-text">{{ helloText }}</text>
        <text class="date-text">{{ dateEN }}</text>
      </view>
      <view class="brand">
        <text class="brand-name">ReadyToGo</text>
        <text class="brand-slogan">轻松准备 立即出发</text>
      </view>
    </view>

    <!-- 日历区域 -->
    <view class="calendar-section">
      <view class="calendar-header" @tap="toggleCalendar">
        <view class="month-display-wrapper">
          <text class="month-display">{{ year }}年 {{ monthName }}</text>
          <text class="calendar-toggle-hint">{{ isCalendarCollapsed ? '▼' : '▲' }}</text>
        </view>
        <view class="month-nav">
          <text class="nav-btn" @tap.stop="switchMonth(-1)">‹</text>
          <text class="nav-btn" @tap.stop="switchMonth(1)">›</text>
        </view>
      </view>
      <view 
        class="calendar-body"
        :class="{ 'body-collapsed': isCalendarCollapsed }"
      >
        <view class="weekdays">
          <text v-for="w in weekLabels" :key="w" class="weekday">{{ w }}</text>
        </view>
        <view class="days-grid">
          <view
            v-for="d in calendarDays"
            :key="d.key"
            class="day-cell"
            :class="{ muted: !d.inMonth, active: d.inMonth && d.day === selectedDay }"
            @tap="selectDay(d)"
          >
            <text class="day-text">{{ d.day }}</text>
            <view v-if="d.hasTrip" class="trip-dot"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="divider">
      <view class="divider-line"></view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-section">
      <view class="action-buttons">
        <button class="btn btn-primary" @tap="quickDepart" @longpress="quickDepartWithTemplate">
          <text class="btn-title">快速出发</text>
          <text class="btn-subtitle">一键清点</text>
        </button>
        <button class="btn btn-secondary" @tap="onCreate">
          <text class="btn-title">新建日程</text>
          <text class="btn-subtitle">先建卡片</text>
        </button>
      </view>
    </view>

    <!-- 天气卡片 -->
    <view class="weather-section">
      <view class="weather-main">
        <view class="weather-icon">
          <view v-if="weather.code === 'sunny'" class="icon-sun"></view>
          <view v-else-if="weather.code === 'cloudy'" class="icon-cloud"></view>
          <view v-else class="icon-rain"></view>
        </view>
        <view class="weather-info">
          <text class="weather-date">{{ todayText }}</text>
          <text class="weather-temp">{{ weather.low }}° / {{ weather.high }}°</text>
        </view>
      </view>
      <view class="weather-detail">
        <text class="weather-status">{{ weather.label }} · {{ weather.place }}</text>
        <view class="sun-times">
          <text class="sun-time">日出 {{ weather.sunrise }}</text>
          <text class="sun-time">日落 {{ weather.sunset }}</text>
        </view>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tab-section">
      <button 
        class="tab-btn" 
        :class="{ active: tab === 0 }" 
        @tap="tab = 0"
      >
        计划中的行程
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: tab === 1 }" 
        @tap="tab = 1"
      >
        待归档的行程
      </button>
    </view>


    <!-- 行程列表 -->
    <view class="list-section">
      <scroll-view scroll-y class="trip-list">
        <view v-if="tab === 0">
          <view v-if="filteredOngoing.length === 0" class="empty-state">
            <text class="empty-text">暂无行程，点击上方新建</text>
          </view>
          <view 
            v-for="t in filteredOngoing" 
            :key="t.id" 
            class="trip-item"
            @tap="onTripTap(t)"
            @longpress.stop="onTripLongPress(t)"
          >
            <view class="trip-status-bar">
              <view
                v-for="i in 6"
                :key="'s-'+i"
                class="status-dot"
                :style="{ 
                  background: i <= statusStep(t) ? statusColor(i) : '#e5e7eb',
                  opacity: i <= statusStep(t) ? 1 : 0.3
                }"
              ></view>
            </view>
            <view class="trip-content">
              <view class="trip-main">
                <view class="trip-header-row">
                  <text class="trip-name">{{ t.title }}</text>
                  <text class="trip-source">{{ sourceLabel(t) }}</text>
                </view>
                <text class="trip-detail">{{ departTimeText(t) }}</text>
                <text class="trip-detail">{{ keyTimeText(t) }}</text>
                <text class="trip-detail">{{ locationText(t) }}</text>
              </view>
              <view class="trip-side">
                <StatusIndicator :status="t.status" size="small" />
                <text class="trip-status-text">{{ statusText(t) }}</text>
                <text class="edit-btn" @tap.stop="editTrip(t)">编辑</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else>
          <view v-if="filteredToArchive.length === 0" class="empty-state">
            <text class="empty-text">暂无待归档行程</text>
          </view>
          <view v-else class="archive-hint">
            <text class="hint-title">有 {{ filteredToArchive.length }} 个已完成行程待归档</text>
          </view>
          <view 
            v-for="t in filteredToArchive" 
            :key="t.id" 
            class="trip-item"
            @tap="onTripTap(t)"
            @longpress.stop="onTripLongPress(t)"
          >
            <view class="trip-status-bar">
              <view
                v-for="i in 6"
                :key="'s-'+i"
                class="status-dot"
                :style="{ 
                  background: i <= statusStep(t) ? statusColor(i) : '#e5e7eb',
                  opacity: i <= statusStep(t) ? 1 : 0.3
                }"
              ></view>
            </view>
            <view class="trip-content">
              <view class="trip-main">
                <view class="trip-header-row">
                  <text class="trip-name">{{ t.title }}</text>
                  <text class="trip-source">{{ sourceLabel(t) }}</text>
                </view>
                <text class="trip-detail">{{ departTimeText(t) }}</text>
                <text class="trip-detail">{{ keyTimeText(t) }}</text>
                <text class="trip-detail">{{ locationText(t) }}</text>
              </view>
              <view class="trip-side">
                <StatusIndicator status="archived" size="small" />
                <text class="trip-status-text">待归档</text>
              </view>
            </view>
          </view>
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
      :actions="dialogState.actions"
      @cancel="onDialogCancel"
      @confirm="onDialogConfirm"
      @action="onDialogAction"
    />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useTripStore } from '../../stores/trip'
import { useTemplateStore } from '../../stores/templates'
import { useAutoThemeClass } from '../../services/theme'
import { getFullWeatherInfo, isWeatherApiConfigured } from '../../services/weather'
import DarkDialog from '../../components/DarkDialog.vue'
import SimpleStatCard from '../../components/SimpleStatCard.vue'
import StatusIndicator from '../../components/StatusIndicator.vue'

const store = useTripStore()
const templateStore = useTemplateStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const { ongoing, toArchive } = storeToRefs(store)

const dialogState = ref({
  visible: false,
  mode: 'confirm',
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  actions: [],
})
let dialogResolver = null

const tab = ref(0)
const today = new Date()
const displayedMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDay = ref(today.getDate())
const helloText = ref('你好')
const isCalendarCollapsed = ref(true)

const weather = ref({
  code: 'sunny',
  label: '晴',
  temp: 24,
  low: 13,
  high: 24,
  sunrise: '06:21',
  sunset: '18:07',
  place: '定位中...',
})

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const monthName = computed(() => `${displayedMonth.value.getMonth() + 1}月`)
const year = computed(() => displayedMonth.value.getFullYear())

const dateEN = computed(() => {
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const activeDate = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth(), selectedDay.value)
  return `${week[activeDate.getDay()]}，${activeDate.getMonth() + 1}月${activeDate.getDate()}日`
})

const todayText = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

// 获取指定日期是否有行程
const hasTripOnDate = (dateStr) => {
  return store.trips?.some(t => t.date === dateStr && t.status !== 'archived')
}

const calendarDays = computed(() => {
  const y = displayedMonth.value.getFullYear()
  const m = displayedMonth.value.getMonth()
  const first = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  const prevTotal = new Date(y, m, 0).getDate()
  const arr = []
  
  for (let i = 0; i < first; i++) {
    arr.push({ key: `p-${i}`, day: prevTotal - first + i + 1, inMonth: false })
  }
  for (let day = 1; day <= total; day++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    // 直接在这里检查是否有行程，确保响应式
    const hasTrip = store.trips?.some(t => t.date === dateStr && t.status !== 'archived')
    arr.push({ 
      key: `d-${day}`, 
      day, 
      inMonth: true,
      hasTrip
    })
  }
  while (arr.length < 42) {
    arr.push({ key: `n-${arr.length}`, day: arr.length - total - first + 1, inMonth: false })
  }
  return arr
})

const currentDate = computed(() => {
  const y = displayedMonth.value.getFullYear()
  const m = String(displayedMonth.value.getMonth() + 1).padStart(2, '0')
  const d = String(selectedDay.value).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const filteredOngoing = computed(() => {
  return ongoing.value
    .sort((a, b) => scheduleOrder(a) - scheduleOrder(b))
})

const filteredToArchive = computed(() => {
  return toArchive.value
    .sort((a, b) => scheduleOrder(a) - scheduleOrder(b))
})

const completedThisMonth = computed(() => {
  const now = new Date()
  return store.trips?.filter(t => {
    if (t.status !== 'archived') return false
    const tripDate = new Date(t.date)
    return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear()
  }).length || 0
})

function switchMonth(step) {
  const newMonth = new Date(displayedMonth.value)
  newMonth.setMonth(newMonth.getMonth() + step)
  displayedMonth.value = newMonth
}

function selectDay(cell) {
  if (cell.inMonth) {
    selectedDay.value = cell.day
  } else if (!cell.inMonth && cell.day > 20) {
    switchMonth(-1)
    selectedDay.value = cell.day
  } else if (!cell.inMonth && cell.day < 15) {
    switchMonth(1)
    selectedDay.value = cell.day
  }
}

function onCreate() {
  uni.navigateTo({ url: `/pages/template-selector/index?date=${currentDate.value}` })
}

function quickDepart() {
  const templates = templateStore.templates || []
  if (templates.length === 0) {
    uni.showToast({ title: '请先创建模板', icon: 'none' })
    return
  }
  const trip = store.createTripFromTemplate(templates[0], {
    title: templates[0].name,
    date: currentDate.value,
  })
  uni.navigateTo({ url: `/pages/trip-checklist/index?id=${trip.id}&mode=departure` })
}

async function quickDepartWithTemplate() {
  const templates = templateStore.templates || []
  if (templates.length === 0) {
    uni.showToast({ title: '请先创建模板', icon: 'none' })
    return
  }
  
  // If only one template, use it directly
  if (templates.length === 1) {
    const trip = store.createTripFromTemplate(templates[0], {
      title: templates[0].name,
      date: currentDate.value,
    })
    uni.navigateTo({ url: `/pages/trip-checklist/index?id=${trip.id}&mode=departure` })
    return
  }
  
  // Show template selection dialog using DarkDialog
  const templateNames = templates.map(t => t.name)
  openAction({
    title: '选择模板',
    actions: templateNames,
  }).then((res) => {
    if (res.index >= 0) {
      const selectedTemplate = templates[res.index]
      const trip = store.createTripFromTemplate(selectedTemplate, {
        title: selectedTemplate.name,
        date: currentDate.value,
      })
      uni.navigateTo({ url: `/pages/trip-checklist/index?id=${trip.id}&mode=departure` })
    }
  })
}

function onTripTap(t) {
  // 已出发：进入返程清点
  if (t.status === 'departed') {
    uni.navigateTo({ url: `/pages/trip-checklist/index?id=${t.id}&mode=return` })
    return
  }
  
  // 返程中（未完成）：进入返程清点
  if (t.status === 'returnPhase' && !t.returnCompleted) {
    uni.navigateTo({ url: `/pages/trip-checklist/index?id=${t.id}&mode=return` })
    return
  }
  
  // 待归档（已完成返程）：弹窗确认归档
  if (t.status === 'returnPhase' && t.returnCompleted) {
    openConfirm({
      title: '确认归档',
      message: '该行程已完成返程清点，是否确认归档？',
      confirmText: '确认归档',
      cancelText: '取消'
    }).then((res) => {
      if (res.confirm) {
        store.archiveTrip(t.id)
        uni.showToast({ title: '已归档', icon: 'success' })
      }
    })
    return
  }
  
  // 已打包：弹出选择 - 现在出发 或 修改清单
  if (t.status === 'packed') {
    openAction({
      title: '行程已打包完成',
      actions: ['现在出发', '修改清单']
    }).then((res) => {
      if (res.index === 0) {
        store.depart(t.id)
        uni.showToast({ title: '出发！', icon: 'success' })
      } else if (res.index === 1) {
        uni.navigateTo({ url: `/pages/trip-checklist/index?id=${t.id}&mode=departure` })
      }
    })
    return
  }
  
  // 其他状态（preparation/packing）：进入出发清点
  uni.navigateTo({ url: `/pages/trip-checklist/index?id=${t.id}&mode=departure` })
}

function onTripLongPress(t) {
  openConfirm({
    title: '删除行程',
    message: `确定要删除"${t.title}"这个行程吗？`,
    confirmText: '删除',
    cancelText: '取消'
  }).then((res) => {
    if (res.confirm) {
      store.deleteTrip(t.id)
      uni.showToast({ title: '已删除', icon: 'success' })
    }
  })
}

function toggleCalendar() {
  isCalendarCollapsed.value = !isCalendarCollapsed.value
}

// 来源标签常量
const SOURCE_LABELS = {
  calendar: '来源：日历',
  temp: '来源：临时'
}

function sourceLabel(t) {
  return SOURCE_LABELS[t?.source] || SOURCE_LABELS.temp
}

function departTimeText(t) {
  const parts = [t.date]
  if (t.scheduleTime) parts.push(t.scheduleTime)
  if (t.keyTime) parts.push(t.keyTime)
  return parts.join(' ')
}

function keyTimeText(t) {
  return t.keyTime ? `关键时间：${t.keyTime}` : '关键时间：未填写'
}

function locationText(t) {
  return t.destination ? `地点：${t.destination}` : '地点：未填写'
}

function scheduleOrder(t) {
  const time = t.scheduleTime || ''
  const match = time.match(/(\d{1,2}):(\d{2})/)
  if (!match) return 9999
  return parseInt(match[1]) * 60 + parseInt(match[2])
}

// 状态常量定义
const STATUS_TEXT_MAP = {
  preparation: '准备中',
  packing: '清点中',
  packed: '已打包',
  departed: '已出发',
  returnPhase: '返程中',
  archived: '已归档'
}

const STATUS_STEP_MAP = {
  preparation: 1,
  packing: 2,
  packed: 3,
  departed: 4,
  returnPhase: 5,
  archived: 6
}

const STATUS_COLORS = ['#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6']

function statusText(t) {
  return STATUS_TEXT_MAP[t.status] || '准备中'
}

function statusStep(t) {
  return STATUS_STEP_MAP[t.status] || 1
}

function statusColor(step) {
  return STATUS_COLORS[step - 1] || STATUS_COLORS[0]
}

function openConfirm(options) {
  return openDialog({
    mode: 'confirm',
    title: options?.title || '',
    message: options?.message || '',
    confirmText: options?.confirmText || '确认',
    cancelText: options?.cancelText || '取消',
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
      actions: Array.isArray(payload.actions) ? payload.actions : [],
      closeOnMask: payload.closeOnMask !== false,
    }
  })
}

function onDialogCancel() {
  closeDialog({ confirm: false, index: -1 })
}

function onDialogConfirm() {
  closeDialog({ confirm: true, index: -1 })
}

function onDialogAction(index) {
  closeDialog({ confirm: false, index: index })
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

function syncFromSystemCalendar() {
  uni.showToast({ title: '系统日历同步功能开发中', icon: 'none' })
}

function editTrip(t) {
  // 导航到行程编辑页面
  uni.navigateTo({ 
    url: `/pages/trip-edit/index?id=${t.id}` 
  })
}

function updateHello() {
  const hour = new Date().getHours()
  if (hour < 9) helloText.value = '早上好'
  else if (hour < 12) helloText.value = '上午好'
  else if (hour < 14) helloText.value = '中午好'
  else if (hour < 18) helloText.value = '下午好'
  else helloText.value = '晚上好'
}

onShow(() => {
  updateHello()
  fetchWeather()
})

async function fetchWeather() {
  if (!isWeatherApiConfigured()) {
    console.warn('天气 API Key 未配置，使用默认数据')
    return
  }
  
  try {
    const weatherData = await getFullWeatherInfo()
    weather.value = weatherData
  } catch (error) {
    console.error('获取天气失败:', error)
  }
}
</script>

<style scoped>
/* 基础页面样式 */
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgba(10, 128, 255, 0.28), transparent 34%),
    linear-gradient(180deg, #040a16 0%, #050d1f 52%, #071020 100%);
  padding: 32rpx 24rpx 48rpx;
  box-sizing: border-box;
  color: #f7fbff;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 10;
}

.greeting {
  display: flex;
  flex-direction: column;
}

.hello-text {
  font-size: 48rpx;
  font-weight: 300;
  color: #f7fbff;
  line-height: 1.2;
}

.date-text {
  font-size: 24rpx;
  color: #9bb0cb;
  margin-top: 8rpx;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.brand-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #76abff;
  letter-spacing: 2rpx;
}

.brand-slogan {
  font-size: 20rpx;
  color: #9bb0cb;
  margin-top: 4rpx;
}

/* 日历区域 */
.calendar-section {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 14px;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 24rpx;
}

.month-display-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.calendar-toggle-hint {
  font-size: 24rpx;
  color: #9bb0cb;
}

.calendar-body {
  transition: all 0.3s ease;
}

.body-collapsed {
  display: none;
}

.month-display {
  font-size: 32rpx;
  font-weight: 700;
  color: #f7fbff;
}

.month-nav {
  display: flex;
  gap: 24rpx;
}

.nav-btn {
  font-size: 36rpx;
  color: #c8d6e5;
  padding: 8rpx 16rpx;
  min-width: 48rpx;
  text-align: center;
}

.weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.weekday {
  font-size: 24rpx;
  color: #9bb0cb;
  width: 64rpx;
  text-align: center;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-cell {
  width: 14.28%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-text {
  font-size: 28rpx;
  color: #c8d6e5;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.day-cell.active .day-text {
  background-color: #76abff;
  color: white;
  font-weight: 600;
}

.day-cell.muted .day-text {
  opacity: 0.3;
}

/* 日历行程标记 */
.trip-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #10b981;
  position: absolute;
  bottom: 12rpx;
  left: 50%;
  transform: translateX(-50%);
}

.day-cell {
  width: 14.28%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 分隔线 */
.divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  margin-bottom: 16rpx;
}

.divider-line {
  width: 120rpx;
  height: 2rpx;
  background-color: #1a2332;
  margin-bottom: 8rpx;
}

/* 操作按钮区域 */
.action-section {
  margin-bottom: 24rpx;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.btn {
  flex: 1;
  padding: 8rpx 16rpx;
  border: none;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #ff5722 100%);
  box-shadow: 
    0 8rpx 32rpx rgba(255, 107, 53, 0.4),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.btn-primary:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 
    0 4rpx 16rpx rgba(255, 107, 53, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  background: linear-gradient(135deg, rgba(255, 180, 120, 0.9) 0%, rgba(255, 140, 80, 0.85) 100%);
  border: 1rpx solid rgba(255, 107, 53, 0.45);
  box-shadow: 
    0 4rpx 16rpx rgba(255, 107, 53, 0.25),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.3);
}

.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20rpx;
  padding: 1rpx;
  background: linear-gradient(135deg, rgba(255, 140, 80, 0.6), rgba(255, 107, 53, 0.2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.btn-secondary:active {
  transform: translateY(2rpx) scale(0.98);
  background: linear-gradient(135deg, rgba(255, 160, 100, 0.95) 0%, rgba(255, 120, 60, 0.9) 100%);
  box-shadow: 
    0 2rpx 8rpx rgba(255, 107, 53, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.btn-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #f8fbff;
  margin-bottom: 4rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 1rpx;
}

.btn-subtitle {
  font-size: 24rpx;
  color: rgba(218, 236, 255, 0.9);
  font-weight: 400;
}

.action-hints {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hint-text {
  font-size: 22rpx;
  color: #9bb0cb;
  line-height: 1.4;
}

.hint-link {
  font-size: 22rpx;
  color: #76abff;
  text-decoration: underline;
  margin-top: 8rpx;
}

/* 天气区域 */
.weather-section {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 14px;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.weather-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-sun {
  width: 48rpx;
  height: 48rpx;
  background-color: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 20rpx #fbbf24;
}

.icon-cloud {
  width: 48rpx;
  height: 32rpx;
  background-color: #9bb0cb;
  border-radius: 16rpx;
  position: relative;
}

.icon-cloud::after {
  content: '';
  position: absolute;
  width: 32rpx;
  height: 32rpx;
  background-color: #9bb0cb;
  border-radius: 50%;
  top: -12rpx;
  left: 8rpx;
}

.icon-rain {
  width: 48rpx;
  height: 48rpx;
  position: relative;
}

.weather-info {
  text-align: right;
}

.weather-date {
  font-size: 22rpx;
  color: #9bb0cb;
  display: block;
  margin-bottom: 8rpx;
}

.weather-temp {
  font-size: 36rpx;
  font-weight: 600;
  color: #f7fbff;
}

.weather-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-status {
  font-size: 24rpx;
  color: #9bb0cb;
}

.sun-times {
  display: flex;
  gap: 16rpx;
}

.sun-time {
  font-size: 22rpx;
  color: #9bb0cb;
}

/* 标签切换 */
.tab-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tab-btn {
  flex: 1;
  padding: 16rpx 24rpx;
  background: rgba(8, 21, 40, 0.7);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 12px;
  font-size: 26rpx;
  color: rgba(218, 236, 255, 0.85);
  text-align: center;
}

.tab-btn.active {
  background: linear-gradient(135deg, #1f8bff, #2f66ff);
  color: #f8fbff;
  border-color: transparent;
}

/* 统计区域 */
.stats-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

/* 列表区域 */
.list-section {
  flex: 1;
}

.trip-list {
  height: 600rpx;
}

.empty-state {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #9bb0cb;
}

.archive-hint {
  padding: 24rpx 0;
  text-align: center;
}

.hint-title {
  font-size: 26rpx;
  color: #c8d6e5;
}

/* 行程卡片 */
.trip-item {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.18);
  border-radius: 12px;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
}

.trip-status-bar {
  display: flex;
  gap: 4rpx;
  margin-bottom: 16rpx;
}

.status-dot {
  height: 6rpx;
  flex: 1;
  border-radius: 3rpx;
}

.trip-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.trip-main {
  flex: 1;
  margin-right: 16rpx;
}

.trip-header-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.trip-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #f7fbff;
}

.trip-source {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  background-color: #111a28;
  color: #9bb0cb;
  border-radius: 999rpx;
  border: 1px solid #1f2937;
}

.trip-detail {
  font-size: 26rpx;
  color: #c8d6e5;
  display: block;
  margin-bottom: 4rpx;
  line-height: 1.4;
}

.trip-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.trip-status-text {
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  background-color: #111a28;
  color: #c8d6e5;
  border-radius: 8rpx;
  border: 1px solid #1a2332;
}

.edit-btn {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  background-color: rgba(118, 171, 255, 0.2);
  color: #76abff;
  border-radius: 6rpx;
  border: 1px solid rgba(118, 171, 255, 0.3);
  margin-top: 4rpx;
}

/* 日间模式样式 - 与装备库页面保持一致 */
.page.theme-day .calendar-section,
.page.theme-day .weather-section,
.page.theme-day .trip-item {
  background: rgba(255, 255, 255, 0.84);
  border-color: rgba(126, 160, 205, 0.28);
}

.page.theme-day .hello-text,
.page.theme-day .brand-name,
.page.theme-day .month-display,
.page.theme-day .btn-title,
.page.theme-day .weather-temp,
.page.theme-day .trip-name {
  color: #1f3658;
}

.page.theme-day .date-text,
.page.theme-day .brand-slogan,
.page.theme-day .weekday,
.page.theme-day .day-text,
.page.theme-day .btn-subtitle,
.page.theme-day .weather-date,
.page.theme-day .weather-status,
.page.theme-day .sun-time,
.page.theme-day .trip-detail {
  color: #5a7094;
}

.page.theme-day .nav-btn {
  color: #4a638a;
}

.page.theme-day .day-cell.active .day-text {
  background: #3ea1ff;
  color: white;
}

.page.theme-day .tab-btn {
  background: rgba(223, 236, 255, 0.72);
  color: #365277;
  border-color: rgba(126, 160, 205, 0.36);
}

.page.theme-day .tab-btn.active {
  background: linear-gradient(135deg, #3ea1ff, #4b75ff);
  color: #f8fbff;
  border-color: transparent;
}

.page.theme-day .trip-source {
  background: rgba(199, 223, 255, 0.52);
  color: #4a638a;
  border-color: rgba(126, 160, 205, 0.32);
}

.page.theme-day .trip-status-text {
  background: rgba(223, 236, 255, 0.72);
  color: #4a638a;
  border-color: rgba(126, 160, 205, 0.32);
}

/* 日间模式 - 操作按钮样式 */
.page.theme-day .btn-primary {
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  box-shadow: 
    0 8rpx 32rpx rgba(255, 107, 53, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
}

.page.theme-day .btn-primary:active {
  box-shadow: 
    0 4rpx 16rpx rgba(255, 107, 53, 0.25),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.3);
}

.page.theme-day .btn-secondary {
  background: linear-gradient(135deg, rgba(255, 200, 160, 0.9) 0%, rgba(255, 170, 120, 0.85) 100%);
  border: 1rpx solid rgba(255, 107, 53, 0.45);
  box-shadow: 
    0 4rpx 16rpx rgba(255, 107, 53, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.page.theme-day .btn-secondary::before {
  background: linear-gradient(135deg, rgba(255, 140, 80, 0.4), rgba(255, 107, 53, 0.15));
}

.page.theme-day .btn-secondary:active {
  background: linear-gradient(135deg, rgba(255, 190, 150, 0.95) 0%, rgba(255, 160, 110, 0.9) 100%);
  box-shadow: 
    0 2rpx 8rpx rgba(255, 107, 53, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.6);
}

.page.theme-day .btn-title {
  color: #f8fbff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.15);
}

.page.theme-day .btn-secondary .btn-title {
  color: #1f3658;
  text-shadow: none;
}

.page.theme-day .btn-subtitle {
  color: rgba(255, 255, 255, 0.95);
}

.page.theme-day .btn-secondary .btn-subtitle {
  color: #5a7094;
}
</style>
