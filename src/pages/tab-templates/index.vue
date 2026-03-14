<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="summary">
      <view class="summary-top">
        <text class="header-title">模板库</text>
      </view>
      <view class="stats">
        <text class="chip">总计 {{ templates.length }}</text>
        <text class="chip">商务 {{ countByCategory('business') }}</text>
        <text class="chip">户外 {{ countByCategory('outdoor') }}</text>
      </view>
    </view>
    <view class="toolbar">
      <view class="search-combo">
        <input v-model.trim="keyword" class="search-input" placeholder="搜索模板名称或分类" />
        <view class="split-line"></view>
        <text class="filter-trigger" @tap.stop="toggleCategoryMenu">{{ activeCategoryLabel }} ▼</text>
      </view>
      <button size="mini" class="add-btn" @tap="create">+</button>
    </view>
    <view v-if="showCategoryMenu" class="group-menu">
      <view
        v-for="opt in categoryOptions"
        :key="opt.value"
        class="group-item"
        :class="{ active: activeCategory === opt.value }"
        @tap="pickCategory(opt.value)"
      >
        {{ opt.label }}
      </view>
    </view>
    <view class="template-pane">
      <scroll-view scroll-y class="template-scroll">
        <view v-if="filteredTemplates.length === 0" class="empty">暂无模板</view>
        <uni-swipe-action>
          <uni-swipe-action-item
            v-for="t in filteredTemplates"
            :key="t.id"
            :right-options="rightOptions"
            @click="onSwipe(t)"
          >
            <view class="card" @tap="open(t)">
              <view class="row top-row">
                <view class="title-wrap">
                  <text class="card-title">{{ t.name }}</text>
                  <text class="meta">{{ t.items.length }} 件</text>
                </view>
                <text class="pill">{{ categoryText(t.category) }}</text>
              </view>
              <view class="row sub">
                <text class="hint">{{ reminderText(t.reminderRules) }}</text>
                <text class="edit-btn" @tap.stop="editTemplate(t)">编辑</text>
              </view>
            </view>
          </uni-swipe-action-item>
        </uni-swipe-action>
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
import { computed, ref } from 'vue'
import { useTemplateStore } from '../../stores/templates'
import DarkDialog from '../../components/DarkDialog.vue'
import { useAutoThemeClass } from '../../services/theme'

const store = useTemplateStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const templates = computed(() => store.templates)
const keyword = ref('')
const activeCategory = ref('all')
const showCategoryMenu = ref(false)
const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '通用', value: 'general' },
  { label: '商务', value: 'business' },
  { label: '户外', value: 'outdoor' },
]
const activeCategoryLabel = computed(() => {
  const picked = categoryOptions.find((opt) => opt.value === activeCategory.value)
  return picked?.label || '全部'
})
const filteredTemplates = computed(() => {
  const picked = templates.value.filter((tpl) =>
    activeCategory.value === 'all' ? true : (tpl.category || 'general') === activeCategory.value,
  )
  const key = keyword.value.trim().toLowerCase()
  if (!key) return picked
  return picked.filter((tpl) => {
    const name = String(tpl.name || '').toLowerCase()
    const reminder = reminderText(tpl.reminderRules).toLowerCase()
    const category = categoryText(tpl.category).toLowerCase()
    return name.includes(key) || reminder.includes(key) || category.includes(key)
  })
})
const rightOptions = [{ text: '删除', style: { backgroundColor: '#f43f5e', color: '#fff' } }]
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

