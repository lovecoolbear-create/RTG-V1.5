<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="summary">
      <view class="summary-top">
        <text class="title">{{ activeTab === 'gear' ? '装备库' : '箱包库' }}</text>
      </view>
      <view class="stats">
        <text class="chip">装备 {{ items.length }}</text>
        <text class="chip">箱包 {{ bags.length }}</text>
        <text class="chip">分组 {{ groups.length }}</text>
      </view>
    </view>

    <view class="tab-row">
      <button class="tab-btn" :class="{ active: activeTab === 'gear' }" @tap="switchTab('gear')">物品</button>
      <button class="tab-btn" :class="{ active: activeTab === 'bags' }" @tap="switchTab('bags')">箱包</button>
    </view>

    <view v-if="activeTab === 'gear'" class="gear-pane">
      <view class="search-row">
        <view class="search-box">
          <input v-model="keyword" class="search-input" placeholder="搜索装备名称或分类" />
          <text class="search-arrow" @tap.stop="toggleGroupMenu">{{ selectedGroupLabel }} ▼</text>
        </view>
        <button class="add-btn" @tap="add">+</button>
      </view>
      <view v-if="showGroupMenu" class="group-menu">
        <view
          v-for="opt in groupMenuOptions"
          :key="opt"
          class="group-item"
          :class="{ active: selectedGroupLabel === opt }"
          @tap="pickGroup(opt)"
        >
          {{ opt }}
        </view>
      </view>
      <scroll-view scroll-y class="gear-scroll">
        <view v-if="filteredItems.length === 0" class="empty">暂无装备</view>
        <uni-swipe-action>
          <uni-swipe-action-item
            v-for="item in filteredItems"
            :key="item.id"
            :right-options="rightOptions"
            @click="remove(item.id)"
          >
            <view class="card">
              <view class="head-row">
                <view class="name-wrap">
                  <text class="item-name">{{ item.name }}</text>
                  <text v-if="item.isImportant" class="state-chip important">重要</text>
                </view>
                <view class="right-meta">
                  <text class="group">{{ item.group || '其他' }}</text>
                </view>
              </view>
              <view class="control-row" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                <view class="control-left" style="display:flex;align-items:center;justify-content:flex-start;gap:16px;flex:1;">
                  <view class="switch-item">
                    <text class="switch-label">需带回</text>
                    <switch :checked="!item.isConsumable" @change="setMustReturn(item.id, $event)" />
                  </view>
                  <view class="switch-item">
                    <text class="switch-label">重要物品</text>
                    <switch :checked="!!item.isImportant" @change="toggleImportant(item.id)" />
                  </view>
                </view>
                <text class="edit-btn control-edit" style="margin-left:8px;" @tap.stop="editItem(item)">编辑</text>
              </view>
            </view>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </scroll-view>
    </view>

    <view v-else class="bag-pane">
      <view class="bag-toolbar">
        <text class="label">常用箱包</text>
        <button size="mini" class="primary-btn" @tap="addBag">+ 添加箱包</button>
      </view>
      <scroll-view scroll-y class="bag-scroll">
        <view v-if="bags.length === 0" class="empty">暂无箱包</view>
        <view v-else class="bag-list">
          <view v-for="bag in bags" :key="bag.id" class="bag-card">
            <text class="bag-name">{{ bag.name }}</text>
            <text class="bag-remove" @tap="removeBag(bag.id)">删除</text>
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
import { useGearStore } from '../../stores/gear'
import DarkDialog from '../../components/DarkDialog.vue'
import { useAutoThemeClass } from '../../services/theme'

const store = useGearStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const items = computed(() => store.items)
const bags = computed(() => store.bags)
const activeTab = ref('gear')
const keyword = ref('')
const selectedGroup = ref('')
const showGroupMenu = ref(false)
const groups = computed(() => [...new Set(items.value.map((item) => item.group || '其他'))].sort())
const selectedGroupLabel = computed(() => selectedGroup.value || '全部分类')
const groupMenuOptions = computed(() => ['全部分类', ...groups.value])
const filteredItems = computed(() => {
  const kw = String(keyword.value || '').trim()
  return items.value.filter((item) => {
    if (selectedGroup.value && (item.group || '其他') !== selectedGroup.value) return false
    if (!kw) return true
    return item.name.includes(kw) || String(item.group || '').includes(kw)
  })
})
const rightOptions = [{ text: '删除', style: { backgroundColor: '#f43f5e', color: '#fff' } }]
const quickGroups = ['证件', '电子', '服装', '个人护理', '补给', '其他', '自定义分组']
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

