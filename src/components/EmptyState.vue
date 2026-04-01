<template>
  <view class="empty-state" :class="[type, { 'compact': compact }]">
    <!-- 插画区域 -->
    <view class="illustration-wrapper">
      <image 
        class="illustration" 
        :src="illustrationSrc" 
        mode="aspectFit"
        :class="{ 'breathing': breathing }"
      />
    </view>
    
    <!-- 标题 -->
    <text class="title">{{ titleText }}</text>
    
    <!-- 副标题/描述 -->
    <text v-if="subtitleText" class="subtitle">{{ subtitleText }}</text>
    
    <!-- 操作按钮 -->
    <view v-if="showAction" class="action-wrapper">
      <button 
        class="action-btn" 
        :class="actionType"
        @tap="handleAction"
        :loading="loading"
      >
        <text class="btn-text">{{ actionText }}</text>
      </button>
    </view>
    
    <!-- 额外插槽内容 -->
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 空状态类型：trip, template, error, network, custom
  type: {
    type: String,
    default: 'trip'
  },
  // 是否紧凑模式（较小尺寸）
  compact: {
    type: Boolean,
    default: false
  },
  // 是否启用呼吸动画
  breathing: {
    type: Boolean,
    default: true
  },
  // 自定义标题
  title: {
    type: String,
    default: ''
  },
  // 自定义副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 是否显示操作按钮
  showAction: {
    type: Boolean,
    default: true
  },
  // 操作按钮文字
  actionText: {
    type: String,
    default: ''
  },
  // 操作按钮类型：primary, secondary, ghost
  actionType: {
    type: String,
    default: 'primary'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 自定义插画路径
  illustration: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

// 预设配置
const presets = {
  trip: {
    illustration: '/assets/illustrations/empty-trip.svg',
    title: '准备好出发了吗？',
    subtitle: '创建你的第一个行程，让出行更有条理',
    actionText: '立即创建',
    actionType: 'primary'
  },
  template: {
    illustration: '/assets/illustrations/empty-template.svg',
    title: '还没有模板',
    subtitle: '创建常用清单模板，下次出行一键出发',
    actionText: '新建模板',
    actionType: 'secondary'
  },
  error: {
    illustration: '/assets/illustrations/network-error.svg',
    title: '哎呀，出错了',
    subtitle: '请检查网络连接后重试',
    actionText: '重新加载',
    actionType: 'primary'
  },
  network: {
    illustration: '/assets/illustrations/network-error.svg',
    title: '网络开小差了',
    subtitle: '请检查网络设置，或稍后重试',
    actionText: '重试',
    actionType: 'primary'
  },
  archive: {
    illustration: '/assets/illustrations/empty-trip.svg',
    title: '暂无归档行程',
    subtitle: '完成出行清单后，行程将自动归档到这里',
    actionText: '去创建行程',
    actionType: 'secondary'
  }
}

// 计算属性
const preset = computed(() => presets[props.type] || presets.trip)

const illustrationSrc = computed(() => {
  return props.illustration || preset.value.illustration
})

const titleText = computed(() => {
  return props.title || preset.value.title
})

const subtitleText = computed(() => {
  return props.subtitle || preset.value.subtitle
})

const actionBtnText = computed(() => {
  return props.actionText || preset.value.actionText
})

const actionBtnType = computed(() => {
  return props.actionType || preset.value.actionType
})

function handleAction() {
  if (!props.loading) {
    emit('action')
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  text-align: center;
}

.empty-state.compact {
  padding: 32rpx 24rpx;
}

/* 插画区域 */
.illustration-wrapper {
  margin-bottom: 32rpx;
}

.empty-state.compact .illustration-wrapper {
  margin-bottom: 24rpx;
}

.illustration {
  width: 240rpx;
  height: 240rpx;
}

.empty-state.compact .illustration {
  width: 160rpx;
  height: 160rpx;
}

/* 呼吸动画 */
.illustration.breathing {
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

/* 标题 */
.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #f7fbff;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.empty-state.compact .title {
  font-size: 28rpx;
  margin-bottom: 12rpx;
}

/* 副标题 */
.subtitle {
  font-size: 28rpx;
  color: #9bb0cb;
  margin-bottom: 32rpx;
  line-height: 1.5;
  max-width: 80%;
}

.empty-state.compact .subtitle {
  font-size: 24rpx;
  margin-bottom: 24rpx;
}

/* 操作按钮 */
.action-wrapper {
  margin-top: 8rpx;
}

.action-btn {
  min-width: 240rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  border: none;
  padding: 0 48rpx;
}

.empty-state.compact .action-btn {
  min-width: 200rpx;
  height: 64rpx;
  padding: 0 32rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}

.empty-state.compact .btn-text {
  font-size: 24rpx;
}

/* 按钮类型 */
.action-btn.primary {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.action-btn.primary .btn-text {
  color: #fff;
}

.action-btn.secondary {
  background: rgba(118, 171, 255, 0.15);
  border: 2rpx solid rgba(118, 171, 255, 0.4);
}

.action-btn.secondary .btn-text {
  color: #76abff;
}

.action-btn.ghost {
  background: transparent;
  border: 2rpx solid rgba(155, 176, 203, 0.3);
}

.action-btn.ghost .btn-text {
  color: #9bb0cb;
}

/* 日间模式适配 */
@media (prefers-color-scheme: light) {
  .title {
    color: #1a2332;
  }
  
  .subtitle {
    color: #64748b;
  }
}
</style>
