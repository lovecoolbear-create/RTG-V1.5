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
page {
  background: #071020;
  transition: background-color 0.2s ease;
}

.page.theme-day {
  transition: background 0.2s ease;
}

.page.theme-night {
  transition: background 0.2s ease;
}
</style>
