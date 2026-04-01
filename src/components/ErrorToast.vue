<template>
  <view 
    v-if="visible" 
    class="error-toast" 
    :class="[type, { 'fade-out': isHiding }]"
    @tap="handleTap"
  >
    <view class="error-icon">
      <text v-if="type === 'error'" class="icon">✕</text>
      <text v-else-if="type === 'warning'" class="icon">!</text>
      <text v-else-if="type === 'info'" class="icon">i</text>
      <text v-else class="icon">✓</text>
    </view>
    <view class="error-content">
      <text class="error-title">{{ title }}</text>
      <text v-if="message" class="error-message">{{ message }}</text>
    </view>
    <view v-if="actionText" class="error-action" @tap.stop="handleAction">
      <text class="action-text">{{ actionText }}</text>
    </view>
    <view v-else class="error-close" @tap.stop="hide">
      <text class="close-icon">✕</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 错误类型：error, warning, info, success
  type: {
    type: String,
    default: 'error'
  },
  // 标题（简短）
  title: {
    type: String,
    default: '出错了'
  },
  // 详细消息
  message: {
    type: String,
    default: ''
  },
  // 操作按钮文字
  actionText: {
    type: String,
    default: ''
  },
  // 自动隐藏时间（毫秒），0表示不自动隐藏
  duration: {
    type: Number,
    default: 3000
  },
  // 是否显示关闭按钮
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'action'])

const visible = ref(false)
const isHiding = ref(false)
let hideTimer = null

onMounted(() => {
  show()
})

onUnmounted(() => {
  clearTimeout(hideTimer)
})

function show() {
  visible.value = true
  isHiding.value = false
  
  if (props.duration > 0) {
    hideTimer = setTimeout(() => {
      hide()
    }, props.duration)
  }
}

function hide() {
  isHiding.value = true
  
  setTimeout(() => {
    visible.value = false
    emit('close')
  }, 300) // 等待淡出动画完成
}

function handleTap() {
  // 点击整个区域也可以关闭
  if (props.closable && !props.actionText) {
    hide()
  }
}

function handleAction() {
  emit('action')
  hide()
}

// 供外部调用的方法
defineExpose({
  show,
  hide
})
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 80rpx;
  left: 32rpx;
  right: 32rpx;
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 16rpx;
  background: rgba(239, 68, 68, 0.95);
  box-shadow: 0 8rpx 32rpx rgba(239, 68, 68, 0.3);
  z-index: 9999;
  animation: slideDown 0.3s ease-out;
}

.error-toast.fade-out {
  animation: slideUp 0.3s ease-in forwards;
}

/* 不同类型样式 */
.error-toast.error {
  background: rgba(239, 68, 68, 0.95);
  box-shadow: 0 8rpx 32rpx rgba(239, 68, 68, 0.3);
}

.error-toast.warning {
  background: rgba(245, 158, 11, 0.95);
  box-shadow: 0 8rpx 32rpx rgba(245, 158, 11, 0.3);
}

.error-toast.info {
  background: rgba(118, 171, 255, 0.95);
  box-shadow: 0 8rpx 32rpx rgba(118, 171, 255, 0.3);
}

.error-toast.success {
  background: rgba(52, 211, 153, 0.95);
  box-shadow: 0 8rpx 32rpx rgba(52, 211, 153, 0.3);
}

.error-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin-right: 20rpx;
  flex-shrink: 0;
}

.icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.error-message {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  line-height: 1.4;
}

.error-action {
  margin-left: 16rpx;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  flex-shrink: 0;
}

.action-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.error-close {
  margin-left: 16rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-icon {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20rpx);
  }
}
</style>
