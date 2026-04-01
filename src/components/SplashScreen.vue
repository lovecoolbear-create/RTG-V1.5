<template>
  <view class="splash-screen" :class="themeClass">
    <view class="logo-container">
      <image class="logo" src="/assets/logo/logo_icon.svg" mode="aspectFit"/>
    </view>
    <text class="brand-name">ReadyToGo</text>
    <text class="brand-slogan">轻松准备，立即出发</text>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAutoThemeClass } from '../services/theme'

const { themeClass } = useAutoThemeClass()

const emit = defineEmits(['complete'])

onMounted(() => {
  // 2.5秒后自动进入首页
  setTimeout(() => {
    emit('complete')
  }, 2500)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #040a16 0%, #071020 100%);
  z-index: 9999;
}

.splash-screen.theme-day {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.logo-container {
  width: 144rpx;
  height: 144rpx;
  margin-bottom: 40rpx;
  animation: logoFadeIn 0.8s ease-out;
}

.logo {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #f7fbff;
  margin-bottom: 16rpx;
  animation: textFadeIn 0.8s ease-out 0.3s both;
}

.splash-screen.theme-day .brand-name {
  color: #1a2332;
}

.brand-slogan {
  font-size: 28rpx;
  color: #9bb0cb;
  animation: textFadeIn 0.8s ease-out 0.5s both;
}

.splash-screen.theme-day .brand-slogan {
  color: #64748b;
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
