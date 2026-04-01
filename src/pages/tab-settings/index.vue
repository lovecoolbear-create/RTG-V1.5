<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="summary">
      <text class="header">设置中心</text>
      <view class="stats">
        <text class="chip">行程 {{ tripCount }}</text>
        <text class="chip">模板 {{ templateCount }}</text>
        <text class="chip">装备 {{ gearCount }}</text>
      </view>
    </view>
    <view class="section">
      <view class="section-title">云开发</view>
      <view class="form-row">
        <text class="label">环境ID</text>
        <input class="input" v-model="envId" placeholder="输入云开发环境ID" />
      </view>
      <view class="btns">
        <button size="mini" class="ghost-btn" @tap="connectCloud">连接</button>
        <button size="mini" class="primary-btn" @tap="cloudUpload">上传到云端</button>
        <button size="mini" class="ghost-btn" @tap="cloudDownload">从云端拉取</button>
      </view>
    </view>
    <view class="section">
      <view class="section-title">出发校验规则</view>
      <view class="rule-row">
        <view class="rule-main">
          <text class="rule-title">商务信息完整性</text>
          <text class="rule-desc">检查目的地、关键时间、证件类型是否填写</text>
        </view>
        <switch :checked="ruleState.businessRequired" @change="onRuleChange('businessRequired', $event)" />
      </view>
      <view class="rule-row">
        <view class="rule-main">
          <text class="rule-title">户外必带提醒</text>
          <text class="rule-desc">提示携带身份证、应急药品、充电设备</text>
        </view>
        <switch :checked="ruleState.outdoorCarry" @change="onRuleChange('outdoorCarry', $event)" />
      </view>
      <view class="rule-row">
        <view class="rule-main">
          <text class="rule-title">重要物品未勾选提醒</text>
          <text class="rule-desc">出发前提示尚未勾选的重要物品</text>
        </view>
        <switch :checked="ruleState.importantUnchecked" @change="onRuleChange('importantUnchecked', $event)" />
      </view>
    </view>

    <view class="section">
      <view class="row" @tap="doExport">
        <text>备份数据 (复制到剪贴板)</text>
        <text class="arrow">></text>
      </view>
      <view class="row" @tap="doImport">
        <text>恢复数据 (从剪贴板导入)</text>
        <text class="arrow">></text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-title">法律条款</view>
      <view class="row" @tap="goToPrivacy">
        <text>隐私政策</text>
        <text class="arrow">></text>
      </view>
      <view class="row" @tap="goToTerms">
        <text>用户服务协议</text>
        <text class="arrow">></text>
      </view>
    </view>

    <view class="tip">
      <text>提示：备份功能会将所有行程、模板和装备库数据导出为 JSON 文本。请妥善保存。</text>
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
import { useTripStore } from '../../stores/trip'
import { useTemplateStore } from '../../stores/templates'
import { useGearStore } from '../../stores/gear'
import cloud from '../../services/cloud'
import { computed, ref } from 'vue'
import DarkDialog from '../../components/DarkDialog.vue'
import { useAutoThemeClass } from '../../services/theme'

const tripStore = useTripStore()
const tplStore = useTemplateStore()
const gearStore = useGearStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const envId = ref('')
const tripCount = computed(() => tripStore.trips.length)
const templateCount = computed(() => tplStore.templates.length)
const gearCount = computed(() => gearStore.items.length)
const RULES_STORAGE_KEY = 'departure_rules_v1'
const defaultRules = {
  businessRequired: true,
  outdoorCarry: true,
  importantUnchecked: true,
}
const ruleState = ref(loadRules())
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
try {
  envId.value = uni.getStorageSync('cloud_env') || ''
} catch {}
function loadRules() {
  try {
    const raw = uni.getStorageSync(RULES_STORAGE_KEY)
    if (!raw) return { ...defaultRules }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return {
      ...defaultRules,
      ...parsed,
    }
  } catch {
    return { ...defaultRules }
  }
}
function saveRules(next) {
  try {
    uni.setStorageSync(RULES_STORAGE_KEY, JSON.stringify(next))
  } catch {}
}
function onRuleChange(key, event) {
  const checked = !!event?.detail?.value
  ruleState.value = {
    ...ruleState.value,
    [key]: checked,
  }
  saveRules(ruleState.value)
}

function doExport() {
  const data = {
    version: 1,
    date: Date.now(),
    trips: tripStore.exportData(),
    templates: tplStore.exportData(),
    gear: gearStore.exportData()
  }
  const json = JSON.stringify(data)
  uni.setClipboardData({
    data: json,
    success: () => {
      uni.showToast({ title: '已复制备份数据', icon: 'success' })
    }
  })
}

