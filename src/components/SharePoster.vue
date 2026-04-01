<template>
  <view class="share-poster-modal" v-if="visible" @tap="close">
    <view class="poster-container" @tap.stop>
      <!-- Canvas 绘制区域 -->
      <canvas 
        canvas-id="shareCanvas" 
        id="shareCanvas"
        class="share-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      />
      
      <!-- 预览图 -->
      <image 
        v-if="posterImage" 
        :src="posterImage" 
        class="poster-preview"
        mode="aspectFit"
      />
      
      <!-- 加载状态 -->
      <view v-if="isGenerating" class="generating-hint">
        <text class="hint-text">正在生成海报...</text>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="btn btn-primary" @tap="saveToAlbum">
          <text class="icon">💾</text>
          <text>保存到相册</text>
        </button>
        <button class="btn btn-secondary" open-type="share" @tap="shareToFriend">
          <text class="icon">📤</text>
          <text>分享给好友</text>
        </button>
      </view>
      
      <!-- 关闭按钮 -->
      <text class="close-btn" @tap="close">✕</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { trackShare, ShareTypes, ShareChannels } from '../utils/share-tracker.js'

const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'share'])

const canvasWidth = 750
const canvasHeight = 1334
const posterImage = ref('')
const isGenerating = ref(false)

// 品牌色
const BRAND_BLUE = '#76abff'
const BRAND_GREEN = '#34d399'
const DARK_BG = '#1a2332'
const TEXT_WHITE = '#ffffff'
const TEXT_GRAY = '#9bb0cb'

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal && props.trip) {
    nextTick(() => {
      generatePoster()
    })
  }
})

async function generatePoster() {
  isGenerating.value = true
  
  try {
    const ctx = uni.createCanvasContext('shareCanvas')
    
    // 1. 绘制背景
    drawBackground(ctx)
    
    // 2. 绘制装饰元素
    drawDecorations(ctx)
    
    // 3. 绘制 Logo
    await drawLogo(ctx)
    
    // 4. 绘制行程信息
    drawTripInfo(ctx)
    
    // 5. 绘制清单统计
    drawChecklistStats(ctx)
    
    // 6. 绘制日期和目的地
    drawDateAndDestination(ctx)
    
    // 7. 绘制底部提示
    drawFooter(ctx)
    
    // 生成图片
    await new Promise((resolve, reject) => {
      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            width: canvasWidth,
            height: canvasHeight,
            destWidth: canvasWidth * 2,
            destHeight: canvasHeight * 2,
            success: (res) => {
              posterImage.value = res.tempFilePath
              resolve(res)
            },
            fail: reject
          })
        }, 300)
      })
    })
    
  } catch (error) {
    console.error('生成海报失败:', error)
    uni.showToast({ title: '生成失败', icon: 'none' })
  } finally {
    isGenerating.value = false
  }
}

