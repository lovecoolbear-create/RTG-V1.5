<template>
  <view class="page legal-page" :class="themeClass" :style="pageThemeStyle">
    <view class="header">
      <text class="back-btn" @tap="goBack">‹ 返回</text>
      <text class="title">用户服务协议</text>
    </view>
    
    <scroll-view scroll-y class="content">
      <view class="section">
        <text class="section-title">1. 协议接受</text>
        <text class="section-text">
          欢迎使用 ReadyToGo 小程序（"本服务"）。本用户服务协议（"本协议"）是您与 ReadyToGo 之间关于使用本服务的协议。
        </text>
        <text class="section-highlight">使用本服务即表示您已阅读、理解并同意接受本协议的全部条款。</text>
      </view>

      <view class="section">
        <text class="section-title">2. 服务说明</text>
        <text class="section-subtitle">2.1 服务内容</text>
        <text class="section-text">
          ReadyToGo 是一款行程准备清单工具，提供以下功能：
          • 行程创建与管理
          • 清单模板管理
          • 行程状态追踪
          • 实时天气查询
          • 数据同步与备份
        </text>
        <text class="section-subtitle">2.2 服务变更</text>
        <text class="section-text">
          我们保留随时修改、暂停或终止部分或全部服务的权利。重大变更将提前通知您。
        </text>
      </view>

      <view class="section">
        <text class="section-title">3. 账号与使用</text>
        <text class="section-subtitle">3.1 使用条件</text>
        <text class="section-text">
          • 您需拥有微信账号并授权登录
          • 您需年满14周岁或在监护人同意下使用
          • 您需确保提供的信息真实准确
        </text>
        <text class="section-subtitle">3.2 使用规范</text>
        <text class="section-text">
          您同意不：
          • 使用本服务从事违法活动
          • 干扰或破坏服务正常运行
          • 未经授权访问他人数据
          • 上传恶意代码或病毒
          • 将服务用于商业转售
        </text>
      </view>

      <view class="section">
        <text class="section-title">4. 知识产权</text>
        <text class="section-subtitle">4.1 我们的权利</text>
        <text class="section-text">
          • 本服务的所有权利归我们所有
          • 包括但不限于代码、设计、商标、标识
          • 未经书面许可，您不得复制、修改或传播
        </text>
        <text class="section-subtitle">4.2 您的权利</text>
        <text class="section-text">
          • 您保留您创建内容的所有权
          • 您授予我们必要的使用权以提供服务
          • 您可随时删除您的内容
        </text>
      </view>

      <view class="section">
        <text class="section-title">5. 免责声明</text>
        <text class="section-highlight">本服务按"现状"提供，我们不提供任何明示或暗示的保证。</text>
        <text class="section-text">
          包括但不限于：
          • 服务将不间断、及时、安全或无错误
          • 数据不会丢失或损坏
          • 天气信息的准确性
          
          在法律允许的最大范围内，我们不对以下损失承担责任：
          • 因使用或无法使用服务导致的直接、间接损失
          • 数据丢失或业务中断
          • 因不可抗力导致的服务中断
        </text>
        <text class="section-text bold">我们的赔偿责任上限为您过去12个月支付的总费用（如有）。</text>
      </view>

      <view class="section">
        <text class="section-title">6. 隐私保护</text>
        <text class="section-text">
          我们重视您的隐私。隐私实践详见我们的《隐私政策》，该政策构成本协议的一部分。
        </text>
      </view>

      <view class="section">
        <text class="section-title">7. 协议终止</text>
        <text class="section-subtitle">7.1 由您终止</text>
        <text class="section-text">
          • 您可以随时停止使用本服务
          • 您可以在设置页面删除所有数据
        </text>
        <text class="section-subtitle">7.2 由我们终止</text>
        <text class="section-text">
          在以下情况下，我们可能暂停或终止您的访问：
          • 您违反本协议
          • 您从事违法活动
          • 您的账号存在安全风险
        </text>
      </view>

      <view class="section">
        <text class="section-title">8. 争议解决</text>
        <text class="section-text">
          <text class="bold">适用法律：</text>本协议适用中华人民共和国法律。
          
          <text class="bold">协商解决：</text>双方应首先通过友好协商解决争议。
          
          <text class="bold">司法管辖：</text>如协商不成，任何一方均可向被告所在地人民法院提起诉讼。
        </text>
      </view>

      <view class="section">
        <text class="section-title">9. 其他条款</text>
        <text class="section-text">
          • <text class="bold">完整协议：</text>本协议与隐私政策构成您与我们之间的完整协议
          • <text class="bold">可分割性：</text>如本协议任何条款被认定为无效，不影响其他条款的效力
          • <text class="bold">权利放弃：</text>我们未行使或执行本协议任何权利不构成对该权利的放弃
          • <text class="bold">协议更新：</text>我们可能更新本协议，继续使用服务即表示您接受新协议
        </text>
      </view>

      <view class="section">
        <text class="section-title">10. 联系我们</text>
        <text class="section-text">
          如有任何问题或建议，请联系我们：
          • 邮箱：support@readytogo.app
          • 微信客服：小程序"设置"页面提交反馈
        </text>
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

.legal-page.theme-day .bold {
  color: #334155;
}
</style>
