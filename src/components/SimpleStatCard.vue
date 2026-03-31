<template>
  <view class="simple-stat-card" :class="`simple-stat-card--${variant}`" @tap="handleTap">
    <view class="simple-stat-card__value">{{ value }}</view>
    <view class="simple-stat-card__label">{{ label }}</view>
    <view v-if="trend && trendIcon" class="simple-stat-card__trend" :class="`simple-stat-card__trend--${trend}`">
      {{ trendIcon }} {{ trendValue }}%
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary'
  },
  clickable: {
    type: Boolean,
    default: false
  },
  trend: {
    type: String,
    default: ''
  },
  trendValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tap'])

const trendIcon = computed(() => {
  if (props.trend === 'up') return '↑'
  if (props.trend === 'down') return '↓'
  return ''
})

const handleTap = () => {
  if (props.clickable) {
    emit('tap')
  }
}
</script>

<style scoped>
/* @import removed */

.simple-stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  transition: all var(--transition-fast);
  text-align: center;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.simple-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.simple-stat-card--primary {
  border-color: var(--primary-color);
}

.simple-stat-card--warning {
  border-color: var(--warning-color);
}

.simple-stat-card--success {
  border-color: var(--success-color);
}

.simple-stat-card__value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.simple-stat-card__label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.simple-stat-card__trend {
  font-size: 12px;
  margin-top: 4px;
  font-weight: 600;
}

.simple-stat-card__trend--up {
  color: var(--success-color);
}

.simple-stat-card__trend--down {
  color: var(--error-color);
}

@media (max-width: 375px) {
  .simple-stat-card__value {
    font-size: 24px;
  }
  
  .simple-stat-card__label {
    font-size: 11px;
  }
}
</style>