async function create() {
  const nameRes = await openPrompt({
    title: '新建模板',
    placeholder: '输入模板名称',
    confirmText: '下一步',
  })
  if (!nameRes.confirm) return
  const name = String(nameRes.value || '').trim() || '未命名模板'
  const categoryRes = await openAction({
    title: '选择模板类型',
    actions: ['通用模板', '商务模板', '户外模板'],
  })
  if (categoryRes.index < 0) return
  const tapIndex = Number(categoryRes.index)
  const category = tapIndex === 1 ? 'business' : tapIndex === 2 ? 'outdoor' : 'general'
  const t = store.addTemplate(name)
  t.category = category
  t.reminderRules = category === 'outdoor' ? ['id-check', 'medicine-check', 'power-check'] : category === 'business' ? ['id-check'] : []
  store.save()
  uni.navigateTo({ url: `/pages/template-edit/index?id=${t.id}` })
}
function countByCategory(category) {
  return templates.value.filter((tpl) => (tpl.category || 'general') === category).length
}
function toggleCategoryMenu() {
  showCategoryMenu.value = !showCategoryMenu.value
}
function pickCategory(value) {
  activeCategory.value = value || 'all'
  showCategoryMenu.value = false
}
function categoryText(category) {
  if (category === 'outdoor') return '户外模板'
  if (category === 'business') return '商务模板'
  return '通用模板'
}
function reminderText(rules = []) {
  if (!rules.length) return '无需出发校验'
  return `出发校验 ${rules.length} 项`
}
async function onSwipe(t) {
  const res = await openConfirm({
    title: '确认删除模板？',
    confirmText: '删除',
    danger: true,
  })
  if (!res.confirm) return
  store.removeTemplate(t.id)
}
function open(t) {
  uni.navigateTo({ url: `/pages/template-edit/index?id=${t.id}` })
}
async function editTemplate(t) {
  const nameRes = await openPrompt({
    title: '编辑模板名称',
    placeholder: '输入模板名称',
    modelValue: t.name || '',
    confirmText: '下一步',
  })
  if (!nameRes.confirm) return
  const categoryRes = await openAction({
    title: '选择模板类型',
    actions: ['通用模板', '商务模板', '户外模板'],
  })
  if (categoryRes.index < 0) return
  const tapIndex = Number(categoryRes.index)
  const category = tapIndex === 1 ? 'business' : tapIndex === 2 ? 'outdoor' : 'general'
  const reminderRules =
    category === 'outdoor' ? ['id-check', 'medicine-check', 'power-check'] : category === 'business' ? ['id-check'] : []
  store.updateTemplate(t.id, {
    name: String(nameRes.value || '').trim() || '未命名模板',
    category,
    reminderRules,
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
    radial-gradient(circle at 18% 10%, rgba(10, 128, 255, 0.28), transparent 34%),
    linear-gradient(180deg, #040a16 0%, #050d1f 52%, #071020 100%);
  padding: 16px;
  box-sizing: border-box;
  color: #f7fbff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.summary {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.summary-top {
  display: flex;
  align-items: center;
}
.header-title {
  font-size: 19px;
  font-weight: 700;
}
.stats {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  font-size: 11px;
  color: rgba(205, 233, 255, 0.92);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.4);
  background: rgba(14, 116, 144, 0.18);
}
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.search-combo {
  flex: 1;
  height: 42px;
  border: 1px solid rgba(118, 171, 255, 0.28);
  border-radius: 12px;
  background: rgba(8, 21, 40, 0.62);
  padding: 0 10px 0 12px;
  display: flex;
  align-items: center;
}
.search-input {
  flex: 1;
  height: 42px;
  line-height: 42px;
  color: #f7fbff;
  font-size: 14px;
}
.split-line {
  width: 1px;
  height: 24px;
  background: rgba(118, 171, 255, 0.26);
}
.filter-trigger {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 94px;
  padding-left: 8px;
  color: rgba(194, 219, 255, 0.88);
  font-size: 14px;
}
.add-btn {
  width: 42px;
  min-width: 42px;
  height: 42px;
  line-height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0b91ff, #2563eb);
  color: #f8fbff;
  font-size: 24px;
  font-weight: 600;
  padding: 0;
}
.group-menu {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.template-pane {
  flex: 1;
  min-height: 0;
}
.template-scroll {
  height: 100%;
}
.group-item {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(118, 171, 255, 0.14);
  color: rgba(214, 232, 255, 0.9);
  font-size: 13px;
}
.group-item:last-child {
  border-bottom: none;
}
.group-item.active {
  background: rgba(59, 130, 246, 0.24);
  color: #f7fbff;
}
.empty {
  color: rgba(185, 203, 229, 0.72);
  text-align: center;
  padding: 24px 0;
}
.card {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.18);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.top-row {
  gap: 8px;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #f7fbff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  color: rgba(194, 219, 255, 0.78);
  font-size: 12px;
}
.sub {
  margin-top: 8px;
}
.pill {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  color: rgba(205, 233, 255, 0.92);
  border: 1px solid rgba(125, 211, 252, 0.4);
  background: rgba(14, 116, 144, 0.18);
}
.hint {
  font-size: 12px;
  color: rgba(194, 219, 255, 0.72);
}
.edit-btn {
  color: #7dd3fc;
  font-size: 13px;
}
.page.theme-day .summary,
.page.theme-day .group-menu,
.page.theme-day .card {
  background: #ffffff;
  border-color: rgba(56, 98, 160, 0.12);
}
.page.theme-day .header-title,
.page.theme-day .card-title,
.page.theme-day .hint,
.page.theme-day .meta,
.page.theme-day .group-item {
  color: #1f3658;
}
.page.theme-day .chip,
.page.theme-day .pill {
  color: #375176;
  border-color: rgba(76, 121, 182, 0.28);
  background: rgba(224, 235, 249, 0.72);
}
.page.theme-day .toolbar .search-combo {
  border-color: rgba(56, 98, 160, 0.2);
  background: #f2f7ff;
}
.page.theme-day .split-line {
  background: rgba(56, 98, 160, 0.2);
}
.page.theme-day .search-input,
.page.theme-day .filter-trigger,
.page.theme-day .group-item.active,
.page.theme-day .edit-btn {
  color: #285fba;
}
.page.theme-day .add-btn {
  background: linear-gradient(135deg, #1e88ff, #3268e7);
}
.page.theme-day .empty {
  color: #56749e;
}
</style>
