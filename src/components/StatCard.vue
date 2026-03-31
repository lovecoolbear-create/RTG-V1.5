<template>
  <view :class="cardClasses" @tap="handleTap">
    <view class="stat-card__header">
      <view v-if="$slots.icon" class="stat-card__icon">
        <slot name="icon"></slot>
      </view>
      <view v-if="trend" class="stat-card__trend" :class="trendClasses">
        <view class="stat-card__trend-icon">{{ trendIcon }}</view>
        <view class="stat-card__trend-text">{{ trendText }}</view>
      </view>
    </view>
    
    <view class="stat-card__content">
      <view class="stat-card__value-container">
        <view class="stat-card__value" :style="valueStyle">{{ formattedValue }}</view>
        <view v-if="unit" class="stat-card__unit">{{ unit }}</view>
      </view>
      
      <view v-if="label" class="stat-card__label">{{ label }}</view>
      
      <view v-if="showProgress" class="stat-card__progress">
        <view class="stat-card__progress-bar" :style="progressStyle">
          <view class="stat-card__progress-fill" :style="progressFillStyle"></view>
        </view>
        <view v-if="showProgressText" class="stat-card__progress-text">{{ Math.round(progress) }}%</view>
      </view>
    </view>
    
    <view v-if="$slots.footer" class="stat-card__footer">
      <slot name="footer"></slot>
    </view>
    
    <view v-if="loading" class="stat-card__loading">
      <LoadingState type="dots" size="small" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import LoadingState from './LoadingState.vue'

const props = defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  trend: {
    type: String,
    default: '',
    validator: (value) => ['up', 'down', 'neutral'].includes(value)
  },
  trendValue: {
    type: Number,
    default: 0
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'error', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  showProgressText: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  formatValue: {
    type: Boolean,
    default: true
  },
  decimals: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['tap'])

const cardClasses = computed(() => [
  'stat-card',
  `stat-card--${props.variant}`,
  `stat-card--${props.size}`,
  {
    'stat-card--clickable': props.clickable,
    'stat-card--loading': props.loading,
    'stat-card--with-trend': props.trend,
    'stat-card--with-progress': props.showProgress
  }
])

const trendClasses = computed(() => [
  'stat-card__trend',
  `stat-card__trend--${props.trend}`
])

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return '↑'
    case 'down': return '↓'
    default: return '→'
  }
})

const trendText = computed(() => {
  if (props.trendValue === 0) return '0%'
  const sign = props.trend === 'up' ? '+' : ''
  return `${sign}${props.trendValue}%`
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  if (!props.formatValue) return props.value.toString()
  
  if (props.value >= 1000000) {
    return `${(props.value / 1000000).toFixed(props.decimals)}M`
  } else if (props.value >= 1000) {
    return `${(props.value / 1000).toFixed(props.decimals)}K`
  } else {
    return props.value.toFixed(props.decimals)
  }
})

const valueStyle = computed(() => {
  const colors = {
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    error: 'var(--error-color)',
    info: 'var(--info-color)'
  }
  
  return {
    color: colors[props.variant] || colors.primary
  }
})

const progressStyle = computed(() => ({
  height: props.size === 'small' ? '4px' : props.size === 'large' ? '8px' : '6px'
}))

const progressFillStyle = computed(() => ({
  width: `${props.progress}%`,
  backgroundColor: valueStyle.value.color
}))

const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('tap')
  }
}

const handleTap = () => {
  if (props.clickable && !props.loading) {
    emit('tap')
  }
}
</script>

<style scoped>
/* /* @import removed */'; */

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.stat-card--small {
  padding: var(--spacing-sm);
}

.stat-card--large {
  padding: var(--spacing-lg);
}

.stat-card--clickable {
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-secondary);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.stat-card--loading {
  pointer-events: none;
  opacity: 0.7;
}

.stat-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.stat-card--small .stat-card__icon {
  width: 32px;
  height: 32px;
}

.stat-card--large .stat-card__icon {
  width: 48px;
  height: 48px;
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
}

.stat-card__trend--up {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-color);
}

.stat-card__trend--down {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.stat-card__trend--neutral {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-tertiary);
}

.stat-card__trend-icon {
  font-weight: bold;
}

.stat-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-card__value-container {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.stat-card__value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1;
  color: var(--text-primary);
}

.stat-card--small .stat-card__value {
  font-size: var(--text-xl);
}

.stat-card--large .stat-card__value {
  font-size: var(--text-3xl);
}

.stat-card__unit {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}

.stat-card__label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.stat-card__progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.stat-card__progress-bar {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.stat-card__progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal) ease-out;
}

.stat-card__progress-text {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
  min-width: 40px;
  text-align: right;
}

.stat-card__footer {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
}

.stat-card__loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
}

// 变体样式
.stat-card--primary {
  border-color: rgba(118, 171, 255, 0.2);
}

.stat-card--success {
  border-color: rgba(52, 211, 153, 0.2);
}

.stat-card--warning {
  border-color: rgba(245, 158, 11, 0.2);
}

.stat-card--error {
  border-color: rgba(239, 68, 68, 0.2);
}

.stat-card--info {
  border-color: rgba(59, 130, 246, 0.2);
}

// 主题适配
.theme-day .stat-card {
  background: var(--bg-card-light);
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.theme-day .stat-card__icon {
  background: var(--bg-secondary-light);
  color: var(--text-primary-light);
}

.theme-day .stat-card__trend--up {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-color);
}

.theme-day .stat-card__trend--down {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.theme-day .stat-card__trend--neutral {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-secondary-light);
}

.theme-day .stat-card__value {
  color: var(--text-primary-light);
}

.theme-day .stat-card__unit {
  color: var(--text-secondary-light);
}

.theme-day .stat-card__label {
  color: var(--text-secondary-light);
}

.theme-day .stat-card__progress-bar {
  background: var(--bg-secondary-light);
}

.theme-day .stat-card__progress-text {
  color: var(--text-tertiary-light);
}

.theme-day .stat-card__footer {
  border-color: var(--border-light);
}

.theme-day .stat-card__loading {
  background: rgba(0, 0, 0, 0.05);
}

// 响应式适配
@media (max-width: 375px) {
  .stat-card__value {
    font-size: var(--text-xl);
  }
  
  .stat-card--large .stat-card__value {
    font-size: var(--text-2xl);
  }
}
</style>
