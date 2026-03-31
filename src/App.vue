<script>
import { syncAutoThemeMode } from './services/theme'

const APP_LAUNCH_SESSION_KEY = 'app_launch_session_v1'

export default {
  onLaunch() {
    uni.setStorageSync(APP_LAUNCH_SESSION_KEY, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    syncAutoThemeMode()
  },
  onShow() {
    syncAutoThemeMode()
  },
  onHide() {},
}
</script>

<style lang="scss">
/* @import removed */

page {
  background: var(--bg-primary);
  transition: background-color var(--transition-normal);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.page.theme-day {
  transition: background var(--transition-normal);
}

.page.theme-night {
  transition: background var(--transition-normal);
}

// 全局动画
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.fade-in {
  animation: fadeIn var(--transition-normal);
}

.slide-up {
  animation: slideUp var(--transition-normal);
}

.pulse {
  animation: pulse 0.6s ease-out;
}

// 全局按钮样式
button {
  transition: all var(--transition-fast);
  border: none;
  outline: none;
  font-family: inherit;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
}

// 全局卡片样式
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
}

// 全局滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: var(--radius-full);
  
  &:hover {
    background: var(--primary-color);
  }
}

// 全局文本选择样式
::selection {
  background: var(--primary-alpha);
  color: var(--text-primary);
}

// 触摸反馈
.touch-feedback {
  transition: all var(--transition-fast);
  
  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

// 加载状态
.loading {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }
}
</style>