function drawBackground(ctx) {
  // 深色渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
  gradient.addColorStop(0, '#040a16')
  gradient.addColorStop(0.5, '#0d1420')
  gradient.addColorStop(1, '#071020')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // 添加装饰性圆形
  ctx.beginPath()
  ctx.arc(100, 200, 300, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(118, 171, 255, 0.05)'
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(canvasWidth - 150, canvasHeight - 300, 400, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(52, 211, 153, 0.03)'
  ctx.fill()
}

function drawDecorations(ctx) {
  // 顶部装饰线
  ctx.beginPath()
  ctx.moveTo(60, 180)
  ctx.lineTo(canvasWidth - 60, 180)
  ctx.strokeStyle = 'rgba(118, 171, 255, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // 底部装饰线
  ctx.beginPath()
  ctx.moveTo(60, canvasHeight - 200)
  ctx.lineTo(canvasWidth - 60, canvasHeight - 200)
  ctx.strokeStyle = 'rgba(118, 171, 255, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()
}

async function drawLogo(ctx) {
  // 绘制品牌名称
  ctx.font = 'bold 48px sans-serif'
  ctx.fillStyle = BRAND_BLUE
  ctx.textAlign = 'center'
  ctx.fillText('ReadyToGo', canvasWidth / 2, 100)
  
  // 副标题
  ctx.font = '28px sans-serif'
  ctx.fillStyle = TEXT_GRAY
  ctx.fillText('轻松准备 · 立即出发', canvasWidth / 2, 145)
}

function drawTripInfo(ctx) {
  const trip = props.trip
  const centerX = canvasWidth / 2
  const startY = 300
  
  // 行程标题
  ctx.font = 'bold 56px sans-serif'
  ctx.fillStyle = TEXT_WHITE
  ctx.textAlign = 'center'
  ctx.fillText(trip.title || '出行计划', centerX, startY)
  
  // 状态标签
  const statusText = getStatusText(trip.status)
  const statusColor = getStatusColor(trip.status)
  
  // 状态背景
  ctx.beginPath()
  ctx.roundRect(centerX - 80, startY + 30, 160, 48, 24)
  ctx.fillStyle = statusColor + '33' // 20% opacity
  ctx.fill()
  
  // 状态文字
  ctx.font = '28px sans-serif'
  ctx.fillStyle = statusColor
  ctx.fillText(statusText, centerX, startY + 62)
}

function drawChecklistStats(ctx) {
  const trip = props.trip
  const centerX = canvasWidth / 2
  const startY = 500
  
  // 统计标题
  ctx.font = '32px sans-serif'
  ctx.fillStyle = TEXT_GRAY
  ctx.textAlign = 'center'
  ctx.fillText('准备进度', centerX, startY)
  
  // 计算完成度
  const items = trip.items || []
  const total = items.length
  const packed = items.filter(i => i.packed).length
  const progress = total > 0 ? Math.round((packed / total) * 100) : 0
  
  // 绘制环形进度条
  const radius = 120
  const centerY = startY + 180
  
  // 背景圆环
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(118, 171, 255, 0.2)'
  ctx.lineWidth = 20
  ctx.stroke()
  
  // 进度圆环
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (Math.PI * 2 * progress / 100)
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.strokeStyle = BRAND_BLUE
  ctx.lineWidth = 20
  ctx.lineCap = 'round'
  ctx.stroke()
  
  // 百分比文字
  ctx.font = 'bold 72px sans-serif'
  ctx.fillStyle = TEXT_WHITE
  ctx.fillText(progress + '%', centerX, centerY + 25)
  
  // 完成数量
  ctx.font = '28px sans-serif'
  ctx.fillStyle = TEXT_GRAY
  ctx.fillText(`${packed}/${total} 物品已打包`, centerX, centerY + 80)
}

function drawDateAndDestination(ctx) {
  const trip = props.trip
  const centerX = canvasWidth / 2
  const startY = 850
  
  // 分隔线
  ctx.beginPath()
  ctx.moveTo(100, startY)
  ctx.lineTo(canvasWidth - 100, startY)
  ctx.strokeStyle = 'rgba(155, 176, 203, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()
  
  // 日期
  ctx.font = '32px sans-serif'
  ctx.fillStyle = TEXT_GRAY
  ctx.textAlign = 'center'
  ctx.fillText('📅 出行日期', centerX, startY + 60)
  
  ctx.font = 'bold 40px sans-serif'
  ctx.fillStyle = TEXT_WHITE
  ctx.fillText(formatDate(trip.date), centerX, startY + 110)
  
  // 目的地（如果有）
  if (trip.destination) {
    ctx.font = '32px sans-serif'
    ctx.fillStyle = TEXT_GRAY
    ctx.fillText('📍 目的地', centerX, startY + 170)
    
    ctx.font = 'bold 40px sans-serif'
    ctx.fillStyle = BRAND_GREEN
    ctx.fillText(trip.destination, centerX, startY + 220)
  }
}

function drawFooter(ctx) {
  const centerX = canvasWidth / 2
  const startY = canvasHeight - 150
  
  // 二维码提示区
  ctx.font = '28px sans-serif'
  ctx.fillStyle = TEXT_GRAY
  ctx.textAlign = 'center'
  ctx.fillText('扫码使用 ReadyToGo', centerX, startY)
  
  // 小程序码位置提示框
  ctx.beginPath()
  ctx.roundRect(centerX - 80, startY + 20, 160, 160, 16)
  ctx.strokeStyle = 'rgba(118, 171, 255, 0.4)'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.stroke()
  ctx.setLineDash([])
  
  ctx.font = '24px sans-serif'
  ctx.fillStyle = TEXT_GRAY
  ctx.fillText('小程序码', centerX, startY + 110)
}

// 辅助函数
function getStatusText(status) {
  const map = {
    'preparation': '准备中',
    'packing': '打包中',
    'packed': '已打包',
    'departed': '已出发',
    'returnPhase': '返程中',
    'archived': '已完成'
  }
  return map[status] || '准备中'
}

function getStatusColor(status) {
  const map = {
    'preparation': '#76abff',
    'packing': '#f59e0b',
    'packed': '#34d399',
    'departed': '#76abff',
    'returnPhase': '#f59e0b',
    'archived': '#64748b'
  }
  return map[status] || '#76abff'
}

function formatDate(dateStr) {
  if (!dateStr) return '未定'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 保存到相册
async function saveToAlbum() {
  if (!posterImage.value) return
  
  // 开始追踪
  const shareId = `share_${Date.now()}`
  
  try {
    await uni.saveImageToPhotosAlbum({
      filePath: posterImage.value
    })
    
    // 记录成功
    await trackShare({
      type: ShareTypes.TRIP,
      channel: ShareChannels.SAVE_ALBUM,
      contentId: props.trip?.id,
      contentTitle: props.trip?.title,
      success: true
    })
    
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (error) {
    // 记录失败
    await trackShare({
      type: ShareTypes.TRIP,
      channel: ShareChannels.SAVE_ALBUM,
      contentId: props.trip?.id,
      contentTitle: props.trip?.title,
      success: false,
      errorMsg: error.errMsg || '保存失败'
    })
    
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 分享给好友
async function shareToFriend() {
  // 记录分享
  await trackShare({
    type: ShareTypes.TRIP,
    channel: ShareChannels.WECHAT_FRIEND,
    contentId: props.trip?.id,
    contentTitle: props.trip?.title,
    success: true
  })
  
  // 触发微信分享
  emit('share', {
    type: 'trip',
    trip: props.trip,
    imageUrl: posterImage.value
  })
}

function close() {
  posterImage.value = ''
  emit('close')
}
</script>

<style scoped>
.share-poster-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.poster-container {
  position: relative;
  width: 650rpx;
  background: #1a2332;
  border-radius: 24rpx;
  overflow: hidden;
  padding: 20rpx;
}

.share-canvas {
  position: absolute;
  top: -9999px;
  left: -9999px;
}

.poster-preview {
  width: 100%;
  height: 900rpx;
  border-radius: 16rpx;
  background: #0d1420;
}

.generating-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.hint-text {
  color: #9bb0cb;
  font-size: 28rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 28rpx;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: #fff;
}

.btn-secondary {
  background: rgba(118, 171, 255, 0.15);
  color: #76abff;
  border: 2rpx solid rgba(118, 171, 255, 0.4);
}

.icon {
  font-size: 32rpx;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #9bb0cb;
  z-index: 10;
}
</style>
