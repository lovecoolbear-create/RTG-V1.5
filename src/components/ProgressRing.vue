<template>
  <view :class="containerClasses" :style="containerStyle">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="progress-ring"
    >
      <!-- 背景圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        fill="none"
        class="progress-ring__background"
      />
      
      <!-- 进度圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :stroke-linecap="strokeLinecap"
        fill="none"
        class="progress-ring__progress"
        :class="{ 'progress-ring__progress--animated': animated }"
      />
      
      <!-- 内圆（可选） -->
      <circle
        v-if="showInnerCircle"
        :cx="center"
        :cy="center"
        :r="innerRadius"
        :fill="innerColor"
        class="progress-ring__inner"
      />
    </svg>
    
    <!-- 中心内容 -->
    <view v-if="$slots.default" class="progress-ring__content">
      <slot></slot>
    </view>
    
    <!-- 百分比显示 -->
    <view v-if="showPercentage" class="progress-ring__percentage">
      <text class="progress-ring__percentage-text">{{ Math.round(percentage) }}%</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  size: {
    type: Number,
    default: 120
  },
  strokeWidth: {
    type: Number,
    default: 8
  },
  color: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  animated: {
    type: Boolean,
    default: true
  },
  showPercentage: {
    type: Boolean,
    default: false
  },
  showInnerCircle: {
    type: Boolean,
    default: true
  },
  innerColor: {
    type: String,
    default: ''
  },
  strokeLinecap: {
    type: String,
    default: 'round',
    validator: (value) => ['butt', 'round', 'square'].includes(value)
  },
  clockwise: {
    type: Boolean,
    default: true
  }
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const innerRadius = computed(() => (props.size - props.strokeWidth * 2) / 2)
const circumference = computed(() => radius.value * 2 * Math.PI)

const dashOffset = computed(() => {
  const offset = circumference.value - (props.percentage / 100) * circumference.value
  return props.clockwise ? offset : -offset
})

const containerClasses = computed(() => [
  'progress-ring-container',
  {
    'progress-ring-container--animated': props.animated,
    'progress-ring-container--with-content': !!props.showPercentage || !!props.slots.default
  }
])

const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  '--progress-color': props.color || 'var(--primary-color)',
  '--progress-bg-color': props.backgroundColor || 'var(--bg-secondary)',
  '--progress-inner-color': props.innerColor || 'var(--bg-primary)'
}))
</script>

<style scoped>
/* @import removed */';

.progress-ring-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring-container--with-content {
  position: relative;
}

.progress-ring {
  transform: rotate(-90deg);
  transition: transform var(--transition-normal);
}

.progress-ring__background {
  stroke: var(--progress-bg-color);
  opacity: 0.3;
}

.progress-ring__progress {
  stroke: var(--progress-color);
  transition: stroke-dashoffset var(--transition-normal) ease-out;
  transform-origin: center;
}

.progress-ring__progress--animated {
  animation: progressPulse 2s ease-in-out infinite;
}

.progress-ring__inner {
  fill: var(--progress-inner-color);
}

.progress-ring__content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.progress-ring__percentage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring__percentage-text {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.progress-ring-container--small .progress-ring__percentage-text {
  font-size: var(--text-base);
}

.progress-ring-container--large .progress-ring__percentage-text {
  font-size: var(--text-xl);
}

@keyframes progressPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

// 主题适配
.theme-day .progress-ring__background {
  stroke: var(--bg-secondary-light);
  opacity: 0.3;
}

.theme-day .progress-ring__percentage-text {
  color: var(--text-primary-light);
}

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .progress-ring__progress {
    transition: none;
  }
  
  .progress-ring__progress--animated {
    animation: none;
  }
}
</style>
