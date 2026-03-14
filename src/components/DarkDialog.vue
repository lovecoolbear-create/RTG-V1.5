<template>
  <view v-if="visible" class="dialog-mask" :class="themeClass" @tap="onMaskTap">
    <view class="dialog-card" @tap.stop>
      <text v-if="title" class="dialog-title">{{ title }}</text>
      <text v-if="message" class="dialog-message">{{ message }}</text>
      <input
        v-if="mode === 'prompt'"
        class="dialog-input"
        :placeholder="placeholder"
        :value="localValue"
        maxlength="80"
        @input="onInput"
      />
      <view v-if="mode === 'action'" class="action-list">
        <button
          v-for="(item, index) in normalizedActions"
          :key="`${index}-${item.label}`"
          class="action-item"
          :class="{ danger: !!item.danger }"
          @tap="emitAction(index)"
        >
          {{ item.label }}
        </button>
      </view>
      <view v-else class="dialog-actions">
        <button class="btn ghost" @tap="emitCancel">{{ cancelText || '取消' }}</button>
        <button class="btn primary" :class="{ danger: !!danger }" @tap="emitConfirm">
          {{ confirmText || '确认' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { readThemeMode } from '../services/theme'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'confirm' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  placeholder: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  danger: { type: Boolean, default: false },
  closeOnMask: { type: Boolean, default: true },
  actions: { type: Array, default: () => [] },
})

const emit = defineEmits(['cancel', 'confirm', 'action'])
const localValue = ref('')
const themeMode = ref(readThemeMode())
const themeClass = computed(() => (themeMode.value === 'day' ? 'theme-day' : 'theme-night'))

const normalizedActions = computed(() =>
  (props.actions || []).map((item) => {
    if (typeof item === 'string') return { label: item, danger: false }
    return {
      label: String(item?.label || ''),
      danger: !!item?.danger,
    }
  }),
)

watch(
  () => props.visible,
  (next) => {
    if (next) {
      themeMode.value = readThemeMode()
      localValue.value = String(props.modelValue || '')
    }
  },
  { immediate: true },
)

function onMaskTap() {
  if (!props.closeOnMask) return
  emit('cancel')
}
function onInput(e) {
  localValue.value = String(e?.detail?.value || '')
}
function emitCancel() {
  emit('cancel')
}
function emitConfirm() {
  emit('confirm', localValue.value)
}
function emitAction(index) {
  emit('action', index)
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(2, 6, 23, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
}
.dialog-card {
  width: 100%;
  max-width: 560rpx;
  border-radius: 14px;
  border: 1px solid rgba(118, 171, 255, 0.26);
  background:
    radial-gradient(circle at 20% 0%, rgba(14, 165, 233, 0.2), transparent 36%),
    rgba(7, 19, 38, 0.96);
  padding: 14px;
  box-sizing: border-box;
}
.dialog-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #f8fbff;
}
.dialog-message {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(215, 233, 255, 0.88);
}
.dialog-input {
  margin-top: 12px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(125, 211, 252, 0.44);
  background: rgba(6, 21, 44, 0.84);
  color: #f8fbff;
  font-size: 14px;
  padding: 0 10px;
}
.action-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-item {
  height: 40px;
  border: 1px solid rgba(118, 171, 255, 0.32);
  border-radius: 10px;
  background: rgba(22, 78, 178, 0.28);
  color: #e0f2fe;
  font-size: 14px;
}
.action-item.danger {
  border-color: rgba(248, 113, 113, 0.45);
  background: rgba(127, 29, 29, 0.4);
  color: #fee2e2;
}
.dialog-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.btn {
  height: 40px;
  border-radius: 10px;
  font-size: 14px;
}
.btn.ghost {
  border: 1px solid rgba(118, 171, 255, 0.34);
  background: rgba(10, 25, 46, 0.86);
  color: #cfe6ff;
}
.btn.primary {
  border: 1px solid rgba(34, 197, 94, 0.34);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(22, 163, 74, 0.84));
  color: #f0fdf4;
}
.btn.primary.danger {
  border-color: rgba(248, 113, 113, 0.4);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.72), rgba(185, 28, 28, 0.86));
  color: #fff1f2;
}
.dialog-mask.theme-day {
  background: rgba(151, 183, 220, 0.34);
}
.dialog-mask.theme-day .dialog-card {
  border: 1px solid rgba(152, 191, 255, 0.42);
  background:
    radial-gradient(circle at 18% 0%, rgba(147, 197, 253, 0.24), transparent 38%),
    rgba(255, 255, 255, 0.97);
}
.dialog-mask.theme-day .dialog-title {
  color: #133b74;
}
.dialog-mask.theme-day .dialog-message {
  color: rgba(36, 77, 132, 0.9);
}
.dialog-mask.theme-day .dialog-input {
  border-color: rgba(147, 197, 253, 0.66);
  background: rgba(247, 251, 255, 0.95);
  color: #1e3a8a;
}
.dialog-mask.theme-day .action-item {
  border-color: rgba(147, 197, 253, 0.66);
  background: rgba(239, 246, 255, 0.96);
  color: #1e3a8a;
}
.dialog-mask.theme-day .action-item.danger {
  border-color: rgba(252, 165, 165, 0.66);
  background: rgba(254, 242, 242, 0.98);
  color: #b91c1c;
}
.dialog-mask.theme-day .btn.ghost {
  border-color: rgba(147, 197, 253, 0.66);
  background: rgba(239, 246, 255, 0.94);
  color: #1d4ed8;
}
.dialog-mask.theme-day .btn.primary {
  border-color: rgba(59, 130, 246, 0.38);
  background: linear-gradient(135deg, #1da1ff, #2563eb);
  color: #f8fbff;
}
</style>
