<template>
  <view class="page" :class="themeClass" :style="pageThemeStyle">
    <view class="block">
      <view class="label">模板名称</view>
      <input class="input" v-model="name" placeholder="输入名称" />
      <button size="mini" @tap="saveName">保存名称</button>
    </view>

    <view class="block">
      <view class="row head">
        <view class="label">物品</view>
        <view class="row" style="gap:8px">
          <button size="mini" @tap="addItem">+ 手动添加</button>
          <button size="mini" type="primary" @tap="addFromGear">从装备库添加</button>
        </view>
      </view>
      <view v-if="tpl?.items?.length === 0" class="empty">暂无物品</view>
      <uni-swipe-action>
        <uni-swipe-action-item
          v-for="it in tpl?.items || []"
          :key="it.id"
          :right-options="removeOption"
          @click="remove(it.id)"
        >
          <view class="row item">
            <text class="name">{{ it.name }}</text>
            <text class="group">{{ it.group || '其他' }}</text>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
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
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTemplateStore } from '../../stores/templates'
import DarkDialog from '../../components/DarkDialog.vue'
import { useAutoThemeClass } from '../../services/theme'

const store = useTemplateStore()
const { themeClass, pageThemeStyle } = useAutoThemeClass()
const id = ref('')
const tpl = ref(null)
const name = ref('')
const removeOption = [{ text: '移除', style: { backgroundColor: '#f43f5e', color: '#fff' } }]
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
  id.value = options?.id || ''
  tpl.value = store.getById(id.value)
  name.value = tpl.value?.name || ''
})

function saveName() {
  store.renameTemplate(id.value, name.value.trim() || '未命名模板')
  tpl.value = store.getById(id.value)
  uni.showToast({ title: '已保存', icon: 'none' })
}

async function addItem() {
  const res = await openPrompt({
    title: '添加物品',
    placeholder: '物品名,分组(可选)',
    confirmText: '添加',
  })
  if (!res.confirm) return
  const raw = String(res.value || '').split(',')
  const item = { name: (raw[0] || '').trim() || '未命名', group: (raw[1] || '').trim() || '其他' }
  store.addItem(id.value, item)
  tpl.value = store.getById(id.value)
}
function remove(itemId) {
  store.removeItem(id.value, itemId)
  tpl.value = store.getById(id.value)
}

function addFromGear() {
  uni.navigateTo({ url: `/pages/gear-picker/index?target=template&id=${id.value}` })
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
.page { padding: 12px; }
.block { background: #fff; padding: 12px; border-radius: 12px; margin-bottom: 12px; }
.label { font-weight: 600; margin-bottom: 6px; }
.input { border: 1px solid #eee; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px; }
.empty { color: #999; text-align: center; padding: 16px 0; }
.row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
.head { margin-bottom: 8px; }
.item { padding: 8px 0; border-bottom: 1px solid #f2f2f2; }
.item:last-child { border-bottom: none; }
.name { font-size: 14px; }
.group { font-size: 12px; color: #666; }
</style>
