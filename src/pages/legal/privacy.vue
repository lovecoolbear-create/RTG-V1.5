<template>
  <view class="page legal-page" :class="themeClass" :style="pageThemeStyle">
    <view class="header">
      <text class="back-btn" @tap="goBack">‹ 返回</text>
      <text class="title">隐私政策</text>
    </view>
    
    <scroll-view scroll-y class="content">
      <view class="section">
        <text class="section-title">1. 引言</text>
        <text class="section-text">
          ReadyToGo（"我们"、"本小程序"）重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用本小程序前仔细阅读本政策。
        </text>
        <text class="section-highlight">使用本小程序即表示您同意本隐私政策的全部内容。</text>
      </view>

      <view class="section">
        <text class="section-title">2. 我们收集的信息</text>
        <text class="section-subtitle">2.1 您主动提供的信息</text>
        <text class="section-text">
          • 行程信息：行程名称、出行日期、目的地、关键时间、证件类型等
          • 清单内容：您创建或编辑的清单项目
          • 模板信息：您自定义的模板名称和项目
        </text>
        <text class="section-subtitle">2.2 我们自动收集的信息</text>
        <text class="section-text">
          • 设备信息：设备型号、操作系统版本、微信版本
          • 位置信息：获取您的地理位置用于显示实时天气（需您授权）
          • 日志信息：使用过程中的操作日志、错误日志
        </text>
      </view>

      <view class="section">
        <text class="section-title">3. 信息使用目的</text>
        <view class="table">
          <view class="table-row header">
            <text class="table-cell">信息类型</text>
            <text class="table-cell">使用目的</text>
          </view>
          <view class="table-row">
            <text class="table-cell">行程信息</text>
            <text class="table-cell">为您提供行程管理和清单服务</text>
          </view>
          <view class="table-row">
            <text class="table-cell">位置信息</text>
            <text class="table-cell">获取实时天气数据，提供出行参考</text>
          </view>
          <view class="table-row">
            <text class="table-cell">设备信息</text>
            <text class="table-cell">优化小程序兼容性，修复问题</text>
          </view>
        </view>
        <text class="section-text">我们不会将您的信息用于上述目的之外的用途。</text>
      </view>

      <view class="section">
        <text class="section-title">4. 信息存储与保护</text>
        <text class="section-subtitle">4.1 存储位置</text>
        <text class="section-text">
          • 本地存储：您的行程和清单数据首先存储在您的设备本地
          • 云端同步：如您开启云同步，数据将加密存储在微信云开发服务器（中国大陆）
        </text>
        <text class="section-subtitle">4.2 安全措施</text>
        <text class="section-text">
          • 采用业界标准的加密技术传输和存储数据
          • 实施访问控制，限制内部人员接触用户数据
          • 定期进行安全审计
        </text>
      </view>

      <view class="section">
        <text class="section-title">5. 信息共享</text>
        <text class="section-highlight">我们承诺不会出售您的个人信息。</text>
        <text class="section-text">
          仅在以下情况下，我们可能共享您的信息：
          • 法律法规要求：响应法院命令、法律程序或政府要求
          • 保护权益：保护我们或他人的权利、财产或安全
          • 服务提供：与可信的服务提供商共享（如天气数据API），且仅用于提供服务
        </text>
      </view>

      <view class="section">
        <text class="section-title">6. 您的权利</text>
        <text class="section-text">
          <text class="bold">查看与修改</text>：您可以随时查看和修改您的行程、清单和模板信息
          
          <text class="bold">删除</text>：您可以删除单条行程或清空所有数据
          
          <text class="bold">导出</text>：您可以导出您的行程数据
          
          <text class="bold">撤回授权</text>：您可以随时撤回位置信息授权
          
          <text class="bold">注销账户</text>：您可以删除所有数据并停止使用本小程序
        </text>
      </view>

      <view class="section">
        <text class="section-title">7. 联系我们</text>
        <text class="section-text">
          如您对本隐私政策有任何疑问或建议，请联系我们：
          • 邮箱：privacy@readytogo.app
          • 微信客服：在小程序"设置"页面提交反馈
        </text>
        <text class="section-text">我们将在15个工作日内回复您的请求。</text>
      </view>

      <view class="footer">
        <text class="footer-text">生效日期：2025年4月1日</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { useAutoThemeClass } from '../../services/theme'

const { themeClass, pageThemeStyle } = useAutoThemeClass()

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #040a16 0%, #071020 100%);
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx 24rpx;
  border-bottom: 1rpx solid rgba(118, 171, 255, 0.1);
}

.back-btn {
  font-size: 28rpx;
  color: #76abff;
  margin-right: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #f7fbff;
}

.content {
  padding: 32rpx;
  height: calc(100vh - 120rpx);
}

.section {
  margin-bottom: 48rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #76abff;
  margin-bottom: 20rpx;
}

.section-subtitle {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #c8d6e5;
  margin: 16rpx 0 12rpx;
}

.section-text {
  display: block;
  font-size: 26rpx;
  color: #9bb0cb;
  line-height: 1.8;
  white-space: pre-line;
}

.section-highlight {
  display: block;
  font-size: 26rpx;
  color: #34d399;
  font-weight: 500;
  margin-top: 16rpx;
  padding: 16rpx;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 12rpx;
  border-left: 4rpx solid #34d399;
}

.table {
  margin: 16rpx 0;
  border: 1rpx solid rgba(118, 171, 255, 0.2);
  border-radius: 12rpx;
  overflow: hidden;
}

.table-row {
  display: flex;
  padding: 16rpx;
  border-bottom: 1rpx solid rgba(118, 171, 255, 0.1);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.header {
  background: rgba(118, 171, 255, 0.1);
}

.table-cell {
  flex: 1;
  font-size: 24rpx;
  color: #c8d6e5;
}

.table-row.header .table-cell {
  color: #76abff;
  font-weight: 500;
}

.bold {
  font-weight: 600;
  color: #c8d6e5;
}

.footer {
  margin-top: 64rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid rgba(118, 171, 255, 0.1);
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #64748b;
}

/* 日间模式 */
.legal-page.theme-day {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.legal-page.theme-day .title {
  color: #1a2332;
}

.legal-page.theme-day .section-title {
  color: #059669;
}

.legal-page.theme-day .section-subtitle {
  color: #334155;
}

.legal-page.theme-day .section-text {
  color: #64748b;
}

.legal-page.theme-day .table {
  border-color: rgba(0, 0, 0, 0.1);
}

.legal-page.theme-day .table-row {
  border-color: rgba(0, 0, 0, 0.05);
}

.legal-page.theme-day .table-cell {
  color: #64748b;
}

.legal-page.theme-day .bold {
  color: #334155;
}
</style>
