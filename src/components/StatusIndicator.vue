<template>
  <view class="status-indicator" :class="`status-indicator--${size}`">
    <view class="status-icon" :class="iconClasses">
      <view v-if="status === 'preparation'" class="preparation-icon">⏳</view>
      <view v-else-if="status === 'packing'" class="packing-icon">📦</view>
      <view v-else-if="status === 'packed'" class="packed-icon">✅</view>
      <view v-else-if="status === 'departed'" class="departed-icon">🚗</view>
      <view v-else-if="status === 'returnPhase'" class="return-icon">🔄</view>
      <view v-else-if="status === 'archived'" class="archived-icon">📋</view>
      <view v-else class="default-icon">⚪</view>
    </view>
    <text v-if="showLabel" class="status-label">{{ statusText }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'preparation'
  },
  size: {
    type: String,
    default: 'medium'
  },
  animated: {
    type: Boolean,
    default: false
  },
  showLabel: {
    type: Boolean,
    default: false
  }
})

const iconClasses = computed(() => [
  'status-icon',
  `status-icon--${props.status}`,
  `status-icon--${props.size}`,
  {
    'status-icon--animated': props.animated
  }
])

const statusText = computed(() => {
  const statusMap = {
    preparation: '准备中',
    packing: '清点中',
    packed: '已打包',
    departed: '已出发',
    returnPhase: '返程中',
    archived: '已归档'
  }
  return statusMap[props.status] || '未知'
})
</script>

<style scoped>
/* @import removed */

.status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.status-indicator--with-label {
  gap: var(--spacing-sm);
}

.status-indicator--small {
  font-size: 12px;
}

.status-indicator--medium {
  font-size: 16px;
}

.status-indicator--large {
  font-size: 20px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  transition: all var(--transition-fast);
}

.status-icon--small {
  width: 16px;
  height: 16px;
  font-size: 8px;
}

.status-icon--medium {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.status-icon--large {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.status-icon--preparation {
  background: var(--info-color);
  color: white;
}

.status-icon--packing {
  background: var(--warning-color);
  color: white;
}

.status-icon--packed {
  background: var(--success-color);
  color: white;
}

.status-icon--departed {
  background: var(--primary-color);
  color: white;
}

.status-icon--returnPhase {
  background: var(--warning-color);
  color: white;
}

.status-icon--archived {
  background: var(--gray-500);
  color: white;
}

.status-icon--animated {
  animation: pulse 2s infinite;
}

.status-label {
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-icon--animated {
    animation: none;
  }
}
</style>
