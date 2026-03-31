import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const THEME_STORAGE_KEY = 'rtg_auto_theme_mode'

function detectThemeModeByHour() {
  const hour = new Date().getHours()
  return hour >= 7 && hour < 19 ? 'day' : 'night'
}

function applyNativeTheme(mode) {
  const day = mode === 'day'
  const navBackground = day ? '#dcecff' : '#040a16'
  const navFront = day ? '#000000' : '#ffffff'
  uni.setStorageSync(THEME_STORAGE_KEY, mode)
  uni.setNavigationBarColor({
    frontColor: navFront,
    backgroundColor: navBackground,
    animation: {
      duration: 180,
      timingFunc: 'easeIn',
    },
  })
  // TabBar style removed to prevent errors
}

export function readThemeMode() {
  const cached = String(uni.getStorageSync(THEME_STORAGE_KEY) || '').trim()
  if (cached === 'day' || cached === 'night') return cached
  const mode = detectThemeModeByHour()
  uni.setStorageSync(THEME_STORAGE_KEY, mode)
  return mode
}

export function syncAutoThemeMode() {
  const mode = detectThemeModeByHour()
  applyNativeTheme(mode)
  return mode
}

export function useAutoThemeClass() {
  const themeMode = ref(readThemeMode())
  const themeClass = computed(() => (themeMode.value === 'day' ? 'theme-day' : 'theme-night'))
  const pageThemeStyle = computed(() => {
    if (themeMode.value === 'day') {
      return {
        background:
          'radial-gradient(circle at 12% 8%, rgba(186, 220, 255, 0.72), transparent 34%), radial-gradient(circle at 88% 18%, rgba(255, 223, 175, 0.48), transparent 30%), linear-gradient(180deg, #f2f8ff 0%, #e8f2ff 45%, #e2edff 100%)',
      }
    }
    return {
      background:
        'radial-gradient(circle at 15% 8%, rgba(10, 128, 255, 0.34), transparent 34%), radial-gradient(circle at 90% 15%, rgba(168, 85, 247, 0.22), transparent 28%), linear-gradient(180deg, #040a16 0%, #050d1f 45%, #071020 100%)',
    }
  })
  const sync = () => {
    themeMode.value = syncAutoThemeMode()
  }
  onShow(sync)
  sync()
  return {
    themeClass,
    pageThemeStyle,
    themeMode,
    syncThemeMode: sync,
  }
}
