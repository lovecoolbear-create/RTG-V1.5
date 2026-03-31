<template>
  <view
    :class="buttonClasses"
    @tap="handleTap"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchcancel="onTouchCancel"
  >
    <view v-if="loading" class="loading-spinner">
      <view class="spinner"></view>
    </view>
    <view v-else class="button-content">
      <view v-if="$slots.icon" class="button-icon">
        <slot name="icon"></slot>
      </view>
      <view class="button-text">
        <view class="button-title">{{ title }}</view>
        <view v-if="subtitle" class="button-subtitle">{{ subtitle }}</view>
      </view>
    </view>
    <view class="button-ripple" v-if="showRipple" :style="rippleStyle"></view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'tap'])

const isPressed = ref(false)
const showRipple = ref(false)
const rippleStyle = ref({})

const buttonClasses = computed(() => [
  'enhanced-button',
  `enhanced-button--${props.variant}`,
  `enhanced-button--${props.size}`,
  {
    'enhanced-button--disabled': props.disabled,
    'enhanced-button--loading': props.loading,
    'enhanced-button--full-width': props.fullWidth,
    'enhanced-button--rounded': props.rounded,
    'enhanced-button--pressed': isPressed.value
  }
])

const handleClick = (e) => {
  if (props.disabled || props.loading) return
  
  createRipple(e)
  emit('click', e)
}

const handleTap = (e) => {
  if (props.disabled || props.loading) return
  
  createRipple(e)
  emit('tap', e)
}

const onTouchStart = () => {
  if (!props.disabled && !props.loading) {
    isPressed.value = true
  }
}

const onTouchEnd = () => {
  isPressed.value = false
}

const onTouchCancel = () => {
  isPressed.value = false
}

const createRipple = (e) => {
  const button = e.currentTarget
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2
  
  rippleStyle.value = {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}px`,
    top: `${y}px`
  }
  
  showRipple.value = true
  
  setTimeout(() => {
    showRipple.value = false
  }, 600)
}
</script>

<style scoped>
/* @import removed */';

.enhanced-button {
  position: relative;
  border: none;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.enhanced-button--disabled {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.enhanced-button--loading {
  cursor: wait;
  pointer-events: none;
}

.enhanced-button--small {
  height: 32px;
  padding: 0 var(--spacing-sm);
  font-size: var(--text-sm);
}

.enhanced-button--medium {
  height: 44px;
  padding: 0 var(--spacing-md);
  font-size: var(--text-base);
}

.enhanced-button--large {
  height: 56px;
  padding: 0 var(--spacing-lg);
  font-size: var(--text-lg);
}

.enhanced-button--full-width {
  width: 100%;
}

.enhanced-button--rounded {
  border-radius: var(--radius-full);
}

.enhanced-button--primary {
  background: var(--primary-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--primary-dark);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
  
  &:active:not(.enhanced-button--disabled) {
    transform: translateY(0) scale(0.98);
  }
}

.enhanced-button--secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--bg-tertiary);
    border-color: var(--border-secondary);
    transform: translateY(-1px);
  }
}

.enhanced-button--success {
  background: var(--success-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--success-dark);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.enhanced-button--warning {
  background: var(--warning-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--warning-dark);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.enhanced-button--danger {
  background: var(--error-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--error-dark);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.enhanced-button--ghost {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--primary-color);
    color: var(--text-inverse);
    transform: translateY(-1px);
  }
}

.enhanced-button--pressed {
  transform: scale(0.98);
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.enhanced-button--loading .button-content {
  opacity: 0;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.button-title {
  font-weight: var(--font-semibold);
  line-height: 1.2;
}

.button-subtitle {
  font-size: 0.75em;
  opacity: 0.8;
  font-weight: var(--font-normal);
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-inverse);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

.button-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

// 主题适配
.theme-day .enhanced-button--primary {
  background: var(--primary-color);
  color: var(--text-inverse);
}

.theme-day .enhanced-button--secondary {
  background: var(--bg-card-light);
  color: var(--text-primary-light);
  border-color: var(--border-secondary);
}

.theme-day .enhanced-button--ghost {
  color: var(--primary-color);
  border-color: var(--primary-color);
  
  &:hover:not(.enhanced-button--disabled):not(.enhanced-button--loading) {
    background: var(--primary-color);
    color: var(--text-inverse);
  }
}

.theme-day .spinner {
  border-color: var(--text-inverse-light);
  border-top-color: transparent;
}
</style>
