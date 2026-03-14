<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="block">
      <view class="label">标题</view>
      <input class="input" v-model="title" placeholder="输入行程标题" />
    </view>

    <view class="block">
      <view class="label">出发时间</view>
      <view class="row">
        <picker mode="date" :value="date" @change="onDateChange">
          <view class="picker">{{ date || '选择日期' }}</view>
        </picker>
        <picker mode="time" :value="time" @change="onTimeChange">
          <view class="picker">{{ time || '选择时间' }}</view>
        </picker>
      </view>
    </view>

    <view class="block">
      <view class="label">目的地</view>
      <input class="input" v-model="destination" placeholder="输入目的地/备注" />
    </view>

    <view class="block">
      <view class="label">关键时间</view>
      <input class="input" v-model="keyTime" placeholder="例如：14:00 客户会议" />
    </view>

    <view class="block">
      <view class="label">证件类型</view>
      <picker mode="selector" :range="idTypeOptions" :value="idTypeIndex" @change="onIdTypeChange">
        <view class="picker">{{ idType || '请选择证件类型' }}</view>
      </picker>
    </view>

    <view class="block">
      <view class="label">来源与模板类别</view>
      <view class="pill-row">
        <view class="pill">{{ sourceText }}</view>
        <view class="pill">{{ categoryText }}</view>
      </view>
    </view>

    <view class="footer">
      <button class="primary" @tap="save">保存</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTripStore } from '../../stores/trip'
import { useAutoThemeClass } from '../../services/theme'

const store = useTripStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const id = ref('')
const trip = ref(null)
const title = ref('')
const destination = ref('')
const keyTime = ref('')
const idType = ref('')
const date = ref('')
const time = ref('')
const idTypeOptions = ['身份证', '护照', '其他']
const idTypeIndex = computed(() => {
  const idx = idTypeOptions.indexOf(idType.value)
  return idx >= 0 ? idx : 0
})
const sourceText = computed(() => {
  const value = String(trip.value?.source || '').toLowerCase()
  return value === 'calendar' ? '计划出行' : '快速出发'
})
const categoryText = computed(() => {
  const category = String(trip.value?.templateCategory || '').toLowerCase()
  if (category === 'outdoor') return '户外模板'
  if (category === 'business') return '商务模板'
  return '通用模板'
})

onLoad((options) => {
  id.value = options?.id || ''
  trip.value = store.trips.find((t) => t.id === id.value)
  if (!trip.value) {
    uni.showToast({ title: '行程不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 800)
    return
  }
  title.value = trip.value.title || ''
  destination.value = trip.value.destination || trip.value.location || ''
  keyTime.value = trip.value.keyTime || ''
  idType.value = trip.value.idType || ''
  date.value = trip.value.date || ''
  time.value = trip.value.scheduleTime || ''
  if (!date.value || !time.value) {
    const parts = (trip.value.time || '').split(' ')
    if (!date.value) date.value = parts[0] || ''
    if (!time.value) time.value = parts[1] || ''
  }
})

function onDateChange(e) {
  date.value = e.detail.value
}
function onTimeChange(e) {
  time.value = e.detail.value
}
function onIdTypeChange(e) {
  const idx = Number(e.detail.value || 0)
  idType.value = idTypeOptions[idx] || ''
}

function save() {
  const t = title.value.trim() || '未命名行程'
  const datePart = String(date.value || '').trim()
  const timePart = String(time.value || '').trim()
  let timeStr = ''
  if (datePart && timePart) timeStr = `${datePart} ${timePart}`
  else if (datePart) timeStr = datePart
  else if (timePart) timeStr = timePart
  else timeStr = trip.value.time || '时间未设置'
  store.updateTripMeta(id.value, {
    title: t,
    location: destination.value.trim() || '未设置',
    destination: destination.value.trim(),
    keyTime: keyTime.value.trim(),
    idType: idType.value.trim(),
    date: datePart,
    scheduleTime: timePart,
    time: timeStr,
  })
  uni.showToast({ title: '已保存', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 500)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 8%, rgba(10, 128, 255, 0.28), transparent 34%),
    linear-gradient(180deg, #040a16 0%, #050d1f 52%, #071020 100%);
  padding: 20px;
  box-sizing: border-box;
  color: #f8fbff;
}

.block {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #d9edff;
}

.input,
.picker {
  border: 1px solid rgba(118, 171, 255, 0.24);
  border-radius: 8px;
  background: rgba(8, 21, 40, 0.72);
  color: #f8fbff;
  padding: 8px;
  min-width: 120px;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pill-row {
  display: flex;
  gap: 8px;
}

.pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.42);
  color: #cae8ff;
  font-size: 12px;
}

.footer {
  margin-top: 24px;
}

.primary {
  width: 100%;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  border: none;
  border-radius: 12px;
}
</style>