async function doImport() {
  const res = await openConfirm({
    title: '恢复数据',
    message: '这将覆盖当前所有数据，且不可撤销。请确保剪贴板中已复制了有效的备份 JSON。确定要继续吗？',
    confirmText: '继续',
  })
  if (!res.confirm) return
  uni.getClipboardData({
    success: (clip) => {
      try {
        if (!clip.data) throw new Error('剪贴板为空')
        const data = JSON.parse(clip.data)
        if (data.trips) tripStore.importData(data.trips)
        if (data.templates) tplStore.importData(data.templates)
        if (data.gear) gearStore.importData(data.gear)
        uni.showToast({ title: '恢复成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '数据格式错误', icon: 'none' })
      }
    },
  })
}

function connectCloud() {
  if (!envId.value) {
    uni.showToast({ title: '请输入环境ID', icon: 'none' })
    return
  }
  const ok = cloud.init(envId.value)
  if (ok) uni.showToast({ title: '已连接', icon: 'success' })
  else uni.showToast({ title: '仅在微信内可用', icon: 'none' })
}

function cloudUpload() {
  if (!cloud.ensure()) {
    connectCloud()
    if (!cloud.ensure()) return
  }
  const data = {
    version: 1,
    date: Date.now(),
    trips: tripStore.exportData(),
    templates: tplStore.exportData(),
    gear: gearStore.exportData()
  }
  cloud.pushBackup(data).then(() => {
    uni.showToast({ title: '已上传', icon: 'success' })
  }).catch(() => {
    uni.showToast({ title: '上传失败', icon: 'none' })
  })
}

async function cloudDownload() {
  const res = await openConfirm({
    title: '从云端拉取',
    message: '拉取会覆盖本地当前数据，是否继续？',
    confirmText: '继续',
  })
  if (!res.confirm) return
  if (!cloud.ensure()) {
    connectCloud()
    if (!cloud.ensure()) return
  }
  cloud.pullLatest().then((data) => {
    if (!data) {
      uni.showToast({ title: '暂无云端数据', icon: 'none' })
      return
    }
    if (data.trips) tripStore.importData(data.trips)
    if (data.templates) tplStore.importData(data.templates)
    if (data.gear) gearStore.importData(data.gear)
    uni.showToast({ title: '拉取成功', icon: 'success' })
  }).catch(() => {
    uni.showToast({ title: '拉取失败', icon: 'none' })
  })
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

function goToPrivacy() {
  uni.navigateTo({ url: '/pages/legal/privacy' })
}

function goToTerms() {
  uni.navigateTo({ url: '/pages/legal/terms' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 8%, rgba(10, 128, 255, 0.28), transparent 34%),
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
.header { font-size: 22px; font-weight: 700; }
.stats {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.chip {
  font-size: 11px;
  color: rgba(205, 233, 255, 0.92);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.4);
  background: rgba(14, 116, 144, 0.18);
}
.section {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.18);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  padding: 12px;
}
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #f7fbff; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.label { width: 72px; color: rgba(194, 219, 255, 0.78); }
.input {
  flex: 1;
  border: 1px solid rgba(118, 171, 255, 0.24);
  border-radius: 8px;
  padding: 8px;
  color: #f7fbff;
  background: rgba(8, 21, 40, 0.72);
}
.btns { display: flex; gap: 8px; }
.primary-btn {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #f8fbff;
  border-radius: 999px;
}
.ghost-btn {
  background: rgba(8, 21, 40, 0.72);
  color: rgba(215, 233, 255, 0.92);
  border: 1px solid rgba(118, 171, 255, 0.28);
  border-radius: 999px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(118, 171, 255, 0.12);
  color: #f7fbff;
}
.row:last-child { border-bottom: none; }
.row:active { background: rgba(14, 116, 144, 0.18); }
.arrow { color: rgba(194, 219, 255, 0.6); font-family: monospace; }
.tip { padding: 0 8px 12px; color: rgba(185, 203, 229, 0.72); font-size: 12px; line-height: 1.5; }
.rule-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}
.rule-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rule-title {
  color: #f7fbff;
  font-size: 14px;
}
.rule-desc {
  color: rgba(194, 219, 255, 0.72);
  font-size: 12px;
}
.page.theme-day .summary,
.page.theme-day .section {
  background: #ffffff;
  border-color: rgba(56, 98, 160, 0.12);
}
.page.theme-day .header,
.page.theme-day .section-title,
.page.theme-day .row,
.page.theme-day .label,
.page.theme-day .input {
  color: #1f3658;
}
.page.theme-day .chip {
  color: #375176;
  border-color: rgba(76, 121, 182, 0.28);
  background: rgba(224, 235, 249, 0.72);
}
.page.theme-day .input {
  border-color: rgba(56, 98, 160, 0.2);
  background: #f2f7ff;
}
.page.theme-day .ghost-btn {
  background: #f2f7ff;
  color: #285fba;
  border-color: rgba(56, 98, 160, 0.2);
}
.page.theme-day .row {
  border-bottom-color: rgba(56, 98, 160, 0.1);
}
.page.theme-day .row:active {
  background: rgba(224, 235, 249, 0.6);
}
.page.theme-day .arrow,
.page.theme-day .tip {
  color: #56749e;
}
.page.theme-day .rule-title {
  color: #1f3658;
}
.page.theme-day .rule-desc {
  color: #56749e;
}
</style>
