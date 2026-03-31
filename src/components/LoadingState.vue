<template>
  <view :class="containerClasses">
    <view v-if="type === 'spinner'" class="loading-spinner">
      <view class="spinner"></view>
      <view v-if="text" class="loading-text">{{ text }}</view>
    </view>
    
    <view v-else-if="type === 'dots'" class="loading-dots">
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
      <view v-if="text" class="loading-text">{{ text }}</view>
    </view>
    
    <view v-else-if="type === 'pulse'" class="loading-pulse">
      <view class="pulse-bar"></view>
      <view class="pulse-bar"></view>
      <view class="pulse-bar"></view>
      <view class="pulse-bar"></view>
      <view v-if="text" class="loading-text">{{ text }}</view>
    </view>
    
    <view v-else-if="type === 'skeleton'" class="loading-skeleton">
      <view class="skeleton-item skeleton-header"></view>
      <view class="skeleton-item skeleton-line"></view>
      <view class="skeleton-item skeleton-line short"></view>
      <view class="skeleton-item skeleton-line"></view>
    </view>
    
    <view v-else-if="type === 'shimmer'" class="loading-shimmer">
      <view class="shimmer-content">
        <slot></slot>
      </view>
      <view class="shimmer-overlay"></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'pulse', 'skeleton', 'shimmer'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  centered: {
    type: Boolean,
    default: true
  },
  overlay: {
    type: Boolean,
    default: false
  }
})

const containerClasses = computed(() => [
  'loading-container',
  `loading-container--${props.type}`,
  `loading-container--${props.size}`,
  {
    'loading-container--centered': props.centered,
    'loading-container--overlay': props.overlay
  }
])
</script>

<style scoped>
/* /* @import removed */'; */

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.loading-container--centered {
  width: 100%;
  min-height: 120px;
}

.loading-container--overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: var(--z-modal);
}

.loading-container--small {
  padding: var(--spacing-sm);
}

.loading-container--medium {
  padding: var(--spacing-md);
}

.loading-container--large {
  padding: var(--spacing-lg);
}

// Spinner 类型
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.loading-container--small .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-container--large .spinner {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

// Dots 类型
.loading-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.dots {
  display: flex;
  gap: var(--spacing-sm);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: dotPulse 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0; }

.loading-container--small .dot {
  width: 6px;
  height: 6px;
}

.loading-container--large .dot {
  width: 10px;
  height: 10px;
}

// Pulse 类型
.loading-pulse {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.pulse-bars {
  display: flex;
  gap: var(--spacing-xs);
  align-items: flex-end;
}

.pulse-bar {
  width: 4px;
  height: 24px;
  background: var(--primary-color);
  border-radius: var(--radius-sm);
  animation: pulseBar 1.2s ease-in-out infinite both;
}

.pulse-bar:nth-child(1) { animation-delay: -0.4s; }
.pulse-bar:nth-child(2) { animation-delay: -0.2s; }
.pulse-bar:nth-child(3) { animation-delay: 0; }
.pulse-bar:nth-child(4) { animation-delay: 0.2s; }

.loading-container--small .pulse-bar {
  width: 3px;
  height: 18px;
}

.loading-container--large .pulse-bar {
  width: 5px;
  height: 32px;
}

// Skeleton 类型
.loading-skeleton {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
}

.skeleton-header {
  height: 24px;
  width: 60%;
}

.skeleton-line {
  height: 16px;
  width: 100%;
  
  &.short {
    width: 40%;
  }
}

// Shimmer 类型
.loading-shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer-content {
  opacity: 0.7;
}

.shimmer-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

// 通用文本样式
.loading-text {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
  text-align: center;
}

// 动画
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulseBar {
  0%, 80%, 100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  40% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// 主题适配
.theme-day .spinner {
  border-color: var(--border-secondary);
  border-top-color: var(--primary-color);
}

.theme-day .dot {
  background: var(--primary-color);
}

.theme-day .pulse-bar {
  background: var(--primary-color);
}

.theme-day .skeleton-item {
  background: var(--bg-secondary-light);
  
  &::after {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 0, 0, 0.05),
      transparent
    );
  }
}

.theme-day .loading-text {
  color: var(--text-secondary-light);
}

.theme-day .loading-container--overlay {
  background: rgba(255, 255, 255, 0.7);
}
</style>