function switchTab(tab) {
  activeTab.value = tab
  showGroupMenu.value = false
}

function toggleGroupMenu() {
  showGroupMenu.value = !showGroupMenu.value
}

function pickGroup(option) {
  selectedGroup.value = option === '全部分类' ? '' : option
  showGroupMenu.value = false
}

async function add() {
  const nameRes = await openPrompt({
    title: '添加装备',
    placeholder: '输入装备名称',
    confirmText: '下一步',
  })
  if (!nameRes.confirm) return
  const name = String(nameRes.value || '').trim()
  if (!name) {
    uni.showToast({ title: '请输入装备名称', icon: 'none' })
    return
  }
  const groupPick = await openAction({
    title: '选择分组',
    actions: quickGroups,
  })
  if (groupPick.index < 0) return
  const picked = quickGroups[groupPick.index] || '其他'
  if (picked === '自定义分组') {
    const groupRes = await openPrompt({
      title: '自定义分组',
      placeholder: '例如：摄影/运动',
      confirmText: '确认',
    })
    if (!groupRes.confirm) return
    const customGroup = String(groupRes.value || '').trim() || '其他'
    await finishAdd(name, customGroup)
    return
  }
  await finishAdd(name, picked)
}
async function finishAdd(name, group) {
  const suggestedConsumable = store.inferConsumable(name, group)
  const suggestedText = suggestedConsumable ? '可消耗' : '需带回'
  const res = await openAction({
    title: '保存方式',
    actions: [
      `按建议保存（${suggestedText}）`,
      '设为需带回',
      '设为可消耗',
      `按建议并标记重要（${suggestedText}）`,
    ],
  })
  if (res.index < 0) return
  const idx = Number(res.index || 0)
  const byChoice = [
    { isConsumable: suggestedConsumable, isImportant: false },
    { isConsumable: false, isImportant: false },
    { isConsumable: true, isImportant: false },
    { isConsumable: suggestedConsumable, isImportant: true },
  ]
  const options = byChoice[idx] || byChoice[0]
  store.add(name, group, options)
  uni.showToast({ title: '已添加', icon: 'none' })
}
function setMustReturn(id, e) {
  const mustReturn = !!e.detail.value
  store.setConsumable(id, !mustReturn)
}
function toggleImportant(id) {
  store.toggleImportant(id)
}
function remove(id) {
  store.remove(id)
}
async function editItem(item) {
  const res = await openPrompt({
    title: '编辑装备',
    placeholder: '名称,分组',
    modelValue: `${item.name},${item.group || '其他'}`,
    confirmText: '保存',
  })
  if (!res.confirm) return
  const raw = String(res.value || '').split(',')
  const nextName = String(raw[0] || '').trim()
  const nextGroup = String(raw[1] || '').trim() || item.group || '其他'
  if (!nextName) {
    uni.showToast({ title: '请输入装备名称', icon: 'none' })
    return
  }
  const updated = store.updateItem(item.id, { name: nextName, group: nextGroup })
  if (!updated) {
    uni.showToast({ title: '保存失败', icon: 'none' })
    return
  }
  uni.showToast({ title: '已更新', icon: 'none' })
}
async function addBag() {
  const res = await openPrompt({
    title: '添加箱包',
    placeholder: '例如：行李箱/双肩包',
    confirmText: '添加',
  })
  if (!res.confirm) return
  const bag = store.addBag(String(res.value || '').trim())
  if (!bag) {
    uni.showToast({ title: '名称为空或已存在', icon: 'none' })
    return
  }
  uni.showToast({ title: '已添加箱包', icon: 'none' })
}
async function removeBag(id) {
  const res = await openConfirm({
    title: '删除箱包',
    message: '删除后不会影响历史行程记录，确定继续？',
    confirmText: '删除',
    danger: true,
  })
  if (!res.confirm) return
  store.removeBag(id)
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
    radial-gradient(circle at 12% 8%, rgba(10, 128, 255, 0.28), transparent 34%),
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
  justify-content: flex-start;
  align-items: center;
}
.title {
  font-size: 19px;
  font-weight: 700;
}
.tab-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.gear-pane,
.bag-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.gear-scroll,
.bag-scroll {
  flex: 1;
  min-height: 0;
  height: 100%;
}
.tab-btn {
  flex: 1;
  background: rgba(8, 21, 40, 0.7);
  color: rgba(218, 236, 255, 0.85);
  border-radius: 12px;
  border: 1px solid rgba(118, 171, 255, 0.2);
  height: 38px;
  line-height: 38px;
  font-size: 13px;
}
.tab-btn.active {
  background: linear-gradient(135deg, #1f8bff, #2f66ff);
  color: #f8fbff;
  border-color: transparent;
}
.primary-btn {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #f8fbff;
  border-radius: 999px;
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
.search-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.search-box {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 1px solid rgba(118, 171, 255, 0.24);
  background: rgba(8, 21, 40, 0.72);
  padding: 0 10px;
}
.search-input {
  flex: 1;
  height: 40px;
  color: #f8fbff;
  font-size: 13px;
}
.search-arrow {
  font-size: 12px;
  color: rgba(186, 213, 255, 0.88);
  padding-left: 8px;
  border-left: 1px solid rgba(118, 171, 255, 0.22);
}
.add-btn {
  width: 40px;
  height: 40px;
  line-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #1888ff, #2e65ff);
  color: #f7fbff;
  font-size: 22px;
  padding: 0;
}
.group-menu {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
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
.bag-empty {
  margin-top: 8px;
  color: rgba(185, 203, 229, 0.72);
  font-size: 12px;
}
.bag-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.bag-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(50% - 5px);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(118, 171, 255, 0.2);
  background: rgba(10, 28, 50, 0.58);
  box-sizing: border-box;
}
.bag-name {
  font-size: 13px;
  color: rgba(221, 242, 255, 0.94);
}
.bag-remove {
  font-size: 12px;
  color: #fecaca;
}
.empty {
  color: rgba(185, 203, 229, 0.72);
  text-align: center;
  padding: 24px 0;
}
.card {
  background: rgba(10, 28, 50, 0.58);
  border: 1px solid rgba(118, 171, 255, 0.18);
  padding: 10px 12px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.name-wrap {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  flex: 1;
  padding-right: 8px;
  min-width: 0;
}
.item-name {
  font-size: 16px;
  font-weight: 650;
  color: #f7fbff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.right-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  flex-shrink: 0;
}
.group {
  color: rgba(194, 219, 255, 0.78);
  font-size: 12px;
}
.edit-btn {
  color: #93c5fd;
  font-size: 12px;
}
.state-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}
.important {
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.56);
  background: rgba(248, 113, 113, 0.2);
}
.control-row {
  min-height: 34px;
}
.control-left {
  display: flex;
  gap: 16px;
  align-items: center;
}
.switch-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-edit {
  line-height: 1;
}
.switch-label {
  color: rgba(194, 219, 255, 0.78);
  font-size: 12px;
}
.bag-pane {
  margin-top: 4px;
}
.bag-toolbar {
  background: rgba(10, 28, 50, 0.5);
  border: 1px solid rgba(118, 171, 255, 0.16);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.label {
  font-size: 12px;
  color: rgba(196, 219, 255, 0.8);
}
.page.theme-day .summary,
.page.theme-day .search-box,
.page.theme-day .group-menu,
.page.theme-day .card,
.page.theme-day .bag-toolbar,
.page.theme-day .bag-card {
  background: rgba(255, 255, 255, 0.84);
  border-color: rgba(126, 160, 205, 0.28);
}
.page.theme-day .title,
.page.theme-day .item-name,
.page.theme-day .group-item,
.page.theme-day .bag-name,
.page.theme-day .switch-label,
.page.theme-day .group {
  color: #1f3658;
}
.page.theme-day .chip {
  color: #375176;
  border-color: rgba(76, 121, 182, 0.28);
  background: rgba(199, 223, 255, 0.42);
}
.page.theme-day .tab-btn {
  background: rgba(223, 236, 255, 0.72);
  color: #365277;
  border-color: rgba(126, 160, 205, 0.36);
}
.page.theme-day .tab-btn.active {
  background: linear-gradient(135deg, #3ea1ff, #4b75ff);
  color: #f8fbff;
}
.page.theme-day .search-input,
.page.theme-day .search-arrow,
.page.theme-day .group-item.active {
  color: #2e496d;
}
.page.theme-day .edit-btn {
  color: #285fba;
}
.page.theme-day .important {
  color: #1f3658;
  border-color: rgba(248, 113, 113, 0.36);
  background: rgba(248, 113, 113, 0.16);
}
.page.theme-day .empty {
  color: #56749e;
}
</style>
