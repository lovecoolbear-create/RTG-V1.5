<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="panel">
      <view class="top">
        <text class="title">{{ sourceMode === 'Calendar' ? '新建计划出行' : '快速出发' }}</text>
        <text class="hint">先选模板，再补充行程信息</text>
      </view>
      <view v-if="libraryTemplates.length" class="quick-wrap">
        <text class="quick-label">模板库</text>
        <scroll-view scroll-x class="quick-scroll">
          <view class="quick-list">
            <text
              v-for="tpl in libraryTemplates"
              :key="`quick-${tpl.id}`"
              class="quick-pill"
              :class="{ active: selectedTemplateId === tpl.id }"
              @tap="select(tpl)"
            >
              {{ tpl.name }}
            </text>
          </view>
        </scroll-view>
      </view>
      <view class="form-grid">
        <view class="field">
          <text class="label">行程名称</text>
          <input class="input" v-model="formTitle" placeholder="例如：上海客户拜访" />
        </view>
        <view class="field">
          <text class="label">出行日期</text>
          <picker mode="date" :value="formDate" @change="onDateChange">
            <view class="picker">{{ formDate || '请选择日期' }}</view>
          </picker>
        </view>
        <view class="field">
          <text class="label">行程时段</text>
          <picker mode="time" :value="formScheduleTime" @change="onScheduleTimeChange">
            <view class="picker">{{ formScheduleTime || '请选择时段' }}</view>
          </picker>
        </view>
        <view class="field">
          <text class="label">目的地</text>
          <input class="input" v-model="formDestination" placeholder="例如：北京国贸" />
        </view>
      </view>
    </view>
    <view class="footer">
      <button class="primary" @tap="confirmCreate">确认并进入清点</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTripStore } from '../../stores/trip'
import { useTemplateStore } from '../../stores/templates'
import { useAutoThemeClass } from '../../services/theme'

const tripStore = useTripStore()
const tplStore = useTemplateStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const templates = computed(() => tplStore.templates)
const sourceMode = ref('Temporary')
const postCreateAction = ref('checklist')
const selectedTemplateId = ref('')
const formTitle = ref('')
const formDate = ref('')
const formScheduleTime = ref('')
const formDestination = ref('')
const LAST_TEMPLATE_KEY = 'last_template_id'
const lastTemplateId = ref('')
const libraryTemplates = computed(() => {
  const all = templates.value || []
  if (!all.length) return []
  const recent = all.find((tpl) => tpl.id === lastTemplateId.value)
  const rest = all.filter((tpl) => tpl.id !== lastTemplateId.value)
  return recent ? [recent, ...rest] : rest
})

onLoad((options) => {
  sourceMode.value = options?.source === 'Calendar' ? 'Calendar' : 'Temporary'
  postCreateAction.value = options?.postCreate === 'cardOnly' ? 'cardOnly' : 'checklist'
  formTitle.value = options?.title ? decodeURIComponent(options.title) : ''
  formDate.value = options?.date ? decodeURIComponent(options.date) : ''
  formScheduleTime.value = options?.time ? decodeURIComponent(options.time) : ''
  lastTemplateId.value = String(uni.getStorageSync(LAST_TEMPLATE_KEY) || '').trim()
  const initial = templates.value.find((tpl) => tpl.id === lastTemplateId.value) || templates.value[0]
  if (initial) selectedTemplateId.value = initial.id
})

function select(tpl) {
  selectedTemplateId.value = tpl.id
}

function onDateChange(e) {
  formDate.value = e.detail.value
}

function onScheduleTimeChange(e) {
  formScheduleTime.value = e.detail.value
}

function confirmCreate() {
  const tpl = templates.value.find((item) => item.id === selectedTemplateId.value)
  if (!tpl) {
    uni.showToast({ title: '请先选择模板', icon: 'none' })
    return
  }
  const title = formTitle.value.trim() || tpl.name
  if (!formDate.value) {
    uni.showToast({ title: '请先选择出行日期', icon: 'none' })
    return
  }
  const trip = tripStore.createTripFromTemplate(tpl, {
    source: sourceMode.value,
    title,
    date: formDate.value,
    scheduleTime: formScheduleTime.value,
    destination: formDestination.value.trim(),
    keyTime: '',
    idType: '',
    templateId: tpl.id,
    templateCategory: tpl.category || 'general',
  })
  uni.setStorageSync(LAST_TEMPLATE_KEY, tpl.id)
  if (postCreateAction.value === 'cardOnly') {
    uni.showToast({ title: '行程已创建', icon: 'none' })
    uni.navigateBack()
    return
  }
  uni.navigateTo({ url: `/pages/trip-checklist/index?id=${trip.id}&mode=departure` })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 8%, rgba(10, 128, 255, 0.32), transparent 34%),
    linear-gradient(180deg, #040a16 0%, #050d1f 52%, #071020 100%);
  padding: 20px;
  box-sizing: border-box;
  color: #eff6ff;
}

.panel {
  background:
    radial-gradient(circle at 20% 0%, rgba(14, 165, 233, 0.2), transparent 36%),
    rgba(7, 19, 38, 0.96);
  border: 1px solid rgba(118, 171, 255, 0.26);
  border-radius: 16px;
  padding: 14px;
}

.top {
  margin-bottom: 12px;
}

.title {
  display: block;
  font-size: 19px;
  font-weight: 700;
}

.hint {
  display: block;
  margin-top: 4px;
  color: rgba(200, 220, 255, 0.76);
  font-size: 12px;
}

.quick-wrap {
  margin-bottom: 10px;
}

.quick-label {
  display: block;
  font-size: 12px;
  color: rgba(186, 230, 253, 0.9);
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
  background: rgba(30, 64, 175, 0.3);
  border: 1px solid rgba(125, 211, 252, 0.45);
  border-radius: 999px;
  padding: 6px 10px;
}

.quick-pill.active {
  color: #e6f6ff;
  border-color: rgba(56, 189, 248, 0.9);
  background: rgba(14, 116, 144, 0.4);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: rgba(215, 233, 255, 0.84);
}

.input,
.picker {
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(118, 171, 255, 0.24);
  background: rgba(8, 21, 40, 0.72);
  color: #f8fbff;
  padding: 0 12px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.footer {
  margin-top: 14px;
  padding-bottom: 8px;
}

.primary {
  width: 100%;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  border: none;
  border-radius: 12px;
}
.page.theme-day {
  background:
    radial-gradient(circle at 16% 8%, rgba(59, 130, 246, 0.2), transparent 34%),
    linear-gradient(180deg, #edf5ff 0%, #f4f8ff 52%, #eef5ff 100%);
  color: #1f3658;
}
.page.theme-day .panel {
  background: #ffffff;
  border-color: rgba(56, 98, 160, 0.14);
}
.page.theme-day .title {
  color: #1f3658;
}
.page.theme-day .hint,
.page.theme-day .label {
  color: #4b6a93;
}
.page.theme-day .quick-label {
  color: #285fba;
}
.page.theme-day .quick-pill {
  color: #2e496d;
  border-color: rgba(56, 98, 160, 0.26);
  background: rgba(224, 235, 249, 0.72);
}
.page.theme-day .quick-pill.active {
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(135deg, #1e88ff, #3268e7);
}
.page.theme-day .input,
.page.theme-day .picker {
  border-color: rgba(56, 98, 160, 0.2);
  background: #f2f7ff;
  color: #1f3658;
}
</style>
